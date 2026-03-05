import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

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

  constructor() {
    // Solo en el constructor, sincroniza el primer valor desde el localStorage
    const usuarioGuardado = localStorage.getItem('user');
    if (usuarioGuardado) {
      this.userSubject.next(JSON.parse(usuarioGuardado));
    }
  }

  get user$(): Observable<Usuario | null> {
    return this.userSubject.asObservable();
  }

  get user(): Usuario | null {
    return this.userSubject.value;
  }

  // Este método lo puede llamar AuthService después del login
  setUser(usuario: Usuario): void {
    this.userSubject.next(usuario);
  }

  clearUser(): void {
    this.userSubject.next(null);
  }
}
