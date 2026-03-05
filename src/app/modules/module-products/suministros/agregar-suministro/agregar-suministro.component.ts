import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SuministroServiceService } from '../../services/suministro-service.service';

@Component({
  selector: 'app-agregar-suministro',
  templateUrl: './agregar-suministro.component.html',
  styleUrls: ['./agregar-suministro.component.css']
})
export class AgregarSuministroComponent {
  suministro = {
    nombre: '',
    estado: true,  // Por defecto activo
    stock: 0,
    unidad: '',
    fechaRegistro: new Date().toISOString(), // Formato ISO 8601
    idCategoria: 0,
    categoria: ''
  };

  constructor(
    private suministroService: SuministroServiceService,
    private dialogRef: MatDialogRef<AgregarSuministroComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data && data.categorias) {
      this.data.categorias = data.categorias; // Pasar las categorías desde el modal padre
    }
  }

  guardarSuministro() {
    // Obtener la categoría seleccionada
    const categoriaSeleccionada = this.data.categorias.find((cat: { idCategoria: number; }) => cat.idCategoria === this.suministro.idCategoria);
    
    if (!categoriaSeleccionada) {
      console.error('Categoría no encontrada');
      return;
    }

    // Asignar el nombre de la categoría
    this.suministro.categoria = categoriaSeleccionada.nombre;

    this.suministroService.agregarSuministro(this.suministro).subscribe({
      next: (response) => {
        this.dialogRef.close(this.suministro); // Cierra el modal con éxito
      },
      error: (error) => {
        console.error('Error al agregar suministro:', error);
      }
    });
  }

  cerrarModal() {
    this.dialogRef.close();
  }
}
