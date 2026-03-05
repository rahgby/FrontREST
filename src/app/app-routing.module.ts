import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/guards/auth.guard';
import { NoAuthGuard } from './auth/guards/no-auth.guard';
import { PageUnauthorizedComponent } from './core/components/page-unauthorized/page-unauthorized.component';

const routes: Routes = [
  { path: '', redirectTo: 'pages', pathMatch: 'full' },
  
  { 
    path: 'auth',
    canActivate: [NoAuthGuard],
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },

  {
    path: 'pages',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    loadChildren: () => import('./modules/pages.module').then(m => m.PagesModule)
  },

  { path: 'unauthorized', component: PageUnauthorizedComponent },

  { path: '**', redirectTo: 'auth' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}