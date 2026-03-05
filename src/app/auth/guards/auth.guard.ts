import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  CanLoad,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {
  // Módulos restringidos solo para Administrador
  private adminOnlyModules = [
    'supplies',    // Suministros
    'staff',       // Personal
    'costumers',   // Clientes
    'extras',   // Extras
    'sales',
    'dashboard' // Dashboard
  ];

  private superAdminOnlyModules = [
    'auditoria'  // <--- Agregamos el path del nuevo módulo aquí
  ];

  private adminAndCajaModules = [
    'sales',
    'dashboard'
  ];

  

  // Módulos restringidos solo para Caja
  private cajaOnlyModules = [
    'sales' ,
    'dashboard'      
  ];

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.checkAuthAndPermissions(state.url);
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.checkAuthAndPermissions(state.url);
  }

  canLoad(): boolean {
    return this.checkAuthAndPermissions();
  }

  private checkAuthAndPermissions(redirectUrl?: string): boolean {

    // 1. Verificar autenticación
    if (!this.authService.isAuthenticated()) {
      this.authService.setRedirectUrl(redirectUrl || '/pages/home');
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: redirectUrl },
        replaceUrl: true
      });
      return false;
    }

    // 2. Obtener el módulo solicitado
    const modulePath = this.getModulePath(redirectUrl);


    if (this.superAdminOnlyModules.includes(modulePath)) {
      const userRole = this.getUserRoleName();
      if ( userRole !== 'Superadmin') {
        console.warn(`Ojo de Dios: Intento de acceso no autorizado por ${userRole}`);
        this.router.navigate(['/pages/home'], { replaceUrl: true });
        return false;
      }
      return true;
    }

    if (this.cajaOnlyModules.includes(modulePath)){
      const userRole = this.getUserRoleName();
      if (userRole !== 'Caja' && userRole !== 'Administrador') {
        console.warn(`AuthGuard: Acceso denegado a ${modulePath}. Rol requerido: Caja. Rol actual: ${userRole}`);
        this.router.navigate(['/pages/home'], { replaceUrl: true });
        return false;
      }

      return true;
    }

    // 3. Verificar si el módulo es solo para Administrador
    if (this.adminOnlyModules.includes(modulePath) || (this.adminAndCajaModules.includes(modulePath)) ){
      const userRole = this.getUserRoleName();
      if (userRole !== 'Administrador') {
        console.warn(`AuthGuard: Acceso denegado a ${modulePath}. Rol requerido: Administrador. Rol actual: ${userRole}`);
        this.router.navigate(['/pages/home'], { replaceUrl: true });
        return false;
      }
      return true;
    }

    // 5. Para otros módulos, permite acceso
    return true;
  }

  private getModulePath(url?: string): string {
    if (!url) return '';
    const segments = url.split('/');
    // Busca el segmento después de 'pages' o el segundo segmento
    const pagesIndex = segments.findIndex(s => s === 'pages');
    return pagesIndex >= 0 && segments.length > pagesIndex + 1 
      ? segments[pagesIndex + 1] 
      : segments[1] || '';
  }

  private getUserRoleName(): string | null {
    // Intenta obtener de UserService
    if (this.userService.user?.rol) {
      return this.userService.user.rol;
    }

    // Intenta obtener de AuthService
    const authUser = this.authService.getUser();
    if (authUser?.rol) {
      return authUser.rol;
    }

    // Si solo tenemos idRol, mapeamos a nombre
    const idRol = this.authService.getIdRol();
    if (idRol !== null) {
      return this.mapRoleIdToName(idRol);
    }

    console.error('AuthGuard: No se pudo determinar el rol del usuario');
    return null;
  }

  private mapRoleIdToName(idRol: number): string {
    switch (idRol) {
      case 1: return 'Administrador';
      case 3: return 'Mesero';
      case 4: return 'Caja';
      case 5: return 'Cocina';
      case 6: return 'Postres';
      case 7: return 'Cocteles';
      default: return 'Desconocido';
    }
  }
}