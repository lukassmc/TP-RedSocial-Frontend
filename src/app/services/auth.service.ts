import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
  data: {
    _id: string;
    nombre: string;
    apellido: string;
    email: string;
    username: string;
    role: string;
    profilePicture?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = 'http://localhost:3000/api/auth';

  register(registerData: RegisterData | FormData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, registerData);
  }

  login(loginData: LoginData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, loginData);
  }

  saveUser(userData: any): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('currentUser', JSON.stringify(userData));
    }
  }

  getCurrentUser(): any {
    if (isPlatformBrowser(this.platformId)) {
      const user = localStorage.getItem('currentUser');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('currentUser');
    }
  }
}
