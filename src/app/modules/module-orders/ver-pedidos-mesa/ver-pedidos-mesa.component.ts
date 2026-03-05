import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { ResumenCuentaDTO } from '../../module-sales/interfaces/itemsVentas';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { OrdersService } from '../services/orders.service';

@Component({
  selector: 'app-ver-pedidos-mesa',
  templateUrl: './ver-pedidos-mesa.component.html',
  styleUrls: ['./ver-pedidos-mesa.component.css']
})
export class VerPedidosMesaComponent {

  cuenta: ResumenCuentaDTO | null = null;
  isLoading: boolean = true;
  errorCarga: boolean = false;
  mensajeVacio: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<VerPedidosMesaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { idMesa: number, nombreMesa?: string }, // Recibimos el ID aquí
    private ordersService: OrdersService
  ) { }

  ngOnInit(): void {

    if (this.data.idMesa) {
      this.cargarDatosMesa();
    } else {
      this.errorCarga = true;
      this.isLoading = false;
    }
  }

  cargarDatosMesa() {
    this.isLoading = true;
    this.errorCarga = false;
    this.mensajeVacio = null;

    this.ordersService.obtenerResumenMesa(this.data.idMesa).subscribe({
      next: (res) => {
        this.cuenta = res;
        this.isLoading = false;
        if (res.tienePedidosEnCocina) {
      
      }
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;

        if (err.status === 404 || (err.error && err.error.message === "La mesa no tiene pedidos pendientes de cobro.")) {
          this.mensajeVacio = "Esta mesa no tiene pedidos pendientes.";
          this.cuenta = null;
          return;
        }

        console.error('Error cargando cuenta:', err);
        this.errorCarga = true;
      }
    });
  }

  // Helper para pintar los badges de estado del pedido
  getClassEstado(estado: string): string {
    switch (estado?.toUpperCase()) {
      case 'ENVIADO': return 'enviado';
      case 'ENTREGADO': return 'entregado';
      case 'CANCELADO': return 'cancelado';
      default: return '';
    }
  }

  cerrarModal(): void {
    this.dialogRef.close();
  }

}
