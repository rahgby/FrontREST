import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private dominio: string = environment.baseUrlApi;
  private apiUrl: string = `${this.dominio}/api/usuario`;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  private redirectUrl: string = '/pages/home'; // Ruta por defecto después de login

  constructor(private http: HttpClient, private router: Router) {
    this.checkAuthState();
  }

  /**
   * Log in a user with the provided credentials
   */
    login(codigo: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { codigo, password }).pipe(
      tap((response: any) => {
        if (response?.token) {
          this.setAuthData(response.token, response.usuario);
          const redirectUrl = this.redirectUrl || '/pages/home';
          this.router.navigateByUrl(redirectUrl);
          this.redirectUrl = '/pages/home';
        }
      }),
      catchError((error: any) => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Log out the current user and redirect if specified
   */
  logout(redirect: boolean = true): void {
    this.clearAuthData();
    if (redirect) {
      this.router.navigate(['/auth/login'], {
        queryParams: { 
          logout: 'true',
          t: Date.now() // Timestamp para evitar cache
        },
        replaceUrl: true // Evita que el usuario vuelva atrás
      });
    }
  }

  setRedirectUrl(url: string): void {
    this.redirectUrl = url || '/home';
  }

  getRedirectUrl(): string {
    return this.redirectUrl;
  }

  /**
   * Sets the authentication data in local storage
   * Ensures consistent ID field naming for user object
   */
  private setAuthData(token: string, user: any): void {
    localStorage.setItem('token', token);
    
    if (user) {
      // Ensure the user object has the ID property in the expected format for backend
      const userId = this.findUserId(user);
      
      // Always set IDUsuario as the backend expects this exact property name
      if (userId !== null) {
        user.IDUsuario = userId;
      }
      
      localStorage.setItem('user', JSON.stringify(user));
      
      if (user.IdRol !== undefined) {
        localStorage.setItem('idRol', user.IdRol?.toString());
      }
    }
    
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Clears all auth data from local storage
   */
  clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('idRol');
    this.isAuthenticatedSubject.next(false);
  }

  getIdRol(): number | null {
    const idRol = localStorage.getItem('idRol');
    return idRol ? parseInt(idRol) : null;
  }

  /**
   * Gets the user ID in a consistent format required by the backend
   * Returns a numeric user ID or null if not found
   */
  getUserId(): number | null {
    const user = this.getUser();
    if (!user) return null;
    
    // First try to get the IDUsuario as that's what the backend expects
    if (user.IDUsuario !== undefined) {
      const userId = user.IDUsuario;
      return typeof userId === 'number' ? userId : parseInt(userId, 10);
    }
    
    // If IDUsuario doesn't exist, try to find another ID property
    return this.findUserId(user);
  }

  // In AuthService
/**
 * Gets user information from local storage or makes an API call if needed
 */
getUserInfo(): Observable<any> {
  const user = this.getUser();
  
  if (user) {
    // If we already have user data, return it as an observable
    return new Observable(observer => {
      observer.next(user);
      observer.complete();
    });
  } else if (this.getToken()) {
    // If we have a token but no user data, fetch from API
    return this.http.get(`${this.apiUrl}/info`).pipe(
      tap((userInfo: any) => {
        this.setAuthData(this.getToken()!, userInfo); // Update storage with full user info
      }),
      catchError(error => {
        console.error('Error fetching user info:', error);
        this.clearAuthData();
        return throwError(() => error);
      })
    );
  } else {
    // No token or user data available
    return throwError(() => new Error('No authentication data available'));
  }
}

/**
 * Gets simplified user info for immediate use
 */
getCurrentUser(): any {
  const user = this.getUser();
  return {
    idUsuario: this.getUserId(),
    nombre: this.getUserName(),
    rol: user?.rol || user?.Rol || null
  };
}

  /**
   * Helper method to find user ID in an object with various possible property names
   * Returns a numeric ID or null if not found
   */
  private findUserId(userData: any): number | null {
    if (!userData) return null;
    
    // Try different property names that might contain the user ID
    // Ordered by most likely to be correct based on backend expectations
    const idPropertyNames = [
      'IDUsuario', 'idUsuario', 'id', 'ID', 'usuario_id',
      'usuarioId', 'UsuarioId', 'idusuario'
    ];
    
    // Try each property name
    for (const propName of idPropertyNames) {
      if (userData[propName] !== undefined && userData[propName] !== null) {
        const userId = userData[propName];
        // Ensure the ID is a number as expected by the backend
        return typeof userId === 'number' ? userId : parseInt(userId, 10);
      }
    }
    
    // If still not found, look for any property containing 'id'
    const possibleIdProps = Object.keys(userData).filter(key => 
      key.toLowerCase().includes('id') && 
      !key.toLowerCase().includes('rol') && 
      !key.toLowerCase().includes('valid')
    );
    
    if (possibleIdProps.length > 0) {
      const userId = userData[possibleIdProps[0]];
      return typeof userId === 'number' ? userId : parseInt(userId, 10);
    }
    
    console.error('Could not find any ID property in user data:', userData);
    return null;
  }

  /**
   * Checks if the user is authenticated based on token validity
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      const payload = this.decodeToken(token);
      const isTokenValid = payload?.exp && (payload.exp * 1000 > Date.now());
      if (!isTokenValid) {
        this.clearAuthData();
      }
      return isTokenValid;
    } catch (e) {
      console.error('Error validating token:', e);
      this.clearAuthData();
      return false;
    }
  }

  private checkAuthState(): void {
    this.isAuthenticatedSubject.next(this.isAuthenticated());
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Gets the user object from local storage
   * Returns null if not found or if parsing fails
   */
// En AuthService
getUser(): any {
  try {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}

getUserName(): string | null {
  const user = this.getUser();
  return user?.nombre || user?.Nombre || user?.username || null;
}

  /**
   * Debug method to inspect user data structure
   * Logs detailed information about the user object
   */
  debugUserData(): void {
    const userData = localStorage.getItem('user');
    console.log('Raw user data in localStorage:', userData);
    
    if (userData) {
      try {
        const user = JSON.parse(userData);
        console.log('Parsed user object:', user);
        console.log('User properties:', Object.keys(user));
        
        // Try to find ID using our algorithm
        const userId = this.getUserId();
        console.log('Extracted user ID:', userId, '(type:', typeof userId, ')');
        
        // Check if we have the IDUsuario property that the backend expects
        const hasCorrectIdProp = user.IDUsuario !== undefined;
        console.log('Has IDUsuario property:', hasCorrectIdProp);
        
        if (!hasCorrectIdProp && userId !== null) {
          console.warn('User object is missing IDUsuario property expected by backend. Will use:', userId);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    } else {
      console.warn('No user data found in localStorage');
    }
  }

  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Error decoding token', e);
      return null;
    }
  }
}