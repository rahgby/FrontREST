import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, catchError, finalize } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SpinnerServiceService } from '../../module-products/services/spinner-service.service';
import { Area } from '../interface/Items';

@Injectable({
  providedIn: 'root'
})
export class AreaService {
  private dominio: string = environment.baseUrlApi;
  private apiUrl: string = `${this.dominio}/api/area`;
  
  constructor(
    private http: HttpClient,
    private spinnerService: SpinnerServiceService
  ) {}
  
  getMisAreas(idUsuario: number|null): Observable<Area[]> {
    return this.http.get<Area[]>(`${this.apiUrl}/lista/misareas/${idUsuario}`);
  }

  getAreas(): Observable<Area[]> {
    return this.http.get<Area[]>(`${this.apiUrl}/lista`);
  }


  asignarAreas(idUsuario: number, areaIds: number[]): Observable<any> {
    const payload = {
      idUsuario: idUsuario,
      areaIds: areaIds
    };
  
    return this.http.post(`${this.apiUrl}/asignar/areas`, payload);
  }

}