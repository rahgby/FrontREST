import { HttpClient, HttpErrorResponse, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError, finalize } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SpinnerServiceService } from '../../module-products/services/spinner-service.service';
import { ApiResponseMesas, DeliveryPagadoRequestDTO, PedidoSave } from '../interface/Items';
import { ResponseCommonDTO, ResumenCuentaDTO } from '../../module-sales/interfaces/itemsVentas';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private dominio: string = environment.baseUrlApi;
  private apiUrl: string = `${this.dominio}/api/pedido`;
  private solicitudApiUrl: string = `${this.dominio}/api/solicitud-cambio-pedido`;

  constructor(
    private http: HttpClient,
    private spinnerService: SpinnerServiceService
  ) { }


  getPedidoById(idPedido: number): Observable<any> {
    this.spinnerService.show();
    return this.http.get<any>(`${this.apiUrl}/${idPedido}`).pipe(
      catchError(this.handleError.bind(this)),
      finalize(() => this.spinnerService.hide())
    );
  }

  
  

  obtenerResumenMesa(idMesa: number): Observable<ResumenCuentaDTO> {
    return this.http.get<ResumenCuentaDTO>(`${this.apiUrl}/mesa/${idMesa}/por-cobrar`);
  }

  obtenerPedidosPorUsuario(idUsuario: number): Observable<any[]> {
    this.spinnerService.show();
    return this.http.get<any[]>(`${this.apiUrl}/usuario/${idUsuario}`).pipe(
      catchError(this.handleError.bind(this)),
      finalize(() => this.spinnerService.hide())
    );
  }

  guardarDeliveryPagado(data: DeliveryPagadoRequestDTO): Observable<ResponseCommonDTO> {
    const url = `${this.apiUrl}/GuardarDelivery`; // Ajusta el endpoint según tu enviroment
    return this.http.post<ResponseCommonDTO>(url, data);
  }



  

  obtenerPedidosCrepesCajaActual(
    pageNumber: number,
    pageSize: number,
    search: string = '',
    estado: string = '',
    orderBy: string = ''
  ): Observable<any> { // Cambiado de any[] a any para recibir el objeto con metadatos
    this.spinnerService.show();
  
    let params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);
  
    if (search) {
      params = params.set('search', search);
    }
    if (estado) {
      params = params.set('estado', estado);
    }
    if (orderBy) {
      params = params.set('orderBy', orderBy);
    }
  

    return this.http.get<any>(`${this.apiUrl}/crepes/caja-actual`, { params }).pipe(
      catchError(this.handleError.bind(this)),
      finalize(() => this.spinnerService.hide())
    );
  }

  

  obtenerPedidosPizzaCajaActual(
    pageNumber: number,
    pageSize: number,
    search: string = '',
    estado: string = '',
    orderBy: string = ''
  ): Observable<any> { // Cambiado de any[] a any para recibir el objeto con metadatos
    this.spinnerService.show();
  
    let params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);
  
    if (search) {
      params = params.set('search', search);
    }
    if (estado) {
      params = params.set('estado', estado);
    }
    if (orderBy) {
      params = params.set('orderBy', orderBy);
    }
  

    return this.http.get<any>(`${this.apiUrl}/pizza/caja-actual`, { params }).pipe(
      catchError(this.handleError.bind(this)),
      finalize(() => this.spinnerService.hide())
    );
  }


  /**
   * @param pedido 
   * @param clave
   */
  editarPedido(pedido: any, clave?: string): Observable<any> {
    this.spinnerService.show();

    const authToken = localStorage.getItem('token'); 

    let url = `${this.apiUrl}/con-solicitud`;

    const params = new HttpParams();
    if (clave) {
      params.set('clave', encodeURIComponent(clave));
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    });

    return this.http.put(url, pedido, {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(
      catchError(this.handleError.bind(this)),
      finalize(() => this.spinnerService.hide())
    );
  }
  

 
  actualizarPedidoCompleto(pedido: any): Observable<any> {
    this.spinnerService.show();
    return this.http.put(`${this.apiUrl}/completo`, pedido, {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(
      catchError(this.handleError.bind(this)),
      finalize(() => this.spinnerService.hide())
    );
  }



  obtenerPedidosCajaActual(
    pageNumber: number,
    pageSize: number,
    search: string = '',
    estado: string = '',
    orderBy: string = ''
  ): Observable<any> {
    this.spinnerService.show();

    let params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);

    if (search) {
      params = params.set('search', search);
    }
    if (estado) {
      params = params.set('estado', estado);
    }
    if (orderBy) {
      params = params.set('orderBy', orderBy);
    }

    return this.http.get<any>(`${this.apiUrl}/caja-actual`, { params }).pipe(
      finalize(() => this.spinnerService.hide()),
      catchError(this.handleError.bind(this))
    );
  }

  obtenerPedidosCajaActualDeliverys(
    pageNumber: number,
    pageSize: number,
    search: string = '',
    estado: string = '',
    orderBy: string = ''
  ): Observable<any> {
    this.spinnerService.show();

    let params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);

    if (search) {
      params = params.set('search', search);
    }
    if (estado) {
      params = params.set('estado', estado);
    }
    if (orderBy) {
      params = params.set('orderBy', orderBy);
    }

    return this.http.get<any>(`${this.apiUrl}/caja-actual/delivery`, { params }).pipe(
      finalize(() => this.spinnerService.hide()),
      catchError(this.handleError.bind(this))
    );
  }

  savePedido(pedidoData: PedidoSave): Observable<any> {
    this.spinnerService.show();

    return this.http.post(`${this.apiUrl}/GuardarPedido`, pedidoData).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error en la petición:', error);

        let errorMessage = 'Hubo un problema con la solicitud. Inténtelo de nuevo más tarde.';

        if (error.status === 400 && error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error && typeof error.error === 'string') {
          try {
            const parsedError = JSON.parse(error.error);
            if (parsedError.message) errorMessage = parsedError.message;
          } catch {
            errorMessage = error.error;
          }
        }

        return throwError(() => new Error(errorMessage));
      }),
      finalize(() => this.spinnerService.hide())
    );
  }

  obtenerPedidosPostresCajaActual(
    pageNumber: number,
    pageSize: number,
    search: string = '',
    estado: string = '',
    orderBy: string = ''
  ): Observable<any> { // Cambiado de any[] a any para recibir el objeto con metadatos
    this.spinnerService.show();

    let params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);

    if (search) {
      params = params.set('search', search);
    }
    if (estado) {
      params = params.set('estado', estado);
    }
    if (orderBy) {
      params = params.set('orderBy', orderBy);
    }


    return this.http.get<any>(`${this.apiUrl}/postres/caja-actual`, { params }).pipe(
      catchError(this.handleError.bind(this)),
      finalize(() => this.spinnerService.hide())
    );
  }

  obtenerPedidosCocina(): Observable<any[]> {
    this.spinnerService.show();
    return this.http.get<any[]>(`${this.apiUrl}/cocina`).pipe(
      catchError(this.handleError.bind(this)),
      finalize(() => this.spinnerService.hide())
    );
  }

  obtenerPedidosCoctelesCajaActual(
    pageNumber: number,
    pageSize: number,
    search: string = '',
    estado: string = '',
    orderBy: string = ''
  ): Observable<any> {
    this.spinnerService.show();

    let params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);

    if (search) {
      params = params.set('search', search);
    }
    if (estado) {
      params = params.set('estado', estado);
    }
    if (orderBy) {
      params = params.set('orderBy', orderBy);
    }

    return this.http.get<any>(`${this.apiUrl}/cocteles/caja-actual`, { params }).pipe(
      catchError(this.handleError.bind(this)),
      finalize(() => this.spinnerService.hide())
    );
  }

  actualizarEstadoPedido(idPedido: number, nuevoEstado: string): Observable<any> {
    this.spinnerService.show();
    return this.http.patch(`${this.apiUrl}/${idPedido}/estado`, JSON.stringify(nuevoEstado), {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(
      catchError(this.handleError.bind(this)),
      finalize(() => this.spinnerService.hide())
    );
  }

  getMisMesas(page: number = 1, size: number = 10, search: string = ''): Observable<ApiResponseMesas> {
    // Construcción de parámetros segura
    let params = new HttpParams()
      .set('pageNumber', page.toString())
      .set('pageSize', size.toString())
      .set('search', search);

    return this.http.get<ApiResponseMesas>(`${this.apiUrl}/mis-mesas`, { params });
  }



  private handleError(error: HttpErrorResponse) {
    this.spinnerService.hide();
    console.error('Error en la petición:', error);

    let errorMessage = 'Hubo un problema con la solicitud. Inténtelo de nuevo más tarde.';

    // Extraer mensaje de error específico si está disponible
    if (error.status === 400 && error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 401) {
      errorMessage = 'No autorizado. Por favor, inicie sesión nuevamente.';
    } else if (error.status === 403) {
      errorMessage = 'No tiene permisos para realizar esta acción.';
    } else if (error.status === 404) {
      errorMessage = 'Recurso no encontrado.';
    } else if (error.error && typeof error.error === 'string') {
      try {
        const parsedError = JSON.parse(error.error);
        if (parsedError.message) {
          errorMessage = parsedError.message;
        }
      } catch (e) {
        if (typeof error.error === 'string') {
          errorMessage = error.error;
        }
      }
    }

    return throwError(() => new Error(errorMessage));
  }

  // Métodos específicos para cocina por categoría
obtenerPedidosCocinaCocteles(): Observable<any[]> {
  this.spinnerService.show();
  return this.http.get<any[]>(`${this.apiUrl}/cocina/cocteles`).pipe(
    catchError(this.handleError.bind(this)),
    finalize(() => this.spinnerService.hide())
  );
}

obtenerPedidosCocinaPostres(): Observable<any[]> {
  this.spinnerService.show();
  return this.http.get<any[]>(`${this.apiUrl}/cocina/postres`).pipe(
    catchError(this.handleError.bind(this)),
    finalize(() => this.spinnerService.hide())
  );
}

obtenerPedidosCocinaCrepes(): Observable<any[]> {
  this.spinnerService.show();
  return this.http.get<any[]>(`${this.apiUrl}/cocina/crepes`).pipe(
    catchError(this.handleError.bind(this)),
    finalize(() => this.spinnerService.hide())
  );
}

obtenerPedidosCocinaPizza(): Observable<any[]> {
  this.spinnerService.show();
  return this.http.get<any[]>(`${this.apiUrl}/cocina/pizza`).pipe(
    catchError(this.handleError.bind(this)),
    finalize(() => this.spinnerService.hide())
  );
}

obtenerRecuentoPlatosEnviados(): Observable<any[]> {
  this.spinnerService.show();
  return this.http.get<any[]>(`${this.apiUrl}/recuento-enviados`).pipe(
    catchError(this.handleError.bind(this)),
    finalize(() => this.spinnerService.hide())
  );
}

}