import { Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { AreaService } from '../../services/areas.service';
import { AuthService } from 'src/app/auth/services/auth.service';
import { MesaService } from '../../services/mesa.service';
import { Area, DividirMesasDTO, Mesa, UnirMesasDTO } from '../../interface/Items';
import { delay, Subject, takeUntil } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { PlatosServiceService } from 'src/app/modules/module-products/services/platos-service.service';
import { CajaService } from 'src/app/modules/module-sales/services/caja-service.service';

@Component({
  selector: 'app-mismesas',
  templateUrl: './mismesas.component.html',
  styleUrls: ['./mismesas.component.css']
})
export class MismesasComponent {
  private destroy$ = new Subject<void>();
  idUser: number | null = 0
  areas: Area[] = [];
  mesasFiltradas: Mesa[] = [];
  isLoadingAreas: boolean = true
  isLoadingMesas: boolean = true
  busqueda: string = '';
  selectedAreaIndex: number = 0;
  mesaSeleccionada: any = null;
  pageNumber: number = 0;
  pageSize: number = 10;
  totalCount: number = 0;
  public cajaAbierta: boolean = false;
  isLoadingCaja: boolean = true;
  isUnionMode: boolean = false;
  selectedMesaMadre: Mesa | null = null;
  selectedMesasHijas: number[] = [];

  constructor(private areaService: AreaService, private authService: AuthService, private mesaService: MesaService, private router: Router,private route: ActivatedRoute,
    private snackBar: MatSnackBar, private platosService: PlatosServiceService, private ventasService: CajaService,

  ) {
    this.idUser = this.authService.getUserId();
  }

  ngOnInit(): void {
    this.cargarMisAreas(this.idUser);
    this.esCajaAbierta()

  }
  esCajaAbierta() {
    this.isLoadingCaja = true; // Iniciamos carga
    this.ventasService.getCajaAbierta()
    .subscribe({
      next: (caja) => {
        this.cajaAbierta = caja !== null;
        this.isLoadingCaja = false; // Ya sabemos la verdad
      },
      error: () => {
        this.isLoadingCaja = false;
      }
    });
  }

  unirMesas() {
    if (!this.isUnionMode) {
      this.isUnionMode = true;
      this.snackBar.open('Modo Unión: Selecciona la mesa principal (Madre)', 'OK', { duration: 4000 });
    } else {
      this.cancelarUnion();
    }
  }

  cancelarUnion() {
    this.isUnionMode = false;
    this.selectedMesaMadre = null;
    this.selectedMesasHijas = [];
  }

  seleccionarMesa(mesa: Mesa) {
    if (this.isUnionMode) {
      this.gestionarSeleccionUnion(mesa);
      return;
    }

    const puedeAbrir = mesa.habilitado === true || (mesa.habilitado === false && mesa.esDelUsuario === true);

    if (!puedeAbrir) {
      this.snackBar.open('Esta mesa está ocupada por otro usuario', 'Entendido', { duration: 3000 });
      return;
    }

    this.mesaSeleccionada = mesa;
    this.router.navigate(['../carta', mesa.idMesa], { 
      relativeTo: this.route,
      state: { nombreMesa: mesa.nombre } // <--- Nombre de la DB
    })
  }



  gestionarSeleccionUnion(mesa: Mesa) {
    if (!this.selectedMesaMadre) {
      if (!mesa.habilitado && !mesa.esDelUsuario) {
        this.snackBar.open('No puedes iniciar una unión con una mesa de otro mozo', 'Error');
        return;
      }
      this.selectedMesaMadre = mesa;
      this.snackBar.open(`Mesa ${mesa.nombre} seleccionada como Principal. Ahora elige las mesas a unir.`, 'OK');
      return;
    }

    if (mesa.idMesa === this.selectedMesaMadre.idMesa) {
      this.selectedMesaMadre = null; 
      this.selectedMesasHijas = [];
      return;
    }

    const index = this.selectedMesasHijas.indexOf(mesa.idMesa);
    if (index === -1) {
      if (!mesa.habilitado) {
        this.snackBar.open('Solo puedes unir mesas que estén habilitadas', 'Aviso');
        return;
      }
      this.selectedMesasHijas.push(mesa.idMesa);
    } else {
      this.selectedMesasHijas.splice(index, 1);
    }
  }

  confirmarUnion() {
    if (!this.selectedMesaMadre || this.selectedMesasHijas.length === 0) return;

    const dto: UnirMesasDTO = {
      idMesaPrincipal: this.selectedMesaMadre.idMesa,
      idsMesasAUnir: this.selectedMesasHijas
    };

    this.mesaService.unirMesas(dto).subscribe({
      next: (res) => {
        if (res.success) {
          this.snackBar.open('Unión realizada con éxito', 'Genial');
          this.cancelarUnion();
          this.cargarMesas(this.busqueda, this.getNombreAreaActual());
        }
      },
      error: (err) => this.snackBar.open(err.error.message, 'Error')
    });
  }

  separarMesa(mesa: Mesa, event: Event) {

    
    event.stopPropagation();
    const dto: DividirMesasDTO = { idMesaPrincipal: mesa.idMesa };

    this.mesaService.dividirMesas(dto).subscribe({
      next: (res) => {
        if (res.success) {
          this.snackBar.open('Mesas separadas correctamente', 'OK');
          this.cargarMesas(this.busqueda, this.getNombreAreaActual());
        }
      }
    });
  }



  

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete(); // Cancela todos los observables
  }

  cargarMesas(pSearch: string = '', area: string = '') {
    this.isLoadingMesas = true
    this.mesaService.getMesasPorArea(this.pageNumber, this.pageSize, pSearch, area).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.mesasFiltradas = response.data; // directamente para mostrar
          this.totalCount = response.totalCount;
          this.isLoadingMesas = false


        },
        error: (err) => {
          console.error('Error al cargar mesas', err);
        }
      });
  }


  cargarMisAreas(idUsuario: number | null) {
    this.isLoadingAreas = true
    this.areaService.getMisAreas(idUsuario).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (areas) => {
          this.areas = areas;
          this.isLoadingAreas = false;

          if (this.areas.length > 1) {
            this.selectedAreaIndex = 0;
            this.cargarMesas('', '');
          } else if (this.areas.length === 1) {
            this.selectedAreaIndex = 0;
            this.cargarMesas('', this.areas[0].nombre);
          }
        },
        error: (err) => {
          console.error('Error al obtener áreas', err);
        }
      });
  }

  seleccionarArea(index: number) {
    this.selectedAreaIndex = index;
    this.pageNumber = 1;
    let nombreAreaFiltro = '';

    // Si hay más de una área, el índice 0 es "TODOS"
    if (this.areas.length > 1) {
      if (index === 0) {
        nombreAreaFiltro = ''; // Cargar todas
      } else {

        nombreAreaFiltro = this.areas[index - 1]?.nombre;
      }
    } else {

      nombreAreaFiltro = this.areas[index]?.nombre;
    }

    this.cargarMesas(this.busqueda, nombreAreaFiltro);

  }

  private getNombreAreaActual(): string {
    if (this.areas.length > 1) {
      return this.selectedAreaIndex === 0 ? '' : this.areas[this.selectedAreaIndex - 1]?.nombre;
    }
    return this.areas[this.selectedAreaIndex]?.nombre || '';
  }

  onBusquedaChange() {
    this.pageNumber = 1;
    this.cargarMesas(this.busqueda, this.getNombreAreaActual());
  }

  onPageChange(event: PageEvent) {
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.cargarMesas(this.busqueda, this.getNombreAreaActual());
  }


 




}
