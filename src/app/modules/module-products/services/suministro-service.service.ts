import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError, finalize } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SpinnerServiceService } from './spinner-service.service';

@Injectable({
  providedIn: 'root'
})
export class SuministroServiceService {
  private dominio: string = environment.baseUrlApi;
  private apiUrl: string = `${this.dominio}/api/suministro`;
  private apiCategoriasUrl: string = `${this.dominio}/api/categoriaSuministro`;
  
  constructor(
    private http: HttpClient,
    private spinnerService: SpinnerServiceService
  ) { }
  
  obtenerSuministros(): Observable<any> {
    this.spinnerService.show();
    return this.http.get(`${this.apiUrl}/lista`).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  obtenerCategorias(): Observable<any> {
    this.spinnerService.show();
    return this.http.get(`${this.apiCategoriasUrl}/lista`).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  obtenerSuministroPorId(id: number): Observable<any> {
    this.spinnerService.show();
    return this.http.get(`${this.apiUrl}{id}`).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  agregarSuministro(plato: any): Observable<any> {
    this.spinnerService.show();
    return this.http.post(this.apiUrl, plato, {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }
  
  editarSuministro(plato: any): Observable<any> {
    this.spinnerService.show();
    return this.http.put(this.apiUrl, plato, {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  private handleError(error: HttpErrorResponse) {
    this.spinnerService.hide();
    console.error('Error en la petición:', error);
    return throwError(() => new Error('Hubo un problema con la solicitud. Inténtelo de nuevo más tarde.'));
  }
}