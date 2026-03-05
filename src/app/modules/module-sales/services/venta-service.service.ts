import { HttpClient, HttpErrorResponse,HttpParams, HttpResponse,HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, catchError, finalize } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SpinnerServiceService } from '../../module-products/services/spinner-service.service';
import { FinalizarCobroDTO, PedidoDTO, ResponseCommonDTO, VentaDTO} from '../interfaces/itemsVentas';

@Injectable({
  providedIn: 'root'
})
export class VentaServiceService {
  private dominio: string = environment.baseUrlApi;
  private apiUrl: string = `${this.dominio}/api/venta`;

  constructor(
    private http: HttpClient,
    private spinnerService: SpinnerServiceService
  ) { }


   obtenerVentasCajaActual(): Observable<any> {
    this.spinnerService.show();
    return this.http.get(`${this.apiUrl}/caja-actual`).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }
getTotalPropinasCajaActual(): Observable<any> {
  this.spinnerService.show();
  return this.http.get(`${this.dominio}/api/propinas/total-caja-actual`).pipe(
    catchError((error) => this.handleError(error)),
    finalize(() => this.spinnerService.hide())
  );
}

finalizarCobro(venta: FinalizarCobroDTO): Observable<ResponseCommonDTO> {

  return this.http.post<ResponseCommonDTO>(`${this.apiUrl}/FinalizarCobro`, venta);
}


obtenerTotalesCaja(idCaja: number): Observable<ResponseCommonDTO> {
  return this.http.get<ResponseCommonDTO>(`${this.apiUrl}/TotalesCaja/${idCaja}`);
}




getPropinasCajaActual(): Observable<any> {
  this.spinnerService.show();
  return this.http.get(`${this.dominio}/api/propinas/caja-actual`).pipe(
    catchError((error) => this.handleError(error)),
    finalize(() => this.spinnerService.hide())
  );
}

   obtenerTop10ProductosMasVendidos(
    fechaInicio?: string,
    fechaFin?: string
  ): Observable<any[]> {
    this.spinnerService.show();
    
    let params = new HttpParams();
    
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);

