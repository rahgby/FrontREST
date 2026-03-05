// categoria.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private dominio: string = environment.baseUrlApi;
  private apiCategoriaUrl: string = `${this.dominio}/api/categoriaSuministro`;

  constructor(private http: HttpClient) { }

  // Obtener todas las categorías
  obtenerCategorias(): Observable<any> {
    return this.http.get(`${this.apiCategoriaUrl}/lista`);
  }

  // Obtener categoría por ID
  obtenerCategoriaPorId(id: number): Observable<any> {
    return this.http.get(`${this.apiCategoriaUrl}/${id}`);
  }

  // Crear nueva categoría
  crearCategoria(categoria: any): Observable<any> {
    return this.http.post(this.apiCategoriaUrl, categoria, {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(
      catchError(error => {
        console.error('Error al crear categoría:', error);
        return throwError(() => new Error('Hubo un problema al crear la categoría.'));
      })
    );
  }

  // Eliminar categoría
  eliminarCategoria(id: number): Observable<any> {
    return this.http.delete(`${this.apiCategoriaUrl}?id=${id}`);
  }
}