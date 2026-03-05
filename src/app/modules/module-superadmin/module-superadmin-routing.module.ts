import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistaAuditoriaComponent } from './vista-auditoria/vista-auditoria.component';

const routes: Routes = [
   {
        path: 'vistaAuditoria',
        component: VistaAuditoriaComponent
    
      },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ModuleSuperadminRoutingModule {

 }
