import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment } from '../models/comment.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommentsService {
  private apiUrl = `${environment.apiUrl}/comments`;

  constructor(private http: HttpClient) {}

  getComments(postId: string): Observable<Comment[]> {
  const token = localStorage.getItem('token');
  return this.http.get<Comment[]>(
    `${this.apiUrl}/${postId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
}

addComment(postId: string, content: string): Observable<Comment> {
  const token = localStorage.getItem('token');
  return this.http.post<Comment>(
    `${this.apiUrl}/${postId}`,
    { content },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
}
}
