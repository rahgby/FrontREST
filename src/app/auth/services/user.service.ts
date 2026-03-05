import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Usuario {
  idUsuario: number;
  nombre: string;
  apellido: string;
  idRol: number;
  rol: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userSubject = new BehaviorSubject<Usuario | null>(null);

  constructor(private authService: AuthService) {
    // Inicializamos el valor del usuario desde el localStorage
    const usuarioGuardado = localStorage.getItem('user');
    if (usuarioGuardado) {
      this.userSubject.next(JSON.parse(usuarioGuardado));
    }

    // Nos suscribimos a los cambios del AuthService para actualizar el usuario
    this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        const usuario = this.authService.getUser();
        this.userSubject.next(usuario);  // Sincronizamos el usuario en memoria
      } else {
        this.userSubject.next(null);  // Si no está autenticado, vaciamos el usuario
      }
    });
  }

  get user$(): Observable<Usuario | null> {
    return this.userSubject.asObservable();
  }

  get user(): Usuario | null {
    return this.userSubject.value;
  }

  setUser(usuario: Usuario): void {
    this.userSubject.next(usuario);
  }

  clearUser(): void {
    this.userSubject.next(null);
  }
}
