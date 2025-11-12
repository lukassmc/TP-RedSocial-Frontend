// src/app/components/create-post/create-post.component.ts
import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostsService } from '../../services/posts.services';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-post.html',
  styleUrls: ['./create-post.css']
})
export class CreatePostComponent {
  @Output() postCreated = new EventEmitter<void>();
  
  showForm = false;
  loading = false;
  error = '';
  
  postData = {
    title: '',
    content: '',
    imageUrl: ''
  };

  selectedFile: File | null = null;
  imagePreview: string | null = null;

  constructor(private postsService: PostsService) {}

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        this.error = 'Solo se permiten archivos de imagen';
        return;
      }

      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        this.error = 'La imagen no puede superar los 5MB';
        return;
      }

      this.selectedFile = file;
      this.error = '';

      // Crear preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.postData.imageUrl = '';
  }

  onSubmit(): void {
    // Validaciones básicas
    if (!this.postData.title.trim() || !this.postData.content.trim()) {
      this.error = 'El título y contenido son obligatorios';
      return;
    }

    this.loading = true;
    this.error = '';

    // Crear FormData si hay imagen, sino enviar JSON normal
    if (this.selectedFile) {
      this.createPostWithImage();
    } else {
      this.createPostWithoutImage();
    }
  }

  private createPostWithImage(): void {
    const formData = new FormData();
    formData.append('title', this.postData.title);
    formData.append('content', this.postData.content);
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.postsService.createPost(formData).subscribe({
      next: () => {
        this.handleSuccess();
      },
      error: (err) => {
        this.handleError(err);
      }
    });
  }

  private createPostWithoutImage(): void {
    this.postsService.createPost(this.postData).subscribe({
      next: () => {
        this.handleSuccess();
      },
      error: (err) => {
        this.handleError(err);
      }
    });
  }

  private handleSuccess(): void {
    this.loading = false;
    this.resetForm();
    this.showForm = false;
    this.postCreated.emit(); 
  }

  private handleError(err: any): void {
    this.loading = false;
    this.error = err.error?.message || 'Error al crear la publicación';
    console.error('Error creating post:', err);
  }

  private resetForm(): void {
    this.postData = {
      title: '',
      content: '',
      imageUrl: ''
    };
    this.selectedFile = null;
    this.imagePreview = null;
    this.error = '';
  }
}