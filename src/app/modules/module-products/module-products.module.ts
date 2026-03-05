
import { HttpClientModule } from '@angular/common/http';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // Para formularios

import { ModuleProductsRoutingModule } from './module-products-routing.module';
import { PlatosComponent } from './platos/platos.component';
import { NgChartsModule } from 'ng2-charts';
// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table'; // Para la tabla
import { MatIconModule } from '@angular/material/icon'; // Para los iconos
import { MatPaginatorModule } from '@angular/material/paginator'; // Para el paginador
import { MatFormFieldModule } from '@angular/material/form-field'; // Para los campos de formulario
import { MatInputModule } from '@angular/material/input'; // Para los inputs
import { MatSelectModule } from '@angular/material/select'; // Para los selects
import { MatOptionModule } from '@angular/material/core'; // Para las opciones de los selects
import { MatMenuModule } from '@angular/material/menu'; // Para menús
import { MatDialogModule } from '@angular/material/dialog'; // Para modales
import { MatSnackBarModule } from '@angular/material/snack-bar'; // Para notificaciones
import { MatTooltipModule } from '@angular/material/tooltip'; // Para tooltips
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Para spinners
import { MatSortModule } from '@angular/material/sort'; // Para ordenar tablas
import { MatCheckboxModule } from '@angular/material/checkbox'; // Para checkboxes
import { MatDatepickerModule } from '@angular/material/datepicker'; // Para selectores de fecha
import { MatNativeDateModule } from '@angular/material/core'; // Para soporte de fecha nativa
import { MatToolbarModule } from '@angular/material/toolbar'; // Para la barra de herramientas
import { MatSidenavModule } from '@angular/material/sidenav'; // Para el menú lateral
import { MatListModule } from '@angular/material/list'; // Para listas
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AgregarSuministroComponent } from './suministros/agregar-suministro/agregar-suministro.component';
import { EditarSuministroComponent } from './suministros/editar-suministro/editar-suministro.component'; // Para barras de progreso
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AdicionalComponent } from './adicional/adicional.component';
import { CrearCategoriaComponent } from './suministros/crear-categoria/crear-categoria.component'; // Importar el módulo
import { SuministrosComponent } from './suministros/suministros.component';
import { SaboresComponent } from './sabores/sabores.component';


@NgModule({
  declarations: [
    PlatosComponent,
    AgregarSuministroComponent,
    EditarSuministroComponent,
    AdicionalComponent,
    CrearCategoriaComponent,
    SuministrosComponent,
    SaboresComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    ModuleProductsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgChartsModule,

    // Angular Material Modules
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatProgressBarModule,
    MatCardModule, // Agregado
    MatButtonModule, // Agregado
    MatInputModule, // Agregado
    MatFormFieldModule, // Agregado
    MatDialogModule, 
    MatSortModule,
    MatSlideToggleModule, 
    MatProgressSpinnerModule,

  ],
})
export class ModuleProductsModule { }