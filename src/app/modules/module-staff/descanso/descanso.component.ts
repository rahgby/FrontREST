import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { UsuarioService } from 'src/app/modules/module-staff/services/usuario.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-descanso',
  templateUrl: './descanso.component.html',
  styleUrls: ['./descanso.component.css']
})
export class DescansoComponent implements OnInit {
  pelotas: any[] = [];
  usuariosCocina: any[] = [];
  usuariosMesero: any[] = [];
  dias: any[] = [];

  @ViewChild('casillaSuperior', { static: true }) casillaSuperior!: ElementRef;

  constructor(
    private renderer: Renderer2,
    private usuarioService: UsuarioService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Cargar días
    this.usuarioService.getDias().subscribe(
      (data) => {
        this.dias = data;

        // Cargar Cocina (Todos: activos e inactivos)
        this.usuarioService.getUsuariosPorRolTodos('Cocina').subscribe(
          (cocinaData) => {
            this.usuariosCocina = cocinaData;
            this.crearPelotas(this.usuariosCocina, 'Cocina');
          },
          (error) => console.error('Error cocina', error)
        );

        // Cargar Meseros (Todos: activos e inactivos)
        this.usuarioService.getUsuariosPorRolTodos('Mesero').subscribe(
          (meseroData) => {
            this.usuariosMesero = meseroData;
            this.crearPelotas(this.usuariosMesero, 'Mesero');
          },
          (error) => console.error('Error mesero', error)
        );
      }
    );
  }

  /**
   * Crea los círculos (pelotas) para representar al personal.
   */
  crearPelotas(usuarios: any[], rol: string): void {
    usuarios.forEach((usuario, i) => {
      const pelota = this.renderer.createElement('div');
      this.renderer.addClass(pelota, 'pelota');
      const nombre = usuario.nombre.substring(0, 4);
      pelota.textContent = `${nombre}`;

      const pelotaObj = {
        elemento: pelota,
        nombre: usuario.nombre,
        nombre_respectivo: `Pelota-${i + 1}`,
        dia: usuario.idDia ? this.dias.find((d) => d.idDia === usuario.idDia)?.nombre : null,
        rol: rol,
        idUsuario: usuario.idUsuario,
      };

      this.pelotas.push(pelotaObj);

      // Aplicar estilos iniciales si ya está en descanso
      if (pelotaObj.dia) {
        this.renderer.setStyle(pelota, 'opacity', '0.7');
        this.renderer.setStyle(pelota, 'border', '3px solid #ff4444');
        this.renderer.setStyle(pelota, 'background-color', '#e0e0e0');
        this.renderer.setStyle(pelota, 'color', '#ff4444');
      }

      this.hacerMovible(pelotaObj);

      // Posicionar la pelota en su área correspondiente
      if (pelotaObj.dia) {
        const columna = document.querySelector(`.dia-columna[data-dia="${pelotaObj.dia}"]`);
        if (columna) {
          this.renderer.appendChild(columna, pelota);
        }
      } else {
        this.renderer.appendChild(this.casillaSuperior.nativeElement, pelota);
      }
    });
  }

  /**
   * Hace que los círculos (pelotas) sean arrastrables.
   * CORREGIDO: Evita errores al hacer clic en espacios vacíos.
   */
  hacerMovible(pelotaObj: any): void {
    const { elemento } = pelotaObj;

    // Bandera para saber si ESTA pelota específica se está moviendo
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    const startMove = (e: MouseEvent | TouchEvent) => {
      isDragging = true; // Iniciamos el arrastre

      const rect = elemento.getBoundingClientRect();
      if (e instanceof MouseEvent) {
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
      } else if (e.touches) {
        offsetX = e.touches[0].clientX - rect.left;
        offsetY = e.touches[0].clientY - rect.top;
      }

      this.renderer.setStyle(elemento, 'position', 'fixed');
      this.renderer.setStyle(elemento, 'z-index', '1000');
      this.renderer.setStyle(elemento, 'pointer-events', 'none');

      // AGREGAMOS LOS LISTENERS GLOBALES AQUÍ (Solo cuando se empieza a arrastrar)
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', endMove);
      document.addEventListener('touchmove', move);
      document.addEventListener('touchend', endMove);

      move(e);
    };

    const move = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return; // Si no es esta pelota, no hacemos nada
      e.preventDefault();

      let clientX: number, clientY: number;

      if (e instanceof MouseEvent) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else if (e.touches) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        return;
      }

