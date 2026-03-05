import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { PlatosServiceService } from '../services/platos-service.service';
import { AdicionalServiceService } from '../services/adicional-service.service';
import { CategoriaService } from '../services/categoria-plato.service';
import { firstValueFrom, forkJoin, Subscription } from 'rxjs';
import { SpinnerServiceService } from '../services/spinner-service.service'; 
import jsPDF from 'jspdf';
import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
  selector: 'app-platos',
  templateUrl: './platos.component.html',
  styleUrls: ['./platos.component.css'],
})
export class PlatosComponent implements OnInit, OnDestroy {
  @ViewChild('platoForm') platoForm!: NgForm;
  @ViewChild('categoriaForm') categoriaForm!: NgForm;
  
  platos: any[] = [];
  user: any;
  seccionFiltroActual: string = '';
  guardando = false;
  guardandoCategoria = false;
extrasSeleccionados: any[] = [];
textoBusqueda: string = '';

  secciones = [
    { idCategoria: 0, nombre: 'Seleccione categoría' }
  ];

  seccionesFiltradas = [...this.secciones];

  showModal: boolean = false;
  showModalCategoria: boolean = false;
  platoEditando = {
    idPlato: 0,
    nombre: '',
    descripcion: '',
    estado: true,
    stock: 0,
    precio: 0,
    imgRuta: '',
    fechaRegistro: '',
    fechaEliminado: null,
    idCategoria: 0,
    categoria: 'string',
    detalleAdicional: [] as { idAdicional: number }[]
  };

  nuevaCategoria = {
    nombre: '',
    idCategoria: 0
  };

  indiceEditando: number | null = null;
  seccionVisible: { [key: string]: boolean } = {};
  extras: any[] = [];
  
  private subscriptions: Subscription = new Subscription();

