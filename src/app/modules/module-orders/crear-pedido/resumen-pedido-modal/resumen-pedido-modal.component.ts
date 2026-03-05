import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PedidoSave, DetallePedidoSave, Sabor, DetallePedidoAdicionalSave, Sabores } from '../../interface/Items';
import { PlatosServiceService } from 'src/app/modules/module-products/services/platos-service.service';
import { DetalleSeleccionado } from '../cartaview/cartaview.component';

@Component({
  selector: 'app-resumen-pedido-modal',
  templateUrl: './resumen-pedido-modal.component.html',
  styleUrls: ['./resumen-pedido-modal.component.css']
})
export class ResumenPedidoModalComponent implements OnInit {

  seleccionados: DetalleSeleccionado[] = [];
  idMesa!: number;
  isFetching: boolean = false;
  nombreCliente: string = '';
  isDelivery = false;
  saboresMap: { [idPlato: number]: Sabores[] } = {};

  constructor(
    private dialogRef: MatDialogRef<ResumenPedidoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { seleccionados: DetalleSeleccionado[], idMesa: number, isDelivery: boolean },
    private platosService: PlatosServiceService
  ) { }

  ngOnInit(): void {
    this.seleccionados = this.data.seleccionados;
    this.idMesa = this.data.idMesa;
    this.isDelivery = this.data.isDelivery


    this.seleccionados.forEach(item => {
      if (!item.idSabor && item.detalleSabores.length > 0) {

        this.saboresMap[item.idPlato] = item.detalleSabores;
        item.idSabor = item.detalleSabores[0].idSabor;

      }
      if (!item.tipoPapas && item.categoria?.toLowerCase().includes('hamburguesa')) {
        item.tipoPapas = 'fritas';
      }
    });
  }

  eliminarPlato(item: DetalleSeleccionado): void {
    this.seleccionados = this.seleccionados.filter(p => p !== item);
    if (this.seleccionados.length === 0) {
      this.dialogRef.close(); // Si no hay nada, cerramos el modal
    }
  }


  calcularExtras(item: DetalleSeleccionado): number {
    if (!item.detallePedidoAdicional || item.detallePedidoAdicional.length === 0) {
      return 0;
    }
    return item.detallePedidoAdicional.reduce((acc, ad) => {
      // Aseguramos que siempre operamos con números
      const p = Number(ad.precio || 0);
      const c = Number(ad.cantidad || 0);
      return acc + (p * c);
    }, 0);
  }

  confirmar(): void {

    if (this.isFetching) {
      return; 
  }

  this.isFetching = true; // Bloqueamos inmediatamente
    const detallePedido: DetallePedidoSave[] = this.seleccionados.map(item => {


      const adicionales: DetallePedidoAdicionalSave[] = (item.detallePedidoAdicional || []).map(ad => ({
        cantidad: ad.cantidad || 1,
        idAdicional: ad.idAdicional,
        adicional: ad.adicional
      }));

      const detalle: DetallePedidoSave = {
        cantidad: item.cantidad,
        comentario: item.comentario || '',
        idPlato: item.idPlato,
        detallePedidoAdicional: adicionales
      };

      if (item.idSabor) {
        detalle.idSabor = item.idSabor;
        const listaSabores = this.saboresMap[item.idPlato] || [];
        const saborEncontrado = listaSabores.find(s => s.idSabor == item.idSabor);
        detalle.sabor = saborEncontrado ? saborEncontrado.nombre : undefined;
      }

      if (item.tipoPapas) {
        detalle.tipoPapas = item.tipoPapas as 'fritas' | 'al hilo';
      }

      return detalle;
    });





    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(now.getTime() - offset).toISOString().slice(0, -1);

    if (this.nombreCliente == '' && this.isDelivery == true) {

    }

    const pedido: PedidoSave = {
      estado: true,
      estadoPedido: 'ENVIADO',
      fechaRegistro: localISOTime,
      ultModificacion: localISOTime,
      nombreCliente: this.nombreCliente || 'Cliente',
      idMesa: this.idMesa,
      detallePedido,
    };




    this.dialogRef.close({
      pedido,
      totalPedido: this.totalPedido
    });
 

  }

  cancelar(): void {
    this.dialogRef.close();
  }

  get totalPedido(): number {
    // Usamos una validación inicial para evitar errores si el array está vacío o nulo
    if (!this.seleccionados || this.seleccionados.length === 0) return 0;

    return this.seleccionados.reduce((acc, item) => {
      // 1. Precio base del plato (aseguramos que sea número)
      const precioPlatoBase = Number(item.precio || 0);

      // 2. Suma de extras: multiplicamos (precio del extra * cantidad del extra)
      // Usamos el encadenamiento opcional ?. y un array vacío [] por seguridad
      const subtotalExtras = (item.detallePedidoAdicional || []).reduce((sum, ad) => {
        return sum + (Number(ad.precio || 0) * Number(ad.cantidad || 0));
      }, 0);

      // 3. Multiplicamos (Suma de Plato + Extras) * Cantidad de platos
      return acc + ((precioPlatoBase + subtotalExtras) * Number(item.cantidad || 0));
    }, 0);
  }

  cambiarCantidadPlato(item: DetalleSeleccionado, cambio: number): void {
    const nuevaCantidad = item.cantidad + cambio;
    if (nuevaCantidad > 0) {
      item.cantidad = nuevaCantidad;
      // IMPORTANTE: Clonamos el array para que Angular detecte el cambio de referencia
      this.seleccionados = [...this.seleccionados];
    } else {
      this.eliminarPlato(item);
    }
  }

  cambiarCantidadAdicional(item: DetalleSeleccionado, ad: any, cambio: number): void {
    const nuevaCantidad = (ad.cantidad || 0) + cambio;
    if (nuevaCantidad > 0) {
      ad.cantidad = nuevaCantidad;
      // Forzamos actualización de referencia
      this.seleccionados = [...this.seleccionados];
    } else {
      item.detallePedidoAdicional = item.detallePedidoAdicional.filter(extra => extra !== ad);
      this.seleccionados = [...this.seleccionados];
    }
  }
}