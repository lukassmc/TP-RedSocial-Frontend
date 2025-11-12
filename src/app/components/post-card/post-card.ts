// src/app/components/post-card/post-card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Post } from '../../../models/post.model';

@Component({
  selector: 'app-post-card',
  templateUrl: './post-card.html',
  styleUrls: ['./post-card.css']
})
export class PostCardComponent {
  @Input() post!: Post;
  @Input() showDeleteButton: boolean = false;
  
  @Output() like = new EventEmitter<string>();
  @Output() unlike = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();

  // Verificar si el usuario actual dio like
  get hasLiked(): boolean {

    
    return false; 
  }

  // Verificar si es el dueño del post
  get isOwner(): boolean {
      
    return false;
  }

  onLike(): void {
    if (this.hasLiked) {
      this.unlike.emit(this.post._id);
    } else {
      this.like.emit(this.post._id);
    }
  }

  onDelete(): void {
    if (confirm('¿Estás seguro de que quieres eliminar esta publicación?')) {
      this.delete.emit(this.post._id);
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