  ngOnInit(): void {
    this.cargarDatosIniciales();
    this.user = this.authService.getUser();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  constructor(
    private platosService: PlatosServiceService, 
    private adicionalService: AdicionalServiceService,
    public spinnerService: SpinnerServiceService,
    private authService: AuthService,
    private categoriaService: CategoriaService
  ) {}

  // ========== MÉTODO PARA CARGAR TODOS LOS DATOS INICIALES ==========
  private cargarDatosIniciales(): void {
    this.spinnerService.show();
    
    this.subscriptions.add(
      forkJoin({
        categorias: this.categoriaService.obtenerCategorias(),
        platos: this.platosService.obtenerPlatos(),
        extras: this.adicionalService.obtenerAdicional()
      }).subscribe({
        next: (resultados) => {
          // Procesar categorías
          this.secciones = [
            { idCategoria: 0, nombre: 'Seleccione categoría' },
            ...resultados.categorias
          ];
          this.seccionesFiltradas = [...this.secciones];
          
          // Procesar platos
          this.platos = resultados.platos;
          
          // Procesar extras
          this.extras = resultados.extras;
          
          // Inicializar secciones visibles
          this.secciones.forEach(seccion => {
            this.seccionVisible[seccion.nombre] = true;
          });
          
          this.spinnerService.hide();
        },
        error: (err) => {
          console.error('Error al cargar datos iniciales:', err);
          this.spinnerService.hide();
        }
      })
    );
  }
// Método para contar extras seleccionados
getSelectedExtrasCount(): number {
  return this.extrasSeleccionados.length;
}
  // ========== MÉTODOS DE CATEGORÍAS ==========
  
  abrirModalNuevaCategoria(): void {
    this.showModal = false;
    setTimeout(() => {
      this.nuevaCategoria = {
        nombre: '',
        idCategoria: 0
      };
      this.showModalCategoria = true;
    }, 300);
  }

  cerrarModalCategoria(): void {
    this.showModalCategoria = false;
  }

  guardarCategoria(): void {
    if (this.nuevaCategoria.nombre.trim() && !this.guardandoCategoria) {
      this.guardandoCategoria = true;
      this.spinnerService.show();
      
      this.subscriptions.add(
        this.categoriaService.crearCategoria(this.nuevaCategoria).subscribe({
          next: (response: any) => {
            if (response.success) {
              window.alert('Categoría creada exitosamente');
              
              // Recargar categorías y platos
              this.spinnerService.show();
              this.subscriptions.add(
                forkJoin({
                  categorias: this.categoriaService.obtenerCategorias(),
                  platos: this.platosService.obtenerPlatos()
                }).subscribe({
                  next: (resultados) => {
                    // Actualizar categorías
                    this.secciones = [
                      { idCategoria: 0, nombre: 'Seleccione categoría' },
                      ...resultados.categorias
                    ];
                    
                    // Aplicar filtro actual si existe
                    if (this.seccionFiltroActual) {
                      this.seccionesFiltradas = this.secciones.filter(
                        s => s.nombre === this.seccionFiltroActual
                      );
                    } else {
                      this.seccionesFiltradas = [...this.secciones];
                    }
                    
                    // Actualizar platos
                    this.platos = resultados.platos;
                    
                    this.showModalCategoria = false;
                    this.guardandoCategoria = false;
                    
                    setTimeout(() => {
                      this.showModal = true;
                      const nuevaCat = this.secciones.find(s => s.nombre === this.nuevaCategoria.nombre);
                      if (nuevaCat) {
                        this.platoEditando.idCategoria = nuevaCat.idCategoria;
                      }
                      this.spinnerService.hide();
                    }, 300);
                  },
                  error: (error) => {
                    console.error('Error al recargar datos:', error);
                    this.guardandoCategoria = false;
                    this.spinnerService.hide();
                  }
                })
              );
              
            } else {
              window.alert(response.message || 'Error al crear categoría');
              this.guardandoCategoria = false;
              this.spinnerService.hide();
            }
          },
          error: (error) => {
            console.error('Error al crear categoría:', error);
            window.alert('Error al crear la categoría');
            this.guardandoCategoria = false;
            this.spinnerService.hide();
          }
        })
      );
    } else {
      window.alert('El nombre de la categoría es requerido');
    }
  }

  // ========== MÉTODOS DE PLATOS ==========
  
  cargarPlatos(): void {
    this.spinnerService.show();
    this.subscriptions.add(
      this.platosService.obtenerPlatos().subscribe({
        next: (data) => {
          this.platos = data;
          
          // Si hay un filtro activo, mantenerlo
          if (this.seccionFiltroActual) {
            this.filtrarPorSeccion(this.seccionFiltroActual);
          }
          
          this.spinnerService.hide();
        },
        error: (err) => {
          console.error('Error al obtener platos:', err);
          this.spinnerService.hide();
        }
      })
    );
  }

  // ========== MÉTODOS DE FILTRADO Y VISUALIZACIÓN ==========
  
  filtrarPorSeccion(seccion: string): void {
    // Guardar el filtro actual
    this.seccionFiltroActual = seccion;
    
    // Mostrar spinner durante el filtrado
    this.spinnerService.show();
    
    // Simular un pequeño delay para que se vea el spinner
    setTimeout(() => {
      if (seccion) {
        this.seccionesFiltradas = this.secciones.filter(s => s.nombre === seccion);
      } else {
        this.seccionesFiltradas = [...this.secciones];
      }
      
      // Ocultar spinner
      this.spinnerService.hide();
    }, 300);
  }

  toggleSeccion(seccion: string): void {
    this.seccionVisible[seccion] = !this.seccionVisible[seccion];
  }

  getPlatosPorSeccion(seccion: string) {
    // 1. Normalizar el texto de búsqueda (minúsculas y sin espacios extra)
    const termino = this.textoBusqueda.toLowerCase().trim();

    return this.platos.filter(plato => {
      // 2. Verificar que pertenezca a la categoría actual del bucle
      const coincideCategoria = plato.categoria === seccion;
      
      // 3. Verificar que el nombre coincida con la búsqueda (si hay texto)
      const coincideBusqueda = !termino || plato.nombre.toLowerCase().includes(termino);

      return coincideCategoria && coincideBusqueda;
    });
  }

  limpiarBusqueda(): void {
    this.textoBusqueda = '';
    // No necesitamos llamar a nada más, el binding de Angular actualiza la vista automáticamente
  }

  // NUEVO: Función opcional si quieres hacer algo al escribir (por ahora vacía ya que usamos el binding directo en getPlatosPorSeccion)
  onSearch(): void {
    // Puedes agregar lógica aquí si necesitas reiniciar paginación o logs
  }

  // ========== MÉTODOS DEL MODAL DE PLATOS ==========
  
  openAddPlatoModal(): void {
    this.indiceEditando = null;
    this.platoEditando = {
      idPlato: 0,
      nombre: '',
      descripcion: '',
      estado: true,
      stock: 0,
      precio: 0,
      imgRuta: '',
      fechaRegistro: '',
      fechaEliminado: null,
      idCategoria: 0,
      categoria: 'string',
      detalleAdicional: []
    };
    this.showModal = true;
  }

  openEditPlatoModal(plato: any, index: number): void {
    this.indiceEditando = index;
    this.platoEditando = { ...plato };
    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
    this.guardando = false;
  }
  
  async guardarPlato(): Promise<void> {
    if (this.platoForm.valid && !this.guardando) {
      this.guardando = true;
      this.spinnerService.show();
      
      try {
        if (this.indiceEditando !== null) {
          // Editar plato existente
          await firstValueFrom(this.platosService.editarPlato(this.platoEditando));

          const idAdicionales = this.platoEditando.detalleAdicional
            ? this.platoEditando.detalleAdicional.map(a => a.idAdicional)
            : [];

          await firstValueFrom(
            this.platosService.addAdicionales(this.platoEditando.idPlato, idAdicionales)
          );

          window.alert('Platillo editado correctamente');
        } else {
          // Crear nuevo plato
          this.platoEditando.fechaRegistro = new Date().toISOString().split('T')[0];
          await firstValueFrom(this.platosService.agregarPlato(this.platoEditando));
          window.alert('Platillo agregado correctamente');
        }
        
        // Cerrar el modal inmediatamente
        this.showModal = false;
        
        // Recargar los platos y mantener el filtro actual
        this.recargarPlatosConFiltro();
        
      } catch (error) {
        console.error('Error al guardar el platillo:', error);
        window.alert('Error al guardar el plato');
        this.guardando = false;
        this.spinnerService.hide();
      }
    }
  }

  // Método para recargar platos manteniendo el filtro
  private recargarPlatosConFiltro(): void {
    this.spinnerService.show();
    this.subscriptions.add(
      this.platosService.obtenerPlatos().subscribe({
        next: (data) => {
          this.platos = data;
          
          // Si hay un filtro activo, recargar también las categorías
          if (this.seccionFiltroActual) {
            this.cargarCategoriasYFiltrar();
          } else {
            this.guardando = false;
            this.spinnerService.hide();
          }
        },
        error: (err) => {
          console.error('Error al recargar platos:', err);
          this.guardando = false;
          this.spinnerService.hide();
        }
      })
    );
  }

  // Método para cargar categorías y aplicar filtro
  private cargarCategoriasYFiltrar(): void {
    this.subscriptions.add(
      this.categoriaService.obtenerCategorias().subscribe({
        next: (categorias) => {
          this.secciones = [
            { idCategoria: 0, nombre: 'Seleccione categoría' },
            ...categorias
          ];
          
          // Reaplicar el filtro actual
          this.filtrarPorSeccion(this.seccionFiltroActual);
          this.guardando = false;
          this.spinnerService.hide();
        },
        error: (err) => {
          console.error('Error al cargar categorías:', err);
          this.guardando = false;
          this.spinnerService.hide();
        }
      })
    );
  }

  deletePlato(plato: any): void {
    if (confirm('¿Estás seguro de que quieres eliminar este platillo?')) {
      this.spinnerService.show();
      plato.estado = false;
      plato.stock = 0;
      plato.fechaEliminado = new Date().toISOString();
      
      this.subscriptions.add(
        this.platosService.editarPlato(plato).subscribe({
          next: (response) => {
            // Eliminar localmente y recargar para mantener consistencia
            this.platos = this.platos.filter(p => p.idPlato !== plato.idPlato);
            window.alert('Platillo eliminado correctamente');
            
            // Recargar para asegurar datos actualizados
            this.recargarPlatosConFiltro();
          },
          error: (error) => {
            console.error('Error al eliminar platillo:', error);
            window.alert('Error al eliminar el plato');
            this.spinnerService.hide();
          }
        })
      );
    }
  }

  cambiarEstado(plato: any): void {
    this.spinnerService.show();
    const nuevoStock = plato.stock > 0 ? 0 : 1;
    const platoActualizado = { ...plato, stock: nuevoStock };
    
    this.subscriptions.add(
      this.platosService.editarPlato(platoActualizado).subscribe({
        next: (response) => {
          // Actualizar localmente
          const index = this.platos.findIndex(p => p.idPlato === plato.idPlato);
          if (index !== -1) {
            this.platos[index].stock = nuevoStock;
          }
          
          window.alert('Estado actualizado correctamente');
          this.spinnerService.hide();
        },
        error: (error) => {
          console.error('Error al cambiar estado:', error);
          window.alert('Error al actualizar estado');
          this.spinnerService.hide();
        }
      })
    );
  }

  onExtraChange(event: any, idAdicional: number) {
    if (event.checked) {
      this.platoEditando.detalleAdicional.push({ idAdicional });
    } else {
      this.platoEditando.detalleAdicional = this.platoEditando.detalleAdicional.filter(
        extra => extra.idAdicional !== idAdicional
      );
    }
  }

  isExtraSelected(idAdicional: number): boolean {
    return this.platoEditando.detalleAdicional.some(extra => extra.idAdicional === idAdicional);
  }

  // ========== MÉTODO PARA GENERAR PDF ==========
  
  generarPDF() {
    this.spinnerService.show();
    
    setTimeout(() => {
      try {
        const doc = new jsPDF();
        const margin = 15;
        let y = 15;

        // Encabezado
        doc.setFontSize(20);
        doc.setTextColor(220, 105, 11);
        doc.setFont('helvetica', 'bold');
        doc.text('LA PATRONA', 105, y, { align: 'center' });
        
        doc.setFontSize(16);
        doc.text('CARTA DE PLATILLOS', 105, y + 8, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        
        y = 35;

        // Configuración de columnas
        const colWidth = 90;
        const colGap = 10;
        const cols = [
          { x: margin, y: y },
          { x: margin + colWidth + colGap, y: y }
        ];
        
        let col = 0;
        let currentY = y;

        // Obtener secciones reales
        const seccionesReales = this.secciones.filter(s => s.idCategoria !== 0);

        for (const seccion of seccionesReales) {
          const platosSeccion = this.platos.filter(p => p.categoria === seccion.nombre);
          if (platosSeccion.length === 0) continue;

          // Verificar si cambiamos de columna
          if (currentY > 250) {
            col++;
            if (col > 1) break; // Solo 2 columnas
            currentY = y;
          }

          const x = cols[col].x;

          // Título de sección
          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'bold');
          doc.text(seccion.nombre.toUpperCase(), x, currentY);
          currentY += 6;

          // Línea
          doc.setDrawColor(220, 105, 11);
          doc.setLineWidth(0.3);
          doc.line(x, currentY, x + colWidth, currentY);
          currentY += 8;

          // Platillos
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          
          for (const plato of platosSeccion) {
            if (currentY > 270) {
              col++;
              if (col > 1) break;
              currentY = y;
              break; // Volver al inicio con nueva sección
            }

            // Nombre truncado si es necesario
            let nombre = plato.nombre;
            if (nombre.length > 35) {
              nombre = nombre.substring(0, 32) + '...';
            }
            
            doc.setTextColor(220, 105, 11);
            doc.text(nombre, x, currentY);
            
            // Precio
            doc.setTextColor(0, 0, 0);
            const precioText = `S/ ${plato.precio.toFixed(2)}`;
            const precioWidth = doc.getTextWidth(precioText);
            doc.text(precioText, x + colWidth - precioWidth, currentY);
            
            currentY += 5;
          }
          
          currentY += 3; // Espacio entre secciones
        }

        // Contador total
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(`Total: ${this.platos.length} platillos`, 15, 285);

        // Guardar
        const fecha = new Date().toISOString().split('T')[0];
        doc.save(`Carta_La_Patrona${fecha}.pdf`);
        
        setTimeout(() => {
          this.spinnerService.hide();
        }, 300);
        
      } catch (error) {
        console.error('Error al generar PDF:', error);
        window.alert('Error al generar el PDF');
        this.spinnerService.hide();
      }
    }, 100);
  }
}