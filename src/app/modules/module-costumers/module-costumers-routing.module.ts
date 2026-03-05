import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Pagina2Component } from './clientes/pagina2.component';
import { AuthGuard } from 'src/app/auth/guards/auth.guard';

const routes: Routes = [
  {
      path: 'clientes',
      canActivate: [AuthGuard],
      component: Pagina2Component
  
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ModuleCostumersRoutingModule { }
