import { Component, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import * as XLSX from 'xlsx';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { AgregarSuministroComponent } from 'src/app/modules/module-products/suministros/agregar-suministro/agregar-suministro.component';
import { EditarSuministroComponent } from './editar-suministro/editar-suministro.component';
import { SuministroServiceService } from '../services/suministro-service.service';
import { SpinnerServiceService } from '../services/spinner-service.service';
import { CrearCategoriaComponent } from './crear-categoria/crear-categoria.component';
import { CategoriaService } from '../services/categoria-suministro.service';

@Component({
  selector: 'app-suministros',
  templateUrl: './suministros.component.html',
  styleUrls: ['./suministros.component.css']
})
export class SuministrosComponent {

  items: any[] = [];
  itemsFiltrados: any[] = [];
  dataSource = new MatTableDataSource<any>(this.itemsFiltrados);
  filtro: string = '';
  categoriaSeleccionada: string = 'Todos';

  categorias = [
    { idCategoria: 1, nombre: "" },
  ];

  ordenStock: 'asc' | 'desc' = 'asc';
  paginaActual = 0;
  itemsPorPagina = 7;
  columnas: string[] = ['nombre', 'stock', 'promedio', 'unit', 'categoria', 'acciones'];

  get itemsPaginaActual() {
    const inicio = this.paginaActual * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.itemsFiltrados.slice(inicio, fin);
  }

  constructor(
    private suministroService: SuministroServiceService,
    private categoriaService: CategoriaService,
    private dialog: MatDialog, 
    public spinnerService: SpinnerServiceService
  ) {}

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarSuministros();
  }

  cargarSuministros() {
    this.suministroService.obtenerSuministros().subscribe({
      next: (data) => {
        this.items = data;
        this.itemsFiltrados = [...this.items];
        this.dataSource.data = this.itemsFiltrados;
      },
      error: (err) => console.error('Error al obtener suministros:', err)
    });
  }

  cargarCategorias() {
    this.suministroService.obtenerCategorias().subscribe({
      next: (data) => {
        this.categorias = data;
      },
      error: (err) => console.error('Error al obtener categorías:', err)
    });
  }

  // Método para abrir modal de creación de categoría
  abrirModalCrearCategoria() {
    const dialogRef = this.dialog.open(CrearCategoriaComponent, {
      width: '400px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Categoría creada:', result);
        // Recargar las categorías después de crear una nueva
        this.cargarCategorias();
      }
    });
  }

  filtrarItems() {
    this.itemsFiltrados = this.items.filter(item =>
      item.nombre.toLowerCase().includes(this.filtro.toLowerCase())
    );

    this.ordenarPorStock();
  }

  aplicarFiltro(categoria: string): void {
    let itemsTemp = [...this.items];
  
    // Filtrado por categoría
    if (categoria === 'Sin Stock') {
      itemsTemp = itemsTemp.filter(item => item.stock === 0);
    } else if (categoria !== 'Todos') {
      itemsTemp = itemsTemp.filter(item => item.categoria === categoria);
    }
  
    // Filtrado por nombre
    if (this.filtro?.trim()) {
      itemsTemp = itemsTemp.filter(item =>
        item.nombre.toLowerCase().includes(this.filtro.toLowerCase())
      );
    }
  
    // Asignar datos filtrados
    this.itemsFiltrados = itemsTemp;
    this.dataSource.data = this.itemsFiltrados;
  
    // Reiniciar paginación
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage(); 
    }
  }

  // Manejar el cambio de página
  cambiarPagina(event: PageEvent) {
    this.paginaActual = event.pageIndex;
    this.itemsPorPagina = event.pageSize;
  }
