import { Component, OnInit, Renderer2, ElementRef, ViewChild, TemplateRef, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { UsuarioService } from 'src/app/modules/module-staff/services/usuario.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/auth/services/auth.service';
import { SpinnerServiceService } from '../../module-products/services/spinner-service.service';
import { ModalAsingarAreasComponent } from '../modal-asingar-areas/modal-asingar-areas.component';

interface Usuario {
  idUsuario: number;
  estado: boolean;
  nombre: string;
  apellido: string;
  codigo: string;
  password?: string; // Hacerlo opcional
  tipoDoc: string;
  documento: string;
  correo: string;
  telefono: string;
  fechaEliminado: string | null;
  fechaRegistro: string;
  idRol: number;
  rol: string;
  dia?: string;
  sueldo: number;
  idArea?: number;
  idDia?: number;
}

interface PropinasDTO {
  idPropina: number;
  idUsuario: number;
  montoPropina: number | string;
  fechaPropina: string | Date;
  usuario: string;
}

interface PropinasPorUsuario {
  IDUsuario: number;
  NombreUsuario: string;
  TotalPropinas: number;
}

interface HistorialSueldosDTO {
  idHistorial: number;
  idUsuario: number;
  usuario: string;
  sueldoBase: number;
  totalPropinas: number;
  bonos: number;
  descuentos: number;
  sueldoNeto: number;
  fechaCalculo: Date;
}

@Component({
  selector: 'app-pagina1',
  templateUrl: './pagina1.component.html',
  styleUrls: ['./pagina1.component.css']
})
export class Pagina1Component implements OnInit, AfterViewInit {
  // Propiedades para el formulario y la tabla
  user: any;
  hidePassword = true; // Para mostrar/ocultar contraseña en el modal de edición
  
  dias: any[] = [
    { id: 1, nombre: "Lunes" },
    { id: 2, nombre: "Martes" },
    { id: 3, nombre: "Miercoles" },
    { id: 4, nombre: "Jueves" },
    { id: 5, nombre: "Viernes" },
    { id: 6, nombre: "Sabado" },
    { id: 7, nombre: "Domingo" }
  ];

  personalForm: FormGroup;
  editarForm: FormGroup;
  propinaForm: FormGroup;
  roles: any[] = [];
  tiposDocumento = ['DNI', 'N° de pasaporte'];
  displayedColumns: string[] = [];
  dataSource: MatTableDataSource<Usuario>;
  dataSourcePropinas = new MatTableDataSource<any>([]);
  dataSourcePropinasPorUsuario = new MatTableDataSource<PropinasPorUsuario>([]);
  columnasPropinasPorUsuario: string[] = ['nombreUsuario', 'totalPropinas'];
  cargandoPropinasPorUsuario = false;
  usuariosInactivos: any[] = [];
  usuarios: Usuario[] = [];
  usuariosActivos: Usuario[] = [];
  usuarioDetalles: Usuario | null = null;
  areas: any[] = [];
  usuariosPorDia: { [key: string]: Usuario[] } = {};
  cargandoPropinas = false;
  totalPropinas = 0;
  meserosActivos: Usuario[] = [];
  propinaAEliminar: number | null = null;
  columnasPropinas: string[] = ['usuarioPropina', 'montoPropina', 'fechaPropina', 'accionesPropina'];
  dataSourceSueldos = new MatTableDataSource<HistorialSueldosDTO>([]);
  columnasSueldos: string[] = ['usuario', 'sueldoBase', 'totalPropinas', 'sueldoNeto'];
  cargandoSueldos = false;
  editarSueldoForm: FormGroup;
  sueldoSeleccionado: HistorialSueldosDTO | null = null;
  plantillaSueldos: HistorialSueldosDTO[] = [];
  mostrarPlantilla: boolean = true;
  
  // Referencias a los modales
  @ViewChild('confirmarEliminarTodasPropinasModal', { static: false }) confirmarEliminarTodasPropinasModal!: TemplateRef<any>;
  @ViewChild('editarModal', { static: false }) editarModal!: TemplateRef<any>;
  @ViewChild('modalContent', { static: false }) modalContent!: TemplateRef<any>;
  @ViewChild('detallesModal', { static: false }) detallesModal!: TemplateRef<any>;
  @ViewChild('recuperarModal', { static: false }) recuperarModal!: TemplateRef<any>;
  @ViewChild('propinasModal', { static: false }) propinasModal!: TemplateRef<any>;
  @ViewChild('agregarPropinaModal', { static: false }) agregarPropinaModal!: TemplateRef<any>;
  @ViewChild('confirmarEliminarPropinaModal', { static: false }) confirmarEliminarPropinaModal!: TemplateRef<any>;
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginatorPropinas!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sortPropinas!: MatSort;
  @ViewChild('editarSueldoModal', { static: false }) editarSueldoModal!: TemplateRef<any>;
  @ViewChild('sueldosModal', { static: false }) sueldosModal!: TemplateRef<any>;

  constructor(
    private renderer: Renderer2,
    private usuarioService: UsuarioService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private breakpointObserver: BreakpointObserver,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    public spinnerService: SpinnerServiceService 
  ) {
    // Inicialización de formularios y dataSource
    this.dataSource = new MatTableDataSource<Usuario>([]);
    this.dataSourcePropinas = new MatTableDataSource<any>([]);
    this.dataSourcePropinasPorUsuario = new MatTableDataSource<PropinasPorUsuario>([]);
    
    this.editarSueldoForm = this.fb.group({
      bono: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      descuento: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]]
    });

    this.personalForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      idRol: ['', Validators.required],
      tipoDoc: ['', Validators.required],
      documento: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      codigo: ['', Validators.required],
      password: ['', Validators.required],
      sueldo: ['', [Validators.required, Validators.min(0)]],
    });

    this.editarForm = this.fb.group({
      idUsuario: [''],
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      idRol: ['', Validators.required],
      tipoDoc: ['', Validators.required],
      documento: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      codigo: ['', Validators.required],
      password: [''], // Sin validadores para permitir vacío
      sueldo: ['', [Validators.required, Validators.min(0)]],
    });

    this.propinaForm = this.fb.group({
      IDUsuario: ['', Validators.required],
      MontoPropina: ['', [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.obtenerAreas();
    this.editarForm.get('codigo')?.disable();

    // Detectar cambios en el tamaño de la pantalla
    this.breakpointObserver.observe([Breakpoints.Handset]).subscribe((result) => {
      if (result.matches) {
        this.displayedColumns = ['idUsuario', 'nombre', 'apellido', 'acciones'];
      } else {
        this.displayedColumns = [
          'idUsuario',
          'nombre',
          'apellido',
          'rol',
          'sueldo', 
          'tipoDoc',
          'documento',
          'correo',
          'telefono',
          'fechaRegistro',
          'acciones',
        ];
      }
    });

    // Obtener roles y usuarios activos
    this.usuarioService.getRoles().subscribe(
      (roles: any) => {
        this.roles = roles;
      },
      (error: any) => {
        console.error('Error al obtener los roles:', error);
      }
    );

    this.usuarioService.getUsuariosActivos().subscribe(
      (resp) => {
        this.usuarios = resp;
        this.dataSource.data = this.usuarios;
        this.usuariosActivos = [...this.usuarios];
        this.meserosActivos = this.usuariosActivos.filter(usuario => usuario.rol === 'Mesero');
        this.cargarSueldos();
        this.cargarPlantillaSueldos();
      },
      (error) => {
        console.error('Error al obtener los usuarios:', error);
      }
    );
    
    //autogenerar el codigo
    this.personalForm.get('codigo')?.disable();
    this.personalForm.valueChanges.subscribe(() => {
      this.generarCodigo();
    });
  }

  generarCodigo(): void {
    const nombre = this.personalForm.get('nombre')?.value || '';
    const idRol = this.personalForm.get('idRol')?.value;
    const documento = this.personalForm.get('documento')?.value || '';
  
    const rol = this.roles.find(r => r.idRol === idRol)?.nombre || '';
  
    if (nombre && rol && documento.length >= 3) {
      const codigoGenerado =
        nombre.charAt(0).toUpperCase() +
        rol.substring(0, 2).toUpperCase() +
        documento.slice(-3);
      
      this.personalForm.get('codigo')?.setValue(codigoGenerado, { emitEvent: false });
    } else {
      this.personalForm.get('codigo')?.setValue('', { emitEvent: false });
    }
  }

  ngAfterViewInit(): void {
    this.dataSourcePropinas.paginator = this.paginatorPropinas;
    this.dataSourcePropinas.sort = this.sortPropinas;
    
    // Configurar el filtro para propinas por usuario
    this.dataSourcePropinasPorUsuario.filterPredicate = (data: PropinasPorUsuario, filter: string) => {
      return data.NombreUsuario.toLowerCase().includes(filter);
    };
  }

  // Métodos para gestión de sueldos e historial
  abrirModalSueldos(): void {
    this.cargarPlantillaSueldos();
    this.cargarSueldos();
    this.dialog.open(this.sueldosModal, {
      width: '90%',
      maxWidth: '1200px',
      height: '80%'
    });
  }

  generarSueldosHoy(): void {
    const confirmar = confirm('¿Está seguro que desea generar los sueldos del día?');
    if (confirmar) {
      this.usuarioService.generarSueldosHoy().subscribe({
        next: (resultados: any) => {
          this.snackBar.open('Sueldos generados correctamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.cargarSueldos();
          this.cargarPlantillaSueldos();
        },
        error: (error) => {
          console.error('Error al generar sueldos:', error);
          this.snackBar.open('Error al generar sueldos', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  aplicarFiltroSueldos(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceSueldos.filter = filterValue.trim().toLowerCase();
  }

  abrirModalEdicionSueldo(sueldo: HistorialSueldosDTO): void {
    this.sueldoSeleccionado = {...sueldo};
    
    this.editarSueldoForm.patchValue({
      bono: sueldo.bonos || 0,
      descuento: sueldo.descuentos || 0
    });
    
    const dialogRef = this.dialog.open(this.editarSueldoModal, {
      width: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.guardarCambiosSueldo();
      }
    });
  }

  cargarPlantillaSueldos(): void {
    const usuariosSinHistorial = this.usuariosActivos.filter(usuario => {
      return !this.dataSourceSueldos.data.some(s => s.idUsuario === usuario.idUsuario);
    });

    this.plantillaSueldos = usuariosSinHistorial.map(usuario => {
      const totalPropinas = this.dataSourcePropinasPorUsuario.data
        .find(p => p.IDUsuario === usuario.idUsuario)?.TotalPropinas || 0;
      
      return {
        idHistorial: 0,
        idUsuario: usuario.idUsuario,
        usuario: `${usuario.nombre} ${usuario.apellido}`,
        sueldoBase: usuario.sueldo || 0,
        totalPropinas: totalPropinas,
        bonos: 0,
        descuentos: 0,
        sueldoNeto: usuario.sueldo + totalPropinas,
        fechaCalculo: new Date()
      };
    });
  }

  cargarSueldos(): void {
    this.cargandoSueldos = true;
    
    this.usuarioService.getAllHistorialSueldos().subscribe({
      next: (sueldos: any[]) => {
        this.dataSourceSueldos.data = sueldos
          .filter(s => s.idHistorial > 0 && this.usuariosActivos.some(u => u.idUsuario === s.idUsuario))
          .map(s => {
            const usuario = this.usuariosActivos.find(u => u.idUsuario === s.idUsuario);
            return {
              idHistorial: s.idHistorial,
              idUsuario: s.idUsuario,
              usuario: usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Usuario no encontrado',
              sueldoBase: s.sueldoBase || 0,
              totalPropinas: s.totalPropinas || 0,
              bonos: s.bonos || 0,
              descuentos: s.descuentos || 0,
              sueldoNeto: s.sueldoNeto || 0,
              fechaCalculo: s.fechaCalculo ? new Date(s.fechaCalculo) : new Date()
            };
          });
        
        this.cargarPlantillaSueldos();
        this.cargandoSueldos = false;
      },
      error: (error) => {
        console.error('Error al cargar sueldos:', error);
        this.cargandoSueldos = false;
      }
    });
  }

  async guardarCambiosSueldo(): Promise<void> {
    if (!this.editarSueldoForm.valid || !this.sueldoSeleccionado) {
      this.snackBar.open('Formulario inválido o sueldo no seleccionado', 'Cerrar', { 
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const formValues = this.editarSueldoForm.value;
    const sueldoNeto = this.calcularSueldoNeto();
    
    const nuevoRegistro = {
      idUsuario: this.sueldoSeleccionado.idUsuario,
      sueldoBase: this.sueldoSeleccionado.sueldoBase,
      totalPropinas: this.sueldoSeleccionado.totalPropinas,
      bonos: Number(formValues.bono) || 0,
      descuentos: Number(formValues.descuento) || 0,
      sueldoNeto: sueldoNeto,
      fechaCalculo: new Date().toISOString()
    };

    try {
      const response = await this.usuarioService.createHistorialSueldo(nuevoRegistro).toPromise();
      
      if (response) {
        this.snackBar.open('Registro de sueldo guardado en el historial', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });

        this.cargarSueldos();
        this.dialog.closeAll();
      }
    } catch (error) {
      console.error('Error al guardar el sueldo:', error);
      this.snackBar.open('Error al guardar el sueldo', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  calcularSueldoNeto(): number {
    if (!this.sueldoSeleccionado) return 0;
    
    const bono = this.editarSueldoForm.get('bono')?.value || 0;
    const descuento = this.editarSueldoForm.get('descuento')?.value || 0;
    
    return this.sueldoSeleccionado.sueldoBase + 
           this.sueldoSeleccionado.totalPropinas + 
           Number(bono) - 
           Number(descuento);
  }

  // Métodos para gestión de usuarios
  openModal(): void {
    this.dialog.open(this.modalContent, {
      width: '600px',
    });
  }

  openRecuperarModal(): void {
    this.usuarioService.getUsuariosInactivos().subscribe(
      (resp: any) => {
        this.usuariosInactivos = resp;
        this.dialog.open(this.recuperarModal, {
          width: '800px',
        });
      },
      (error) => {
        console.error('Error al obtener usuarios inactivos:', error);
      }
    );
  }

  abrirModalEditar(usuario: Usuario): void {
    // No limpiar la contraseña, poner vacío para indicar que no se cambiará
    this.editarForm.patchValue({
      ...usuario,
      password: '' // Dejar vacío para indicar que no se cambiará
    });
    this.dialog.open(this.editarModal, {
      width: '600px',
    });
  }

  onSubmit(): void {
    if (this.personalForm.valid) {
      const usuarioData = this.personalForm.getRawValue();
      
      const rolValido = this.roles.find((r) => r.idRol === usuarioData.idRol);
      if (!rolValido) {
        console.error('Rol no válido seleccionado:', usuarioData.idRol);
        alert('El Rol seleccionado no es válido.');
        return;
      }

      const nuevoUsuario: Usuario = {
        idUsuario: 0,
        estado: true,
        nombre: usuarioData.nombre,
        apellido: usuarioData.apellido,
        codigo: usuarioData.codigo,
        password: usuarioData.password,
        tipoDoc: usuarioData.tipoDoc,
        documento: usuarioData.documento,
        correo: usuarioData.correo,
        telefono: usuarioData.telefono,
        fechaEliminado: null,
        fechaRegistro: new Date().toISOString(),
        idRol: usuarioData.idRol,
        rol: rolValido.nombre,
        sueldo: Number(usuarioData.sueldo) || 0,
      };

      this.usuarioService.saveUsuario(nuevoUsuario).subscribe(
        (response) => {
          window.location.reload();
        },
        (error) => {
          console.error('Error al guardar el usuario:', error);
          console.error('Detalles del error:', error.error);
          alert('Error al guardar el usuario. Verifica los datos e intenta nuevamente.');
        }
      );
    } else {
      console.error('Formulario inválido. Errores:', this.personalForm.errors);
      Object.keys(this.personalForm.controls).forEach(key => {
        const controlErrors = this.personalForm.get(key)?.errors;
        if (controlErrors != null) {
          console.error('Campo', key, 'tiene errores:', controlErrors);
        }
      });
    }
  }

  guardarCambios(): void {
    if (this.editarForm.valid) {
      const formValues = this.editarForm.getRawValue();
      const rolValido = this.roles.find((r) => r.idRol === formValues.idRol);
      
      if (!rolValido) {
        alert('El Rol seleccionado no es válido.');
        return;
      }

      // Crear objeto base (sin password)
      const usuarioActualizado: any = {
        idUsuario: formValues.idUsuario,
        estado: true,
        nombre: formValues.nombre,
        apellido: formValues.apellido,
        codigo: formValues.codigo,
        tipoDoc: formValues.tipoDoc,
        documento: formValues.documento,
        correo: formValues.correo,
        telefono: formValues.telefono,
        fechaEliminado: null,
        fechaRegistro: new Date().toISOString(),
        idRol: formValues.idRol,
        rol: rolValido.nombre,
        sueldo: Number(formValues.sueldo) || 0,
      };

      // Solo agregar password si se proporcionó una nueva
      if (formValues.password && formValues.password.trim() !== '') {
        usuarioActualizado.password = formValues.password;
      }

      this.usuarioService.updateUsuario(usuarioActualizado).subscribe(
        (response) => {
          // Actualizar el usuario en la tabla local
          const index = this.dataSource.data.findIndex((u) => u.idUsuario === formValues.idUsuario);
          if (index !== -1) {
            // Crear una copia actualizada del usuario
            const usuarioActualizadoCompleto: Usuario = {
              ...this.dataSource.data[index],
              nombre: formValues.nombre,
              apellido: formValues.apellido,
              idRol: formValues.idRol,
              rol: rolValido.nombre,
              tipoDoc: formValues.tipoDoc,
              documento: formValues.documento,
              correo: formValues.correo,
              telefono: formValues.telefono,
              sueldo: Number(formValues.sueldo) || 0,
            };
            this.dataSource.data[index] = usuarioActualizadoCompleto;
            this.dataSource.data = [...this.dataSource.data];
            
            // Actualizar también en usuariosActivos
            const activosIndex = this.usuariosActivos.findIndex(u => u.idUsuario === formValues.idUsuario);
            if (activosIndex !== -1) {
              this.usuariosActivos[activosIndex] = usuarioActualizadoCompleto;
            }
          }
          
          this.snackBar.open('Usuario actualizado correctamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.dialog.closeAll();
        },
        (error) => {
          console.error('Error completo:', error);
          const detalle = error.error?.toString() || '';
          
          if (detalle.includes("Violation of UNIQUE KEY")) {
            this.snackBar.open('Ya existe un usuario con ese DNI u otro dato único.', 'Cerrar', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          } else {
            this.snackBar.open('Error al actualizar el usuario. Intenta nuevamente.', 'Cerrar', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        }
      );
    }
  }

  // Métodos para gestión de propinas
  abrirModalPropinas(): void {
    this.cargarPropinas();
    this.dialog.open(this.propinasModal, {
      width: '90%',
      maxWidth: '1000px',
      height: '90%',
      autoFocus: true,
      restoreFocus: true
    });
  }

  abrirModalAgregarPropina(): void {
    this.meserosActivos = this.usuariosActivos.filter(usuario => usuario.idRol === 3);
    this.propinaForm.reset();
    this.dialog.open(this.agregarPropinaModal, {
      width: '500px'
    });
  }

  cargarPropinas(): void {
    this.cargandoPropinas = true;
    this.cargandoPropinasPorUsuario = true;
    
    this.usuarioService.getAllPropinas().subscribe({
      next: (propinas: any[]) => {
        
        if (!propinas || propinas.length === 0) {
          console.warn('No se recibieron datos de propinas');
          this.dataSourcePropinas.data = [];
          this.dataSourcePropinasPorUsuario.data = [];
          return;
        }
  
        const propinasProcesadas = propinas.map((p: any) => ({
          IDPropina: p.idPropina,
          IDUsuario: p.idUsuario,
          MontoPropina: Number(p.montoPropina) || 0,
          FechaPropina: p.fechaPropina ? new Date(p.fechaPropina) : new Date(),
          Usuario: p.usuario
        }));
  
        this.dataSourcePropinas.data = propinasProcesadas;
        
        const propinasPorUsuario = propinas.reduce((acc: PropinasPorUsuario[], propina: any) => {
          const usuarioExistente = acc.find((u: PropinasPorUsuario) => u.IDUsuario === propina.idUsuario);
          const monto = Number(propina.montoPropina) || 0;
          
          if (usuarioExistente) {
            usuarioExistente.TotalPropinas += monto;
          } else {
            acc.push({
              IDUsuario: propina.idUsuario,
              NombreUsuario: propina.usuario || `Usuario ${propina.idUsuario}`,
              TotalPropinas: monto
            });
          }
          return acc;
        }, [] as PropinasPorUsuario[]);
  
        this.dataSourcePropinasPorUsuario.data = propinasPorUsuario.sort((a: PropinasPorUsuario, b: PropinasPorUsuario) => 
          b.TotalPropinas - a.TotalPropinas
        );
        
        setTimeout(() => {
          if (this.paginatorPropinas) {
            this.dataSourcePropinas.paginator = this.paginatorPropinas;
          }
          if (this.sortPropinas) {
            this.dataSourcePropinas.sort = this.sortPropinas;
          }
        });
        
        this.calcularTotalPropinas();
        this.cargarPlantillaSueldos();
      },
      error: (err) => {
        console.error('Error al cargar propinas:', err);
        this.cargandoPropinas = false;
        this.cargandoPropinasPorUsuario = false;
      },
      complete: () => {
        this.cargandoPropinas = false;
        this.cargandoPropinasPorUsuario = false;
      }
    });
  }

  calcularTotalPropinas(): void {
    if (!this.dataSourcePropinas.data || this.dataSourcePropinas.data.length === 0) {
      this.totalPropinas = 0;
      return;
    }

    this.totalPropinas = this.dataSourcePropinas.data.reduce(
      (sum, propina) => sum + (Number(propina.MontoPropina) || 0), 
      0
    );
  }

  guardarPropina(): void {
    if (this.propinaForm.valid) {
      const formValue = this.propinaForm.value;
      
      const nuevaPropina = {
        idPropina: 0,
        idUsuario: Number(formValue.IDUsuario),
        montoPropina: Number(formValue.MontoPropina),
        fechaPropina: new Date(),
        usuario: ''
      };

      this.usuarioService.createPropina(nuevaPropina).subscribe({
        next: () => {
          this.dialog.closeAll();
          this.cargarPropinas();
          this.snackBar.open('Propina guardada correctamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (err) => {
          console.error('Error al guardar propina', err);
          this.snackBar.open('Error al guardar la propina', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  eliminarPropina(id: number): void {
    this.propinaAEliminar = id;
    
    if (!this.confirmarEliminarPropinaModal) {
      console.error('El modal de confirmación no está disponible');
      return;
    }
  
    const dialogRef = this.dialog.open(this.confirmarEliminarPropinaModal, {
      width: '400px'
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        this.propinaAEliminar = null;
      }
    });
  }

  confirmarEliminacionPropina(): void {
    if (this.propinaAEliminar === null || this.propinaAEliminar === undefined) {
      console.error('No hay propina seleccionada para eliminar');
      return;
    }
  
    this.usuarioService.deletePropina(this.propinaAEliminar).subscribe({
      next: () => {
        this.cargarPropinas();
        this.propinaAEliminar = null;
        this.dialog.closeAll();
        this.snackBar.open('Propina eliminada correctamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (err) => {
        console.error('Error al eliminar propina', err);
        this.snackBar.open('Error al eliminar la propina', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.propinaAEliminar = null;
      }
    });
  }

  aplicarFiltroPropinasPorUsuario(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourcePropinasPorUsuario.filter = filterValue.trim().toLowerCase();
  }

  // Métodos auxiliares
  formatFecha(fecha: Date | string): string {
    if (!fecha) return '';
    
    const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
    
    if (isNaN(date.getTime())) return '';

    const dia = date.getDate().toString().padStart(2, '0');
    const mes = (date.getMonth() + 1).toString().padStart(2, '0');
    const año = date.getFullYear();
    
    return `${dia}/${mes}/${año}`;
  }

  obtenerIcono(nombreArea: string): string {
    switch (nombreArea.toLowerCase()) {
      case 'casa': return 'home';
      case 'loza': return 'restaurant';
      case 'terraza': return 'deck';
      case 'parrilla': return 'whatshot';
      case 'broaster': return 'fastfood';
      case 'papas': return 'fastfood';
      case 'hamburguesas': return 'fastfood';
      case 'jugos': return 'emoji_food_beverage';
      case 'lavado': return 'cleaning_services';
      default: return 'help';
    }
  }

  recuperarUsuario(usuario: any): void {
    const confirmar = window.confirm('¿Estás seguro de que deseas recuperar este usuario?');
    if (confirmar) {
      this.usuarioService.recuperarUsuario(usuario.idUsuario).subscribe(
        (response: any) => {
          this.snackBar.open('Usuario recuperado correctamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        },
        (error) => {
          console.error('Error al recuperar el usuario:', error);
          this.snackBar.open('Error al recuperar el usuario', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      );
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  eliminarUsuario(usuario: Usuario): void {
    const confirmar = window.confirm('¿Estás seguro de que deseas eliminar este registro?');
    if (confirmar) {
      this.usuarioService.deleteUsuario(usuario.idUsuario).subscribe(
        (response) => {
          this.snackBar.open('Usuario eliminado correctamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        },
        (error) => {
          console.error('Error al eliminar el usuario:', error);
          this.snackBar.open('Error al eliminar el usuario', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      );
    }
  }

  obtenerAreas(): void {
    this.usuarioService.getAreas().subscribe(
      (data) => {
        this.areas = data;
      },
      (error) => {
        console.error('Error al obtener las áreas:', error);
      }
    );
  }

  verDetalles(usuario: Usuario): void {
    this.usuarioDetalles = usuario;
    this.dialog.open(this.detallesModal, {
      width: '500px',
    });
  }

  obtenerUsuariosDelDia(dia: string): any[] {
    return this.usuarios.filter(usuario => usuario.dia === dia);
  }

  tieneUsuariosDia(dia: string): boolean {
    return this.usuarios.some(usuario => usuario.dia === dia);
  }

  onAreaClick(area: any): void {
   
  }

  abrirModal(idUsuario: number) {
    this.dialog.open(ModalAsingarAreasComponent, {
      width: '600px',
      data: { idUsuario }
    });
  }

  eliminarTodasPropinas(): void {
    if (this.dataSourcePropinas.data.length === 0) {
      this.snackBar.open('No hay propinas para eliminar', 'Cerrar', {
        duration: 3000,
        panelClass: ['info-snackbar']
      });
      return;
    }

    this.dialog.open(this.confirmarEliminarTodasPropinasModal, {
      width: '500px'
    });
  }

  confirmarEliminacionTodasPropinas(): void {
    this.usuarioService.deleteAllPropinas().subscribe({
      next: () => {
        this.snackBar.open('Todas las propinas han sido eliminadas correctamente', 'Cerrar', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
        
        this.cargarPropinas();
        this.cargarPlantillaSueldos();
        
        this.dialog.closeAll();
      },
      error: (err) => {
        console.error('Error al eliminar todas las propinas:', err);
        this.snackBar.open('Error al eliminar todas las propinas', 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}