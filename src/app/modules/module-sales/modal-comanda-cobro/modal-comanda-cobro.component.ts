import { Component, Inject, OnInit } from '@angular/core';
import { DetalleAdicionalDTO, FinalizarCobroDTO, ItemPedidoDTO, PedidoPorCobrarDTO, ResumenCuentaDTO } from '../interfaces/itemsVentas';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrdersService } from '../../module-orders/services/orders.service';
import { VentaServiceService } from '../services/venta-service.service';
import { DetalleSeleccionado } from '../../module-orders/crear-pedido/cartaview/cartaview.component';

export interface ModalCobroData {
  idMesa: number;
  nombreMesa: string;
  idCaja: number;
  isDelivery?: boolean;
  totalDelivery?: number;
  itemsDelivery?: any;
}

@Component({
  selector: 'app-modal-comanda-cobro',
  templateUrl: './modal-comanda-cobro.component.html',
  styleUrls: ['./modal-comanda-cobro.component.css']
})
export class ModalComandaCobroComponent implements OnInit {

  Math = Math;
  isLoading: boolean = true;
  cuenta: ResumenCuentaDTO | null = null;
  errorCarga: boolean = false;
  pasoActual: 'RESUMEN' | 'SELECCION_PAGO' = 'RESUMEN';
  mensajeVacio: string | null = null;
  montoDescuento: number = 0;
  montoDelivery: number = 0;

  pago = { efectivo: 0, tarjeta: 0, yape: 0 , plin: 0};
  montoPropina: number = 0;

  constructor(
    public dialogRef: MatDialogRef<ModalComandaCobroComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ModalCobroData,
    private pedidosService: OrdersService,
    private snackBar: MatSnackBar,
    private ventasService: VentaServiceService,
  ) { }

  ngOnInit(): void {
    if (this.data.isDelivery) {
      this.cargarDatosDelivery();
    } else {
      this.cargarDatosMesa();
    }
  }

  // Getter para total con propina
  get totalConPropina(): number {
    return this.totalCalculado + this.montoPropina;
  }

  get totalCalculado(): number {
    const subtotal = this.cuenta?.totalGeneral || 0;
    const calculo = subtotal + this.montoDelivery - this.montoDescuento;
    return Math.max(0, calculo); 
  }

  get faltante(): number {
    const objetivoVenta = this.totalCalculado;
    const sumaPagosEnCaja = this.pago.efectivo + this.pago.tarjeta + this.pago.yape + this.pago.plin;
    return objetivoVenta - sumaPagosEnCaja;
  }

  irAPagar() {
    this.pasoActual = 'SELECCION_PAGO';
    this.resetearPagos();
  }

  volverAlResumen() {
    this.pasoActual = 'RESUMEN';
  }

  cerrar() {
    this.dialogRef.close();
  }

  resetearPagos() {
    this.checkValid();
    this.pago = { efectivo: 0, tarjeta: 0, yape: 0, plin: 0 };
  
  
  }

  seleccionarMetodoUnico(metodo: 'EFECTIVO' | 'TARJETA' | 'YAPE' | 'PLIN') {
    this.resetearPagos();
    const totalVenta = this.totalCalculado; 
    if (metodo === 'EFECTIVO') this.pago.efectivo = totalVenta;
    if (metodo === 'TARJETA') this.pago.tarjeta = totalVenta;
    if (metodo === 'YAPE') this.pago.yape = totalVenta;
    if (metodo === 'PLIN') this.pago.plin = totalVenta;
  }

  checkValid() {
    // Validar negativos básicos
    if (this.pago.efectivo < 0) this.pago.efectivo = 0;
    if (this.pago.tarjeta < 0) this.pago.tarjeta = 0;
    if (this.pago.yape < 0) this.pago.yape = 0;
    if (this.pago.plin < 0) this.pago.plin = 0;
    if (this.montoPropina < 0) this.montoPropina = 0;
    const deudaTotal = (this.cuenta?.totalGeneral || 0) + this.montoDelivery;
    if (this.montoDescuento > deudaTotal) {
      this.montoDescuento = deudaTotal; 
      this.snackBar.open('⚠️ El descuento no puede superar el total de la cuenta.', 'Entendido', { duration: 2000 });
    }
    if (this.montoDescuento < 0) this.montoDescuento = 0;
  }

  validarEstadoSaldo(): string {
    const f = this.faltante;
    if (f > 0.1) return 'faltante';
    if (f < -0.1) return 'excedente'; // Pequeño fix visual
    return 'completo';
  }

