import { Component, HostListener, OnInit } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { UserService } from 'src/app/auth/user.service';
import { AuthService } from 'src/app/auth/services/auth.service';
import { SseServiceService } from 'src/app/core/services/sse-service.service';
import { UsuarioService } from 'src/app/modules/module-staff/services/usuario.service'; // Ajusta la ruta según tu estructura

@Component({
  selector: 'app-usernav',
  templateUrl: './usernav.component.html',
  styleUrls: ['./usernav.component.css'],
})
export class UsernavComponent implements OnInit {
  showMenu: boolean = false;
  isAuthenticated$: Observable<boolean>;
  user: any;
  
  notificacionesNuevas: number = 0;
  listaNotificaciones: any[] = [];
  showNotis: boolean = false;
  
  // Propiedades para propinas
  totalPropinasUsuario: number = 0;
  cargandoPropinas: boolean = false;
  esMesero: boolean = false;
  
  // NUEVA PROPIEDAD: Controla si el monto de propinas está revelado
  propinasRevelado: boolean = false;

  constructor(
    public authService: AuthService,
    private router: Router,
    private sseService: SseServiceService,
    private usuarioService: UsuarioService // Inyectar UsuarioService
  ) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
  }

  ngOnInit(): void {
    this.user = this.authService.getUser();
    
    // Verificar si el usuario es mesero
    this.esMesero = this.user?.rol?.toLowerCase() === 'mesero';
    
    // Si es mesero, cargar sus propinas
    if (this.esMesero && this.user?.idUsuario) {
      this.cargarTotalPropinas();
    }
    
    this.sseService.sseData$.subscribe(data => {
      this.notificacionesNuevas++;
      this.listaNotificaciones.unshift(data);
      this.lanzarNotificacionEscritorio(data);
      this.reproducirSonido();
      
      // Si llega una notificación y el usuario es mesero, actualizar propinas
      if (this.esMesero && this.user?.idUsuario) {
        this.cargarTotalPropinas();
      }
    });
  }

  toggleMenu(): void {
    this.showMenu = !this.showMenu;
  }

  // NUEVO MÉTODO: Alternar visibilidad del monto de propinas
  toggleRevelarPropinas(event: Event): void {
    event.stopPropagation(); // Evitar que se cierre el menú
    this.propinasRevelado = !this.propinasRevelado;
    
    // Si se revela y no hay datos cargados, cargar propinas
    if (this.propinasRevelado && this.totalPropinasUsuario === 0 && !this.cargandoPropinas) {
      this.cargarTotalPropinas();
    }
  }

  reproducirSonido() {
    const audio = new Audio('/assets/images/notificacion.mp3');
    audio.play().catch(e => console.log('Audio bloqueado por el navegador hasta que el usuario interactúe.'));
  }

  limpiarContador() {
    this.notificacionesNuevas = 0;
    this.showNotis = !this.showNotis;
    this.showMenu = false; 
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;

    if (!target.closest('.user-nav-container') && !target.closest('.notificacion-wrapper')) {
      this.showMenu = false;
      this.showNotis = false;
    }
  }

  vaciarNotificaciones(event: Event) {
    event.stopPropagation();
    this.listaNotificaciones = [];
    this.notificacionesNuevas = 0;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/'], { 
      queryParams: { logout: 'true' },
      replaceUrl: true 
    });
  }

  lanzarNotificacionEscritorio(data: any) {
    if (Notification.permission === "granted") {
      const titulo = `Pedido #${data.pedidoId}`;
      const mensaje = data.mensaje;
      console.log(data)
  
      const notification = new Notification("La Patrona", {
        body: `${titulo} - ${mensaje}`,
        icon: 'assets/images/icon.jpg',
        tag: `pedido-${data.pedidoId}`
      });
  
      notification.onclick = () => {
        window.focus();
        this.router.navigate(['/pages/orders/pedidos']);
      };
    }
  }

  irANotificacion(noti: any, index: number) {
    this.router.navigate(['/pages/orders/pedidos']);
    this.listaNotificaciones.splice(index, 1);
    this.showNotis = false;
  
    if (this.notificacionesNuevas > 0) {
      this.notificacionesNuevas--;
    }
  }

  // Cargar total de propinas del usuario
  cargarTotalPropinas(): void {
    if (!this.user?.idUsuario) return;
    
    this.cargandoPropinas = true;
    this.usuarioService.getTotalPropinasUsuario(this.user.idUsuario).subscribe({
      next: (total) => {
        this.totalPropinasUsuario = total;
        this.cargandoPropinas = false;
      },
      error: (error) => {
        console.error('Error al cargar propinas:', error);
        this.totalPropinasUsuario = 0;
        this.cargandoPropinas = false;
      }
    });
  }

  // Formatear monto en soles
  formatearMonto(monto: number): string {
    return `S/ ${monto.toFixed(2)}`;
  }
}