import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PedidosComponent } from './pedidos/pedidos.component';
import { PedidoCocinaComponent } from './pedido-cocina/pedido-cocina.component';
import { CrearPedidoComponent } from './crear-pedido/crear-pedido.component';
import { MismesasComponent } from './crear-pedido/mismesas/mismesas.component';
import { CartaviewComponent } from './crear-pedido/cartaview/cartaview.component';

const routes: Routes = [
  { 
    path: '',  
    children: [
      { path: 'pedidos', component: PedidosComponent },
      //{ path: 'agregar-pedido', component: AgregarpedidoComponent },
      { 
        path: 'crear-pedido', 
        component: CrearPedidoComponent,
        children: [
          { path: '', redirectTo: 'mis-mesas', pathMatch: 'full' },
          { path: 'mis-mesas', component: MismesasComponent },
          { path: 'carta/:idMesa', component: CartaviewComponent }
        ]
      },
      { path: 'pedido-cocina', component: PedidoCocinaComponent },
      { path: '', redirectTo: 'pedidos', pathMatch: 'full' }
    ]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ModuleOrdersRoutingModule { }