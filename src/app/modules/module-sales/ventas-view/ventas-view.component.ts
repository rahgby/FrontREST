import { Component, OnDestroy, OnInit } from '@angular/core';
import { AreaMapaCaja, CajaDTO, ReporteCajaDTO, VentaDTO} from '../interfaces/itemsVentas';
import { CajaService } from '../services/caja-service.service';
import { MesaService } from '../../module-orders/services/mesa.service';
import { DialogoMontoInicialComponent } from '../dialogo-monto-inicial/dialogo-monto-inicial.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CajaResumenComponent } from '../caja-resumen/caja-resumen.component';
import { Subject, takeUntil } from 'rxjs';
import { SseServiceService } from 'src/app/core/services/sse-service.service';
import { ModalComandaCobroComponent } from '../modal-comanda-cobro/modal-comanda-cobro.component';
import { VentaServiceService } from '../services/venta-service.service';
import { ModalPedidosVentaComponent } from '../modal-pedidos-venta/modal-pedidos-venta.component';

@Component({
  selector: 'app-ventas-view',
  templateUrl: './ventas-view.component.html',
  styleUrls: ['./ventas-view.component.css']
})
export class VentasViewComponent implements OnInit {
  cajaActual?: CajaDTO;
  montoActual: number = 0
  cajaAnterior?: CajaDTO
  isCajaAbierta: boolean = false;
  isLoadingCajaActual: boolean = true;
  isLoadingCajaAnterior: boolean = true;
  isLoadingMapa: boolean = true;
  mostrarSaldos: boolean = false;
  mostrarSaldoAnterior: boolean = false;
  mostrarSaldoInfo: boolean = false;
  totalPropinasCajaActual: number = 0
  mostrarPropinas: boolean = false;
  mapaAreas: AreaMapaCaja[] | null = [];
  private destroy$ = new Subject<void>();
  isLoadingReporte = false;
  totals: ReporteCajaDTO | null = null;
  horaInicio: string = '';
  horaFin: string = ''
  ventas: VentaDTO[] = [];
  totalRegistros = 0;
  pageSize = 10;
  pageNumber = 1;
  searchTerm = '';
  isLoading = false;


  ventasTotalesCount: number = 0;
  constructor(private cajaService: CajaService, private sseService: SseServiceService,
    private mesaService: MesaService, private dialog: MatDialog, private snackBar: MatSnackBar, private ventasService: VentaServiceService) {

  }

