// src/app/components/create-post/create-post.component.ts
import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostsService } from '../../services/posts.services';
import { MusicSearch } from '../music-search/music-search';
import {Song} from '../../models/music.model'

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [CommonModule, FormsModule, MusicSearch],
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
    imageUrl: '',
    music: ''
  };

  selectedFile: File | null = null;
  imagePreview: string | null = null;
  selectedSong: Song | null = null
  showMusicSelector = false;

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

  toggleMusicSelector() {
  this.showMusicSelector = !this.showMusicSelector;
}

  onSongSelected(song: any) {
    this.selectedSong = song
  }

  removeSong() {
  this.selectedSong = null;
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
      console.log('post con imagen');
      
    } else if(this.selectedSong){
      this.createPostWithMusic();
      console.log('post con musica');
    } else {
      this.createPostWithoutImage();
      console.log('post simple');
    }

  }

  private createPostWithImage(): void {
    const formData = new FormData();
    formData.append('title', this.postData.title);
    formData.append('content', this.postData.content);
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
      console.log('Imagen adjuntada:', this.selectedFile.name);
    }

    this.postsService.createPost(formData).subscribe({
      next: () => {
        console.log('Publicación creada con imagen');
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

  private createPostWithMusic(){
    const formData = new FormData();
    formData.append('title', this.postData.title)
    formData.append('content', this.postData.content)

    if (this.selectedSong){
       formData.append('music', JSON.stringify(this.selectedSong))
    }

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
  
  console.error(' Error completo:', err);
  console.error(' Status:', err.status);
  console.error(' Error response:', err.error);
  

  if (err.status === 400) {
    console.error(' Detalles del error 400:', err.error);
    
    if (err.error.message) {
      this.error = `Error: ${err.error.message}`;
    } else if (err.error.error) {
      this.error = `Error: ${err.error.error}`;
    } else {
      this.error = 'Datos inválidos. Revisa los campos.';
    }
  } else {
    this.error = err.error?.message || 'Error inesperado al crear la publicación';
  }
}
  private resetForm(): void {
    this.postData = {
      title: '',
      content: '',
      imageUrl: '',
      music : ''
    };
    this.selectedFile = null;
    this.imagePreview = null;
    this.error = '';
  }
}