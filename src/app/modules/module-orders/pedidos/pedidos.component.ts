import { ChangeDetectorRef, Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { VerPedidosModalComponent } from '../ver-pedidos-modal/ver-pedidos-modal.component';
import { EditarPedidosModalComponent } from '../editar-pedidos-modal/editar-pedidos-modal.component';
import { SpinnerServiceService } from '../../module-products/services/spinner-service.service';
import { OrdersService } from '../services/orders.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PlatosServiceService } from '../../module-products/services/platos-service.service';
import { AuthService } from '../../../auth/services/auth.service';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { CajaService } from '../../module-sales/services/caja-service.service';
import { SseServiceService } from 'src/app/core/services/sse-service.service';
import { interval, Subject, Subscription, takeUntil } from 'rxjs';
import { MatTabGroup } from '@angular/material/tabs';
import { HttpErrorResponse } from '@angular/common/http';
import { MesaCard } from '../interface/Items';
import { VerPedidosMesaComponent } from '../ver-pedidos-mesa/ver-pedidos-mesa.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.css']
})
export class PedidosComponent implements OnInit {


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('tabGroup') tabGroup!: MatTabGroup; // referencia al mat-tab-group
  private sseSubscription?: Subscription;
  public cajaAbierta: boolean = false;
  public estado: string = "ENVIADO"
  ahora = new Date();
  private timerSub!: Subscription;
  token: any = null
  rolUsuario: string = '';
  idUsuario: number = 0;
  totalPages = 0
  pageSize = 10;
  currentPage = 0;
  pageSizeOptions: number[] = [5, 10, 20, 50];
  totalPedidos = 0;
  allPedidos: any[] = [];
  Mismesas: MesaCard[] = []; //para mozos
  criterioBusqueda: string = "";
  terminoBusqueda: string = "";
  estadoFiltro: string = "";
  estadosSecuencia: string[] = ['ENVIADO', 'ENTREGADO', 'ABONADO'];
  pedidosResaltados: Set<number> = new Set();
  private destroy$ = new Subject<void>();
  novedadesPorEstado: { [key: string]: number } = {
    'ENVIADO': 0,
    'ENTREGADO': 0,
    'ABONADO': 0,
    'CANCELADO': 0
  };
  vistaCuentas: boolean = false;

  mesasPage = 0;
mesasPageSize = 10;
totalMesas = 0;

  constructor(
    private dialog: MatDialog,
    public spinnerService: SpinnerServiceService,
    public ordersService: OrdersService,
    private snackBar: MatSnackBar,
    private platosService: PlatosServiceService,
    private authService: AuthService,
    private ventasService: CajaService,
    private sseService: SseServiceService,
    private router: Router,


  ) {
    this.token = authService.getToken()
  }

 
  ngOnInit() {
  
    this.novedadesPorEstado = { ...this.sseService.novedadesPendientes };
    if (this.estado === 'ENVIADO') {
      this.novedadesPorEstado['ENVIADO'] = 0;
      this.sseService.limpiarNovedadEstado('ENVIADO');
    }

    this.pedidosResaltados = this.sseService.pedidosNoLeidos;

    this.timerSub = interval(60000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.ahora = new Date();
      });

    this.obtenerUsuarioActual();
    this.ventasService.getCajaAbierta().subscribe(caja => {
      this.cajaAbierta = caja !== null;
      if (this.cajaAbierta) {

        this.cargarPedidos();

      }
    });

