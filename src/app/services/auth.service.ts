import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject ,tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';


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
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router)
  // Use a relative API path. When running the SSR server (Render), the server
  // will proxy `/api` to the real backend URL defined in the `API_URL` env var.
  // When running locally without the proxy, you can set API_URL in the server
  // or run the backend on localhost:3000.
  private apiUrl = `${environment.apiUrl}/auth`;
  private usuarioLogueadoSubject = new BehaviorSubject<any>(this.getCurrentUser());
  public usuarioLogueado$ = this.usuarioLogueadoSubject.asObservable();

  register(registerData: RegisterData | FormData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, registerData);
    
  }

  login(loginData: LoginData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, loginData)
    .pipe(
      tap(response => {
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('currentUser', JSON.stringify(response.user)); 
          this.setUsuarioLogueado(response.user); 
      })
    );
  }

  setUsuarioLogueado(usuario: any) {
    this.usuarioLogueadoSubject.next(usuario);
  }

  setCurrentUser(user: any, token: string): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('access_token', token);
  }

  saveUser(userData: any): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('currentUser', JSON.stringify(userData));
    }
  }

 getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  clearAuthData(): void {
  if (isPlatformBrowser(this.platformId)) {
    try {
  
      localStorage.removeItem('currentUser');
      localStorage.removeItem('access_token');
      
    
      sessionStorage.clear();
      
      console.log(' Auth data limpiada correctamente');
    } catch (error) {
      console.error(' Error limpiando auth data:', error);
    }
  }
}

isTokenValid(): boolean {
  const token = localStorage.getItem('access_token');
  if (!token) return false;
  
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
    return this.getCurrentUser() !== null;
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('access_token');
      this.setUsuarioLogueado(null);
      sessionStorage.clear();
    }
  }
}
