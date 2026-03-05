import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatMenuModule } from '@angular/material/menu'; // Importa MatMenuModule
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css']
})
export class SidenavComponent implements OnInit  {
  isMobile = true;
@ViewChild(MatSidenav) sidenav!: MatSidenav;
openSubMenu: string | null = null;
user: any;

constructor(private observer: BreakpointObserver, private router: Router, private authService: AuthService) {}

ngOnInit(): void {

  this.user = this.authService.getUser();
  this.observer.observe(['(max-width: 800px)']).subscribe((screenSize) => {
    this.isMobile = screenSize.matches;
  });

  console.log(this.user)
}

toggleMenu() {
  this.sidenav.toggle();
}

// Función para alternar el submenú
toggleSubMenu(menu: string) {
  this.openSubMenu = this.openSubMenu === menu ? null : menu;
}

// Función para verificar si un submenú está abierto
isSubMenuOpen(menu: string): boolean {
  return this.openSubMenu === menu;
}


navigateTo(path: string) {
  this.router.navigate([path]);
}
}
