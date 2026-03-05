import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CategoriaService } from '../../services/categoria-suministro.service';

@Component({
  selector: 'app-crear-categoria',
  templateUrl: './crear-categoria.component.html',
  styleUrls: ['./crear-categoria.component.css']
})
export class CrearCategoriaComponent {
  categoria = {
    nombre: '',
    descripcion: '',
    estado: true,
    fechaRegistro: new Date().toISOString()
  };

  constructor(
    private categoriaService: CategoriaService,
    private dialogRef: MatDialogRef<CrearCategoriaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  guardarCategoria() {
    // Validar que el nombre no esté vacío
    if (!this.categoria.nombre.trim()) {
      alert('Por favor, ingrese un nombre para la categoría');
      return;
    }

    this.categoriaService.crearCategoria(this.categoria).subscribe({
      next: (response) => {
        this.dialogRef.close(this.categoria);
      },
      error: (error) => {
        console.error('Error al crear categoría:', error);
        alert('Error al crear la categoría. Por favor, intente nuevamente.');
      }
    });
  }

  cerrarModal() {
    this.dialogRef.close();
  }
}