    this.sseService.sseData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        const estadoRecibido = data.tipo === 'nuevo-pedido' ? 'ENVIADO' : data.estado;
        this.pedidosResaltados = this.sseService.pedidosNoLeidos;
        if (estadoRecibido && this.novedadesPorEstado.hasOwnProperty(estadoRecibido)) {
          if (this.estado !== estadoRecibido && this.estado !== "") {
            this.novedadesPorEstado[estadoRecibido]++;
          }

          if (this.vistaCuentas) {
 
            this.cargarMisMesas(); 
          } else {
   
            this.cargarPedidos();
          }
          
        }
      });


  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.timerSub?.unsubscribe(); 
  }

  cambiarOrden(orden: string) {
    this.criterioBusqueda = orden;
    this.cargarPedidos();
  }

  quitarResalteNuevo(idPedido: number) {
    this.sseService.pedidosNoLeidos.delete(idPedido);
    this.pedidosResaltados = this.sseService.pedidosNoLeidos;
  }

  onMesasPageChange(event: PageEvent): void {
    this.mesasPage = event.pageIndex;
    this.mesasPageSize = event.pageSize;
    this.cargarMisMesas();
  }

  cargarMisMesas(): void {
    this.spinnerService.show();
    this.ordersService.getMisMesas(this.mesasPage + 1, this.mesasPageSize, "").subscribe({
      next: (res) => {
        this.Mismesas = res.data;
        this.totalMesas = res.totalCount; // Guardamos el total para el paginador
      },
      error: (e) => {
        console.error(e);
        this.mostrarError('Error al cargar mesas');
      },
      complete: () => {
        this.spinnerService.hide(); // Desactivamos spinner
      }
    });
  }

  buscarPedidos(valor: string) {
    if (this.vistaCuentas) {
      this.spinnerService.show();
      this.mesasPage = 0; 
      this.ordersService.getMisMesas(1, this.mesasPageSize, valor).subscribe({
          next: (res) => {
             this.Mismesas = res.data;
             this.totalMesas = res.totalCount;
          },
          complete: () => this.spinnerService.hide()
      });
      return;
    }
    this.terminoBusqueda = valor;
    this.estado = '';

    const todosIndex = this.estados.indexOf('TODOS');
    if (todosIndex >= 0 && this.tabGroup) {
      this.tabGroup.selectedIndex = todosIndex;
    }

    this.cargarPedidos();
  }

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

  obtenerUsuarioActual() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.idUsuario) {
      this.idUsuario = currentUser.idUsuario;
      this.rolUsuario = currentUser.rol;

    } else {
      this.authService.getUserInfo().subscribe({
        next: (usuario) => {
          this.idUsuario = this.authService.getUserId()!;
          this.rolUsuario = usuario.rol || usuario.Rol;


        },
        error: (err) => {
          console.error('Error al obtener información de usuario:', err);
          this.mostrarError('Error al cargar información de usuario');
        }
      });
    }
  }


  isTiempoCritico(fechaRegistro: string): boolean {
    const diff = this.ahora.getTime() - new Date(fechaRegistro).getTime();
    return diff > 3600000; 
  }


  getTituloPedido(pedido: any): string {
    const mesa = pedido.mesa || 'Sin asignar';
    const cliente = pedido.nombreCliente || 'Cliente';
    if (pedido.isDelivery) {
      return `Delivery - ${cliente}`;
    }

    if (this.rolUsuario === 'Administrador' || this.rolUsuario === 'Supervisor') {
      const mesero = pedido.usuario || 'Sin asignar';
      return `${mesa} - ${mesero}`;
    }

    return `${mesa} - ${cliente}`;
  }

  estados = [
    'ENVIADO',
    'ENTREGADO',
    'ABONADO',
    'CANCELADO',
    'TODOS'
  ];

  abrirResumenMesa(event: Event, mesa: any) {
    // ⛔ ESTO ES VITAL: Detiene el click para que no se active el routerLink
    event.stopPropagation(); 
    event.preventDefault();
  
    this.dialog.open(VerPedidosMesaComponent, {
      width: '500px', // Ancho estilo móvil
      maxHeight: '85vh',
      panelClass: 'modal-sin-padding', // Opcional para estilos
      data: { 
        idMesa: mesa.idMesa,
        nombreMesa: mesa.nombreMesa
      }
    });
  }

  cambiarestado(estado: string) {
    if (estado === 'TODOS') {
      this.estado = ""; // quita filtro
    } else {
      this.estado = estado;
    }
    this.cargarPedidos();
  }

  onTabChange(event: any) {
    let indiceReal = event.index; // Usamos 'let' para poder modificarlo matemáticamente
    if (this.rolUsuario === 'Mesero') {
      
      // CASO A: Clic en Tab 1 (Mis Cuentas)
      if (indiceReal === 1) {
          this.vistaCuentas = true;
          this.cargarMisMesas();
          return; // ⛔ STOP: Terminamos aquí
      }
      if (indiceReal > 1) {
        indiceReal = indiceReal - 1;
      }
    }

    this.vistaCuentas = false;
    if (indiceReal < this.estados.length) {
      const nombreEstado = this.estados[indiceReal];
      
      if (this.novedadesPorEstado.hasOwnProperty(nombreEstado)) {
        this.novedadesPorEstado[nombreEstado] = 0;
      }
      this.sseService.limpiarNovedadEstado(nombreEstado);
      this.cambiarestado(nombreEstado);
    }
  }

  cargarPedidos() {
  this.spinnerService.show();
  let pedidoObservable;
  if (this.rolUsuario === 'Cocteles') {
    pedidoObservable = this.ordersService.obtenerPedidosCoctelesCajaActual(
      this.currentPage + 1, this.pageSize, this.terminoBusqueda, this.estado, this.criterioBusqueda
    );
  } else if (this.rolUsuario === 'Postres') {
    pedidoObservable = this.ordersService.obtenerPedidosPostresCajaActual(
      this.currentPage + 1, this.pageSize, this.terminoBusqueda, this.estado, this.criterioBusqueda
    );
  } else if (this.rolUsuario === 'Crepes') {
    pedidoObservable = this.ordersService.obtenerPedidosCrepesCajaActual(
      this.currentPage + 1, this.pageSize, this.terminoBusqueda, this.estado, this.criterioBusqueda
    );
  } else if (this.rolUsuario === 'Pizza y Helado') {
    pedidoObservable = this.ordersService.obtenerPedidosPizzaCajaActual(
      this.currentPage + 1, this.pageSize, this.terminoBusqueda, this.estado, this.criterioBusqueda
    );
  } else {
    pedidoObservable = this.ordersService.obtenerPedidosCajaActual(
      this.currentPage + 1, this.pageSize, this.terminoBusqueda, this.estado, this.criterioBusqueda
    );
  }

  pedidoObservable.subscribe({
    next: (response) => {
    // Mapeo unificado de la data
      this.allPedidos = response.data.map((pedido: any) => ({
        idPedido: pedido.idPedido,
        estadoPedido: pedido.estadoPedido,
        idMesa: pedido.idMesa,
        idUsuario: pedido.idUsuario,
        monto: pedido.monto,
        fechaRegistro: pedido.fechaRegistro,
        isDelivery: pedido.isDelivery,
        ultModificacion: pedido.ultModificacion,
        nombreCliente: pedido.nombreCliente || pedido.cliente,
        usuario: pedido.usuario,
        mesa: pedido.mesa,
        detallePedido: pedido.detallePedido
      }));

      this.totalPedidos = response.totalCount;
      this.totalPages = response.totalPages;
      this.currentPage = response.pageNumber - 1;
    },
    error: (err) => {
      console.error('❌ Error al obtener pedidos:', err);
      this.mostrarError('Error al cargar los pedidos');
    },
    complete: () => this.spinnerService.hide()
  });
}


  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.cargarPedidos();
  }

