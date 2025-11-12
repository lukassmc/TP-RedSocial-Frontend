import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post, CreatePost, PostsResponse } from '../../models/post.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PostsService {

    private apiUrl= 'https://tp-redsocial-backend-im15.onrender.com/posts';

    constructor(private http: HttpClient, private authService: AuthService){};

    getPosts(page: number = 1, limit: number = 10, sortBy: 'date' | 'likes' = 'date') : Observable<PostsResponse>{
        let params = new HttpParams()
        .set('page', page.toString())
        .set('limit', limit.toString())
        .set('sortBy', sortBy);
        
        return this.http.get<PostsResponse>(this.apiUrl, {params});

    }

    getMyPosts(limit: number =3) : Observable<Post[]>{

        return this.http.get<Post[]>(`${this.apiUrl}/my-posts`, {
            params: new HttpParams().set('limit', limit.toString())
        });
    }

    createPost(postData: any) : Observable<Post>{
        return this.http.post<any>(this.apiUrl, postData)

    }

    deletePost(postId: string) : Observable<void>{
        return this.http.delete<void>(`${this.apiUrl}/${postId}`)
    }

    
  
    likePost(postId: string): Observable<Post> {
        return this.http.post<Post>(`${this.apiUrl}/${postId}/like`, {});
    }

    
    unlikePost(postId: string): Observable<Post> {
        return this.http.delete<Post>(`${this.apiUrl}/${postId}/like`);
    }
    
    hasLiked(post: Post): boolean {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return false;
    
    return Array.isArray(post.likes) && post.likes.includes(currentUser._id);
    }
    
    isPostOwner(post: Post): boolean {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return false;
    
    return post.userId._id === currentUser._id;
    }
    
}

