import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialogo-boleta-factura',
  templateUrl: './dialogo-boleta-factura.component.html',
  styleUrls: ['./dialogo-boleta-factura.component.css'],
})
export class DialogoBoletaFacturaComponent {
  constructor(private dialogRef: MatDialogRef<DialogoBoletaFacturaComponent>) {}

  crearBoleta() {
    this.dialogRef.close('boleta'); // Cierra el diálogo y devuelve 'boleta'
  }

  crearFactura() {
    this.dialogRef.close('factura'); // Cierra el diálogo y devuelve 'factura'
  }

  cerrar() {
    this.dialogRef.close(); // Cierra el diálogo sin hacer nada
  }
}