esAdministrador(): boolean {
  const rolUsuario = this.rolUsuario;
  return rolUsuario === 'Administrador' || rolUsuario === 'Postres';
}

esCocina(): boolean {
  const rolUsuario = this.rolUsuario;
  return rolUsuario === 'Administrador' || rolUsuario === 'Postres' || rolUsuario === 'Crepes' || rolUsuario === 'Cocteles' || rolUsuario === 'Pizza y Helado';
}
  abrirModalVer(pedido: any) {
    this.dialog.open(VerPedidosModalComponent, {
      width: '500px',
      data: pedido
    });
  }

  abrirModalEditar(pedido: any) {
    const dialogRef = this.dialog.open(EditarPedidosModalComponent, {
      width: '500px',
      data: {
        ...pedido
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarPedidos();
      }
    });
  }
  puedeRetroceder(pedido: any): boolean {
    if (pedido.estadoPedido === 'CANCELADO') return false;
    const currentIndex = this.estadosSecuencia.indexOf(pedido.estadoPedido);
    return currentIndex > 0;
  }

  puedeAvanzar(pedido: any): boolean {
    if (pedido.estadoPedido === 'CANCELADO') return false;
    const currentIndex = this.estadosSecuencia.indexOf(pedido.estadoPedido);
    return currentIndex < this.estadosSecuencia.length - 1;
  }

  getEstadoAnterior(pedido: any): string {
    if (pedido.isDelivery && pedido.estadoPedido === 'ENTREGADO') {
      return 'ENVIADO';
    }

    const currentIndex = this.estadosSecuencia.indexOf(pedido.estadoPedido);
    return currentIndex > 0 ? this.estadosSecuencia[currentIndex - 1] : this.estadosSecuencia[0];
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

  cambiarEstadoPedido(pedido: any, nuevoEstado: string, esRetroceso: boolean = false): void {
    const confirmMessage = esRetroceso
      ? `¿Estás seguro de RETROCEDER este pedido a ${nuevoEstado}?`
      : `¿Estás seguro de avanzar este pedido a ${nuevoEstado}?`;

    if (window.confirm(confirmMessage)) {
      this.spinnerService.show();

      this.platosService.actualizarEstadoPedido(pedido.idPedido, nuevoEstado).subscribe({
        next: (response: any) => {
          pedido.estadoPedido = nuevoEstado;
          pedido.ultModificacion = new Date().toISOString();
          this.mostrarExito(esRetroceso ? `Estado retrocedido a ${nuevoEstado}` : `Estado avanzado a ${nuevoEstado}`);
          this.cargarPedidos();
        },
        error: (err: HttpErrorResponse) => {
          this.spinnerService.hide();
      
          let mensajeParaUsuario = 'Ocurrió un error inesperado al actualizar el pedido.';
          if (err.error && typeof err.error === 'object' && err.error.message) {
              mensajeParaUsuario = err.error.message; 
           
          } 
          else if (err.status === 0) {
              mensajeParaUsuario = 'No hay conexión con el servidor.';
          }
         
          this.mostrarError(mensajeParaUsuario); 
      },
        complete: () => this.spinnerService.hide()
      });
    }
  }

  cancelarPedido(pedido: any): void {
    if (window.confirm('¿Estás seguro de CANCELAR este pedido? Esta acción no se puede deshacer.')) {
      this.fetchCancelarPedido(pedido, 'CANCELADO');
    }
  }
// Agregar este método
agregarPedidoAMesa(event: Event, mesa: any): void {
  event.stopPropagation(); // Evitar que se propague al card
  event.preventDefault();

  if (!this.cajaAbierta) {
    this.mostrarError('La caja está cerrada. No se pueden crear nuevos pedidos.');
    return;
  }

  // Mostrar confirmación
  const confirmacion = window.confirm(
    `¿Deseas agregar un nuevo pedido a la mesa ${mesa.nombreMesa}?\n\n` +
    `Este pedido se agregará a la cuenta actual como una comanda adicional.`
  );

  if (confirmacion) {
    this.navegarACartaConMesa(mesa);
  }
}

// Método para navegar a la carta con la información de la mesa
navegarACartaConMesa(mesa: any): void {
  // Guardar información en localStorage para persistencia
  localStorage.setItem(`nombreMesa_${mesa.idMesa}`, mesa.nombreMesa);
  
  // También guardar que viene de una cuenta existente (opcional)
  localStorage.setItem('origenPedido', 'cuenta_existente');
  
  // Navegar a la carta con el ID de la mesa
  this.router.navigate(['/pages/orders/crear-pedido/carta', mesa.idMesa], {
    state: { 
      nombreMesa: mesa.nombreMesa,
      origen: 'cuenta_existente',
      pedidosExistentes: mesa.cantidadPedidos || 0
    }
  });
}
  fetchCancelarPedido(pedido: any, nuevoEstado: string): void {
      this.spinnerService.show();
      this.platosService.CancelarPedido(pedido.idPedido, nuevoEstado).subscribe({
        next: (response: any) => {
          pedido.estadoPedido = nuevoEstado;
          pedido.ultModificacion = new Date().toISOString();
          this.mostrarExito("Pedido Cancelado correctamente");
          this.cargarPedidos();
        },
        error: (err: HttpErrorResponse) => {
          this.spinnerService.hide();
      
          let mensajeParaUsuario = 'Ocurrió un error inesperado al actualizar el pedido.';
          if (err.error && typeof err.error === 'object' && err.error.message) {
              mensajeParaUsuario = err.error.message; 
           
          } 
          else if (err.status === 0) {
              mensajeParaUsuario = 'No hay conexión con el servidor.';
          }
         
          this.mostrarError(mensajeParaUsuario); 
      },
        complete: () => this.spinnerService.hide()
      });
    
  }

  ordenarPedidosPorFecha(pedidos: any[]) {
    pedidos.sort((a, b) => new Date(b.ultModificacion).getTime() - new Date(a.ultModificacion).getTime());
  }

  getEstadoColor(estado: string): string {
    switch (estado) {
      case 'ENTREGADO': return 'barra-verde';
      case 'POR RECOGER': return 'barra-azul';
      case 'ENVIADO': return 'barra-amarillo';
      case 'CANCELADO': return 'barra-rojo';
      case 'ABONADO': return 'barra-gris';
      default: return 'barra-default';
    }
  }

  getEstadoFont(estado: string): string {
    switch (estado) {
      case 'ENTREGADO': return 'color-verde';
      case 'POR RECOGER': return 'color-azul';
      case 'ENVIADO': return 'color-amarillo';
      case 'CANCELADO': return 'color-rojo';
      case 'ABONADO': return 'color-gris';
      default: return 'color-default';
    }
  }

  mostrarFlechaAvance(pedido: any, rol: string): boolean {
    const siguienteEstado = this.getSiguienteEstado(pedido);

    if (siguienteEstado === 'POR RECOGER' && (rol === 'Administrador' || rol === 'Mesero' ||rol === 'Caja')) {
      return true;
    }

    if (siguienteEstado === 'ENTREGADO' && (rol === 'Administrador' || rol === 'Mesero'|| rol === 'Caja')) {
      return true;
    }

    if (siguienteEstado === 'ABONADO' && rol === 'Caja') {
      return true;
    }

    return false;
  }
  mostrarFlechaRetroceso(pedido: any, rol: string): boolean {
    return rol === 'ADMIN' && this.puedeRetroceder(pedido);
  }
  mostrarError(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: ['error-snackbar']
    });
  }
  mostrarExito(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000
    });
  }

  resetPagination() {
    this.currentPage = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado?.toUpperCase()) {
      case 'ENTREGADO':
        return 'badge-verde';
      case 'ABONADO':
        return 'badge-verde';
      case 'ENVIADO':
        return 'badge-amarillo';
      case 'POR RECOGER':
        return 'badge-azul';
      case 'CONFIRMAR':
        return 'badge-amarillo';
      case 'CANCELADO':
        return 'badge-rojo';
      default:
        return 'badge-default';
    }
  }

}