import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VentasViewComponent } from './ventas-view/ventas-view.component';
import { VentasHistorialComponent } from './ventas-historial/ventas-historial.component';

const routes: Routes = [
   {
        path: 'ventas',
        component: VentasViewComponent
    
      },

      {
        path: 'ventas-historial',
        component: VentasHistorialComponent
    
      },

     
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ModuleSalesRoutingModule { }
