import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PagesComponent } from './pages.component';
import { AuthGuard } from '../auth/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: PagesComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'home', loadChildren: () => import('./home/home.module').then(m => m.HomeModule) },
      { path: 'products', loadChildren: () => import('./module-products/module-products.module').then(m => m.ModuleProductsModule) },
      { path: 'staff', loadChildren: () => import('./module-staff/module-staff.module').then(m => m.ModuleStaffModule) },
      { path: 'orders', loadChildren: () => import('./module-orders/module-orders.module').then(m => m.ModuleOrdersModule) },
      { path: 'sales', loadChildren: () => import('./module-sales/module-sales.module').then(m => m.ModuleSalesModule) },
      { path: 'costumers', loadChildren: () => import('./module-costumers/module-costumers.module').then(m => m.ModuleCostumersModule) },
      {path: 'auditoria', loadChildren: () => import('./module-superadmin/module-superadmin.module').then(m => m.ModuleSuperadminModule)},
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }