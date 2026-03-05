import { Component, ElementRef, Renderer2, ViewChild, TemplateRef } from '@angular/core';
import { Router } from '@angular/router'; // Importa Router
import { MesaService } from '../../module-orders/services/mesa.service';
import { UsuarioService } from '../services/usuario.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SpinnerServiceService } from '../../module-products/services/spinner-service.service';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-area',
  templateUrl: './area.component.html',
  styleUrls: ['./area.component.css']
})
export class AreaComponent {
  pelotas: any[] = []; // Almacena los círculos (personal)
  usuariosCocina: any[] = []; 
  usuariosMesero: any[] = []; 
  areas: any[] = []; // Almacena las áreas
mesas: any[] = [];
  totalMesas: number = 0;
areaForm: FormGroup;
  @ViewChild('casillaSuperior', { static: true }) casillaSuperior!: ElementRef; // Referencia a la casilla superior
  @ViewChild('agregarAreaModal', { static: false }) agregarAreaModal!: TemplateRef<any>;

  constructor(
    private renderer: Renderer2,
    private usuarioService: UsuarioService,
    private mesaService: MesaService,
    private snackBar: MatSnackBar,
    private router: Router,
    private spinnerService: SpinnerServiceService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.areaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
this.cargarAreas();
    this.cargarMesas();
    // Obtener áreas desde la base de datos
    this.usuarioService.getAreas().subscribe(
      (data) => {
        this.areas = data;

        this.usuarioService.getUsuariosActivos('Cocina').subscribe(
          (cocinaData) => {
            if (cocinaData && cocinaData.length > 0) {
              this.usuariosCocina = cocinaData;
            } else {
              console.warn('No hay usuarios activos para Cocina');
            }
          },
          (error) => {
            console.error('Error al obtener usuarios de Cocina:', error);
          }
        );

        // Obtener usuarios activos de Mesero (IdRol = 4)
        this.usuarioService.getUsuariosActivos('Mesero').subscribe(
          (meseroData) => {
            if (meseroData && meseroData.length > 0) {
              this.usuariosMesero = meseroData;
            } else {
              console.warn('No hay usuarios activos para Mesero');
            }
          },
          (error) => {
            console.error('Error al obtener usuarios de Mesero:', error);
          }
        );
      },
      (error) => {
        console.error('Error al obtener áreas:', error);
      }
    );

    
  }

  /**
   * Crea los círculos (pelotas) para representar al personal.
   * @param usuarios Lista de usuarios.
   * @param rol Rol de los usuarios (Cocina o Mesero).
   */

  cargarAreas(): void {
    this.usuarioService.getAreas().subscribe(
      (data) => {
        this.areas = data;
      },
      (error) => {
        console.error('Error al cargar áreas:', error);
        this.snackBar.open('Error al cargar las áreas', 'Cerrar', { duration: 3000 });
      }
    );
  }
 cargarMesas(): void {
    this.mesaService.getList().subscribe(
      (mesas) => {
        this.mesas = mesas;
        this.totalMesas = mesas.length; // Actualiza el contador
      },
      (error) => {
        console.error('Error al cargar mesas:', error);
        this.snackBar.open('Error al cargar las mesas', 'Cerrar', { duration: 3000 });
      }
    );
  }

   mesasPorArea(idArea: number): any[] {
    return this.mesas.filter(mesa => mesa.idArea === idArea);
  }

