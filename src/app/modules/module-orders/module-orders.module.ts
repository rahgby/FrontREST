import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
//aca pon los mods del mundo
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';//AgregarPedidoCarta
import { MatCardModule } from '@angular/material/card';//AgregarPedidoCarta
import { MatTableModule } from '@angular/material/table'; // Módulo de tablas
import { MatIconModule } from '@angular/material/icon';  // Módulo de íconos
import { MatButtonModule } from '@angular/material/button'; // Módulo de botones
import { MatDialogModule } from '@angular/material/dialog'; // Importar MatDialogModule
import { MatSnackBarModule } from '@angular/material/snack-bar'; // Importar MatSnackBarModule
import { MatListModule } from '@angular/material/list';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input'; // Para mat-input
import { MatGridListModule } from '@angular/material/grid-list'; // Importa MatGridListModule
import { MatProgressBarModule } from '@angular/material/progress-bar'; // Importa MatProgressBar
import { ModuleOrdersRoutingModule } from './module-orders-routing.module';
import { FilterPipe } from 'src/app/filter.pipe';
import { MatRadioModule } from '@angular/material/radio'; 
import { MatSelectModule } from '@angular/material/select';
import { PedidosComponent } from './pedidos/pedidos.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { VerPedidosModalComponent } from './ver-pedidos-modal/ver-pedidos-modal.component';
import { EditarPedidosModalComponent } from './editar-pedidos-modal/editar-pedidos-modal.component';
import { MatBadgeModule } from '@angular/material/badge';
import { VerBoletaComponent } from './ver-boleta-modal/ver-boleta/ver-boleta.component';
import { getSpanishPaginatorIntl } from './services/paginator-es';
// Añade estos imports para las tabs
import { MatTabsModule } from '@angular/material/tabs';
import { PedidoCocinaComponent } from './pedido-cocina/pedido-cocina.component';// Importa MatTabsModule
import { CrearPedidoComponent } from './crear-pedido/crear-pedido.component';
import { MismesasComponent } from './crear-pedido/mismesas/mismesas.component';
import { CartaviewComponent } from './crear-pedido/cartaview/cartaview.component';
import { ResumenPedidoModalComponent } from './crear-pedido/resumen-pedido-modal/resumen-pedido-modal.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ConfiguradorAdicionalComponent } from './crear-pedido/configurador-adicional/configurador-adicional.component';
import { VerPedidosMesaComponent } from './ver-pedidos-mesa/ver-pedidos-mesa.component';
import { MatTooltipModule } from '@angular/material/tooltip';



@NgModule({
  declarations: [
    PedidosComponent,
    FilterPipe,
    VerPedidosMesaComponent,
    VerPedidosModalComponent,
    EditarPedidosModalComponent,
    PedidoCocinaComponent,
    CrearPedidoComponent,
    MismesasComponent,
    CartaviewComponent,
    ResumenPedidoModalComponent,
    ConfiguradorAdicionalComponent,
    VerPedidosMesaComponent
  ],
  imports: [
    CommonModule,
    ModuleOrdersRoutingModule,
    MatDialogModule,
    VerBoletaComponent,
    MatRadioModule,
    MatTableModule, // Importa MatTableModule
    MatIconModule,  // Importa MatIconModule
    MatButtonModule,// Importa MatButtonModule
    MatDialogModule, // Usa MatDialogModule en lugar de MatDialog
    MatSnackBarModule, // Usa MatSnackBarModule en lugar de MatSnackBar
    MatExpansionModule, //AgregarPedidoCarta
    MatCardModule,//AgregarPedidoCarta,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatToolbarModule,
    MatGridListModule,
    MatPaginatorModule,
    MatListModule,
    FormsModule,
    MatInputModule,
    MatMenuModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatTabsModule, // Agrega esta línea para habilitar mat-tab-group y mat-tab
    MatBadgeModule,
    FormsModule,
    MatCheckboxModule
  ],
  providers: [
    { provide: MatPaginatorIntl, useFactory: getSpanishPaginatorIntl }
  ]
})
export class ModuleOrdersModule { }