    return this.http.get<any[]>(`${this.apiUrl}/top10-productos-mas-vendidos`, { 
      params
    }).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  obtenerTotalVentas(idCaja: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/total-count?idCaja=${idCaja}`);
  }



  obtenerVentasFiltradas(
    page: number,
    pageSize: number,
    search: string = '',
    idCaja?: number,
    horaInicio?: string,
    horaFin?: string, // <--- NUEVO: Parámetro opcional
    fechaInicio?: string,
    fechaFin?: string,
  ): Observable<any> {
    let params = new HttpParams()
      .set('pageNumber', page.toString())
      .set('pageSize', pageSize.toString());
  
    if (search) params = params.set('search', search);
    if (idCaja) params = params.set('idCaja', idCaja.toString()); // Enviamos al backend
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);
    if (horaInicio) params = params.set('horaInicio', horaInicio);
    if (horaFin) params = params.set('horaFin', horaFin);
  
    return this.http.get<VentaDTO[]>(`${this.apiUrl}/ventas`, { params });
  }

  obtenerTodasVentas(search: string = ''): Observable<any> {
    this.spinnerService.show();
    return this.http.get(`${this.apiUrl}/all?search=${search}`).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

 getReporteVentasPorCategoriaCajaActual(
  fechaInicio?: string,
  fechaFin?: string,
  horaInicio?: string,
  horaFin?: string
): Observable<any> {
  let params = '';
  if (fechaInicio) params += `fechaInicio=${fechaInicio}&`;
  if (fechaFin) params += `fechaFin=${fechaFin}&`;
  if (horaInicio) params += `horaInicio=${horaInicio}&`;
  if (horaFin) params += `horaFin=${horaFin}&`;

  const url = `${this.apiUrl}/reporte-ventas-categoria-caja-actual${params ? '?' + params : ''}`;

  this.spinnerService.show();
  return this.http.get(url).pipe(
    catchError(this.handleError),
    finalize(() => this.spinnerService.hide())
  );
}

  getPedidosPorVenta(idVenta: number): Observable<PedidoDTO[]> {
    return this.http.get<PedidoDTO[]>(`${this.apiUrl}/pedidosPorVenta/${idVenta}`);
  }


  

  

  obtenerVentaPorId(id: number): Observable<any> {
    this.spinnerService.show();
    return this.http.get(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  crearVenta(venta: any): Observable<any> {
    this.spinnerService.show();
    return this.http.post(this.apiUrl, venta, {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  actualizarVenta(id: number, venta: any): Observable<any> {
    this.spinnerService.show();
    return this.http.put(`${this.apiUrl}/${id}`, venta, {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  eliminarVenta(id: number): Observable<any> {
    this.spinnerService.show();
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  obtenerTotalesPorMetodoPago(): Observable<any> {
    this.spinnerService.show();
    return this.http.get(`${this.apiUrl}/totales-por-metodo-pago`).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  obtenerTotalesCajasSimples(): Observable<any> {
    this.spinnerService.show();
    return this.http.get(`${this.apiUrl}/totales-cajas-simples`).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  // En venta-service.service.ts

obtenerPersonalMasProductivo(
  fechaInicio?: string,
  fechaFin?: string
): Observable<any[]> {
  this.spinnerService.show();
  
  let params = new HttpParams();
  
  if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
  if (fechaFin) params = params.set('fechaFin', fechaFin);

  return this.http.get<any[]>(`${this.apiUrl}/personal-mas-productivo`, { 
    params
  }).pipe(
    catchError(this.handleError),
    finalize(() => this.spinnerService.hide())
  );
}
  private handleError(error: HttpErrorResponse) {
    this.spinnerService.hide();
    console.error('Error en el servicio de ventas:', error);
    return throwError(() => new Error('Ocurrió un error al procesar la venta. Por favor intente nuevamente.'));
  }

    getPersonalPorVentas(
    fechaInicio?: string, 
    fechaFin?: string, 
    idCategoria?: number, 
    top: number = 10
  ): Observable<any> {
    this.spinnerService.show();
    
    let params = new HttpParams()
      .set('top', top.toString());
    
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);
    if (idCategoria) params = params.set('idCategoria', idCategoria.toString());

    return this.http.get(`${this.apiUrl}/personal-por-ventas`, { params }).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }



  /**
 * Obtener ventas agrupadas por hora
 */
obtenerVentasPorHora(
  fechaInicio?: string,
  fechaFin?: string,
  horaInicio?: string,
  horaFin?: string
): Observable<any[]> {
  this.spinnerService.show();
  
  let params = new HttpParams();
  
  if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
  if (fechaFin) params = params.set('fechaFin', fechaFin);
  if (horaInicio) params = params.set('horaInicio', horaInicio);
  if (horaFin) params = params.set('horaFin', horaFin);

  return this.http.get<any[]>(`${this.apiUrl}/ventas-por-hora`, { 
    params
  }).pipe(
    catchError(this.handleError),
    finalize(() => this.spinnerService.hide())
  );
}

  /**
   * Obtener personal ordenado por monto de ventas
   */
  getPersonalPorMontoVentas(
    fechaInicio?: string, 
    fechaFin?: string, 
    idCategoria?: number, 
    top: number = 10
  ): Observable<any> {
    this.spinnerService.show();
    
    let params = new HttpParams()
      .set('top', top.toString());
    
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);
    if (idCategoria) params = params.set('idCategoria', idCategoria.toString());

    return this.http.get(`${this.apiUrl}/personal-por-monto-ventas`, { params }).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  /**
   * Obtener estadísticas generales de platos
   */
  getEstadisticasPlatos(
    fechaInicio?: string, 
    fechaFin?: string, 
    idCategoria?: number, 
    tipoOrdenamiento: string = 'cantidad', 
    top: number = 10
  ): Observable<any> {
    this.spinnerService.show();
    
    let params = new HttpParams()
      .set('tipoOrdenamiento', tipoOrdenamiento)
      .set('top', top.toString());
    
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);
    if (idCategoria) params = params.set('idCategoria', idCategoria.toString());

    return this.http.get(`${this.apiUrl}/estadisticas-platos`, { params }).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

}