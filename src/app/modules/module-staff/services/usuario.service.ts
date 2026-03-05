import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { of, Observable, throwError } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { SpinnerServiceService } from '../../module-products/services/spinner-service.service';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private dominio: string = environment.baseUrlApi;
  private api_usuario = `${this.dominio}/api/usuario`;
  private api_roles = `${this.dominio}/api/roles`;
  private api_areas = `${this.dominio}/api/area`;
  private api_dias = `${this.dominio}/api/dia`;
  private api_propinas = `${this.dominio}/api/propinas`;
  private api_historialSueldos = `${this.dominio}/api/HistorialSueldos`;


  constructor(
    private http: HttpClient,
    private spinnerService: SpinnerServiceService // Inyectar el spinner
  ) { }

// Método genérico para manejar errores CORREGIDO
private handleError = (error: HttpErrorResponse) => {
  console.error('Error en la petición:', error);
  
  // Verificar que spinnerService existe antes de usarlo
  if (this.spinnerService) {
    this.spinnerService.hide();
  } else {
    console.warn('spinnerService no disponible en handleError');
  }
  
  // Crear un mensaje de error más informativo
  let errorMessage = 'Hubo un problema con la solicitud. Inténtelo de nuevo más tarde.';
  
  if (error.error instanceof ErrorEvent) {
    // Error del lado del cliente
    errorMessage = `Error: ${error.error.message}`;
  } else {
    // Error del lado del servidor
    if (error.error && error.error.message) {
      errorMessage = error.error.message;
    } else if (error.status === 404) {
      errorMessage = 'Recurso no encontrado. Verifique la URL del endpoint.';
    } else if (error.status === 500) {
      errorMessage = 'Error interno del servidor';
    }
    
    // Agregar detalles adicionales para debug
    console.error('Detalles del error:', {
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      error: error.error
    });
  }
  
  return throwError(() => new Error(errorMessage));
}

  // Obtener todos los usuarios
  public getAllUsuarios(): Observable<any> {
    this.spinnerService.show();
    return this.http.get(`${this.api_usuario}/lista`).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  // Obtener usuarios activos
  public getUsuariosActivos(psearch?: string): Observable<any> {
    this.spinnerService.show();
    const params: any = {};
    if (psearch !== undefined) {
      params.pSearch = psearch;
    }
    return this.http.get(`${this.api_usuario}/activos`, { params }).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  // Obtener todos los roles
  public getRoles(psearch?: string): Observable<any> {
    this.spinnerService.show();
    const params: any = {};
    if (psearch !== undefined) {
      params.search = psearch;
    }
    return this.http.get(`${this.api_roles}/lista`, { params }).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }


  // Guardar nueva área
public saveArea(area: any): Observable<any> {
  this.spinnerService.show();
  
  // IMPORTANTE: Tu backend usa [HttpPost()] sin ruta adicional
  // Entonces la URL debe ser solo `${this.api_areas}`, NO `${this.api_areas}/guardar`
  const url = `${this.api_areas}`; // ← Esto hace POST a http://localhost:5202/api/area
  
 
  
  return this.http.post(url, area).pipe(
    catchError(this.handleError),
    finalize(() => this.spinnerService.hide())
  );
}


  // Eliminar área
  public deleteArea(idArea: number): Observable<any> {
    this.spinnerService.show();
    return this.http.delete(`${this.api_areas}/eliminar/${idArea}`).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  // Guardar un nuevo usuario
  public saveUsuario(usuario: any): Observable<any> {
    this.spinnerService.show();
    return this.http.post(`${this.api_usuario}/guardar`, usuario).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  // Actualizar un usuario existente
  public updateUsuario(usuario: any): Observable<any> {
    this.spinnerService.show();
    return this.http.put(`${this.api_usuario}/actualizar`, usuario).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  
  // Eliminar un usuario por ID
  public deleteUsuario(id: number): Observable<any> {
    this.spinnerService.show();
    return this.http.delete(`${this.api_usuario}/eliminar/${id}`).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  public getUsuariosInactivos(): Observable<any> {
    this.spinnerService.show();
    return this.http.get(`${this.api_usuario}/inactivos`).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  public recuperarUsuario(id: number): Observable<any> {
    this.spinnerService.show();
    return this.http.put(`${this.api_usuario}/recuperar/${id}`, {}).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  public getAreas(): Observable<any> {
    this.spinnerService.show();
    return this.http.get(`${this.api_areas}/lista`).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }
  public getOnlyAreas(): Observable<any> {
    this.spinnerService.show();
    return this.http.get(`${this.api_areas}/lista/onlyAreas`).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  // Obtener usuarios activos por IdRol
  public getUsuariosActivosPorRol(idRol: number): Observable<any> {
    this.spinnerService.show();
    return this.http.get(`${this.api_usuario}/por-rol-activos/${idRol}`).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  // Obtener todos los días
  public getDias(): Observable<any> {
    this.spinnerService.show();
    return this.http.get(`${this.api_dias}/lista`).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

 // En usuario.service.ts

public actualizarDiaDescanso(idUsuario: number, idDia: number | null): Observable<any> {
  this.spinnerService.show();
  
  const headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  // Creamos el objeto pequeño que espera el DTO del backend
  const body = {
    idDia: idDia
  };

  return this.http.put(`${this.api_usuario}/actualizar-dia-descanso/${idUsuario}`,
    JSON.stringify(body), { headers }).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
}


getUsuariosPorRolTodos(rol: string): Observable<any[]> {
  // Asumiendo que tienes un mapa de roles o envías el ID directamente
  // Si tu backend espera un ID int, asegúrate de convertir 'Cocina' a su ID correspondiente.
  // Ejemplo: Cocina = 1, Mesero = 2 (Ajusta estos IDs según tu base de datos)
  const idRol = rol === 'Cocina' ? 1 : (rol === 'Mesero' ? 2 : 0); 
  
  return this.http.get<any[]>(`${this.api_usuario}/por-rol-todos/${idRol}`);
}

  public actualizarArea(idUsuario: number, idArea: number | null): Observable<any> {
    this.spinnerService.show();
    return this.http.put(`${this.api_usuario}/actualizar-area/${idUsuario}`, idArea).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }



  public getUsuariosActivosPorDia(idDia: number): Observable<any> {
    this.spinnerService.show();
    return this.http.get(`${this.api_usuario}/por-dia-activos/${idDia}`).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  // Métodos para propinas
  public getAllPropinas(search: string = ''): Observable<any> {
    this.spinnerService.show();
    return this.http.get(`${this.api_propinas}?search=${search}`).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  public getPropinaById(id: number): Observable<any> {
    this.spinnerService.show();
    return this.http.get(`${this.api_propinas}/${id}`).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  public createPropina(propina: any): Observable<any> {
    this.spinnerService.show();
    return this.http.post(this.api_propinas, propina).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  public updatePropina(id: number, propina: any): Observable<any> {
    this.spinnerService.show();
    return this.http.put(`${this.api_propinas}/${id}`, propina).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  public deletePropina(id: number): Observable<any> {
    this.spinnerService.show();
    return this.http.delete(`${this.api_propinas}/${id}`).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  // Métodos para Historial de Sueldos
  public getAllHistorialSueldos(search: string = ''): Observable<any> {
    this.spinnerService.show();
    return this.http.get(`${this.api_historialSueldos}?search=${search}`).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  public getHistorialSueldoById(id: number): Observable<any> {
    this.spinnerService.show();
    return this.http.get(`${this.api_historialSueldos}/${id}`).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  public createHistorialSueldo(historial: any): Observable<any> {
    this.spinnerService.show();
    return this.http.post(this.api_historialSueldos, historial).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  public updateHistorialSueldo(historial: any): Observable<any> {
    this.spinnerService.show();
    return this.http.put(`${this.api_historialSueldos}/actualizar`, historial).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  public deleteHistorialSueldo(id: number): Observable<any> {
    this.spinnerService.show();
    return this.http.delete(`${this.api_historialSueldos}/${id}`).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  public generarSueldosHoy(): Observable<any> {
    this.spinnerService.show();
    return this.http.get(`${this.api_historialSueldos}/generar-sueldos-hoy`).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  public getTotalPropinasUsuario(usuarioId: number): Observable<number> {
    this.spinnerService.show();
    return this.http.get<number>(`${this.api_propinas}/total-por-usuario/${usuarioId}`).pipe(
      catchError(() => {
        this.spinnerService.hide();
        return of(0); // Devuelve 0 si hay error
      }),
      finalize(() => this.spinnerService.hide())
    );
  }


public deleteAllPropinas(): Observable<any> {
    this.spinnerService.show();
    return this.http.delete(`${this.api_propinas}/all`).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }


public getPropinaPorPedido(idPedido: number): Observable<any> {
  this.spinnerService.show();
  return this.http.get(`${this.api_propinas}/pedido/${idPedido}`).pipe(
    tap((response: any) => { // ← Ahora response está tipado
      this.spinnerService.hide();
    }),
    catchError(error => {
      console.error('❌ Error al obtener propina para pedido', idPedido, ':', error);
      this.spinnerService.hide();
      return of(null);
    })
  );
}

  public getByUsuarioId(usuarioId: number): Observable<any> {
    this.spinnerService.show();
    return this.http.get(`${this.api_historialSueldos}/por-usuario/${usuarioId}`).pipe(
      catchError(this.handleError),
      finalize(() => this.spinnerService.hide())
    );
  }

  
}