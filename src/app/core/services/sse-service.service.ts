import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject} from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SseServiceService {
  private eventSource: EventSource | null = null;

  public novedadesPendientes: { [key: string]: number } = {
    'ENVIADO': 0,
    'ENTREGADO': 0,
    'ABONADO': 0,
    'CANCELADO': 0
  };


  public pedidosNoLeidos = new Set<number>();

  private sseDataSubject = new Subject<any>();
  public sseData$ = this.sseDataSubject.asObservable(); 

  private cajaEventSubject = new Subject<any>();
  public cajaEvent$ = this.cajaEventSubject.asObservable();

  constructor(private zone: NgZone) {}

  establecerConexion(token: string) {
    if (this.eventSource) return; // Evita duplicar conexiones

    const cleanToken = token.replace('Bearer ', '');
    const url = `${environment.baseUrlApi}/sse/conexion?access_token=${cleanToken}`;
    
    this.eventSource = new EventSource(url);

    this.eventSource.onmessage = (event) => {
      this.zone.run(() => {
        const data = JSON.parse(event.data);

        if (data.pedidoId) {
          this.pedidosNoLeidos.add(data.pedidoId);
        }

        if (data.tipo === 'nuevo-pedido') {
          this.novedadesPendientes['ENVIADO']++;
        } 
        
        // 2. Si es cambio de estado: usamos el campo 'estado' del JSON
        else if (data.tipo === 'ESTADO_CAMBIADO' && data.estado) {
          const est = data.estado.toUpperCase();
          if (this.novedadesPendientes.hasOwnProperty(est)) {
            this.novedadesPendientes[est]++;
          }
        }
        
        // 1. Emitir al canal general
        this.sseDataSubject.next(data);

        // 2. Emitir al canal de caja si corresponde
        if (data.tipo?.includes('CAJA')) {
          this.cajaEventSubject.next(data);
        }
      });
    };

    this.eventSource.onerror = (error) => {
      this.zone.run(() => {
        console.error('SSE Error, reintentando...', error);
        this.eventSource?.close();
        this.eventSource = null;
        
        // Opcional: Lógica de reconexión tras X segundos
      });
    };
  }

  desconectar() {
    this.eventSource?.close();
    this.eventSource = null;
  }

  limpiarNovedadEstado(estado: string) {
    if (this.novedadesPendientes[estado] !== undefined) {
      this.novedadesPendientes[estado] = 0;
    }
  }
}