import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, catchError, finalize } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SpinnerServiceService } from '../../module-products/services/spinner-service.service';
import { AreaMapaCaja, ResponseCommonDTO } from '../../module-sales/interfaces/itemsVentas';
import { DividirMesasDTO, UnirMesasDTO } from '../interface/Items';

@Injectable({
  providedIn: 'root'
})
export class MesaService {
  private dominio: string = environment.baseUrlApi;
  private apiUrl: string = `${this.dominio}/api/mesa`;
  
  constructor(
    private http: HttpClient,
    private spinnerService: SpinnerServiceService
  ) {}
getMesasParaEdicion(idUsuario: number): Observable<any> {
  return this.http.get(`${this.apiUrl}/para-edicion?idUsuario=${idUsuario}`);
}
  getList(pSearch: string = ""): Observable<any[]> {
    this.spinnerService.show();
    return this.http.get<any[]>(`${this.apiUrl}/lista?pSearch=${pSearch}`).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }


  getMapaOperativoCaja(): Observable<ResponseCommonDTO<AreaMapaCaja[]>> {
    this.spinnerService.show();
    
    return this.http.get<ResponseCommonDTO<AreaMapaCaja[]>>(`${this.apiUrl}/mapa-operativo`).pipe(
      catchError(this.handleError.bind(this)),
      finalize(() => this.spinnerService.hide())
    );
  }


  unirMesas(data: UnirMesasDTO): Observable<ResponseCommonDTO> {
    return this.http.post<ResponseCommonDTO>(`${this.apiUrl}/UnirMesas`, data);
  }

  // API para Dividir / Desunir Mesas
  dividirMesas(data: DividirMesasDTO): Observable<ResponseCommonDTO> {
    return this.http.post<ResponseCommonDTO>(`${this.apiUrl}/DividirMesas`, data);
  }



  getMesasPorArea(
    pageNumber: number,
    pageSize: number,
    pSearch: string = '',
    area: string = ''
  ): Observable<any> {
  
    this.spinnerService.show();
  
    let params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);
  
    if (pSearch) {
      params = params.set('pSearch', pSearch);
    }
  
    if (area) {
      params = params.set('area', area);
    }
  
    return this.http.get<any>(`${this.apiUrl}/lista/porArea`, { params }).pipe(
      finalize(() => this.spinnerService.hide()),
      catchError(this.handleError.bind(this))
    );
  }

  allMesas(pSearch: string = ""): Observable<any[]> {
    this.spinnerService.show();
    return this.http.get<any[]>(`${this.apiUrl}/allMesas?pSearch=${pSearch}`).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  getById(pId: number): Observable<any> {
    this.spinnerService.show();
    return this.http.get<any>(`${this.apiUrl}/${pId}`).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  saveItem(mesa: any): Observable<any> {
    this.spinnerService.show();
    return this.http.post(this.apiUrl, mesa).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  updateItem(mesa: any): Observable<any> {
    this.spinnerService.show();
    return this.http.put(this.apiUrl, mesa).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  deleteItem(id: number): Observable<any> {
  this.spinnerService.show();
  return this.http.delete(`${this.apiUrl}/${id}`).pipe(
    catchError(this.handleError),
    finalize(() => this.spinnerService.hide())
  );
}


  getMesasDisponibles(idUsuario?: number): Observable<any[]> {
    this.spinnerService.show();
    const url = idUsuario 
      ? `${this.apiUrl}/disponibles?idUsuario=${idUsuario}`
      : `${this.apiUrl}/disponibles`;
    return this.http.get<any[]>(url).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  private handleError(error: HttpErrorResponse) {
    this.spinnerService.hide();
    console.error('Error en la petición:', error);
    
    let errorMessage = 'Error en la solicitud. Por favor, inténtelo nuevamente.';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 400) {
      errorMessage = 'Datos inválidos enviados al servidor.';
    } else if (error.status === 404) {
      errorMessage = 'Recurso no encontrado.';
    } else if (error.status === 500) {
      errorMessage = 'Error interno del servidor.';
    }
    
    return throwError(() => new Error(errorMessage));
  }
}