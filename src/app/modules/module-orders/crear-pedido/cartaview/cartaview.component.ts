import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

// ASEGURA QUE ESTAS RUTAS SEAN CORRECTAS EN TU PROYECTO
import { PlatosServiceService } from 'src/app/modules/module-products/services/platos-service.service';
import { Categoria, DeliveryPagadoRequestDTO, PedidoSave, Plato, Sabores } from '../../interface/Items';
import { OrdersService } from '../../services/orders.service';
import { ResumenPedidoModalComponent } from '../resumen-pedido-modal/resumen-pedido-modal.component';
import { ConfiguradorAdicionalComponent } from '../configurador-adicional/configurador-adicional.component';
import { ModalComandaCobroComponent } from 'src/app/modules/module-sales/modal-comanda-cobro/modal-comanda-cobro.component';
import { FinalizarCobroDTO } from 'src/app/modules/module-sales/interfaces/itemsVentas';
import { CajaService } from 'src/app/modules/module-sales/services/caja-service.service';

export interface DetalleSeleccionado {
  idPlato: number;
  nombre: string;
  precio: number;
  cantidad: number;
  comentario: string;
  idSabor?: number;
  sabor?: number
  tipoPapas: string;
  detallePedidoAdicional: {
    idAdicional: number;
    adicional: string;
    cantidad: number;
    precio: number;
  }[];
  esPersonalizado: boolean;
  subtotal?: number;
  categoria?: string;
  detalleSabores: Sabores[]
}

@Component({
  selector: 'app-cartaview',
  templateUrl: './cartaview.component.html',
  styleUrls: ['./cartaview.component.css']
})
export class CartaviewComponent implements OnInit {

  idMesa!: number;
  categorias: Categoria[] = [];
  categoriaTodos: Categoria = { idCategoria: 0, nombre: "Todos" };

  isLoadingCategorias: boolean = true;
  selectedCategoriaIndex: number = 0; // 0 = Carrito, 1 = Primera Categoría
  busqueda: string = '';
  pageNumber: number = 1;
  pageSize: number = 10;
  productos: Plato[] = [];
  productosFiltradas: Plato[] = [];
  totalCount: number = 0;
  isLoadingProductos: boolean = false;
  categoriaActivaId: number = 0;
  seleccionados: DetalleSeleccionado[] = [];
  isDelivery: boolean = false;
  idCaja: number | undefined = 0;
  nombreMesa: string = '';

  constructor(
  private route: ActivatedRoute,
  private platosService: PlatosServiceService,
  private orderService: OrdersService,
  private dialog: MatDialog,
  private snackBar: MatSnackBar,
  private cajaService: CajaService,
  private router: Router
) {
  this.idMesa = Number(this.route.snapshot.paramMap.get('idMesa'));
  
  if (this.idMesa == -1) {
    this.isDelivery = true;
  } else {
    // INTENTAR RECUPERAR DE MÚLTIPLES FUENTES
    this.recuperarNombreMesa();
  }
}

// NUEVO MÉTODO: Recuperar nombre de mesa de todas las fuentes posibles
private recuperarNombreMesa() {
  // 1. Intentar del estado de navegación (primera carga)
  const navigation = this.router.getCurrentNavigation();
  if (navigation?.extras.state && navigation.extras.state['nombreMesa']) {
    this.nombreMesa = navigation.extras.state['nombreMesa'];
    // Guardar en localStorage para recargas
    localStorage.setItem(`nombreMesa_${this.idMesa}`, this.nombreMesa);
    console.log("Nombre recuperado de navigation:", this.nombreMesa);
    return;
  }
  
  // 2. Intentar de localStorage (recargas de página)
  const nombreGuardado = localStorage.getItem(`nombreMesa_${this.idMesa}`);
  if (nombreGuardado) {
    this.nombreMesa = nombreGuardado;
    console.log("Nombre recuperado de localStorage:", this.nombreMesa);
    return;
  }
  
  // 3. Valor por defecto si no hay nada
  this.nombreMesa = `Mesa ${this.idMesa}`;
  console.log("Usando nombre por defecto:", this.nombreMesa);
}

ngOnInit(): void {
  this.cargarCategorias();
  console.log("La mesa es: " + this.nombreMesa);
  
  if(this.isDelivery) {
    this.obtenerCajaId();
  }
}
irAMesa(mesa: any) {
  // Guardar en localStorage ANTES de navegar
  localStorage.setItem(`nombreMesa_${mesa.idMesa}`, mesa.nombre);
  
  this.router.navigate(['/ruta-de-carta', mesa.idMesa], {
    state: { nombreMesa: mesa.nombre }
  });
}
  get totalItems(): number {
    return this.seleccionados.reduce((acc, p) => acc + p.cantidad, 0);
  }

  cargarCategorias() {
    this.platosService.obtenerCategorias().subscribe({
      next: (data) => {
        this.categorias = data;
        // Agregamos "Todos" al final o al principio según prefieras
        this.categorias.push(this.categoriaTodos);

        this.isLoadingCategorias = false;

        // Por defecto seleccionamos la primera categoría real (Index 1)
        if (this.categorias.length > 0) {
          this.categoriaActivaId = this.categorias[0].idCategoria;
          this.selectedCategoriaIndex = 1;
          this.cargarPlatos();
        }
      },
      error: (err) => {
        console.error('Error al cargar las categorías:', err);
        this.isLoadingCategorias = false;
      }
    });
  }

