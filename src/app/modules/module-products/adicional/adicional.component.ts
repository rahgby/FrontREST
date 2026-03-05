import { Component, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import * as XLSX from 'xlsx';
import { AdicionalServiceService } from '../services/adicional-service.service';
import { NgForm } from '@angular/forms';
import { SpinnerServiceService } from '../services/spinner-service.service'; 
import { PlatosServiceService } from '../services/platos-service.service';

@Component({
  selector: 'app-adicional',
  templateUrl: './adicional.component.html',
  styleUrls: ['./adicional.component.css']
})
export class AdicionalComponent {
  @ViewChild('itemForm') itemForm!: NgForm;
  @ViewChild('saborForm') saborForm!: NgForm;
  
  // Datos de la tabla de adicionales
  items: any[] = [
    { idAdicional: 1, nombre: '', stock: 0, precio: 0 },
  ];

  // Datos de la tabla de sabores
  sabores: any[] = [];
  saboresFiltrados: any[] = [];
  filtroSabores: string = '';
  
  itemsFiltrados = this.items;
  filtro: string = '';
  mostrarModal = false;
  mostrarModalSabor = false;
  modalTitulo = '';
  modalTituloSabor = '';
  
  itemSeleccionado: any = {
    idAdicional: 0,
    nombre: '',
    stock: 0,
    precio: 0,
    estado: true,
    fechaRegistro: ''
  };

  saborSeleccionado: any = {
    IDSabor: 0,
    Nombre: '',
    IDPlato: null,
    Plato: '',
    Estado: true
  };

  // Para la lista de platos en el select
  platos: any[] = [];

  // Paginación
  paginaActual = 0;
  paginaActualSabores = 0;
  itemsPorPagina = 7;
  itemsPorPaginaSabores = 7;

  // Columnas de las tablas
  columnas: string[] = ['id', 'nombre', 'stock', 'precio', 'acciones'];
  columnasSabores: string[] = ['id', 'nombre', 'plato', 'estado', 'acciones'];
  ordenStock: 'asc' | 'desc' = 'asc';
  dataSource: any;
  indiceEditando: number | null = null;
  indiceEditandoSabor: number | null = null;

  constructor(
    private adicionalService: AdicionalServiceService, 
    private platosService: PlatosServiceService,
    public spinnerService: SpinnerServiceService
  ) {}

  ngOnInit(): void {
    this.cargarAdicionales();
    this.cargarSabores();
    this.cargarPlatos();
  }

  cargarAdicionales() {
    this.adicionalService.obtenerAdicional().subscribe({
      next: (data) => {
        this.items = data;
        this.itemsFiltrados = [...this.items];
      },
      error: (err) => {
        console.error('❌ Error al obtener suministros:', err);
      }
    });
  }

  cargarSabores() {
  this.adicionalService.obtenerSabores().subscribe({
    next: (data) => {
     
      
      if (Array.isArray(data)) {
        // Mapear los datos para usar propiedades consistentes
        this.sabores = data.map(sabor => ({
          IDSabor: sabor.idSabor,  // Mapear idSabor → IDSabor
          Nombre: sabor.nombre,
          IDPlato: sabor.idPlato,   // Mapear idPlato → IDPlato
          Plato: sabor.plato,
          Estado: sabor.estado
        }));
        
        this.saboresFiltrados = [...this.sabores];
      } else {
        console.error('❌ Error: Los datos no son un array:', data);
        this.sabores = [];
        this.saboresFiltrados = [];
      }
    },
    error: (err) => {
      console.error('❌ Error al obtener sabores:', err);
      console.error('❌ Detalles del error:', err.message);
      console.error('❌ Status:', err.status);
    }
  });
}

  cargarPlatos() {
    this.platosService.obtenerPlatos().subscribe({
      next: (data) => {
        this.platos = data;
      },
      error: (err) => {
        console.error('❌ Error al obtener platos:', err);
      }
    });
  }

  // Obtener los ítems de la página actual para adicionales
  get itemsPaginaActual() {
    const inicio = this.paginaActual * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    const resultado = this.itemsFiltrados.slice(inicio, fin);
    return resultado;
  }

  // Obtener los ítems de la página actual para sabores
  get saboresPaginaActual() {
    const inicio = this.paginaActualSabores * this.itemsPorPaginaSabores;
    const fin = inicio + this.itemsPorPaginaSabores;
    const resultado = this.saboresFiltrados.slice(inicio, fin);
    return resultado;
  }

  // Filtrar ítems por nombre (adicionales)
  filtrarItems() {
    this.itemsFiltrados = this.items.filter(item =>
      item.nombre.toLowerCase().includes(this.filtro.toLowerCase())
    );
    this.paginaActual = 0;
  }

  // Filtrar sabores por nombre
  filtrarSabores() {
    this.saboresFiltrados = this.sabores.filter(sabor =>
      sabor.Nombre.toLowerCase().includes(this.filtroSabores.toLowerCase())
    );
    this.paginaActualSabores = 0;
  }

  // Cambiar de página para adicionales
  cambiarPagina(event: PageEvent) {
    this.paginaActual = event.pageIndex;
    this.itemsPorPagina = event.pageSize;
  }

  // Cambiar de página para sabores
  cambiarPaginaSabores(event: PageEvent) {
    this.paginaActualSabores = event.pageIndex;
    this.itemsPorPaginaSabores = event.pageSize;
  }

  // Métodos para adicionales
  abrirModalAgregar() {
    this.modalTitulo = 'Agregar Item';
    this.itemSeleccionado = { 
      idAdicional: 0,
      nombre: '', 
      stock: 0, 
      precio: 0,
      estado: true,
      fechaRegistro: new Date().toISOString().split('T')[0]
    };
    this.mostrarModal = true;
    this.indiceEditando = null;
  }

  abrirModalEditar(item: any) {
    this.indiceEditando = item.idAdicional;
    this.modalTitulo = 'Editar Item';
    this.itemSeleccionado = { ...item };
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  // Métodos para sabores
  abrirModalAgregarSabor() {
    this.modalTituloSabor = 'Agregar Sabor';
    this.saborSeleccionado = {
      IDSabor: 0,
      Nombre: '',
      IDPlato: null,
      Plato: '',
      Estado: true
    };
    this.mostrarModalSabor = true;
    this.indiceEditandoSabor = null;
  }

  abrirModalEditarSabor(sabor: any) {
  
  this.indiceEditandoSabor = sabor.IDSabor;
  this.modalTituloSabor = 'Editar Sabor';
  
  // ⭐ CRÍTICO: Asegurarse de copiar con los nombres correctos
  this.saborSeleccionado = {
    IDSabor: sabor.IDSabor,
    Nombre: sabor.Nombre,
    IdPlato: sabor.IDPlato,  // Nota: Frontend usa IdPlato, backend IDPlato
    Plato: sabor.Plato,
    Estado: sabor.Estado
  };
  
  this.mostrarModalSabor = true;
}

  cerrarModalSabor() {
    this.mostrarModalSabor = false;
  }
guardarSabor() {
  
  
  if (this.saborForm.valid) {
    // Validar que IdPlato no sea null, undefined, 0 o vacío
    if (!this.saborSeleccionado.IdPlato) {
      console.error('❌ Error: IdPlato no puede estar vacío');
      window.alert('Por favor seleccione un plato');
      return;
    }
    
    if (this.indiceEditandoSabor !== null && this.indiceEditandoSabor > 0) {
      this.editarSabor(this.saborSeleccionado);
      this.cerrarModalSabor();
    } else {     
      this.crearSabor(this.saborSeleccionado);
      this.cerrarModalSabor();
    }
  } else {
    console.error('❌ Formulario inválido');
    window.alert('Por favor complete todos los campos requeridos correctamente');
  }
}
crearSabor(sabor: any): void {
  
  // ⭐ Buscar el nombre del plato
  const platoSeleccionado = this.platos.find(p => p.idPlato === Number(sabor.IdPlato));
  
  if (!platoSeleccionado) {
    console.error('❌ ERROR: No se encontró el plato');
    window.alert('Error: Debe seleccionar un plato válido');
    return;
  }
  
  // Crear el objeto en el formato EXACTO que espera el backend
  const saborParaBackend = {
    IDSabor: 0,  // Para creación, debe ser 0
    Nombre: sabor.Nombre,
    IDPlato: Number(sabor.IdPlato),
    Plato: platoSeleccionado.nombre,  // ⭐ AGREGAR nombre del plato
    Estado: true
  };
  
  
  this.adicionalService.agregarSabor(saborParaBackend).subscribe({
    next: (response) => {
      window.alert('Sabor agregado correctamente');
      this.cargarSabores();
    },
    error: (error) => {
      console.error('❌ Error al crear sabor:', error);
      if (error.error?.errors) {
        const errores = Object.entries(error.error.errors)
          .map(([campo, mensajes]: [string, any]) => `${campo}: ${mensajes.join(', ')}`)
          .join('\n');
        window.alert(`Errores de validación:\n${errores}`);
      } else {
        window.alert('Error al agregar sabor: ' + (error.error?.message || error.message));
      }
    }
  });
}

editarSabor(sabor: any) {
  
  
  // Validar ANTES de enviar
  if (!sabor.IdPlato || sabor.IdPlato === null || sabor.IdPlato === undefined) {
    console.error('❌ ERROR: IdPlato es null/undefined');
    window.alert('Por favor seleccione un plato válido');
    return;
  }
  
  // Convertir a números
  const idPlato = Number(sabor.IdPlato);
  const idSabor = Number(sabor.IDSabor);
  
  if (isNaN(idPlato) || idPlato <= 0) {
    console.error('❌ ERROR: IdPlato inválido');
    window.alert('ID de plato inválido');
    return;
  }
  
  // Verificar si el nombre del sabor ya existe en este plato
  const saborExistente = this.sabores.find(s => 
    s.Nombre.toLowerCase() === sabor.Nombre.toLowerCase() && 
    s.IDPlato === idPlato &&
    s.IDSabor !== idSabor
  );
  
  if (saborExistente) {
    console.error('❌ ERROR: Ya existe este sabor en el plato seleccionado');
    window.alert(`El sabor "${sabor.Nombre}" ya existe en este plato. Por favor, elija un nombre diferente.`);
    return;
  }
  
  // ⭐ SOLUCIÓN: Buscar el nombre del plato
  const platoSeleccionado = this.platos.find(p => p.idPlato === idPlato);
  
  if (!platoSeleccionado) {
    console.error('❌ ERROR: No se encontró el plato');
    window.alert('Error: No se encontró el plato seleccionado');
    return;
  }
  
  // CRÍTICO: Incluir TODOS los campos requeridos
  const saborParaBackend = {
    IDSabor: idSabor,
    Nombre: sabor.Nombre.trim(),
    IDPlato: idPlato,
    Plato: platoSeleccionado.nombre,  // ⭐ AGREGAR nombre del plato
    Estado: sabor.Estado !== undefined ? sabor.Estado : true
  };

  
  this.adicionalService.editarSabor(saborParaBackend).subscribe({
    next: (response) => {
      window.alert('Sabor editado correctamente');
      this.cargarSabores();
    },
    error: (error) => {
      console.error('❌ Error al editar sabor:', error);
      
      // Manejar errores específicos
      if (error.status === 400) {
        if (error.error?.errors) {
          // Mostrar errores de validación específicos
          const errores = Object.entries(error.error.errors)
            .map(([campo, mensajes]: [string, any]) => `${campo}: ${mensajes.join(', ')}`)
            .join('\n');
          window.alert(`Errores de validación:\n${errores}`);
        } else if (error.error?.message) {
          window.alert('Error: ' + error.error.message);
        } else {
          window.alert('Error de validación. Verifique que todos los campos sean correctos.');
        }
      } else {
        window.alert('Error al editar sabor. Por favor, intente nuevamente.');
      }
    }
  });
}
 // Reemplazar el método eliminarSabor en adicional.component.ts

eliminarSabor(sabor: any) {
  const confirmacion = window.confirm(`¿Estás seguro de que deseas desactivar "${sabor.Nombre}"?`);
  
  if (confirmacion) {
    // Llamar directamente al servicio de eliminación
    this.adicionalService.eliminarSabor(sabor.IDSabor).subscribe({
      next: (response) => {
        window.alert('Sabor desactivado correctamente');
        this.cargarSabores(); // Recargar la lista
      },
      error: (error) => {
        console.error('❌ Error al desactivar sabor:', error);
        window.alert('Error al desactivar el sabor: ' + (error.error?.message || error.message));
      }
    });
  }
}

activarSabor(sabor: any) {
  const confirmacion = window.confirm(`¿Deseas reactivar "${sabor.Nombre}"?`);
  
  if (confirmacion) {
    this.adicionalService.reactivarSabor(sabor.IDSabor).subscribe({
      next: (response) => {
        window.alert('Sabor reactivado correctamente');
        this.cargarSabores();
      },
      error: (error) => {
        console.error('❌ Error al reactivar:', error);
        window.alert('Error al reactivar el sabor: ' + (error.error?.message || error.message));
      }
    });
  }
}

  // Métodos para adicionales
  guardarItem() {
    if (this.itemForm.valid) {
      if (this.indiceEditando !== null && this.indiceEditando > 0) {
        this.editarAdicional(this.itemSeleccionado);
        this.cerrarModal();
      } else {     
        this.crearAdicional(this.itemSeleccionado);
        this.cerrarModal();
      }
    }
  }

  editarAdicional(adicional: any){
    this.adicionalService.editarAdicional(adicional).subscribe({
      next: (response) => {
        this.cargarAdicionales();
      },
      error: (error) => {
        console.error('❌ Error al editar:', error);
        window.alert('Error al editar');
      }
    });
  }

  crearAdicional(adicional: any): void {
    adicional.fechaRegistro = new Date().toISOString().split('T')[0];
    adicional.estado = true;

    this.adicionalService.agregarAdicional(adicional).subscribe({
      next: (response) => {
        window.alert('Platillo agregado correctamente');
        this.cargarAdicionales();
      },
      error: (error) => {
        console.error('❌ Error al crear:', error);
        window.alert('Error al agregar');
      }
    });
  }

  eliminarItem(item: any) {
    const confirmacion = window.confirm(`¿Estás seguro de que deseas eliminar "${item.nombre}"?`);
    if (confirmacion) {
      item.estado = false;
      item.stock = 0;
      item.fechaEliminado = new Date().toISOString();
      this.editarAdicional(item);
    }
  }

  exportarLista() {
    const datosExportar = this.itemsFiltrados.map(item => ({
      Id: item.idAdicional,
      Nombre: item.nombre,
      Stock: item.stock,
      Precio: item.precio,
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosExportar);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Adicional');
    XLSX.writeFile(wb, 'Adicional.xlsx');
  }

  actualizarItems() {
    this.itemsFiltrados = [...this.items];
    this.filtro = '';
    this.paginaActual = 0;
    this.cargarAdicionales();
  }

  ordenarPorStock() {
    this.ordenStock = this.ordenStock === 'asc' ? 'desc' : 'asc';

    this.itemsFiltrados.sort((a, b) => {
      if (this.ordenStock === 'asc') {
        return a.stock - b.stock;
      } else {
        return b.stock - a.stock;
      }
    });

    this.paginaActual = 0;
  }
}