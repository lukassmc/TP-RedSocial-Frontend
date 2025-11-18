import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Post, CreatePost, PostsResponse } from '../../models/post.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PostsService {

    private apiUrl= 'http://localhost:3000/posts';

    constructor(private http: HttpClient, private authService: AuthService){};

    getPosts(page: number = 1, limit: number = 10, sortBy: 'date' | 'likes' = 'date', userId? :string) : Observable<PostsResponse>{
        let params = new HttpParams()
        .set('page', page.toString())
        .set('limit', limit.toString())
        .set('sortBy', sortBy);

        if(userId){
            params= params.set('userId', userId)
        }
        
        return this.http.get<PostsResponse>(this.apiUrl, {params});

    }

    getMyPosts(limit: number = 3): Observable<Post[]> {
        const token = localStorage.getItem('token')
        
        return this.http.get<Post[]>(`${this.apiUrl}/my-posts`, {
            
            params: new HttpParams().set('limit', limit.toString())
        });
        }
    createPost(postData: any): Observable<Post> {

        if (postData instanceof FormData) {
      
            return this.http.post<Post>(`${this.apiUrl}/with-image`, postData);
        } else {
     
            const formattedData = {
            title: postData.title,
            content: postData.content,
            imageUrl: postData.imageUrl || undefined
            };
            return this.http.post<Post>(this.apiUrl, formattedData);
    }
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

