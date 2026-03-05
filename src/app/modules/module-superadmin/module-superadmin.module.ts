import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ModuleSuperadminRoutingModule } from './module-superadmin-routing.module';
import { VistaAuditoriaComponent } from './vista-auditoria/vista-auditoria.component';
import { Routes } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';




@NgModule({
  declarations: [
    VistaAuditoriaComponent
  ],
  imports: [
    CommonModule,
    ModuleSuperadminRoutingModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatInputModule,
    MatCardModule,
    FormsModule,
    MatTabsModule,
    MatButtonModule,
    MatTooltipModule
  ]
})
export class ModuleSuperadminModule { }
