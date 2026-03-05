import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Pagina1Component } from './personal/pagina1.component';
import { AreaComponent } from './area/area.component';
import { DescansoComponent } from './descanso/descanso.component';
import { AuthGuard } from 'src/app/auth/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      { path: 'personal', component: Pagina1Component },
      { path: 'descanso', component: DescansoComponent },
      { path: 'area', component: AreaComponent }
    
      
      
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ModuleStaffRoutingModule { }
