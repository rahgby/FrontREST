import { Component, OnInit, OnDestroy } from '@angular/core';
import { OrdersService } from '../services/orders.service';
import { SseServiceService } from 'src/app/core/services/sse-service.service';
import { AuthService } from '../../../auth/services/auth.service';
import { PlatosServiceService } from '../../module-products/services/platos-service.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, interval, Subscription, takeUntil } from 'rxjs';

@Component({
  selector: 'app-pedido-cocina',
  templateUrl: './pedido-cocina.component.html',
  styleUrls: ['./pedido-cocina.component.css']
})
export class PedidoCocinaComponent implements OnInit, OnDestroy {
  pedidos: any[] = [];
  mostrarFranja = true;
  isLoading: boolean = true;
  token: any = null;
  rolUsuario: string = '';
  pedidosResaltados: Set<number> = new Set();
  ahora = new Date();
  recuentoPlatos: any[] = []; 
  private destroy$ = new Subject<void>();
  private timerSub!: Subscription;
  
  estadosSecuencia: string[] = ['ENVIADO', 'ENTREGADO', 'ABONADO'];
  
  // Mapeo de roles a métodos del servicio
  private categoriasPorRol: { [key: string]: () => any } = {
    'COCTELES': () => this.ordersService.obtenerPedidosCocinaCocteles(),
    'POSTRES': () => this.ordersService.obtenerPedidosCocinaPostres(),
    'CREPES': () => this.ordersService.obtenerPedidosCocinaCrepes(),
    'PIZZA Y HELADO': () => this.ordersService.obtenerPedidosCocinaPizza(),
  };

  private sseSubscription: any;
  private reloadTimer: any;

