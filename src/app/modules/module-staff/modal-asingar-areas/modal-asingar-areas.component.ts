import { Component } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { AreaService } from '../../module-orders/services/areas.service';
import { Area } from '../../module-orders/interface/Items';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-modal-asingar-areas',
  templateUrl: './modal-asingar-areas.component.html',
  styleUrls: ['./modal-asingar-areas.component.css']
})
export class ModalAsingarAreasComponent {

  misAreas: Area[] = []
  areasTotales: Area[] = []
  areasSeleccionadas: number[] = [];


  constructor( private areasService: AreaService,  private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { idUsuario: number 
    },
    private dialogRef: MatDialogRef<ModalAsingarAreasComponent>
  ) {}

  
  ngOnInit(): void {
    this.getAreasTotales();
    this.getMisAreas();
  }

  getAreasTotales(): void {
    this.areasService.getAreas().subscribe({
      next: (res) => this.areasTotales = res,
      error: () => console.error('Error al cargar áreas')
    });
  }

  getMisAreas(): void {
    this.areasService.getMisAreas(this.data.idUsuario).subscribe({
      next: (res) => this.misAreas = res,
      error: () => console.error('Error al cargar áreas del usuario')
    });
  }

  estaAsignada(idArea: number): boolean {
    return this.misAreas.some(a => a.idArea === idArea);
  }

  cerrar(): void {
    this.dialogRef.close(false);
  }


  guardar(): void {
    this.areasService
      .asignarAreas(this.data.idUsuario, this.areasSeleccionadas)
      .subscribe({
        next: () => {
          this.snackBar.open('Áreas asignadas correctamente', 'OK', {
            duration: 3000
          });
          this.dialogRef.close(true);
        },
        error: () => {
          this.snackBar.open('Error al asignar áreas', 'Cerrar', {
            duration: 3000
          });
        }
      });
  }



}
