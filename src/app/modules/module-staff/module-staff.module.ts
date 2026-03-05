import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms'; // Añade FormsModule
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { ModuleStaffRoutingModule } from './module-staff-routing.module';
import { Pagina1Component } from './personal/pagina1.component';
import { AreaComponent } from './area/area.component';
import { DescansoComponent } from './descanso/descanso.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NgxPaginationModule } from 'ngx-pagination';
import { ModalAsingarAreasComponent } from './modal-asingar-areas/modal-asingar-areas.component'; // Añade NgxPaginationModule
import { MatListModule } from '@angular/material/list';

@NgModule({
  declarations: [
    Pagina1Component, 
    AreaComponent, 
    DescansoComponent, ModalAsingarAreasComponent
  ],
  imports: [
    CommonModule,
    ModuleStaffRoutingModule,
    ReactiveFormsModule,
    FormsModule, // Añade esta línea para ngModel
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatToolbarModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    NgxPaginationModule, // Añade esta línea para la paginación
    MatListModule,
  ],
})
export class ModuleStaffModule { }