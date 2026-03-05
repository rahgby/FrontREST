import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError, finalize, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SpinnerServiceService } from './spinner-service.service';

@Injectable({
  providedIn: 'root'
})
export class AdicionalServiceService {
  private dominio: string = environment.baseUrlApi;
  private apiUrl: string = `${this.dominio}/api/adicional`;
  private apiSaborUrl: string = `${this.dominio}/api/sabores`;

  constructor(
    private http: HttpClient,
    private spinnerService: SpinnerServiceService
  ) { }

  obtenerSabores(): Observable<any> {
    this.spinnerService.show();
    return this.http.get(`${this.apiSaborUrl}/lista`).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  

eliminarSabor(id: number): Observable<any> {
  this.spinnerService.show();
  
  return this.http.delete(`${this.apiSaborUrl}?id=${id}`).pipe(
    tap(response => {
    }),
    catchError(this.handleError),
    finalize(() => this.spinnerService.hide())
  );
}

reactivarSabor(id: number): Observable<any> {
  this.spinnerService.show();
  
  return this.http.patch(`${this.apiSaborUrl}/reactivar/${id}`, {}).pipe(
    tap(response => {
    }),
    catchError(this.handleError),
    finalize(() => this.spinnerService.hide())
  );
}
 agregarSabor(sabor: any): Observable<any> {
  this.spinnerService.show();
  
  
  return this.http.post(this.apiSaborUrl, sabor, {
    headers: { 'Content-Type': 'application/json' }
  }).pipe(
    tap(response => {
     
    }),
    catchError((error: HttpErrorResponse) => {
      console.error('❌ ERROR CAPTURADO EN agregarSabor:');
      console.error('❌ Error completo:', error);
      console.error('❌ Error.status:', error.status);
      console.error('❌ Error.statusText:', error.statusText);
      
      // Mostrar TODO el contenido del error
      if (error.error) {
        console.error('❌ Error.error:', error.error);
        console.error('❌ Error.error tipo:', typeof error.error);
        
        if (typeof error.error === 'string') {
          console.error('❌ Error.error como string:', error.error);
          // Intentar parsear si parece JSON
          if (error.error.trim().startsWith('{') || error.error.trim().startsWith('[')) {
            try {
              const parsed = JSON.parse(error.error);
              console.error('❌ Error.error parseado:', parsed);
            } catch (e) {
              console.error('❌ No se pudo parsear como JSON');
            }
          }
        } else if (typeof error.error === 'object') {
          console.error('❌ Error.error propiedades:', Object.keys(error.error));
          console.error('❌ Error.error valores:', error.error);
        }
      }
      
      return throwError(() => error);
    }),
    finalize(() => this.spinnerService.hide())
  );
}

editarSabor(sabor: any): Observable<any> {
  this.spinnerService.show();
  
  
  return this.http.put(this.apiSaborUrl, sabor, {
    headers: { 'Content-Type': 'application/json' }
  }).pipe(
    tap(response => {
    }),
    catchError((error: HttpErrorResponse) => {
      console.error('❌ ERROR CAPTURADO EN editarSabor:');
      console.error('❌ Error completo:', error);
      console.error('❌ Error.status:', error.status);
      console.error('❌ Error.statusText:', error.statusText);
      
      // ⭐ NUEVO: Mostrar los errores de validación detallados
      if (error.error) {
        console.error('❌ Error.error:', error.error);
        
        if (error.error.errors) {
          console.error('❌ ========== ERRORES DE VALIDACIÓN ==========');
          console.error('❌ error.error.errors:', error.error.errors);
          
          // Mostrar cada error individualmente
          Object.keys(error.error.errors).forEach(campo => {
            console.error(`❌ Campo "${campo}":`, error.error.errors[campo]);
          });
          console.error('❌ ============================================');
        }
        
        if (error.error.title) {
          console.error('❌ Título del error:', error.error.title);
        }
        
        if (error.error.traceId) {
          console.error('❌ TraceId:', error.error.traceId);
        }
      }
      
      return throwError(() => error);
    }),
    finalize(() => this.spinnerService.hide())
  );
}

  obtenerAdicional(): Observable<any> {
    this.spinnerService.show();
    return this.http.get(`${this.apiUrl}/lista`).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  obtenerAdicionalPorId(id: number): Observable<any> {
    this.spinnerService.show();
    return this.http.get(`${this.apiUrl}{id}`).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  agregarAdicional(adicional: any): Observable<any> {
    this.spinnerService.show();
    return this.http.post(this.apiUrl, adicional, {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  editarAdicional(adicional: any): Observable<any> {
    this.spinnerService.show();
    return this.http.put(this.apiUrl, adicional, {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  // CAMBIO IMPORTANTE: Usar arrow function para mantener el contexto
private handleError = (error: HttpErrorResponse) => {
  this.spinnerService.hide();
  
  console.error('❌ ========== ERROR HANDLER ==========');
  console.error('❌ Pasando el error sin modificar para debugging');
  console.error('❌ Error original:', error);
  console.error('❌ ===================================');
  
  // Devolver el error original para que el componente pueda manejarlo
  return throwError(() => error);
}
}