  cargarPlatos() {
    this.isLoadingProductos = true;
    this.platosService.getPlatosList(
      this.pageNumber,
      this.pageSize,
      this.busqueda,
      this.categoriaActivaId
    )
      .subscribe({
        next: (resp) => {
          this.productos = resp.data;
          this.productosFiltradas = [...this.productos];
          this.totalCount = resp.totalCount;
          this.isLoadingProductos = false;
        },
        error: (err) => {
          console.error('Error al cargar platos', err);
          this.isLoadingProductos = false;
        }
      });
  }

  // Lógica del Slider
  seleccionarCategoria(index: number) {
    this.selectedCategoriaIndex = index;
    this.productos = [];
    this.productosFiltradas = [];

    // Index 0 es Carrito, no cargamos platos
    if (index === 0) return;

    // Los indices de categorias están desplazados por 1 debido al botón carrito
    const categoria = this.categorias[index - 1];

    if (categoria) {
      this.categoriaActivaId = categoria.idCategoria;
      this.pageNumber = 1;
      this.cargarPlatos();
    }
  }

  obtenerCajaId() {
    this.cajaService.getCajaAbierta().subscribe({
      next: (caja) => {
        this.idCaja = caja ? caja.idCaja : undefined;
      },
      error: (err) => {
        console.error('Error crítico al verificar caja:', err);
      }
    });
  }


  onPageChange(event: any) {
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.cargarPlatos();
  }

  agregarProducto(plato: Plato) {
    const existente = this.seleccionados.find(p => p.idPlato === plato.idPlato && !p['esPersonalizado']);

    if (existente) {
      existente.cantidad++;
    } else {
      this.seleccionados.push({
        ...plato,
        cantidad: 1,
        categoria: plato.categoria,
        detallePedidoAdicional: [],
        esPersonalizado: false,
        detalleSabores: plato.detalleSabores
      } as any);
    }
  }

  quitarProducto(input: Plato | DetalleSeleccionado) {
    let index: number;

    if ('esPersonalizado' in input) {
      index = this.seleccionados.indexOf(input as DetalleSeleccionado);
    } else {
      // Buscar el último agregado no personalizado
      index = this.seleccionados.map(s => s.idPlato).lastIndexOf(input.idPlato);
      const simpleIndex = this.seleccionados.findIndex(s => s.idPlato === input.idPlato && !s.esPersonalizado);
      if (simpleIndex !== -1) index = simpleIndex;
    }

    if (index === -1) return;

    const item = this.seleccionados[index];

    if (item.cantidad > 1) {
      item.cantidad--;
    } else {
      this.seleccionados.splice(index, 1);
    }
  }

  getCantidadSeleccionada(plato: Plato): number {
    return this.seleccionados
      .filter(s => s.idPlato === plato.idPlato)
      .reduce((acc, p) => acc + p.cantidad, 0);
  }

  abrirConfigurador(plato: Plato) {
    const index = this.seleccionados.findIndex(p => p.idPlato === plato.idPlato && !p.esPersonalizado);
    // Nota: Aunque el index sea -1 (nuevo), permitimos configurar
    // Pero tu lógica original busca uno existente. Mantenemos tu lógica:
    if (index === -1) return;

    const itemAgrupado = this.seleccionados[index];

    const dialogRef = this.dialog.open(ConfiguradorAdicionalComponent, {
      width: '100%',
      maxWidth: '500px',
      data: {
        plato: plato,
        cantidad: itemAgrupado.cantidad
      }
    });

    dialogRef.afterClosed().subscribe((instanciasConfiguradas: any[]) => {
      if (instanciasConfiguradas && instanciasConfiguradas.length > 0) {
        this.seleccionados.splice(index, 1); // Quitamos el genérico
        instanciasConfiguradas.forEach(instancia => {
          this.seleccionados.push(instancia); // Agregamos los configurados
        });
      }
    });
  }

