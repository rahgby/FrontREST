import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, of, Observable, throwError, finalize, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SpinnerServiceService } from '../../module-products/services/spinner-service.service';

export interface AuditLog {
    id: number;
    fechaHora: string;      // Viene como string ISO del JSON
    usuarioId: number;
    accion: string;
    entidad: string;
    entidadId: number;
    datosAnteriores: string | null;
    datosNuevos: string | null;
    ipOrigen: string;
    usuarioNombre: string | null;
  }
  
  // Para la respuesta paginada del Controller
  export interface AuditResponse {
    success: boolean;
    total: number;
    page: number;
    pageSize: number;
    data: AuditLog[];
  }



@Injectable({
  providedIn: 'root'
})


export class AuditoriaService {
  private dominio: string = environment.baseUrlApi;
  private apiUrl: string = `${this.dominio}/api/Audit`;

  constructor(
    private http: HttpClient,
  ) { }

  getLogs(entidad: string = '', page: number = 1, pageSize: number = 10): Observable<AuditResponse> {
    const params = new HttpParams()
      .set('entidad', entidad)
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
  
    return this.http.get<AuditResponse>(this.apiUrl, { params });
  }


}