   abrirModalAgregarArea(): void {
    this.areaForm.reset();
    const dialogRef = this.dialog.open(this.agregarAreaModal, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.guardarArea();
      }
    });
  }
  guardarArea(): void {
    if (this.areaForm.valid) {
      const nombreArea = this.areaForm.get('nombre')?.value;
      
      // Verificar si el área ya existe
      const areaExistente = this.areas.find(a => 
        a.nombre.toLowerCase() === nombreArea.toLowerCase()
      );
      
      if (areaExistente) {
        this.snackBar.open('Esta área ya existe', 'Cerrar', { duration: 3000 });
        return;
      }

      const nuevaArea = {
        IDArea: 0,
        Nombre: nombreArea
      };

      this.spinnerService.show();
      this.usuarioService.saveArea(nuevaArea).subscribe(
        (response) => {
          this.spinnerService.hide();
          if (response.success) {
            this.snackBar.open('Área creada exitosamente', 'Cerrar', { duration: 3000 });
            this.cargarAreas(); // Recargar la lista de áreas
            this.dialog.closeAll();
          } else {
            this.snackBar.open('Error al crear el área', 'Cerrar', { duration: 3000 });
          }
        },
        (error) => {
          this.spinnerService.hide();
          console.error('Error al crear área:', error);
          this.snackBar.open('Error al crear el área', 'Cerrar', { duration: 3000 });
        }
      );
    }
  }

  // Método para eliminar área
  eliminarArea(idArea: number, event: Event): void {
    event.stopPropagation();
    
    
    if (!idArea || isNaN(idArea)) {
      this.snackBar.open('ID de área inválido', 'Cerrar', { duration: 3000 });
      return;
    }

    // Verificar si hay mesas en esta área
    const mesasEnArea = this.mesas.filter(m => m.idArea === idArea);
    if (mesasEnArea.length > 0) {
      this.snackBar.open('No se puede eliminar el área porque tiene mesas asignadas', 'Cerrar', { 
        duration: 4000,
        panelClass: ['snack-error']
      });
      return;
    }

    // Verificar si hay usuarios asignados a esta área
    const usuariosEnArea = [...this.usuariosCocina, ...this.usuariosMesero].filter(u => u.idArea === idArea);
    if (usuariosEnArea.length > 0) {
      this.snackBar.open('No se puede eliminar el área porque tiene personal asignado', 'Cerrar', { 
        duration: 4000,
        panelClass: ['snack-error']
      });
      return;
    }

    if (confirm('¿Está seguro de eliminar esta área? Esta acción no se puede deshacer.')) {
      this.spinnerService.show();
      this.usuarioService.deleteArea(idArea).subscribe({
        next: (response) => {
          this.spinnerService.hide();
          if (response.success) {
            this.snackBar.open('Área eliminada correctamente', 'Cerrar', { duration: 3000 });
            this.cargarAreas(); // Recargar la lista de áreas
          } else {
            this.snackBar.open(response.message || 'Error al eliminar el área', 'Cerrar', { duration: 3000 });
          }
        },
        error: (error) => {
          this.spinnerService.hide();
          console.error('Error al eliminar área:', error);
          this.snackBar.open('Error al eliminar el área', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }
  obtenerIconoArea(nombreArea: string): string {
    const iconos: { [key: string]: string } = {
      'terraza': 'deck',
      'loza': 'restaurant',
      'escenario': 'theater_comedy',
      'cocina': 'kitchen',
      'barra': 'local_bar',
      'parrilla': 'outdoor_grill',
      'recepcion': 'meeting_room',
      'almacen': 'inventory'
    };
    
    return iconos[nombreArea.toLowerCase()] || 'location_on';
  }

 agregarMesa(area: any): void {
  // Obtener el número consecutivo para esta área
  const mesasArea = this.mesas.filter(m => m.idArea === area.idArea);
  const numeroConsecutivo = (mesasArea.length + 1).toString().padStart(2, '0');
  
  // Crear nombre de mesa (Mesa + Inicial de área + número)
  const inicialArea = area.nombre.charAt(0).toUpperCase();
  const nombreMesa = `Mesa${inicialArea}${numeroConsecutivo}`;
  
  const nuevaMesa = {
    nombre: nombreMesa,
    estado: true, // boolean según la entidad Mesa
    idUsuario: null, // puede ser null según la entidad
    idArea: area.idArea, // el idArea que viene del parámetro
    habilitado: true, // boolean según la entidad
    reservado: false, // boolean según la entidad
    total: 0 // decimal según la entidad
  };

 this.mesaService.saveItem(nuevaMesa).subscribe(
      (response) => {
        this.cargarMesas(); // Esto actualizará totalMesas automáticamente
      },
      (error) => {
        console.error('Error al crear mesa:', error);
        this.snackBar.open('Error al crear la mesa', 'Cerrar', { duration: 3000 });
      }
    );
  }



 eliminarMesa(idMesa: number, event: Event): void {
  event.stopPropagation();

  if (!idMesa || isNaN(idMesa)) {
    console.error('ID de mesa inválido:', idMesa);
    this.snackBar.open('ID de mesa inválido', 'Cerrar', { duration: 3000 });
    return;
  }

  if (confirm('¿Está seguro de eliminar esta mesa?')) {
    this.spinnerService.show();
    this.mesaService.deleteItem(idMesa).subscribe({
      next: (response) => {
      
        this.mesas = this.mesas.filter(m => m.IDMesa !== idMesa);
        this.snackBar.open('Mesa eliminada correctamente', 'Cerrar', {
          duration: 3000
        });

        this.cargarMesas();
        

        
      },

      error: (error) => {
  console.error('Error al eliminar mesa:', error);
  let errorMsg = 'Error al eliminar la mesa, esta ocupada';

  // 🔽 Verifica si tu backend envió un mensaje personalizado
  if (error.error?.message) {
    errorMsg = error.error.message;
  }

  this.snackBar.open(errorMsg, 'Cerrar', {
    duration: 4000,
    panelClass: ['snack-error']
  });
},
      complete: () => {
        this.spinnerService.hide();
      }
    });
  }
}

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
        area: usuario.idArea ? this.areas.find((d) => d.idArea === usuario.idArea)?.nombre : null,
        rol: rol,
        idUsuario: usuario.idUsuario,
      };

      this.pelotas.push(pelotaObj);
      this.hacerMovible(pelotaObj);

      // Posicionar la pelota en su área correspondiente
      if (pelotaObj.area) {
        const columna = document.querySelector(`.area-columna[data-area="${pelotaObj.area}"]`);
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
   * @param pelotaObj Objeto que representa una pelota.
   */
  hacerMovible(pelotaObj: any): void {
    const { elemento } = pelotaObj;
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    const startMove = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
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

      move(e);
    };

    const move = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
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
      isDragging = false;

      const pelotaRect = elemento.getBoundingClientRect();
      let colocada = false;

      // Verificar si la pelota se soltó en la casilla superior
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

        pelotaObj.area = null;

        colocada = true;
      }

      // Verificar si la pelota se soltó en alguna área
      if (!colocada) {
        document.querySelectorAll('.area-columna').forEach((columna: any) => {
          const columnaRect = columna.getBoundingClientRect();
          if (
            pelotaRect.left < columnaRect.right &&
            pelotaRect.right > columnaRect.left &&
            pelotaRect.top < columnaRect.bottom &&
            pelotaRect.bottom > columnaRect.top
          ) {
            pelotaObj.area = columna.dataset.area;

            this.renderer.appendChild(columna, elemento);
            this.renderer.setStyle(elemento, 'position', 'relative');
            this.renderer.setStyle(elemento, 'left', '0px');
            this.renderer.setStyle(elemento, 'top', '0px');

            colocada = true;
          }
        });
      }

      if (!colocada) {
        this.renderer.setStyle(elemento, 'position', 'relative');
      }

      this.renderer.setStyle(elemento, 'z-index', 'auto');
      this.renderer.setStyle(elemento, 'pointer-events', 'auto');

      // Actualizar el área en la base de datos
      this.actualizarArea(pelotaObj);
    };

    // Eventos para dispositivos táctiles
    elemento.addEventListener('touchstart', startMove);
    elemento.addEventListener('touchmove', move);
    elemento.addEventListener('touchend', endMove);

    // Eventos para mouse
    elemento.addEventListener('mousedown', startMove);
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', endMove);
  }

  /**
   * Actualiza el área de un usuario en la base de datos.
   * @param pelota Objeto que representa una pelota.
   */
  async actualizarArea(pelota: any): Promise<void> {
    const idArea = pelota.area ? this.areas.find((d) => d.nombre === pelota.area)?.idArea : null;

    try {
      const response = await this.usuarioService.actualizarArea(pelota.idUsuario, idArea).toPromise();
    } catch (error) {
      console.error('Error al actualizar el área:', error);
      alert('Error al actualizar el área');
    }
  }

  /**
   * Función para retroceder a la página anterior.
   */
   retroceder(): void {
    this.router.navigate(['/pages/staff/personal']); // Ruta correcta
  }
  enviarWhatsApp(): void {
    // 1. Organizar personal por área
    const personalPorArea: { [key: string]: string[] } = {};
    
    this.pelotas.forEach(pelota => {
        if (pelota.area) {
            personalPorArea[pelota.area] = personalPorArea[pelota.area] || [];
            personalPorArea[pelota.area].push(pelota.nombre);
        }
    });

    // 2. Construir mensaje mejorado
    let mensaje = "*ASIGNACIÓN DEL DÍA*\n\n";
    
    if (Object.keys(personalPorArea).length === 0) {
        mensaje += "⚠️ No hay personal asignado aún";
    } else {
        for (const [area, personal] of Object.entries(personalPorArea)) {
            mensaje += `*${area.toUpperCase()}*\n`;
            mensaje += personal.map(nombre => `➡ ${nombre}`).join('\n');
            mensaje += '\n\n';
        }
    }

    mensaje += `\nActualizado: ${new Date().toLocaleString()}`;

    // 3. Generar enlace directo
    const enlaceBase = "https://web.whatsapp.com";
    const enlaceGrupo = "https://chat.whatsapp.com/HgjmK4k37TZDYBZpT67TxW";
    
    // Alternativa 1: Enlace para móviles (abre la app)
    const urlMovil = `whatsapp://send?text=${encodeURIComponent(mensaje)}`;
    
    // Alternativa 2: Enlace para web
    const urlWeb = `${enlaceBase}/send?text=${encodeURIComponent(mensaje)}`;
    
    // Detección de dispositivo
    const esMovil = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    try {
        if (esMovil) {
            // Intenta abrir en la app
            window.location.href = urlMovil;
        } else {
            // Abre nueva pestaña con WhatsApp Web
            window.open(urlWeb, '_blank');
            
            // Muestra instrucciones adicionales
            setTimeout(() => {
                alert('Por favor pega el mensaje en el grupo manualmente.\n\nMensaje copiado al portapapeles!');
                this.copiarAlPortapapeles(mensaje);
            }, 1000);
        }
    } catch (e) {
        console.error('Error al abrir WhatsApp:', e);
        this.copiarAlPortapapeles(mensaje);
        alert('Se copió el mensaje al portapapeles. Péguelo manualmente en WhatsApp.');
    }
}

// Método auxiliar para copiar al portapapeles
copiarAlPortapapeles(texto: string): void {
    const textarea = document.createElement('textarea');
    textarea.value = texto;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
}
}