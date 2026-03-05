import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SpinnerServiceService } from '../../module-products/services/spinner-service.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { CajaService } from '../services/caja-service.service';

@Component({
  selector: 'app-historial-cajas',
  templateUrl: './historial-cajas.component.html',
  styleUrls: ['./historial-cajas.component.css']
})
export class HistorialCajasComponent implements OnInit {
  // Filtros
  fechaInicioBusqueda: Date | null = null;
  
  // Datos
  todasLasCajas: any[] = [];
  cajasFiltradas: any[] = [];
  cajaSeleccionada: any = null;
  ventasDeCaja: any[] = [];
  cargando: boolean = false;
  cargandoVentas: boolean = false;

  // Tabla de ventas
  displayedColumns: string[] = ['correlativo', 'cliente', 'mesa', 'total', 'metodoPago', 'fechaAbonado', 'acciones'];
  dataSource = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private ventasService: CajaService,
    private spinnerService: SpinnerServiceService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.cargarTodasLasCajas();
  }

  // 1. Cargar todas las cajas
  cargarTodasLasCajas(): void {
    this.cargando = true;
    this.ventasService.getList().subscribe({
      next: (cajas) => {
        this.cargando = false;
        this.todasLasCajas = cajas || [];
        // Ordenar por fecha de inicio (más reciente primero)
        this.todasLasCajas.sort((a, b) => 
          new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime()
        );
        this.cajasFiltradas = [...this.todasLasCajas];
      },
      error: (err) => {
        this.cargando = false;
        console.error('Error al cargar cajas:', err);
        this.snackBar.open('Error al cargar el historial de cajas', 'Cerrar', { duration: 3000 });
      }
    });
  }

  // 2. Buscar cajas por fecha de inicio
  buscarCajasPorFecha(): void {
    if (!this.fechaInicioBusqueda) {
      // Si no hay fecha seleccionada, mostrar todas las cajas
      this.cajasFiltradas = [...this.todasLasCajas];
      return;
    }

    const fechaSeleccionada = new Date(this.fechaInicioBusqueda);
    fechaSeleccionada.setHours(0, 0, 0, 0);

    this.cajasFiltradas = this.todasLasCajas.filter(caja => {
      if (!caja.fechaInicio) return false;
      
      const fechaCaja = new Date(caja.fechaInicio);
      fechaCaja.setHours(0, 0, 0, 0);
      
      return fechaCaja.getTime() === fechaSeleccionada.getTime();
    });

    this.snackBar.open(
      `Encontradas ${this.cajasFiltradas.length} cajas para ${fechaSeleccionada.toLocaleDateString()}`,
      'Cerrar',
      { duration: 3000 }
    );
  }

  // 3. Obtener ventas con detalles por caja
  obtenerVentasDeCaja(caja: any): void {
    // Si ya está seleccionada, colapsar
    if (this.cajaSeleccionada?.idCaja === caja.idCaja) {
      this.cajaSeleccionada = null;
      this.ventasDeCaja = [];
      this.dataSource.data = [];
      return;
    }

    this.cajaSeleccionada = caja;
    this.cargandoVentas = true;
    this.spinnerService.show();

    this.ventasService.getVentasConDetallesPorCaja(caja.idCaja).subscribe({
      next: (response: any) => {
        this.cargandoVentas = false;
        this.spinnerService.hide();
        
        if (response.success) {
          this.ventasDeCaja = response.ventas || [];
          this.dataSource.data = this.ventasDeCaja;
          
          this.snackBar.open(
            `${this.ventasDeCaja.length} ventas cargadas para la caja #${caja.idCaja}`,
            'Cerrar',
            { duration: 3000 }
          );

          // Configurar paginador
          setTimeout(() => {
            this.dataSource.paginator = this.paginator;
          });
        } else {
          this.snackBar.open(response.message || 'Error al cargar ventas', 'Cerrar', { duration: 3000 });
          this.ventasDeCaja = [];
          this.dataSource.data = [];
        }
      },
      error: (err) => {
        this.cargandoVentas = false;
        this.spinnerService.hide();
        console.error('Error al obtener ventas de caja:', err);
        this.snackBar.open('Error al cargar ventas con detalles', 'Cerrar', { duration: 3000 });
        this.ventasDeCaja = [];
        this.dataSource.data = [];
      }
    });
  }

  // 4. Limpiar filtros
  limpiarFiltros(): void {
    this.fechaInicioBusqueda = null;
    this.cajasFiltradas = [...this.todasLasCajas];
    this.cajaSeleccionada = null;
    this.ventasDeCaja = [];
    this.dataSource.data = [];
    this.snackBar.open('Filtros limpiados', 'Cerrar', { duration: 2000 });
  }

  // Métodos de utilidad
  getEstadoCaja(caja: any): string {
    return caja.fechaCierre ? 'CERRADA' : 'ABIERTA';
  }

  getEstadoClass(caja: any): string {
    return caja.fechaCierre ? 'estado-cerrada' : 'estado-abierta';
  }

  formatFecha(fecha: any): string {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleString('es-PE');
  }

  getIconoMetodoPago(metodo: string): string {
    if (!metodo) return 'payments';
    switch (metodo.toLowerCase()) {
      case 'efectivo': return 'attach_money';
      case 'yape': return 'phone_android';
      case 'tarjeta': return 'credit_card';
      default: return 'payments';
    }
  }

  calcularDuracionCaja(caja: any): string {
    if (!caja.fechaInicio) return 'N/A';
    
    const inicio = new Date(caja.fechaInicio);
    const fin = caja.fechaCierre ? new Date(caja.fechaCierre) : new Date();
    
    const diffMs = fin.getTime() - inicio.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    }
    return `${diffMinutes}m`;
  }

  // Para la tabla de ventas
  getNombreCliente(venta: any): string {
    return venta.nombreCliente || 'Consumidor Final';
  }

  getNombreMesa(venta: any): string {
    return venta.nombreMesa || 'Sin mesa';
  }

  getMontoTotal(venta: any): number {
    return venta.venta?.total || 0;
  }

  getMetodoPago(venta: any): string {
    return venta.venta?.metodoPago || 'N/A';
  }

  getFechaAbonado(venta: any): Date | null {
    return venta.venta?.fechaAbonado || null;
  }
}