  ngOnInit() {
    this.verificarEstadoCaja()
    this.obtenerUltimoCierre();
    this.cargarMapaOperativo();

    this.sseService.sseData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        if (data.estado === 'ENTREGADO') {
          console.log('Refrescando Mapa por cambio en pedido:', data.pedidoId);
          this.cargarMapaOperativo();
        }
      });

  }
 

  verPedidos(venta: VentaDTO) {
    const id = venta.idVenta; 
    this.dialog.open(ModalPedidosVentaComponent, {
      width: '800px', 
      disableClose: false,
      data: { idVenta: id, total: venta.total, descuento: venta.descuento, delivery:venta.precioDelivery  } 
    });
  }

  crearComprobante(venta: VentaDTO) {
    this.snackBar.open(`Generando comprobante para Ticket #${venta.correlativo}...`, 'OK');
  }

  cargarVentas() {
    const idCaja = this.cajaActual?.idCaja;
    if (!idCaja) {
      console.warn("No hay una caja activa para filtrar el historial.");
      return;
    }

    this.isLoading = true;
    this.ventasService.obtenerVentasFiltradas(
      this.pageNumber,
      this.pageSize,
      this.searchTerm,
      idCaja,
      this.horaInicio || undefined, // Enviamos undefined si está vacío
      this.horaFin || undefined,

    ).subscribe({
      next: (resp) => {
        this.ventas = resp.data;
        this.totalRegistros = resp.totalCount;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.snackBar.open(err);
      }
    });
  }

  onSearch(termino: string) {
    this.searchTerm = termino;
    this.pageNumber = 1;
    this.cargarVentas();
  }

  onPageChange(event: any) {
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.cargarVentas();
  }

  cargarReporte() {
    const idCaja = this.cajaActual?.idCaja;
    if (!idCaja) {
      this.showSnackBar("Error no hay caja activa")
      return;
    }
    this.isLoadingReporte = true;
    this.ventasService.obtenerTotalesCaja(idCaja).subscribe({
      next: (resp) => {
        this.isLoadingReporte = false;
        if (resp.success) {
          this.totals = resp.data as ReporteCajaDTO;
          ;
        } else {
          console.error(resp.message);
        }
      },
      error: (err) => {
        this.isLoadingReporte = false;
        this.showSnackBar(err.message || 'Error al ver el monto', 'error');
      }
    });
  }

  cargarContadorVentas() {
    const idCaja = this.cajaActual?.idCaja;
    if (!idCaja) {
      this.ventasTotalesCount = 0; 
      return; 
    }
    this.ventasService.obtenerTotalVentas(idCaja).subscribe({
      next: (resp) => {
        this.ventasTotalesCount = resp.totalVentas || 0; 
      },
      error: (err) => {
        console.error("Error cargando contador:", err);
        this.ventasTotalesCount = 0; // En caso de error, fallamos seguro a 0
      }
    });
  }

  cargarMapaOperativo(): void {
    this.mesaService.getMapaOperativoCaja().subscribe({
      next: (res) => {
        if (res.success) {
          this.mapaAreas = res.data;
          this.isLoadingMapa = false;

        } else {
          this.mapaAreas = null
          this.isLoadingMapa = false;
        }
      },
      error: (err) => {
        console.error(err)
      }
    });
  }

  verificarEstadoCaja() {
    this.cajaService.getCajaAbierta().subscribe({
      next: (caja) => {
        this.isLoadingCajaActual = false

        if (caja) {
          this.cajaActual = caja;
          this.isCajaAbierta = true;
          this.cargarVentas();
          this.cargarContadorVentas();

        } else {
          this.cajaActual = undefined;
          this.isCajaAbierta = false;

        }
      },
      error: (err) => {
        console.error('Error crítico al verificar caja:', err);
        this.isCajaAbierta = false;
        this.isLoadingCajaActual = false

      }
    });
  }


  obtenerUltimoCierre() {
    this.cajaService.getUltimaCajaCerrada().subscribe({
      next: (caja) => {
        this.isLoadingCajaAnterior = false

        if (caja) {
          this.cajaAnterior = caja;

        }
      },
      error: (err) => {
        console.error('Error al obtener el historial:', err);
        this.isLoadingCajaAnterior = false
      }
    });
  }

  cerrarCaja() {
    if (!this.cajaActual?.idCaja) return;
    const confirmado = window.confirm('¿Estás seguro de que deseas cerrar la caja? Esta acción no se puede deshacer.');
  if (!confirmado) return;
    this.isLoadingCajaActual = true;
    const ahora = new Date();
    const fechaLocal = new Date(ahora.getTime() - (ahora.getTimezoneOffset() * 60000))
      .toISOString();
    const cierreDto: CajaDTO = {
      idCaja: this.cajaActual.idCaja,
      fechaCierre: fechaLocal,
      monto: 0,
      montoPropina: 0,
      ventaNeta: 0,
      montoYape: 0,
      montoEfectivo: 0,
      montoTarjeta: 0
    };

    this.cajaService.closeCaja(this.cajaActual.idCaja, cierreDto).subscribe({
      next: (res) => {
        if (res.success) {
          this.abrirModalResumen();
          this.showSnackBar('Caja cerrada correctamente.');
          this.verificarEstadoCaja()
          this.obtenerUltimoCierre();
          this.cargarMapaOperativo();
        } else {
          this.showSnackBar(res.message || 'No se pudo cerrar la caja', 'error');
        }
      },
      error: (err) => {
        this.isLoadingCajaActual = false;
        console.error(err);
        this.showSnackBar('Error de conexión al cerrar caja', 'error');
      }
    });
  }

  abrirDetalleMesa(mesa: any) {
    switch (mesa.estadoMapa) {
      case 'ABONABLE':
        this.abrirModalCobro(mesa)
        console.log(mesa.idMesa)
        break;
      case 'PREPARANDO':
      
        this.abrirModalCobro(mesa)
        break;
      case 'LIBRE':
      default:

        break;
    }
  }

  abrirModalCobro(mesa: any) {
    const dialogRef = this.dialog.open(ModalComandaCobroComponent, {
      width: '600px',
      maxHeight: '90vh',
      disableClose: true,
      data: {
        idMesa: mesa.idMesa,
        nombreMesa: mesa.nombre,
        idCaja: this.cajaActual?.idCaja,
        isDelivery: false

      }

    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        console.log('Pago exitoso, recargando mapa...');
        this.cargarMapaOperativo();
        this.cargarVentas();
        this.cargarContadorVentas();
      }
    });
  }

  abrirModalResumen() {
    this.dialog.open(CajaResumenComponent, {
      width: '400px',
      disableClose: true
    });
  }
  iniciarCaja() {
    const dialogRef = this.dialog.open(DialogoMontoInicialComponent, {
      width: '300px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(async (montoInicial) => {
      if (montoInicial !== undefined) {

        const nuevaCaja = {
          FechaInicio: new Date(),
          FechaCierre: null,
          MontoInicial: parseFloat(montoInicial)
        };

        try {
          const response = await this.cajaService.saveItem(nuevaCaja).toPromise();
          if (response && response.success) {
            this.showSnackBar('Caja iniciada con monto inicial de S/' + montoInicial);
            this.verificarEstadoCaja();
          }
        } catch (error) {
          console.error('Error al iniciar caja:', error);
          this.showSnackBar('Error al iniciar caja', 'error');
        } finally {

          this.verificarEstadoCaja()
          this.obtenerUltimoCierre();
          this.cargarMapaOperativo();

        }
      }
    });
  }

  togglePropinas() {
    this.mostrarPropinas = !this.mostrarPropinas;

  }
  toggleSaldoInfo() {
    this.mostrarSaldoInfo = !this.mostrarSaldoInfo
    if (this.mostrarSaldoInfo) {
      this.cargarReporte();
    }


  }
  getMonto(terminoBusqueda: string): number {
    if (!this.totals?.desglose) return 0;

    const item = this.totals.desglose.find(d =>
      d.metodoPago.toUpperCase().includes(terminoBusqueda.toUpperCase())
    );

    return item ? item.total : 0;
  }

  abrirHistorialCajas() {

  }
  toggleSaldos() {
    this.mostrarSaldos = !this.mostrarSaldos;
    if (this.mostrarSaldos) {
      this.cargarReporte();
    }

  }
  toggleSaldoAnterior() {
    this.mostrarSaldoAnterior = !this.mostrarSaldoAnterior;
  }
  private showSnackBar(message: string, type: 'success' | 'error' = 'success'): void {
    const panelClass = type === 'success' ? 'success-snackbar' : 'error-snackbar';
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: [panelClass]
    });
  }
  aplicarFiltros() {
    this.pageNumber = 1;
    this.cargarVentas();
  }
  limpiarFiltros() {
    this.searchTerm = '';
    this.horaInicio = '';
    this.horaFin = '';
    this.aplicarFiltros();
  }
}
