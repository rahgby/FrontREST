import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../auth/guards/auth.guard'; // Ajusta la ruta según tu estructura
import { WelcomeComponent } from './welcome/welcome.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard], // <-- Protege TODAS las rutas hijas desde el nivel raíz
    children: [
      { 
        path: '', 
        component: WelcomeComponent, // Ruta inicial (/home)
      },
      { 
        path: 'welcome', 
        component: WelcomeComponent,
      },
     
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeRoutingModule {}