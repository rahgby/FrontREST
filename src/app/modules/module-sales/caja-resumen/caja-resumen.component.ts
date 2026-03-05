// caja-resumen.component.ts
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CajaService } from '../services/caja-service.service';
import { CajaDTO } from '../interfaces/itemsVentas';

@Component({
  selector: 'app-modal-resumen-caja',
  templateUrl: './caja-resumen.component.html',
  styleUrls: ['./caja-resumen.component.css']
})

export class CajaResumenComponent {
  caja: CajaDTO | null = null;
  loading = true;
  error = false;

  constructor(
    public dialogRef: MatDialogRef<CajaResumenComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { idCaja: number },
    private cajaService: CajaService
  ) {}

  ngOnInit(): void {
    this.cargarResumen();
  }

  cargarResumen() {
    this.loading = true;
    this.cajaService.getUltimaCajaCerrada().subscribe({
      next: (res) => {
        this.caja = res;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.error = true;
      }
    });
  }

  imprimir(): void {
    window.print();
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}