import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar';
import { SessionService } from './services/session.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .main-content {
      min-height: calc(100vh - 80px);
      background-color: #f8fafc;
    }
  `]
})
export class App {
  title = 'Noisy';
  constructor(private sessionService: SessionService, private authService: AuthService) {}

ngOnInit() {
  this.sessionService.sessionExpires$.subscribe(shouldShow => {
    if (shouldShow) this.showExtendSessionModal();
  });
}

showExtendSessionModal() {
  const confirmExtend = confirm("Tu sesión expirará en 5 minutos. ¿Deseás extenderla?");
  if (confirmExtend) {
    this.authService.refreshToken().subscribe(() => {
      this.sessionService.startSessionTimer(); // Reiniciar timer
    });
  }
}
}