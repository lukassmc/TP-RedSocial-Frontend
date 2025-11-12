import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Post } from '../../../models/post.model';
import { PostsService } from '../../services/posts.services';
import { PostCardComponent } from '../../components/post-card/post-card';
import { FormsModule } from '@angular/forms';
import { CreatePostComponent } from '../../components/create-post/create-post';

@Component({
  selector: 'app-publicaciones',
  standalone: true,
  imports: [CommonModule, PostCardComponent, FormsModule, CreatePostComponent],
  templateUrl: './publicaciones.html',
  styleUrls: ['./publicaciones.css']
})
export class Publicaciones implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private postsService= inject(PostsService);

  posts: Post[] = [];
  loading = true;
  error : string = '';

  currentPage= 1;
  itemsPerPage = 10;
  totalPosts= 0;
  totalPages= 0;
  
  sortBy: 'date' | 'likes' = 'date';

  currentUser: any;
  showUserMenu = false;


  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    if (!this.currentUser) {
      this.router.navigate(['/login']);
    }
    this.loadPosts();

  }

  loadPosts() : void {
    this.loading = true;
    this.error = '';


    this.postsService.getPosts(this.currentPage, this.itemsPerPage, this.sortBy)
    .subscribe({
      next: (response) =>{
        this.posts = response.posts;
        this.totalPosts = response.total;
        this.totalPages = Math.ceil(this.totalPosts / this.itemsPerPage)
        this.loading = false;
      },
      error : (err) => {
        this.error = 'Error al cargar las publicaciones.';
        this.loading = false;
        console.error('Error loading posts:', err)
      }


    })
  }

    changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadPosts();
    }
  }
  changeSort(sortBy: 'date' | 'likes') : void {
    this.sortBy = sortBy;
    this.currentPage = 1;
    this.loadPosts();
  }

  onLike(postId : string) : void {
    this.postsService.likePost(postId).subscribe({
      next: (updatedPost) => {
        const index = this.posts.findIndex(post => post._id === postId);
        if (index !== -1){
          this.posts[index] = updatedPost;
        }
      },
      error: (err) => {
        console.error('Error liking post:', err)
      }
    })
  }
   onUnlike(postId: string): void {
    this.postsService.unlikePost(postId).subscribe({
      next: (updatedPost) => {
      
        const index = this.posts.findIndex(p => p._id === postId);
        if (index !== -1) {
          this.posts[index] = updatedPost;
        }
      },
      error: (err) => {
        console.error('Error quitando like:', err);
        alert('Error al quitar like');
      }
    });
  }

  onPostCreated(): void {
    this.loadPosts();
  }

  onDelete(postId: string): void {
    this.postsService.deletePost(postId).subscribe({
      next: () => {
        
        this.posts = this.posts.filter(p => p._id !== postId);
        this.totalPosts--;
        this.totalPages = Math.ceil(this.totalPosts / this.itemsPerPage);
      },
      error: (err) => {
        console.error('Error eliminando post:', err);
        alert('Error al eliminar la publicación');
      }
    });

    
  }

  get pagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }


  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  logout(): void {
    this.authService.logout();
    this.showUserMenu = false;
    this.router.navigate(['/login']);
  }
}