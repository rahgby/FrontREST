import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { SpinnerServiceService } from '../../module-products/services/spinner-service.service';

@Injectable({
  providedIn: 'root'
})
export class CustomerServiceService {
  private dominio: string = environment.baseUrlApi;
  private apiUrl: string = `${this.dominio}/api/cliente`;

  constructor(
    private http: HttpClient,
    private spinnerService: SpinnerServiceService // Inyectar el spinner
  ) { }

  // Método para manejar errores
  private handleError(error: HttpErrorResponse) {
    this.spinnerService.hide(); // Ocultar spinner en caso de error
    console.error('Error en la petición:', error);
    return throwError(() => new Error('Hubo un problema con la solicitud. Inténtelo de nuevo más tarde.'));
  }

  // Obtener todos los clientes
  public getAllCliente(): Observable<any> {
    this.spinnerService.show();
    return this.http.get(`${this.apiUrl}/lista`).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  // Obtener clientes activos
public getClientesActivos(pSearch: string = ''): Observable<any> {
  this.spinnerService.show();
  const params = new HttpParams().set('pSearch', pSearch);
  return this.http.get(`${this.apiUrl}/activos`, { params }).pipe(
    catchError(this.handleError),
    finalize(() => this.spinnerService.hide())
  );
}

  // Guardar un nuevo cliente
  public saveCliente(cliente: any): Observable<any> {
    this.spinnerService.show();
    return this.http.post(`${this.apiUrl}/guardar`, cliente).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  // Actualizar un cliente existente
  updateCliente(cliente: any): Observable<any> {
    this.spinnerService.show();
    return this.http.put(`${this.apiUrl}/actualizar`, cliente).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  // Eliminar un cliente por ID
  public deleteCliente(id: number): Observable<any> {
    this.spinnerService.show();
    return this.http.delete(`${this.apiUrl}/eliminar/${id}`).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  // Obtener clientes inactivos
  public getClientesInactivos(): Observable<any> {
    this.spinnerService.show();
    return this.http.get(`${this.apiUrl}/inactivos`).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }
public getClienteById(pId: number): Observable<any> {
  this.spinnerService.show();
  return this.http.get(`${this.apiUrl}/${pId}`).pipe(
    catchError(this.handleError),
    finalize(() => this.spinnerService.hide())
  );
}
  // Recuperar un cliente
  public recuperarCliente(id: number): Observable<any> {
    this.spinnerService.show();
    return this.http.put(`${this.apiUrl}/recuperar/${id}`, {}).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }
}