getStockIcon(stock: number): string {
    if (stock === 0) {
      return 'error'; // Ícono de error para stock 0
    } else if (stock <= 10) {
      return 'warning'; // Ícono de advertencia para stock bajo
    } else {
      return 'check_circle'; // Ícono de check para stock suficiente
    }
  }

  // Método para calcular el porcentaje de stock (asumiendo un máximo de 100)
  getStockPercentage(item: any): number {
    // Puedes ajustar este valor máximo según tus necesidades
    const maxStock = 100;
    return Math.min((item.stock / maxStock) * 100, 100);
  }

  // Método para obtener color de categoría
  getCategoryColor(categoria: string): string {
    // Genera un gradiente basado en el hash de la categoría
    const gradients = [
      'linear-gradient(135deg, #a8edea, #fed6e3)',
      'linear-gradient(135deg, #5ee7df, #b490ca)',
      'linear-gradient(135deg, #74b9ff, #0984e3)',
      'linear-gradient(135deg, #f093fb, #f5576c)',
      'linear-gradient(135deg, #d299c2, #fef9d7)'
    ];
    
    // Crea un hash simple basado en el nombre de la categoría
    let hash = 0;
    for (let i = 0; i < categoria.length; i++) {
      hash = categoria.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Usa el hash para seleccionar un gradiente
    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
  }

  // Método para ver detalles del item
  verDetalles(item: any): void {
    // Implementa la lógica para ver detalles
    console.log('Ver detalles:', item);
    // Puedes abrir un modal, navegar a otra página, etc.
    // Ejemplo: this.abrirModalDetalles(item);
  }
  abrirModalAgregar() {
    const dialogRef = this.dialog.open(AgregarSuministroComponent, {
      width: '500px',
      data: { 
        categorias: this.categorias }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        window.alert(`Suministro agregado: ${result.nombre}`);
        this.cargarSuministros();
        console.log('Nuevo suministro agregado:', this.itemsFiltrados);
      }
    });
  }

  abrirModalEditar(item: any) {
    const dialogRef = this.dialog.open(EditarSuministroComponent, {
      width: '500px',
      data: { 
        suministro: { ...item },
        categorias: this.categorias }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarSuministros();
        console.log('Nuevo suministro editado:', this.itemsFiltrados);
      }
    });
  }
 
  eliminarItem(item: any): void {
    const confirmacion = window.confirm(`¿Estás seguro de que deseas eliminar "${item.nombre}"?`);

    if (confirmacion) {
      // Guardar una copia del item antes de modificarlo
      const index = this.items.indexOf(item);
      const copiaItem = { ...item }; // Copia para restaurar en caso de error

      // Eliminar inmediatamente de la interfaz
      this.items.splice(index, 1);
      this.itemsFiltrados = [...this.items];
      this.dataSource.data = this.items;

      // Modificar el objeto antes de enviarlo a la API
      item.estado = false;
      item.fechaEliminado = new Date().toISOString();
      item.stock = 0;

      // Llamar al servicio para actualizar en la API
      this.suministroService.editarSuministro(item).subscribe({
        next: () => {
          console.log(`Suministro "${item.nombre}" eliminado correctamente.`);
        },
        error: (error) => {
          console.error('Error al eliminar suministro:', error);
          // Restaurar el ítem si la API falla
          this.items.splice(index, 0, copiaItem);
          this.itemsFiltrados = [...this.items];
          this.dataSource.data = this.items;
        }
      });
    }
  }

  // Actualizar ítems
  actualizarItems() {
    console.log('Actualizando items...');
    this.cargarSuministros();
    window.alert('Los datos se han actualizado correctamente.');
  }
  
  // Exportar lista
  exportarLista() {
    const datosExportar = this.itemsFiltrados.map(item => ({
      Suministro: item.nombre,
      Stock: item.stock,
      Promedio: item.promedio,
      Unidad: item.unidad,
      Categoría: item.categoria,
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosExportar);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Suministros');
    XLSX.writeFile(wb, 'suministros.xlsx');
  }
  
  ordenarPorStock() {
    this.ordenStock = this.ordenStock === 'asc' ? 'desc' : 'asc';
    this.itemsFiltrados.sort((a, b) => 
      this.ordenStock === 'asc' ? a.stock - b.stock : b.stock - a.stock
    );
  
    this.dataSource.data = [...this.itemsFiltrados];
  
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}