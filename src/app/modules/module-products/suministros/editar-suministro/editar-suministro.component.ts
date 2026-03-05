import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SuministroServiceService } from '../../services/suministro-service.service';

@Component({
  selector: 'app-editar-suministro',
  templateUrl: './editar-suministro.component.html',
  styleUrls: ['./editar-suministro.component.css']
})
export class EditarSuministroComponent {
  suministro: any;
  categorias: any[];

  constructor(
    private suministroService: SuministroServiceService,
    private dialogRef: MatDialogRef<EditarSuministroComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // Cargar el suministro seleccionado y categorías
    this.suministro = { ...data.suministro }; // Copia del suministro para evitar modificar la referencia
    this.categorias = data.categorias;
  }

  guardarSuministro() {
    const categoriaSeleccionada = this.categorias.find(cat => cat.idCategoria === this.suministro.idCategoria);
    if (!categoriaSeleccionada) {
      console.error('Categoría no encontrada');
      return;
    }

    this.suministro.categoria = categoriaSeleccionada.nombre; // Asigna el nombre de la categoría

    this.suministroService.editarSuministro(this.suministro).subscribe({
      next: (response) => {
        this.dialogRef.close(this.suministro); // Cierra el modal y envía los cambios
      },
      error: (error) => {
        console.error('Error al editar suministro:', error);
      }
    });
  }

  cerrarModal() {
    this.dialogRef.close();
  }
}