      this.renderer.setStyle(elemento, 'left', `${clientX - offsetX}px`);
      this.renderer.setStyle(elemento, 'top', `${clientY - offsetY}px`);
    };

    const endMove = (e: MouseEvent | TouchEvent) => {
      // --- CORRECCIÓN CRUCIAL ---
      // Si no estábamos arrastrando ESTA pelota, detenemos todo.
      if (!isDragging) return;

      isDragging = false;

      // LIMPIAMOS LOS LISTENERS GLOBALES (Para no afectar otros clics)
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', endMove);
      document.removeEventListener('touchmove', move);
      document.removeEventListener('touchend', endMove);

      const pelotaRect = elemento.getBoundingClientRect();
      let colocada = false;

      // 1. Verificar si se soltó en la casilla superior
      const casillaSuperiorRect = this.casillaSuperior.nativeElement.getBoundingClientRect();
      if (
        pelotaRect.left < casillaSuperiorRect.right &&
        pelotaRect.right > casillaSuperiorRect.left &&
        pelotaRect.top < casillaSuperiorRect.bottom &&
        pelotaRect.bottom > casillaSuperiorRect.top
      ) {
        this.renderer.appendChild(this.casillaSuperior.nativeElement, elemento);
        this.renderer.setStyle(elemento, 'position', 'relative');
        this.renderer.setStyle(elemento, 'left', '0px');
        this.renderer.setStyle(elemento, 'top', '0px');

        pelotaObj.dia = null;
        colocada = true;
      }

      // 2. Verificar si se soltó en alguna columna de día
      if (!colocada) {
        document.querySelectorAll('.dia-columna').forEach((columna: any) => {
          const columnaRect = columna.getBoundingClientRect();
          if (
            pelotaRect.left < columnaRect.right &&
            pelotaRect.right > columnaRect.left &&
            pelotaRect.top < columnaRect.bottom &&
            pelotaRect.bottom > columnaRect.top
          ) {
            pelotaObj.dia = columna.dataset.dia;

            this.renderer.appendChild(columna, elemento);
            this.renderer.setStyle(elemento, 'position', 'relative');
            this.renderer.setStyle(elemento, 'left', '0px');
            this.renderer.setStyle(elemento, 'top', '0px');
            colocada = true;
          }
        });
      }

      // Si no se colocó en ningún sitio válido
      if (!colocada) {
        this.renderer.setStyle(elemento, 'position', 'relative');
        this.renderer.setStyle(elemento, 'left', '0px');
        this.renderer.setStyle(elemento, 'top', '0px');
      }

      this.renderer.setStyle(elemento, 'z-index', 'auto');
      this.renderer.setStyle(elemento, 'pointer-events', 'auto');

      // Llamada al backend
      this.actualizarDiaDescanso(pelotaObj);
    };

    // Eventos iniciales (SOLO al elemento, no al documento globalmente)
    elemento.addEventListener('mousedown', startMove);
    elemento.addEventListener('touchstart', startMove);
  }

  /**
   * Actualiza el día de descanso y gestiona los errores de permisos.
   */
  async actualizarDiaDescanso(pelota: any): Promise<void> {

    // 1. VALIDACIÓN: Si no hay token, salir.
    const token = localStorage.getItem('token');
    if (!token) return;

    // Guardamos el día nuevo al que se intentó mover
    const idDiaNuevo = pelota.dia ? this.dias.find((d) => d.nombre === pelota.dia)?.idDia : null;

    try {
      // 2. INTENTO DE ACTUALIZACIÓN
      await this.usuarioService.actualizarDiaDescanso(pelota.idUsuario, idDiaNuevo).toPromise();

      // --- ÉXITO ---
      if (idDiaNuevo) {
        // Estilo: Descanso (Gris/Rojo)
        this.renderer.setStyle(pelota.elemento, 'opacity', '0.7');
        this.renderer.setStyle(pelota.elemento, 'border', '3px solid #ff4444');
        this.renderer.setStyle(pelota.elemento, 'background-color', '#e0e0e0');
        this.renderer.setStyle(pelota.elemento, 'color', '#ff4444');
      } else {
        // Estilo: Activo (Normal)
        this.renderer.setStyle(pelota.elemento, 'opacity', '1');
        this.renderer.setStyle(pelota.elemento, 'border', 'none');
        this.renderer.removeStyle(pelota.elemento, 'background-color');
        this.renderer.setStyle(pelota.elemento, 'color', 'white');
      }

    } catch (error: any) {
      if (error.status === 403) {
        alert('Acceso Denegado: Solo los Administradores pueden gestionar descansos.');
        this.ngOnInit();

      } else if (error.status === 401) {
        console.warn('Sesión expirada');
      } else {
        console.error('Error crítico:', error);
        alert('Error de conexión. No se guardaron los cambios.');
      }
    }
  }

  retroceder(): void {
    this.router.navigate(['/pages/staff/personal']);
  }
}