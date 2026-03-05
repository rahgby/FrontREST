import { Component, Inject } from '@angular/core';
import { PedidoDTO } from '../interfaces/itemsVentas';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { VentaServiceService } from '../services/venta-service.service';

@Component({
  selector: 'app-modal-pedidos-venta',
  templateUrl: './modal-pedidos-venta.component.html',
  styleUrls: ['./modal-pedidos-venta.component.css']
})
export class ModalPedidosVentaComponent {

  listaPedidos: PedidoDTO[] = [];
  isLoading: boolean = true; 

  constructor(

    @Inject(MAT_DIALOG_DATA) public data: { idVenta: number, total: number, descuento: number, delivery: number },
    public dialogRef: MatDialogRef<ModalPedidosVentaComponent>,
    private _ventaService: VentaServiceService
  ) {}

  ngOnInit(): void {

    this.cargarPedidos();
  }

  get subtotalBase(): number {
    // Matemática inversa: Si Total = Base + Del - Desc
    // Entonces: Base = Total - Del + Desc
    return (this.data.total - (this.data.delivery || 0)) + (this.data.descuento || 0);
  }



  cargarPedidos() {
    this.isLoading = true;
    this._ventaService.getPedidosPorVenta(this.data.idVenta).subscribe({
      next: (resp) => {
        console.log(resp);
        this.listaPedidos = resp
        
        
        this.isLoading = false;
        console.log("Pedidos cargados:", this.listaPedidos);
      },
      error: (err) => {
        console.error("Error al cargar pedidos:", err);
        this.isLoading = false;
      }
    });
  }

  cerrar() {
    this.dialogRef.close();
  }
}
