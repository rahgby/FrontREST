import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, Observable, throwError, finalize } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SpinnerServiceService } from './spinner-service.service';
import { HttpHeaders } from '@angular/common/http';
import { Categoria, Sabor, Sabores } from '../../module-orders/interface/Items';

@Injectable({
  providedIn: 'root'
})
export class PlatosServiceService {
  private dominio: string = environment.baseUrlApi;
  private apiUrl: string = `${this.dominio}/api/plato`;
  private apiCategoriaUrl: string = `${this.dominio}/api/categoriaPlato`;

  constructor(
    private http: HttpClient,
    private spinnerService: SpinnerServiceService
  ) { }

  obtenerPlatos(): Observable<any> {
    this.spinnerService.show();
    return this.http.get(`${this.apiUrl}/lista`).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  getPlatosList(
    pageNumber: number,
    pageSize: number,
    pSearch: string = '',
    idCategoria: number = 0
  ): Observable<any> {
  
    this.spinnerService.show();
  
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString())
      .set('idCategoria', idCategoria.toString());
  
    if (pSearch) {
      params = params.set('pSearch', pSearch);
    }
  
    return this.http.get<any>(`${this.apiUrl}/lista/porCategoria`, { params }).pipe(
      finalize(() => this.spinnerService.hide())
    );
  }

  actualizarEstadoPedido(idPedido: number, nuevoEstado: string): Observable<any> {
    return this.http.patch(
      `${this.dominio}/api/pedido/${idPedido}/estado`,
      `"${nuevoEstado}"`,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }
    ).pipe(
      
      finalize(() => this.spinnerService.hide())
    );
  }


  CancelarPedido(idPedido: number, nuevoEstado: string): Observable<any> {
    return this.http.patch(
      `${this.dominio}/api/pedido/${idPedido}/cancelar`,
      `"${nuevoEstado}"`,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }
    ).pipe(
      
      finalize(() => this.spinnerService.hide())
    );
  }

  obtenerCategorias(): Observable<Categoria[]> {
    this.spinnerService.show();
    return this.http.get<Categoria[]>(`${this.apiCategoriaUrl}/lista`).pipe(
      finalize(() => this.spinnerService.hide())
    );
  }

  obtenerPlatoPorId(id: number): Observable<any> {
    this.spinnerService.show();
    return this.http.get(`${this.apiUrl}{id}`).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  agregarPlato(plato: any): Observable<any> {
    this.spinnerService.show();
    return this.http.post(this.apiUrl, plato, {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  editarPlato(plato: any): Observable<any> {
    this.spinnerService.show();
    return this.http.put(this.apiUrl, plato, {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  addAdicionales(idPlato: number, idAdicionales: number[]): Observable<any> {
    this.spinnerService.show();
    return this.http.put(`${this.apiUrl}/addAdicional?idPlato=${idPlato}`, idAdicionales, {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  getAdicionalesByPlato(idPlato: number): Observable<any[]> {
    this.spinnerService.show();
    return this.http.get<any[]>(`${this.dominio}/api/pedido/adicionales/${idPlato}`).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  obtenerSaboresPorPlato(idPlato: number): Observable<Sabores[]> {
    this.spinnerService.show();

    return this.http.get<Sabores[]>(`${this.dominio}/api/pedido/sabores/${idPlato}`).pipe(
      finalize(() => this.spinnerService.hide())
    );
  }

  
  obtenerTiposPapas(): Observable<string[]> {
    this.spinnerService.show();
    return this.http.get<string[]>(`${this.dominio}/api/pedido/tipos-papas`).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  verificarStock(idPlato: number, cantidadRequerida: number): Observable<any> {
    this.spinnerService.show();
    
    const params = new HttpParams()
      .set('idPlato', idPlato.toString())
      .set('cantidad', cantidadRequerida.toString());

    return this.http.get(`${this.apiUrl}/verificarStock`, { params }).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  private handleError = (error: HttpErrorResponse) => {
    this.spinnerService.hide();
    console.error('❌ Error en PlatosService:', error);
    
    let errorMessage = 'Hubo un problema con la solicitud. Inténtelo de nuevo más tarde.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error ${error.status}: ${error.error?.message || error.message}`;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}