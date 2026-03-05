import { Component, OnInit, Renderer2, ElementRef, ViewChild, TemplateRef, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CustomerServiceService } from '../services/customer-service.service';
import { SpinnerServiceService } from '../../module-products/services/spinner-service.service';


interface Cliente {
  idCliente: number;
  estado: boolean;
  nombre: string;
  apellido: string;
  password: string;
  tipoDoc: string;
  documento: string;
  correo: string;
  telefono: string;
  fechaEliminado: string | null;
  fechaNacimiento: string | null;
  fechaRegistro: string;
  direccion: string; // Agrega este campo
}

@Component({
  selector: 'app-pagina2',
  templateUrl: './pagina2.component.html',
  styleUrls: ['./pagina2.component.css']
})
export class Pagina2Component implements OnInit, AfterViewInit {
  clienteForm: FormGroup;
  editarForm: FormGroup;
  tiposDocumento = ['DNI', 'N° de pasaporte','RUC'];
  displayedColumns: string[] = [];
  dataSource: MatTableDataSource<Cliente>;
  clientesInactivos: any[] = [];
  clientes: Cliente[] = [];
  clienteDetalles: Cliente | null = null;

  @ViewChild('editarModal') editarModal!: TemplateRef<any>;
  @ViewChild('modalContent') modalContent!: TemplateRef<any>;
  @ViewChild('detallesModal') detallesModal!: TemplateRef<any>;
  @ViewChild('recuperarModal') recuperarModal!: TemplateRef<any>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private renderer: Renderer2,
    private CustomerServiceService: CustomerServiceService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private breakpointObserver: BreakpointObserver,
    public spinnerService: SpinnerServiceService 

  ) {
    this.dataSource = new MatTableDataSource<Cliente>([]);
    this.clienteForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      tipoDoc: ['', Validators.required],
      documento: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      password: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      direccion: ['', Validators.required], // Agrega este campo
    });
    

    this.editarForm = this.fb.group({
      idCliente: [''],
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      tipoDoc: ['', Validators.required],
      documento: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      password: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      direccion: ['', Validators.required], // Agrega este campo
    });

    this.breakpointObserver.observe([Breakpoints.Handset]).subscribe((result) => {
      if (result.matches) {
        this.displayedColumns = ['idCliente', 'nombre', 'apellido', 'acciones'];
      } else {
        this.displayedColumns = [
          'idCliente',
          'nombre',
          'apellido',
          'tipoDoc',
          'documento',
          'correo',
          'telefono',
          'fechaNacimiento',
          'fechaRegistro',
          'direccion',
          'acciones',
        ];
      }
    });

    this.loadClientesActivos();
  }

  ngOnInit(): void {
    // Lógica de inicialización aquí
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadClientesActivos(): void {
    this.CustomerServiceService.getClientesActivos().subscribe(
      (resp) => {
        this.clientes = resp;
        this.dataSource.data = this.clientes;
      },
      (error) => {
        console.error('Error al obtener los clientes:', error);
        alert('Error al cargar los clientes. Verifica la conexión con el servidor.');
      }
    );
  }

  openModal(): void {
    this.dialog.open(this.modalContent, {
      width: '600px',
    });
  }
  
  openRecuperarModal(): void {
    this.CustomerServiceService.getClientesInactivos().subscribe(
      (resp: any) => {
        this.clientesInactivos = resp;
        this.dialog.open(this.recuperarModal, {
          width: '800px',
        });
      },
      (error) => {
        console.error('Error al obtener clientes inactivos:', error);
      }
    );
  }

  abrirModalEditar(cliente: Cliente): void {
    this.editarForm.patchValue(cliente);
    this.dialog.open(this.editarModal, {
      width: '600px',
    });
  }

  guardarClientes(): void {
    if (this.editarForm.valid) {
      const clienteEditado = this.editarForm.value;
  
      const fechaNacimientoFormateada = new Date(clienteEditado.fechaNacimiento).toISOString();
  
      const clienteActualizado: Cliente = {
        idCliente: clienteEditado.idCliente,
        estado: true,
        nombre: clienteEditado.nombre,
        apellido: clienteEditado.apellido,
        password: clienteEditado.password,
        tipoDoc: clienteEditado.tipoDoc,
        documento: clienteEditado.documento,
        correo: clienteEditado.correo,
        telefono: clienteEditado.telefono,
        fechaEliminado: null,
        fechaRegistro: new Date().toISOString(),
        fechaNacimiento: fechaNacimientoFormateada,
        direccion: clienteEditado.direccion, // Incluye este campo
      };
  
  
      this.CustomerServiceService.updateCliente(clienteActualizado).subscribe(
        (response) => {
          const index = this.dataSource.data.findIndex((u) => u.idCliente === clienteEditado.idCliente);
          if (index !== -1) {
            this.dataSource.data[index] = clienteActualizado;
            this.dataSource.data = [...this.dataSource.data];
          }
          this.dialog.closeAll();
        },
        (error) => {
          console.error('Error completo:', error);

          // Intenta ver si el mensaje contiene "Violation of UNIQUE KEY"
          const detalle = error.error?.toString() || '';
          
          if (detalle.includes("Violation of UNIQUE KEY")) {
            alert("Ya existe un cliente con ese DNI u otro dato único.");
          } else {
            alert("Error al actualizar el cliente. Intenta nuevamente.");
          }
        }
      );
    }
  }

  onSubmit(): void {
    if (this.clienteForm.valid) {
      const clienteData = this.clienteForm.value;
  
      const nuevoCliente: Cliente = {
        idCliente: 0,
        estado: true,
        nombre: clienteData.nombre,
        apellido: clienteData.apellido,
        password: clienteData.password,
        tipoDoc: clienteData.tipoDoc,
        documento: clienteData.documento,
        correo: clienteData.correo,
        telefono: clienteData.telefono,
        fechaEliminado: null,
        fechaRegistro: new Date().toISOString(),
        fechaNacimiento: clienteData.fechaNacimiento,
        direccion: clienteData.direccion // Asegúrate de incluir este campo
      };
  
      this.CustomerServiceService.saveCliente(nuevoCliente).subscribe(
        (response) => {
          this.loadClientesActivos(); // Recargar los clientes activos
        },
        (error) => {
          console.error('Error completo:', error);

          // Intenta ver si el mensaje contiene "Violation of UNIQUE KEY"
          const detalle = error.error?.toString() || '';
          
          if (detalle.includes("Violation of UNIQUE KEY")) {
            alert("Ya existe un cliente con ese DNI u otro dato único.");
          } else {
            alert("Error al actualizar el cliente. Intenta nuevamente.");
          }
        }
      );
    }
  }

  recuperarCliente(cliente: any): void {
    const confirmar = window.confirm('¿Estás seguro de que deseas recuperar este cliente?');
    if (confirmar) {
      this.CustomerServiceService.recuperarCliente(cliente.idCliente).subscribe(
        (response: any) => {
          this.loadClientesActivos(); // Recargar los clientes activos
        },
        (error) => {
          console.error('Error al recuperar el cliente:', error);
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

  eliminarCliente(cliente: Cliente): void {
    const confirmar = window.confirm('¿Estás seguro de que deseas eliminar este registro?');
    if (confirmar) {
      this.CustomerServiceService.deleteCliente(cliente.idCliente).subscribe(
        (response) => {
          this.loadClientesActivos(); // Recargar los clientes activos
        },
        (error) => {
          console.error('Error al eliminar el cliente:', error);
        }
      );
    }
  }

  verDetalles(cliente: Cliente): void {
    this.clienteDetalles = cliente;
    this.dialog.open(this.detallesModal, {
      width: '500px',
    });
  }
}