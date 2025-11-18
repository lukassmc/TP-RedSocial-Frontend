import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subscription, take } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { PostsService } from '../../services/posts.services';

import { PostCardComponent } from '../../components/post-card/post-card';
import { Post } from '../../../models/post.model';
import { UsersService } from '../../services/user.service';
@Component({
  selector: 'app-mi-perfil',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, PostCardComponent, DatePipe],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css',
})
export class MiPerfil implements OnInit, OnDestroy {
  constructor(
  private fb: FormBuilder,
  private authService: AuthService,
  private postsService: PostsService,
  private userService : UsersService,
  private router : Router
  ) {}

  currentUser : any = null;
  subscription: Subscription | null = null;

  profileForm! : FormGroup;

  defaultAvatarUrl= '/assets/default-avatar.jpg'
  avatarPreview : string | null = null;
  avatarFile : File | null = null;


  loading = false;
  saving = false;
  errorMsg= '';
  successMsg = '';


  lastPosts : Post[]= [];
  postsLoading = false;

  showEditModal = false;


  ngOnInit(): void{

      this.profileForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(30)]],
      apellido: ['', [Validators.required, Validators.maxLength(30)]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email]],
      description: ['', [Validators.maxLength(200)]],
      birthdate: ['']
    });


    this.subscription = this.authService.usuarioLogueado$.subscribe(user => {
      this.currentUser =user;
      if (user){
        this.patchForm(user);
        this.loadLastPosts();
        this.avatarPreview = user.profilePicture || this.defaultAvatarUrl;

      }else {

        this.profileForm.reset();
        this.lastPosts = [];
        this.avatarPreview = this.defaultAvatarUrl
      };
    });

  };

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private patchForm(user: any){
    this.profileForm.patchValue({
      nombre: user.nombre || '',
      apellido: user.apellido || '',
      username: user.username || '',
      email: user.email || '',
      description: user.description || '',
      birthdate: user.birthdate ? this.formatDateForInput(user.birthdate) : ''

    })

  }

  private formatDateForInput(dateStr: string) {
    const d = new Date(dateStr);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  loadLastPosts(): void {

    if(!this.currentUser || !this.currentUser._id) return;

    this.postsLoading = true
    this.postsService.getMyPosts()
    .pipe(take(1))
    .subscribe({
      next: posts =>{
          console.log("🟦 Posts recibidos:", posts);
          console.log("🟨 Tipo:", Array.isArray(posts), "Cantidad:", posts?.length);
        this.lastPosts = posts;
        this.postsLoading = false;
      },
      error: err =>{
        console.error('Error cargando las últimas publicaciones', err);
        this.postsLoading = false;
      }  
    });
  }

    openEditModal() {
    this.showEditModal = true;
    this.successMsg = '';
    this.errorMsg = '';
  }

  closeEditModal() {
    this.showEditModal = false;
    this.avatarFile = null;

    this.avatarPreview = this.currentUser?.profilePicture || this.defaultAvatarUrl;
  }

    onFileSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];

    if (!file.type.startsWith('image/')) {
      this.errorMsg = 'Solo se permiten imágenes';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      this.errorMsg = 'La imagen no debe superar los 2MB';
      return;
    }
    this.avatarFile = file;
 
    const reader = new FileReader();
    reader.onload = () => this.avatarPreview = String(reader.result);
    reader.readAsDataURL(file);
  }

  async saveProfile() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.errorMsg = 'Revisá los datos del formulario.';
      return;
    }
    if (!this.currentUser || !this.currentUser._id) {
      this.errorMsg = 'Usuario no disponible';
      return;
    }

    this.saving = true;
    this.errorMsg = '';
    this.successMsg = '';

    
    const formData = new FormData();
    formData.append('nombre', this.profileForm.value.nombre ?? '');
    formData.append('apellido', this.profileForm.value.apellido ?? '');
    formData.append('username', this.profileForm.value.username ?? '');
    formData.append('email', this.profileForm.value.email ?? '');
    formData.append('description', this.profileForm.value.description ?? '');
    formData.append('birthdate', this.profileForm.value.birthdate ?? '');
    if (this.avatarFile) {
      formData.append('avatar', this.avatarFile, this.avatarFile.name);
    }

    
    this.userService.updateProfile(this.currentUser._id, formData)
      .pipe(take(1))
      .subscribe({
        next: (updatedUser: any) => {
         
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          this.authService.setUsuarioLogueado(updatedUser);
          this.successMsg = 'Perfil actualizado correctamente';
          this.saving = false;
        
          setTimeout(() => this.closeEditModal(), 900);
        },
        error: err => {
          console.error('Error al actualizar perfil', err);
          this.errorMsg = err?.error?.message || 'Error al guardar los cambios';
          this.saving = false;
        }
      });
  }

    logout() {
    this.authService.logout();
  }

  goToPosts(): void {

    this.router.navigate(['/posts'])
  }

}
