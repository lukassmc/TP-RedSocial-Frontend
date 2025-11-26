import { Router } from '@angular/router';
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Post } from '../../../models/post.model';
import { PostsService } from '../../services/posts.services';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { CommentSection } from '../comment-section/comment-section';

@Component({
  selector: 'app-post-card',
  imports : [CommonModule, CommentSection],
  templateUrl: './post-card.html',
  styleUrls: ['./post-card.css']
})
export class PostCardComponent implements OnInit {
  @Input() post!: Post;
  @Input() showDeleteButton: boolean = false;
  
  @Output() like = new EventEmitter<string>();
  @Output() unlike = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();
  @Output() takenDown = new EventEmitter<string>();

  hasLiked: boolean = false;
  isOwner: boolean = false;
  isAdmin : boolean = false;
  showComments: boolean = false

  constructor(
    private postsService: PostsService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
  console.log('🔍 Post completo:', this.post);
  
    this.checkUserInteractions();
    this.checkIfAdmin();
  }

  private checkUserInteractions(): void {
    this.hasLiked = this.postsService.hasLiked(this.post);
    this.isOwner = this.postsService.isPostOwner(this.post);
  }

  private checkIfAdmin(): void {
    const currentUser = this.authService.getCurrentUser();
    this.isAdmin = currentUser?.role === 'administrador';
  }
  
  onTakeDownClick(): void {
    if (confirm(`¿Estás seguro de que quieres bajar la publicación "${this.post.title}"?`)) {
      this.postsService.removePostAsAdmin(this.post._id).subscribe({
        next: () => {
          alert('Publicación bajada exitosamente.');
          this.takenDown.emit(String(this.post._id)); 
        },
        error: (err) => {
          console.error('Error al bajar la publicación:', err);
          alert('No se pudo bajar la publicación.');
        }
      });
    }
  }
  
  openPost() {
  this.router.navigate(['/posts', this.post._id]);
}
  onLike(): void {
    if (this.hasLiked) {
      this.unlike.emit(this.post._id);
    } else {
      this.like.emit(this.post._id);
    }
    // Actualizar estado local inmediatamente para mejor UX
    this.hasLiked = !this.hasLiked;
  }

  onDelete(): void {
    if (confirm('¿Estás seguro de que quieres eliminar esta publicación?')) {
      this.delete.emit(this.post._id);
    }
  }

  toggleComments() {
  this.showComments = !this.showComments;
}
increaseCommentCount() {
  if (!this.post.comments) this.post.comments = 0;
  this.post.comments++;
}

onCommentAdded(): void {
  
  
  if (typeof this.post.comments === 'number') {
    this.post.comments += 1;
    ;
  } else {
    
    this.post.comments = 1;
  }
}


  get timeAgo(): string {
    const now = new Date();
    const postDate = new Date(this.post.createdAt);
    const diffMs = now.getTime() - postDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
  }
}