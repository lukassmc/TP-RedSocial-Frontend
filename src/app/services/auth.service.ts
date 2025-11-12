import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';


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
  // Use a relative API path. When running the SSR server (Render), the server
  // will proxy `/api` to the real backend URL defined in the `API_URL` env var.
  // When running locally without the proxy, you can set API_URL in the server
  // or run the backend on localhost:3000.
  private apiUrl = 'http://localhost:3000/auth';

  register(registerData: RegisterData | FormData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, registerData);
    
  }

  login(loginData: LoginData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, loginData);
  }

   private setCurrentUser(user: any, token: string): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('access_token', token);
  }

  saveUser(userData: any): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('currentUser', JSON.stringify(userData));
    }
  }

 
getCurrentUser(): any {
  if (isPlatformBrowser(this.platformId)) {
    try {
      const userStr = localStorage.getItem('currentUser');
      console.log('🔍 userStr from localStorage:', userStr);
      
     
      if (!userStr || userStr === 'undefined' || userStr === 'null' || userStr === '""') {
        console.log(' No hay usuario válido en localStorage');
        return null;
      }
      
      const parsedUser = JSON.parse(userStr);
      console.log('✅ Usuario parseado correctamente:', parsedUser);
      return parsedUser;
    } catch (error) {
      console.error(' Error crítico parsing user:', error);
      console.log(' Valor problemático:', localStorage.getItem('currentUser'));
      this.clearAuthData(); 
      return null;
    }
  }
  return null;
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

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('access_token');
      sessionStorage.clear();
    }
  }
}