  confirmarPedido() {
    if (this.seleccionados.length === 0) return;

    const dialogRef = this.dialog.open(ResumenPedidoModalComponent, {
      width: '90%',
      maxWidth: '600px',
      data: { seleccionados: this.seleccionados, idMesa: this.idMesa, isDelivery: this.isDelivery }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      const pedidoSave = result.pedido;
      const total = result.totalPedido;

      if (this.isDelivery) {
        pedidoSave.isDelivery = true;
        delete pedidoSave.idMesa;

        // Modal de Cobro para Delivery
        const dialogCobro = this.dialog.open(ModalComandaCobroComponent, {
          width: '600px',
          maxHeight: '90vh',
          disableClose: true,
          data: {
            idMesa: 0,
            nombreMesa: 'DELIVERY - ' + pedidoSave.nombreCliente,
            idCaja: this.idCaja,
            isDelivery: true,
            totalDelivery: total,
            itemsDelivery: this.seleccionados
          }
        });

        dialogCobro.afterClosed().subscribe((cobroData: FinalizarCobroDTO | undefined) => {
          if (!cobroData) {
            this.mostrarNotificacion('Cobro cancelado. El delivery no se creó.', 'warning-snackbar');
            return;
          }

          const deliveryRequest: DeliveryPagadoRequestDTO = {
            pedido: pedidoSave,
            cobro: cobroData
          };

          this.isLoadingProductos = true; // Reusamos flag para bloquear UI
          this.orderService.guardarDeliveryPagado(deliveryRequest).subscribe({
            next: (res) => {
              this.isLoadingProductos = false;
              if (res.success) {
                this.procesarExito();
              } else {
                this.mostrarNotificacion(`Error: ${res.message}`, 'error-snackbar-pro');
              }
            },
            error: (err) => {
              this.isLoadingProductos = false;
              const msg = err.error?.message || 'Error de conexión';
              this.mostrarNotificacion(`⛔ ${msg}`, 'error-snackbar-pro');
            }
          });
        });
        return;
      }

      // Pedido Normal (Mesa)
      this.orderService.savePedido(pedidoSave).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.procesarExito();
          } else {
            this.mostrarNotificacion(`Aviso: ${res.message}`, 'warning-snackbar');
          }
        },
        error: (err) => {
          const mensajeError = err?.error?.message || err?.message || 'Error al procesar el pedido';
          this.mostrarNotificacion(`⚠️ ${mensajeError}`, 'error-snackbar-pro');
        }
      });
    });
  }

  private procesarExito() {
    if (window.navigator?.vibrate) window.navigator.vibrate(100);
    this.seleccionados = [];
    this.mostrarNotificacion('¡Pedido enviado con éxito! 👨‍🍳', 'success-snackbar-pro');

    // Opcional: Redirigir o limpiar pantalla
    this.selectedCategoriaIndex = 1; // Volver a la primera categoría
  }

  private mostrarNotificacion(mensaje: string, clase: string) {
    this.snackBar.open(mensaje, 'ENTENDIDO', {
      duration: 3000,
      panelClass: [clase]
    });
  }

  // NUEVO MÉTODO: Ejecutar búsqueda manual
  ejecutarBusqueda() {
    // Solo ejecutar si hay texto para buscar
    if (this.busqueda && this.busqueda.trim()) {
      // Buscar el índice de la categoría "Todos" en el array de categorías
      const indexTodos = this.categorias.findIndex(cat => cat.idCategoria === 0);

      if (indexTodos !== -1) {
        // +1 porque el índice 0 es el carrito
        this.selectedCategoriaIndex = indexTodos + 1;
        this.categoriaActivaId = 0; // ID de la categoría "Todos"
      }

      this.isLoadingProductos = true;
      this.productos = [];
      this.productosFiltradas = [];
      this.pageNumber = 1;
      this.cargarPlatos();
    } else {
      // Opcional: Mostrar mensaje si no hay texto
      this.snackBar.open('Ingresa un texto para buscar', 'OK', {
        duration: 2000,
        panelClass: ['warning-snackbar']
      });
    }
  }

  // NUEVO MÉTODO: Limpiar búsqueda
  limpiarBusqueda() {
    this.busqueda = '';

    // Opcional: Recargar la categoría actual sin filtro
    // Esto mostrará todos los productos de la categoría actual
    if (this.selectedCategoriaIndex > 0) {
      this.isLoadingProductos = true;
      this.productos = [];
      this.productosFiltradas = [];
      this.pageNumber = 1;
      this.cargarPlatos();
    }

    // Opcional: Mostrar notificación
    this.snackBar.open('Búsqueda limpiada', 'OK', {
      duration: 2000,
      panelClass: ['info-snackbar']
    });
  }


  // NUEVO MÉTODO PRIVADO: Lógica común de búsqueda
  private realizarBusqueda() {
    // IMPORTANTE: Si hay texto de búsqueda, seleccionar la categoría "Todos"
    if (this.busqueda && this.busqueda.trim()) {
      // Buscar el índice de la categoría "Todos" en el array de categorías
      const indexTodos = this.categorias.findIndex(cat => cat.idCategoria === 0);

      if (indexTodos !== -1) {
        // +1 porque el índice 0 es el carrito
        this.selectedCategoriaIndex = indexTodos + 1;
        this.categoriaActivaId = 0; // ID de la categoría "Todos"
      } else {
        // Si no encuentra "Todos", ir a la primera categoría
        this.selectedCategoriaIndex = 1;
        this.categoriaActivaId = this.categorias[0]?.idCategoria || 0;
      }
    } else {
      // Si la búsqueda está vacía, mantener la categoría actual o ir a la primera
      if (this.selectedCategoriaIndex === 0) {
        this.selectedCategoriaIndex = 1;
        this.categoriaActivaId = this.categorias[0]?.idCategoria || 0;
      }
    }

    this.isLoadingProductos = true;
    this.productos = [];
    this.productosFiltradas = [];
    this.pageNumber = 1;
    this.cargarPlatos();
  }

}
