import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment } from '../models/comment.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommentsService {
  private apiUrl = `${environment.apiUrl}/comments`;

  constructor(private http: HttpClient) {}

getComments(
  postId: string,
  page: number = 1,
  limit: number = 10
): Observable<{ comments: Comment[]; total: number; page: number; limit: number }> {
  const token = localStorage.getItem('token');

  let params = new HttpParams()
    .set('page', page.toString())
    .set('limit', limit.toString());

  return this.http.get<{ comments: Comment[], total: number, page: number, limit: number }>(
  `${this.apiUrl}/post/${postId}`,
  {
    params,
    headers: { Authorization: `Bearer ${token}` }
  }
);
}
  updateComment(commentId: string, content: string): Observable<Comment> {
  const token = localStorage.getItem('token');

  return this.http.put<Comment>(
    `${this.apiUrl}/${commentId}`,
    { content },
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
    `${this.apiUrl}/post/${postId}`,
    { content },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
}
}