  finalizarCobro() {

    if (Math.abs(this.faltante) > 0.1) {
      if (this.faltante > 0) {
        this.snackBar.open(`⚠️ Faltan S/ ${this.faltante.toFixed(2)} para cubrir la cuenta.`, 'Corregir');
      } else {
        this.snackBar.open(`⚠️ El monto excede el total. Ajuste a S/ ${this.cuenta?.totalGeneral}`, 'Corregir');
      }
      return;
    }

    const detallesPago = [];
    if (this.pago.efectivo > 0) detallesPago.push({ metodo: 'EFECTIVO', monto: this.pago.efectivo });
    if (this.pago.tarjeta > 0) detallesPago.push({ metodo: 'TARJETA', monto: this.pago.tarjeta });
    if (this.pago.yape > 0) detallesPago.push({ metodo: 'YAPE', monto: this.pago.yape });
    if (this.pago.plin > 0) detallesPago.push({ metodo: 'PLIN', monto: this.pago.plin });

    const inputCobro: FinalizarCobroDTO = {
      totalParcial: this.cuenta?.totalGeneral || 0,
      vuelto: 0,
      boletaFactura: '',
      fechaRegistro: new Date(),
      idCaja: this.data.idCaja,
      idMesa: this.data.idMesa,
      descuento: this.montoDescuento > 0 ? this.montoDescuento : undefined,
       precioDelivery: this.montoDelivery > 0 ? this.montoDelivery : undefined,
      idsPedidos: this.cuenta?.pedidos.map(p => p.idPedido) || [],
      detallesPago: detallesPago,
      montoPropina: this.montoPropina > 0 ? this.montoPropina : undefined
    };

    console.log('📤 Enviando cobro:', inputCobro);

    if (this.data.isDelivery) {
      this.dialogRef.close(inputCobro);
      return;
    }

    this.isLoading = true;

    this.ventasService.finalizarCobro(inputCobro).subscribe({
      next: (resp) => {
        this.isLoading = false;

        if (resp.success) {
          let mensaje = '✅ ¡Cobro registrado correctamente!';
          
          if (this.montoPropina > 0) {
            mensaje += ` (Propina: S/ ${this.montoPropina.toFixed(2)})`;
          }

          this.snackBar.open(mensaje, 'Cerrar', {
            duration: 4000,
            panelClass: ['success-snackbar']
          });

          this.dialogRef.close(true);

        } else {
          this.snackBar.open(`⛔ ${resp.message}`, 'Entendido', { duration: 5000 });

          if (resp.message.toLowerCase().includes('actualice')) {
            this.cargarDatosMesa();
            this.volverAlResumen();
          }
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('❌ Error completo:', err);
        
        if (err.error && err.error.message) {
          this.manejarErrorBackend(err.error.message);
        } else if (err.status === 400) {
          this.snackBar.open('⛔ Datos de cobro inválidos. Verifique la información.', 'Cerrar', { duration: 5000 });
        } else {
          console.error('Error crítico:', err);
          this.snackBar.open('❌ Error de conexión o servidor no disponible.', 'Cerrar', { duration: 5000 });
        }
      }
    });
  }

  manejarErrorBackend(mensaje: string) {
    this.snackBar.open(`⛔ ${mensaje}`, 'Entendido', { duration: 5000 });
  }

  cargarDatosMesa() {
    this.isLoading = true;
    this.errorCarga = false;
    this.mensajeVacio = null;

    this.pedidosService.obtenerResumenMesa(this.data.idMesa).subscribe({
      next: (res) => {
        this.cuenta = res;
        this.isLoading = false;

        if (res.tienePedidosEnCocina) {
   
        }
      },
      error: (err) => {
        this.isLoading = false;

        if (err.error && err.error.message === "La mesa no tiene pedidos pendientes de cobro.") {
          this.mensajeVacio = err.error.message;
          this.cuenta = null;
          return;
        }
        console.error('Error cargando cuenta:', err);
        this.errorCarga = true;
      }
    });
  }

  private cargarDatosDelivery() {
    this.isLoading = true;
    this.errorCarga = false;
    this.mensajeVacio = null;

    const itemsTransformados: ItemPedidoDTO[] = (this.data.itemsDelivery || []).map((item: any) => {
      const costoExtrasUnitario = (item.detallePedidoAdicional || []).reduce((acc: number, extra: any) => acc + (extra.precio * extra.cantidad), 0);
      const subtotalLinea = (item.precio + costoExtrasUnitario) * item.cantidad;
      const extrasMapeados: DetalleAdicionalDTO[] = (item.detallePedidoAdicional || []).map((extra: any) => ({
        idDetalleAdicional: 0,
        adicional: extra.adicional,
        precio: extra.precio,
        cantidad: extra.cantidad,
        idAdicional: extra.idAdicional
      }));

      return {
        idDetallePedido: 0,
        cantidad: item.cantidad,
        subtotal: subtotalLinea,
        comentario: item.comentario || '',
        idPedido: 0,
        idPlato: item.idPlato,
        plato: item.nombre,
        precio: item.precio,
        idSabor: item.idSabor,
        sabor: item.sabor,
        tipoPapas: item.tipoPapas,
        detallePedidoAdicional: extrasMapeados
      };
    });

    const pedidoUnico: PedidoPorCobrarDTO = {
      idPedido: 0,
      nombreCliente: 'Cliente Delivery',
      totalPedido: this.data.totalDelivery || 0,
      estado: 'NUEVO',
      fechaRegistro: new Date().toISOString(),
      esAdicional: false,
      items: itemsTransformados
    };

    this.cuenta = {
      idMesa: 0,
      nombreMesa: this.data.nombreMesa || 'DELIVERY',
      totalGeneral: this.data.totalDelivery || 0,
      tienePedidosEnCocina: false,
      mensajeAlerta: undefined,
      pedidos: [pedidoUnico]
    };

    this.isLoading = false;
  }
}