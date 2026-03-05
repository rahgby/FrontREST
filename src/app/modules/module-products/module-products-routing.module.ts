import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlatosComponent } from './platos/platos.component';
import { SuministrosComponent } from './suministros/suministros.component';
import { AdicionalComponent } from './adicional/adicional.component';
import { SaboresComponent } from './sabores/sabores.component';

const routes: Routes = [
  {
    path: 'suministros',
    component: SuministrosComponent,

  },
  {
    path: 'platos',
    component: PlatosComponent,

  },
  {
    path: 'adicional',
    component: AdicionalComponent,

  },
  {
    path: 'sabores',
    component: SaboresComponent,

  }


  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ModuleProductsRoutingModule { }
