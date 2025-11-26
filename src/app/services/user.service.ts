import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}`; 
  
  
  getUser(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/users`);
  }
  getMyProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/me`);
  }
  
  updateProfile(id: string, formData: FormData): Observable<any> {
    return this.http.patch(`${this.apiUrl}/users/me`, formData);
  }

  createUserByAdmin(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/users`, userData);
  }

  toggleUserActive(userId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/users/${userId}/toggle-active`, {});
  }

}
