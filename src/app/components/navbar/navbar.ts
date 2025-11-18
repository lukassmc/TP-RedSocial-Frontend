// src/app/components/navbar/navbar.component.ts
import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

interface CurrentUser {
  _id: string;
  nombre: string;
  apellido: string;
  username: string;
  email: string;
  profilePicture?: string;
  role: string;
}

@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit {
  currentUser: any = null;
  showUserMenu: boolean = false;
  private sub: any;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  
  ngOnInit(): void {
    this.sub = this.authService.usuarioLogueado$.subscribe(usuario => {
    this.currentUser = usuario;
  });
  }

  // Alternar menú de usuario
  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  // Cerrar sesión
  logout(): void {
    // Llamar al método de logout del AuthService
    this.authService.logout();
    
    // Redirigir al login
    this.router.navigate(['/login']);
    
    // Cerrar el menú
    this.showUserMenu = false;
  }

  
  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  // Cerrar menú al hacer click fuera
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    
    // Si el click fue fuera del menú de usuario, cerrarlo
    if (!target.closest('.navbar-user')) {
      this.showUserMenu = false;
    }
  }

  // Navegar al perfil
  goToProfile(): void {
    this.router.navigate(['/profile']);
    this.showUserMenu = false;
  }

  // Navegar a publicaciones
  goToPosts(): void {
    this.router.navigate(['/posts']);
  }

  // Verificar si el usuario está autenticado
  get isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  // Obtener iniciales para avatar por defecto
  get userInitials(): string {
    if (!this.currentUser) return 'U';
    
    const first = this.currentUser.nombre?.charAt(0) || '';
    const last = this.currentUser.apellido?.charAt(0) || '';
    
    return (first + last).toUpperCase() || 'U';
  }

  // Generar URL para avatar por defecto
  get defaultAvatarUrl(): string {
    if (!this.currentUser) return 'https://ui-avatars.com/api/?name=Usuario&background=6366f1&color=fff';
    
    const name = `${this.currentUser.nombre}+${this.currentUser.apellido}`;
    return `https://ui-avatars.com/api/?name=${name}&background=6366f1&color=fff`;
  }
}