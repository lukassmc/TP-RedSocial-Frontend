import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-publicaciones',
  imports: [CommonModule, RouterLink],
  templateUrl: './publicaciones.html',
  styleUrls: ['./publicaciones.css']
})
export class Publicaciones implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser: any;
  showUserMenu = false;

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    if (!this.currentUser) {
      this.router.navigate(['/login']);
    }
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