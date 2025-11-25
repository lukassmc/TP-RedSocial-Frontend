import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, of, catchError } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { inject } from '@angular/core';

export interface RegisterData {
  nombre: string;
  apellido: string;
  username: string;
  email: string;
  password: string;
  birthdate: string;
  description?: string;
  role?: string;
}

export interface LoginData {
  identifier: string;
  password: string;
}

export interface AuthResponse {
  statusCode: number;
  message: string;
  user: {
    _id: string;
    nombre: string;
    apellido: string;
    email: string;
    username: string;
    role: string;
    profilePicture?: string;
  };
  access_token: string;
  expiresIn: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  private apiUrl = `${environment.apiUrl}/auth`;
  

  private usuarioLogueadoSubject = new BehaviorSubject<any>(this.getCurrentUser());
  public usuarioLogueado$ = this.usuarioLogueadoSubject.asObservable();
  
  constructor() {
    this.initializeAuthFromStorage();
  }

  private initializeAuthFromStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('access_token');
      const user = localStorage.getItem('currentUser');
      
      if (token && user) {
        this.setUsuarioLogueado(JSON.parse(user));
      }
    }
  }

  register(registerData: RegisterData | FormData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, registerData);
  }

  login(loginData: LoginData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, loginData)
      .pipe(
        tap(response => {
          this.setAuthData(response);
        })
      );
  }

  setAuthData(response: AuthResponse): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      

      const expirationTime = Date.now() + ((response.expiresIn || 15 * 60) * 1000);
      localStorage.setItem('token_expiration', expirationTime.toString());
      
      this.setUsuarioLogueado(response.user);
    }
  }

  setUsuarioLogueado(usuario: any): void {
    this.usuarioLogueadoSubject.next(usuario);
  }

  getCurrentUser(): any {
    if (isPlatformBrowser(this.platformId)) {
      const user = localStorage.getItem('currentUser');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  getUserId(): string | null {
    const token = localStorage.getItem('access_token');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || payload._id || null;
    } catch (e) {
      return null;
    }
  }

  isTokenValid(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    
    const token = localStorage.getItem('access_token');
    const expirationTime = localStorage.getItem('token_expiration');
    
    if (!token) return false;
    

    if (expirationTime) {
      const isExpired = Date.now() >= parseInt(expirationTime);
      if (isExpired) {
        console.log('Token expirado, haciendo logout...');
        this.logout();
        return false;
      }
      return true;
    }
    
  
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = Date.now() >= payload.exp * 1000;
      
      if (isExpired) {
        console.log('Token expirado, haciendo logout...');
        this.logout();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error verificando token:', error);
      this.logout();
      return false;
    }
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null && this.isTokenValid();
  }

  refreshToken(): Observable<any> {
    return this.http.post(`${this.apiUrl}/refresh`, {}).pipe(
      tap((response: any) => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('access_token', response.access_token);
          
          
          const expirationTime = Date.now() + ((response.expiresIn || 15 * 60) * 1000);
          localStorage.setItem('token_expiration', expirationTime.toString());
        }
      })
    );
  }
  saveUser(userData: any): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('currentUser', JSON.stringify(userData));
    }
  }



validateToken(): Observable<any> {
  const token = localStorage.getItem('access_token');
  if (!token) {
    return of({ valid: false });
  }
  return this.http.get(`${this.apiUrl}/auth/validate`, {
    headers: { Authorization: `Bearer ${token}` }
  }).pipe(
    catchError(() => {
    
      return of({ valid: false });
    })
  );
}

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('access_token');
      localStorage.removeItem('token_expiration');
      this.setUsuarioLogueado(null);
      sessionStorage.clear();
      this.router.navigate(['/login']);
    }
  }

  clearAuthData(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('access_token');
        localStorage.removeItem('token_expiration');
        sessionStorage.clear();
        console.log('Auth data limpiada correctamente');
      } catch (error) {
        console.error('Error limpiando auth data:', error);
      }
    }
  }
}