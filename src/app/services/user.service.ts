import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/users'; 

  
  getUser(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  updateProfile(id: string, formData: FormData): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, formData);
  }
}
