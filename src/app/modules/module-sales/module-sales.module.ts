import { ModuleSalesRoutingModule } from './module-sales-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogoBoletaFacturaComponent } from './dialogo-boleta-factura/dialogo-boleta-factura.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIcon, MatIconModule } from '@angular/material/icon'; 
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { ReactiveFormsModule } from '@angular/forms'; 
import {  MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FormControl } from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input'; 
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { DialogoMontoInicialComponent } from './dialogo-monto-inicial/dialogo-monto-inicial.component';
import { HistorialCajasComponent } from './historial-cajas/historial-cajas.component';
import { VentasViewComponent } from './ventas-view/ventas-view.component';
import { VentasHistorialComponent } from './ventas-historial/ventas-historial.component';
import { ModalComandaCobroComponent } from './modal-comanda-cobro/modal-comanda-cobro.component';
import { CajaResumenComponent } from './caja-resumen/caja-resumen.component';
import { ModalPedidosVentaComponent } from './modal-pedidos-venta/modal-pedidos-venta.component';
@NgModule({
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-PE' } // Configura Perú para dd/mm/yyyy
  ],
  
  declarations: [    
    CajaResumenComponent,
    DialogoBoletaFacturaComponent,
    DialogoMontoInicialComponent,
    HistorialCajasComponent,
    VentasViewComponent,
    VentasHistorialComponent,
    ModalComandaCobroComponent,
    ModalPedidosVentaComponent,
  ],
  imports: [
    CommonModule,
    ModuleSalesRoutingModule,
    MatPaginatorModule,
    MatNativeDateModule,
    MatInputModule,
    MatIconModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatTooltipModule,
    FormsModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    CommonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatCardModule,
    MatIconModule,
    MatSnackBarModule,
    MatTableModule, 
    MatExpansionModule,
    MatCardModule,
    MatRadioModule,
    MatSelectModule,
    MatListModule,
    MatDividerModule
  ]
})
export class ModuleSalesModule { pedidoMetodo = new FormControl('');}

