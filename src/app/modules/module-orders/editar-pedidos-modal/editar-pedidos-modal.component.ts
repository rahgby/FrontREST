import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { OrdersService } from '../services/orders.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/auth/services/auth.service';
import { MesaService } from '../services/mesa.service';
import { Mesa} from '../interface/Items';
@Component({
  selector: 'app-editar-pedidos-modal',
  templateUrl: './editar-pedidos-modal.component.html',
  styleUrls: ['./editar-pedidos-modal.component.css']
})
export class EditarPedidosModalComponent implements OnInit {
  copiaData: any;
  mesasDisponibles: any[] = [];
  mesasHabilitadas: any[] = [];
  misMesasOcupadas: any[] = [];


  constructor(
    public dialogRef: MatDialogRef<EditarPedidosModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private pedidosService: OrdersService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private mesaService: MesaService
  ) {
    
  }

  ngOnInit(): void {
    this.copiaData = JSON.parse(JSON.stringify(this.data));
    console.log(this.copiaData)
     this.cargarMesasParaEdicion();
  }

  eliminarDetalle(index: number): void {
    if (this.copiaData.detallePedido.length > 1) {
      this.copiaData.detallePedido.splice(index, 1);
      this.recalcularMonto();
    } else {
      this.mostrarError('Debe haber al menos un platillo en la orden.');
    }
  }
cargarMesasParaEdicion(): void {
  const idUsuario = this.copiaData.idUsuario; // ← el mesero que creó el pedido
  if (!idUsuario) return;

  this.mesaService.getMesasParaEdicion(idUsuario).subscribe({
    next: (res) => {
      if (res.success) {
        this.mesasDisponibles = res.data;
        this.mesasHabilitadas = res.data.filter((m: Mesa) => m.habilitado);
        this.misMesasOcupadas = res.data.filter((m: Mesa) => !m.habilitado && m.esDelUsuario);
      }
    },
    error: (err) => {
      console.error('Error cargando mesas:', err);
    }
  });
}
  eliminarAdicional(detalleIndex: number, adicionalIndex: number): void {
    this.copiaData.detallePedido[detalleIndex].detallePedidoAdicional.splice(adicionalIndex, 1);
    this.recalcularMonto();
  }

  private recalcularMonto(): void {
    let total = 0;
    this.copiaData.detallePedido?.forEach((detalle: any) => {
      total += detalle.subtotal || 0;
      detalle.detallePedidoAdicional?.forEach((adicional: any) => {
        total += (adicional.cantidad || 0) * (adicional.precio || 0);
      });
    });
    this.copiaData.monto = total;
  }

  guardar(): void {
    
   
      this.mostrarConfirmacion(
        '¿Está seguro de guardar los cambios?\nEstos se aplicarán inmediatamente.',
        () => this.guardarPedido()
      );
   
      
    
  }

  private mostrarConfirmacion(mensaje: string, callback: () => void): void {
    if (confirm(mensaje)) {
      callback();
    }
  }

  private guardarPedido(): void {
    const ahoraLocal = new Date();
    const offset = ahoraLocal.getTimezoneOffset() * 60000;
    const horaLocalISO = new Date(ahoraLocal.getTime() - offset).toISOString().slice(0, -1);

    this.copiaData.estado = true;
    this.copiaData.ultModificacion = horaLocalISO;

    if (this.copiaData.idMesa === undefined || this.copiaData.idMesa === null) {
        console.warn('ADVERTENCIA: IDMesa no está definido, usando valor original:', this.data.idMesa);
        this.copiaData.idMesa = this.data.idMesa;
    }

    const pedidoParaEnviar = {
        ...this.copiaData,
        IDPedido: this.copiaData.idPedido,
        IDUsuario: this.copiaData.idUsuario,
        IDCliente: this.copiaData.idCliente,
        IDMesa: this.copiaData.idMesa,
        Monto: this.copiaData.monto,
        EstadoPedido: this.copiaData.estadoPedido,
        FechaRegistro: this.copiaData.fechaRegistro,
        UltModificacion: horaLocalISO,
        Estado: true,
        DetallePedido: this.copiaData.detallePedido?.map((detalle: any) => ({
            ...detalle,
            IDDetallePedido: detalle.idDetallePedido,
            IDPlato: detalle.idPlato,
            IDPromocion: detalle.idPromocion,
            Cantidad: detalle.cantidad,
            Subtotal: detalle.subtotal,
            Comentario: detalle.comentario,
            IdSabor: detalle.idSabor,
            TipoPapas: detalle.tipoPapas,
            DetallePedidoAdicional: detalle.detallePedidoAdicional?.map((adicional: any) => ({
                ...adicional,
                IDAdicional: adicional.idAdicional,
                Cantidad: adicional.cantidad
            }))
        }))
    };

    

    this.pedidosService.editarPedido(pedidoParaEnviar).subscribe({
        next: (res) => {
            if (res.message?.includes('solicitud') || res.message?.includes('Solicitud')) {
                this.mostrarExito('✅ Solicitud de cambio creada correctamente.\n⏳ Esperando aprobación del administrador.');
            } else {
                this.mostrarExito('✅ Pedido actualizado correctamente');
            }
            
            this.dialogRef.close(res);
        },
        error: (err) => {
            console.error('Error al actualizar el pedido:', err);
            this.mostrarError('❌ Error al actualizar el pedido: ' + err.message);
        }
    });
}
  cerrar(): void {
    this.dialogRef.close();
  }

  private mostrarError(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  private mostrarExito(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 4000,
      panelClass: ['success-snackbar']
    });
  }
}