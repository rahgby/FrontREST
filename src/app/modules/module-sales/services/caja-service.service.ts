import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, of, Observable, throwError, finalize, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SpinnerServiceService } from '../../module-products/services/spinner-service.service';
import { AreaMapaCaja, CajaDTO, ResponseCommonDTO, ResumenCuentaDTO } from '../interfaces/itemsVentas';

@Injectable({
  providedIn: 'root'
})
export class CajaService {
  private dominio: string = environment.baseUrlApi;
  private apiUrl: string = `${this.dominio}/api/caja`;

  constructor(
    private http: HttpClient,
    private spinnerService: SpinnerServiceService
  ) { }

  getCajas(
  pageNumber: number,
  pageSize: number,
  search: string = '',
  horaInicio?: string,
  horaFin?: string,
  fechaInicio?: string,
  fechaFin?: string
): Observable<any> {
  let params = `pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}`;
  if (fechaInicio) params += `&fechaInicio=${fechaInicio}`;
  if (fechaFin) params += `&fechaFin=${fechaFin}`;
  if (horaInicio) params += `&horaInicio=${horaInicio}`;
  if (horaFin) params += `&horaFin=${horaFin}`;

  return this.http.get(`${this.apiUrl}/cajas?${params}`).pipe(
    catchError(this.handleError)
  );
}
  getList(pSearch: string = ''): Observable<any> {
    this.spinnerService.show();
    return this.http.get(`${this.apiUrl}?pSearch=${pSearch}`).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }


  getById(id: number): Observable<any> {
    this.spinnerService.show();
    return this.http.get(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }



  closeCaja(idCaja: number, dto: CajaDTO): Observable<ResponseCommonDTO> {
    return this.http.patch<ResponseCommonDTO>(`${this.apiUrl}/${idCaja}`, dto);
  }



// ventas-service.service.ts
saveItem(caja: any): Observable<any> {
  this.spinnerService.show();
  
  // Convertir a string ISO pero manteniendo la zona horaria local
  const cajaParaEnviar = {
    ...caja,
    FechaInicio: caja.FechaInicio.toISOString(),
    MontoInicial: caja.MontoInicial || 0, // Asegurar que siempre haya un monto
    Monto: 0
  };

  return this.http.post(this.apiUrl, cajaParaEnviar, {
    headers: { 'Content-Type': 'application/json' }
  }).pipe(
    catchError(this.handleError),
    finalize(() => this.spinnerService.hide())
  );
}
  updateItem(caja: any): Observable<any> {
    this.spinnerService.show();
    return this.http.put(`${this.apiUrl}/${caja.IDCaja}`, caja, {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(
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

 

  getCajaAbierta(): Observable<CajaDTO | null> {
    this.spinnerService.show();
    return this.http.get<ResponseCommonDTO<CajaDTO>>(`${this.apiUrl}/abierta`).pipe(
      map(res => res.success ? res.data : null), 
      catchError(err => this.handleError(err)),
      finalize(() => this.spinnerService.hide())
    );
  }

  getUltimaCajaCerrada(): Observable<CajaDTO | null> {
    this.spinnerService.show();
    
    return this.http.get<ResponseCommonDTO<CajaDTO>>(`${this.apiUrl}/ultima-cerrada`).pipe(
      map(res => {
        return res.success ? res.data : null;}),
      catchError((error: HttpErrorResponse) => {
        return this.handleError(error);
      }),
      finalize(() => this.spinnerService.hide())
    );
  }

 getCajasPorFechaInicio(fechaInicio: string): Observable<any> {
    this.spinnerService.show();
    return this.http.get(`${this.apiUrl}/por-fecha-inicio?fechaInicio=${fechaInicio}`).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }







  getVentasConDetallesPorCaja(idCaja: number): Observable<any> {
    this.spinnerService.show();
    return this.http.get(`${this.apiUrl}/${idCaja}/ventas-con-detalles`).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  // 3. Obtener resumen completo de caja (opcional)
  getResumenCompletoCaja(idCaja: number): Observable<any> {
    this.spinnerService.show();
    return this.http.get(`${this.apiUrl}/${idCaja}/resumen-completo`).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

getHistorialCaja(pSearch: string = ''): Observable<any> {
  this.spinnerService.show();
  return this.http.get(`${this.apiUrl}?pSearch=${pSearch}`).pipe(
    catchError(this.handleError),
    finalize(() => this.spinnerService.hide())
  );
}





 getPedidosEntregadosDuranteCajaAbierta(): Observable<any[]> {
    this.spinnerService.show();
    return this.http.get<any[]>(`${this.apiUrl}/pedidos-entregados/caja-abierta`).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }


  getTotalPedidosAbonados(idCaja: number): Observable<{total: number}> {
  this.spinnerService.show();
  return this.http.get<{total: number}>(`${this.apiUrl}/${idCaja}/total-pedidos-abonados`).pipe(
    catchError(this.handleError),
    finalize(() => this.spinnerService.hide())
  );
}
  private handleError = (error: HttpErrorResponse) => {
    this.spinnerService.hide();
    console.error('Error en el servicio de ventas:', error);
    let errorMessage = 'Ocurrió un error al procesar la solicitud';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      if (error.status === 404) {
        errorMessage = 'Recurso no encontrado';
      } else if (error.status === 500) {
        errorMessage = 'Error interno del servidor';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}