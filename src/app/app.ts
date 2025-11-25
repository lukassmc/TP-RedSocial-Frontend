import { Component, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar';
import { SessionService } from './services/session.service';
import { AuthService } from './services/auth.service';
import { Loading } from './components/loading/loading';
import { SessionWarning } from './components/session-warning/session-warning';
import { Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { inject } from '@angular/core';

@Component({
  selector: 'app-root',
  imports: [CommonModule,RouterOutlet, NavbarComponent, Loading, SessionWarning],
  template: `
    <app-loading *ngIf="isLoading"></app-loading>
    <ng-container *ngIf="!isLoading">
      <app-navbar></app-navbar>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
      <app-session-warning></app-session-warning>
    </ng-container>
  `,
  styles: [`
    .main-content {
      min-height: calc(100vh - 80px);
      background-color: #f8fafc;
    }
  `]
})
export class App implements OnInit {
  title = 'Noisy';
  isLoading = true;

  
  private sessionService = inject(SessionService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
   
      setTimeout(() => {
       
        if (this.authService.isTokenValid()) {
          this.router.navigate(['/publicaciones']);
        } else {
          this.router.navigate(['/login']);
        }
        this.isLoading = false;
      }, 2000); 
    }

  }
}