  constructor(
    private ordersService: OrdersService,
    private authService: AuthService,
    public sseService: SseServiceService,
    private platosService: PlatosServiceService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.obtenerUsuarioActual();
    this.escucharEventos();
    this.cargarDetallesDesdeStorage();
    // Timer para actualizar el tiempo transcurrido cada minuto
    this.timerSub = interval(60000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.ahora = new Date();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.timerSub?.unsubscribe();
    if (this.reloadTimer) clearTimeout(this.reloadTimer);
  }

  obtenerUsuarioActual() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.idUsuario) {
      this.rolUsuario = currentUser.rol;
      this.cargarPedidosPorRol();
    } else {
      this.authService.getUserInfo().subscribe({
        next: (usuario) => {
          this.rolUsuario = usuario.rol || usuario.Rol;
          this.cargarPedidosPorRol();
        },
        error: (err) => {
          console.error('Error al obtener información de usuario:', err);
          this.isLoading = false;
        }
      });
    }
  }

  toggleFranja() {
    this.mostrarFranja = !this.mostrarFranja;
  }
 cargarPedidosPorRol() {
  const rolUpper = this.rolUsuario.toUpperCase();
  
  if (rolUpper === 'ADMINISTRADOR' || rolUpper === 'COCINA') {
    this.cargarPedidosCocina();
    this.cargarRecuentoPlatos();
    return;
  }
  
  const metodoCategoria = this.categoriasPorRol[rolUpper];
  
  if (metodoCategoria) {
    this.cargarPedidosPorCategoria(metodoCategoria);
  } else {
    console.warn(`⚠️ Rol no reconocido para cocina: ${rolUpper}`);
    this.cargarPedidosCocina();
  }
}
  cargarRecuentoPlatos() {
    this.ordersService.obtenerRecuentoPlatosEnviados().subscribe({
      next: (recuento) => {
        this.recuentoPlatos = recuento || [];
        console.log('📊 Recuento de platos:', this.recuentoPlatos);
      },
      error: (error) => {
        console.error('Error al cargar recuento:', error);
        this.recuentoPlatos = [];
      }
    });
  }

   formatearRecuentoPlato(plato: any): string {
    let texto = plato.nombrePlato || plato.NombrePlato;
    
    if (plato.sabor || plato.Sabor) {
      texto += ` (${plato.sabor || plato.Sabor})`;
    }
    
    if (plato.tipoPapas || plato.TipoPapas) {
      texto += ` - ${plato.tipoPapas || plato.TipoPapas}`;
    }
    
    return texto;
  }
  cargarPedidosPorCategoria(metodoServicio: () => any) {
    this.isLoading = true;
    
    metodoServicio().subscribe({
      next: (pedidos: any[]) => {
        this.pedidos = pedidos || [];
        this.isLoading = false;
        this.pedidosResaltados = this.sseService.pedidosNoLeidos;
        
        console.log(`✅ Cargados ${this.pedidos.length} pedidos de ${this.rolUsuario}`);
      },
      error: (error: any) => {
        console.error(`Error al cargar pedidos de ${this.rolUsuario}:`, error);
        this.pedidos = [];
        this.isLoading = false;
        this.mostrarError(`Error al cargar pedidos de ${this.rolUsuario}`);
      }
    });
  }

  escucharEventos() {
    this.sseService.sseData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        if (data.tipo === 'nuevo-pedido' || data.tipo === 'ESTADO_CAMBIADO' || data.tipo == 'PEDIDO_EDITADO') {
          console.log('🍳 Cocina: Actualizando lista por evento:', data.tipo);
          this.pedidosResaltados = this.sseService.pedidosNoLeidos;
          this.recargarPedidosConRetraso(600);
        }
      });

    this.sseService.cajaEvent$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        console.log('💰 Cocina: Cambio en caja detectado');
        this.recargarPedidosConRetraso(1000);
      });
  }

  recargarPedidosConRetraso(ms: number): void {
    if (this.reloadTimer) clearTimeout(this.reloadTimer);
    this.reloadTimer = setTimeout(() => {
      this.cargarPedidosPorRol(); // Ahora recarga según el rol
    }, ms);
  }

  marcarComoVisto(idPedido: number) {
    this.sseService.pedidosNoLeidos.delete(idPedido);
    this.pedidosResaltados = this.sseService.pedidosNoLeidos;
  }

  cargarPedidosCocina() {
    this.isLoading = true;
    this.ordersService.obtenerPedidosCocina().subscribe({
      next: (pedidos) => {
        this.pedidos = pedidos || [];
        this.isLoading = false;
        this.pedidosResaltados = this.sseService.pedidosNoLeidos;
        this.limpiarDetallesObsoletos();
      },
      error: (error) => {
        console.error('Error al cargar pedidos de cocina:', error);
        this.pedidos = [];
        this.isLoading = false;
      }
    });
  }

  // ============ MÉTODOS PARA GESTIÓN DE ESTADOS ============

  getTiempoTranscurrido(fechaRegistro: string): string {
    const inicio = new Date(fechaRegistro).getTime();
    const ahora = this.ahora.getTime();
    const diff = ahora - inicio;
  
    if (diff < 60000) {
      return 'Ahora';
    }
  
    const horas = Math.floor(diff / 3600000);
    const minutos = Math.floor((diff % 3600000) / 60000);
  
    if (horas === 0) {
      return `${minutos}m`;
    }
  
    return `${horas}h ${this.pad(minutos)}m`;
  }

  private pad(valor: number): string {
    return valor < 10 ? '0' + valor : valor.toString();
  }

  isTiempoCritico(fechaRegistro: string): boolean {
    const diff = this.ahora.getTime() - new Date(fechaRegistro).getTime();
    return diff > 3600000; // Más de 1 hora
  }

  puedeAvanzar(pedido: any): boolean {
    if (pedido.estadoPedido === 'CANCELADO') return false;
    const currentIndex = this.estadosSecuencia.indexOf(pedido.estadoPedido);
    return currentIndex < this.estadosSecuencia.length - 1;
  }

  puedeRetroceder(pedido: any): boolean {
    if (pedido.estadoPedido === 'CANCELADO') return false;
    const currentIndex = this.estadosSecuencia.indexOf(pedido.estadoPedido);
    return currentIndex > 0;
  }

  getSiguienteEstado(pedido: any): string {
    if (pedido.isDelivery && pedido.estadoPedido === 'ENVIADO') {
      return 'ENTREGADO';
    }
    const currentIndex = this.estadosSecuencia.indexOf(pedido.estadoPedido);
    return currentIndex < this.estadosSecuencia.length - 1
      ? this.estadosSecuencia[currentIndex + 1]
      : this.estadosSecuencia[this.estadosSecuencia.length - 1];
  }

  getEstadoAnterior(pedido: any): string {
    if (pedido.isDelivery && pedido.estadoPedido === 'ENTREGADO') {
      return 'ENVIADO';
    }
    const currentIndex = this.estadosSecuencia.indexOf(pedido.estadoPedido);
    return currentIndex > 0 ? this.estadosSecuencia[currentIndex - 1] : this.estadosSecuencia[0];
  }

  avanzarEstado(pedido: any): void {
     if (this.rolUsuario !== 'Administrador' && this.rolUsuario !== 'Cocina') {
      this.mostrarError('Solo administradores pueden cambiar estados');
      return;
    }

    const siguienteEstado = this.getSiguienteEstado(pedido);
    
    if (window.confirm(`¿Estás seguro de avanzar este pedido a ${siguienteEstado}?`)) {
      this.cambiarEstadoPedido(pedido, siguienteEstado, false);
    }
  }

  private readonly STORAGE_KEY = 'cocina_detalles_completados';

// Agregar esta propiedad
detallesCompletados: Set<number> = new Set();

cargarDetallesDesdeStorage(): void {
  const guardado = localStorage.getItem(this.STORAGE_KEY);
  if (guardado) {
    const ids: number[] = JSON.parse(guardado);
    this.detallesCompletados = new Set(ids);
  }
}

