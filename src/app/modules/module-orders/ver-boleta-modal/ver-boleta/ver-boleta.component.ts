import { Component, Inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { BoletaData } from '../../interface/boleta-data.interface';




@Component({
  selector: 'app-ver-boleta',
  templateUrl: './ver-boleta.component.html',
  styleUrls: ['./ver-boleta.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    DecimalPipe // Necesario para el pipe 'number'
  ]
})
export class VerBoletaComponent {
  constructor(
    public dialogRef: MatDialogRef<VerBoletaComponent>,
@Inject(MAT_DIALOG_DATA) public data: BoletaData  ) {}

  calcularSubtotal(): number {
    return this.data.items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  }

  onClose(): void {
    this.dialogRef.close();
  }

  imprimirBoleta(): void {
    window.print();
  }
}
export { BoletaData };
