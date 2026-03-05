import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

// Angular Material Modules (CORREGIDO)
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip'; // ✅ Cambiado: MatTooltip → MatTooltipModule
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // ✅ Cambiado: MatSpinner → MatProgressSpinnerModule
import { MatBadgeModule } from '@angular/material/badge';

// Components
import { HeaderComponent } from './components/header/header.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { UsernavComponent } from './components/usernav/usernav.component';
import { NotificationComponent } from './components/notification/notification.component';

@NgModule({
  declarations: [
    HeaderComponent,
    SidenavComponent,
    UsernavComponent,
    NotificationComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    
    // Angular Material Modules (CORREGIDO)
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule, // ✅ Reemplazado: MatSpinner → MatProgressSpinnerModule
    MatSidenavModule,
    MatTooltipModule, // ✅ Reemplazado: MatTooltip → MatTooltipModule
    MatMenuModule,
    MatListModule,
    MatBadgeModule
  ],
  exports: [
    // Export CommonModule and RouterModule for common directives
    CommonModule,
    RouterModule,
    
    // Export Angular Material Modules
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatSidenavModule,
    MatMenuModule,
    MatListModule,
    MatProgressSpinnerModule, // ✅ Agregado para exportar
    MatTooltipModule, // ✅ Agregado para exportar
    MatBadgeModule, // ✅ Agregado para exportar
    
    // Export TranslateModule if needed by other modules
    TranslateModule,
    
    // Export Components
    HeaderComponent,
    SidenavComponent,
    UsernavComponent // ✅ Agregado UsernavComponent a exports
  ]
})
export class SharedModule {}