toggleDetalleCompletado(idDetalle: number, event: Event): void {
  event.stopPropagation();
  if (this.detallesCompletados.has(idDetalle)) {
    this.detallesCompletados.delete(idDetalle);
  } else {
    this.detallesCompletados.add(idDetalle);
  }
  // Guardar en localStorage
  localStorage.setItem(this.STORAGE_KEY, JSON.stringify([...this.detallesCompletados]));
}
  trackByDetalle(index: number, detalle: any): number {
  return detalle.idDetallePedido || detalle.IDDetallePedido;
}

trackByPedido(index: number, pedido: any): number {
  return pedido.idPedido || pedido.IDPedido;
}
limpiarDetallesObsoletos(): void {
  const idsActivos = new Set<number>();
  this.pedidos.forEach(pedido => {
    const detalles = pedido.detallePedido || pedido.DetallePedido || [];
    detalles.forEach((d: any) => {
      const id = d.idDetallePedido || d.IDDetallePedido;
      if (id) idsActivos.add(id);
    });
  });

  // Eliminar del Set los que ya no aparecen
  this.detallesCompletados.forEach(id => {
    if (!idsActivos.has(id)) {
      this.detallesCompletados.delete(id);
    }
  });

  // Actualizar storage limpio
  localStorage.setItem(this.STORAGE_KEY, JSON.stringify([...this.detallesCompletados]));
}

  retrocederEstado(pedido: any): void {
    if (this.rolUsuario !== 'Administrador') {
      this.mostrarError('Solo administradores pueden cambiar estados');
      return;
    }

    const estadoAnterior = this.getEstadoAnterior(pedido);
    
    if (window.confirm(`¿Estás seguro de RETROCEDER este pedido a ${estadoAnterior}?`)) {
      this.cambiarEstadoPedido(pedido, estadoAnterior, true);
    }
  }

  cancelarPedido(pedido: any): void {
    if (this.rolUsuario !== 'Administrador') {
      this.mostrarError('Solo administradores pueden cancelar pedidos');
      return;
    }

    if (window.confirm('¿Estás seguro de CANCELAR este pedido? Esta acción no se puede deshacer.')) {
      this.cambiarEstadoPedido(pedido, 'CANCELADO', false);
    }
  }

  cambiarEstadoPedido(pedido: any, nuevoEstado: string, esRetroceso: boolean = false): void {
    this.platosService.actualizarEstadoPedido(pedido.idPedido || pedido.IDPedido, nuevoEstado).subscribe({
      next: (response: any) => {
        // Actualizar localmente
        pedido.estadoPedido = nuevoEstado;
        pedido.EstadoPedido = nuevoEstado;
        pedido.ultModificacion = new Date().toISOString();
        
        // Mostrar mensaje de éxito
        const mensaje = esRetroceso 
          ? `Estado retrocedido a ${nuevoEstado}` 
          : `Estado avanzado a ${nuevoEstado}`;
        this.mostrarExito(mensaje);
        
        // Recargar pedidos para obtener datos actualizados
        this.cargarPedidosPorRol();
      },
      error: (err: any) => {
        console.error('Error al actualizar estado:', err);
        this.mostrarError('Error al actualizar el estado del pedido');
      }
    });
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado?.toUpperCase()) {
      case 'ENTREGADO':
        return 'badge-verde';
      case 'ABONADO':
        return 'badge-verde';
      case 'ENVIADO':
        return 'badge-amarillo';
      case 'CANCELADO':
        return 'badge-rojo';
      default:
        return 'badge-default';
    }
  }

  // ============ MÉTODOS DE ESTILO EXISTENTES ============

  getTamanioPedidoClass(pedido: any): string {
    const detalles = pedido.detallePedido || pedido.DetallePedido;
    if (!detalles || detalles.length === 0) {
      return 'cols-1 pedido-simple';
    }

    const cantidadDetalles = detalles.length;
    
    if (cantidadDetalles === 1) return 'cols-1 pedido-simple';
    if (cantidadDetalles <= 3) return 'cols-1';
    if (cantidadDetalles <= 5) return 'cols-2';
    if (cantidadDetalles <= 7) return 'cols-3';
    return 'cols-4';
  }

  getDetalleClass(detalle: any): string {
    let extrasCount = 0;

    if (detalle.sabor || detalle.Sabor) extrasCount++;
    if (detalle.tipoPapas || detalle.TipoPapas) extrasCount++;
    if (detalle.comentario || detalle.Comentario) extrasCount++;
    
    const adicionales = detalle.detallePedidoAdicional || detalle.DetallePedidoAdicional;
    if (adicionales && adicionales.length > 0) extrasCount++;

    if (extrasCount === 0) return 'simple';
    if (extrasCount <= 2) return 'con-extras';
    return 'completo';
  }

  // ============ MÉTODOS DE UTILIDAD ============

  mostrarExito(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  mostrarError(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: ['error-snackbar']
    });
  }
}