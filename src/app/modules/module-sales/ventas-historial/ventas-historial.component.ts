import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VentaServiceService } from '../services/venta-service.service';
import { VentaDTO } from '../interfaces/itemsVentas';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { ModalPedidosVentaComponent } from '../modal-pedidos-venta/modal-pedidos-venta.component';
import { MatDialog } from '@angular/material/dialog';
import { CajaService } from '../services/caja-service.service';
import { CajaDTO } from '../interfaces/itemsVentas';  

@Component({
  selector: 'app-ventas-historial',
  templateUrl: './ventas-historial.component.html',
  styleUrls: ['./ventas-historial.component.css']
})
export class VentasHistorialComponent implements OnInit {
  cajas: CajaDTO[] = [];
  totalRegistrosCajas = 0;
  pageSizeCajas = 3;
  pageNumberCajas = 1;
  isLoadingCajas = false;
  isLoading: boolean = true;
  totalRegistros = 0;
  pageSize = 10;
  pageNumber = 1;
  searchTerm = '';
  horaInicio: string = '';
  horaFin: string = '';
  fechaInicio: any = '';
  fechaFin: any = '';
  ventas: VentaDTO[] = [];

  reporteVentasCategoria: any = null;
  resumenCategoria: any = null;
  cajaInfoReporte: any = null;
  fechaGeneracionReporte: Date | null = null;
  loadingReporte = false;
  errorReporte = '';

  // Variables para el modal de detalle de categoría
  mostrarModalCategoria = false;
  categoriaSeleccionada: any = null;
  itemsCategoriaSeleccionada: any[] = [];


  constructor(
    private snackBar: MatSnackBar, private ventasService: VentaServiceService, private dialog: MatDialog, private cajaService: CajaService) {

  }


  ngOnInit() {
    this.cargarVentas();
    this.cargarCajas();
  }

  verPedidos(venta: VentaDTO) {
      const id = venta.idVenta; 
      this.dialog.open(ModalPedidosVentaComponent, {
        width: '800px', 
        disableClose: false,
        data: { idVenta: id, total: venta.total , descuento: venta.descuento, delivery:venta.precioDelivery} 
      });
    }
  
cargarCajas() {
  const fInicioFormateada = this.fechaInicio ? this.formatearFecha(this.fechaInicio) : undefined;
  const fFinFormateada = this.fechaFin ? this.formatearFecha(this.fechaFin) : undefined;

  this.isLoadingCajas = true;
  this.cajaService.getCajas(
    this.pageNumberCajas,
    this.pageSizeCajas,
    this.searchTerm,
    this.horaInicio || undefined,
    this.horaFin || undefined,
    fInicioFormateada,
    fFinFormateada
  ).subscribe({
    next: (resp) => {
      this.cajas = resp.data;
      this.totalRegistrosCajas = resp.totalCount;
      this.isLoadingCajas = false;
    },
    error: () => {
      this.isLoadingCajas = false;
      this.snackBar.open('Error al cargar cajas', 'Cerrar', { duration: 5000 });
    }
  });
}

onPageChangeCajas(event: any) {
  this.pageNumberCajas = event.pageIndex + 1;
  this.pageSizeCajas = event.pageSize;
  this.cargarCajas();
}
  crearComprobante(v: any) {

  }

  limpiarFiltros() {
    this.searchTerm = '';
    this.horaInicio = '';
    this.horaFin = '';
    this.fechaInicio = ''; // Limpiar fecha inicio
    this.fechaFin = '';    // Limpiar fecha fin
    this.pageNumber = 1;
    this.pageNumberCajas = 1; // agregar
  this.cargarVentas();
  this.cargarCajas();
  }

  private formatearFecha(fecha: any): string {
    if (!fecha || typeof fecha === 'string' && fecha === '') return '';

    const d = new Date(fecha);
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);

    return `${year}-${month}-${day}`; // Esto devuelve "2026-02-12"
  }


  cargarVentas() {

    const fInicioFormateada = this.fechaInicio ? this.formatearFecha(this.fechaInicio) : undefined;
    const fFinFormateada = this.fechaFin ? this.formatearFecha(this.fechaFin) : undefined;

    this.isLoading = true;
    this.ventasService.obtenerVentasFiltradas(
      this.pageNumber,
      this.pageSize,
      this.searchTerm,
      0,
      this.horaInicio || undefined,
      this.horaFin || undefined,
      fInicioFormateada || undefined,
      fFinFormateada || undefined

    ).subscribe({
      next: (resp) => {
        this.ventas = resp.data;
        this.totalRegistros = resp.totalCount;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.snackBar.open('Error de Servidor ', 'Cerrar', {
          duration: 5000,
          verticalPosition: 'bottom',
          panelClass: ['error-snackbar'] // Opcional: para darle estilo rojo en CSS
        });
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



  aplicarFiltros() {
    this.pageNumber = 1;
    this.cargarVentas();
    this.cargarCajas();
  }



 cargarReporteVentasPorCategoria(): void {
  this.loadingReporte = true;
  this.errorReporte = '';

  const fInicioFormateada = this.fechaInicio ? this.formatearFecha(this.fechaInicio) : undefined;
  const fFinFormateada = this.fechaFin ? this.formatearFecha(this.fechaFin) : undefined;

  this.ventasService.getReporteVentasPorCategoriaCajaActual(
    fInicioFormateada,
    fFinFormateada,
    this.horaInicio || undefined,
    this.horaFin || undefined
  ).subscribe({
    next: (response: any) => {
      this.loadingReporte = false;
      if (response.success) {
        this.reporteVentasCategoria = response.detallePorCategoria || [];
        this.resumenCategoria = response.resumen;
        this.cajaInfoReporte = response.caja;
        this.fechaGeneracionReporte = response.fechaGeneracion;

        if (this.reporteVentasCategoria.length === 0) {
          this.errorReporte = response.message || 'No hay ventas en el período seleccionado';
        }
      } else {
        this.errorReporte = response.message || 'Error al cargar el reporte';
      }
    },
    error: (err) => {
      this.loadingReporte = false;
      this.errorReporte = err.error?.message || 'Error de conexión al servidor';
    }
  });
}
  formatearMoneda(valor: number): string {
    return `S/ ${valor.toFixed(2)}`;
  }


  verDetalleCategoria(categoria: any): void {
    this.categoriaSeleccionada = categoria;
    this.itemsCategoriaSeleccionada = categoria.items || [];
    this.mostrarModalCategoria = true;
  }

  cerrarModalCategoria(): void {
    this.mostrarModalCategoria = false;
    this.categoriaSeleccionada = null;
    this.itemsCategoriaSeleccionada = [];
  }

  getIconoTipo(tipo: string): string {
    return tipo === 'PLATO' ? '🍽️' : '➕';
  }

  getClaseTipo(tipo: string): string {
    return tipo === 'PLATO' ? 'badge-primary' : 'badge-info';
  }

}
