import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { SessionService } from '../../services/session.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-session-warning',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './session-warning.html',
  styleUrls: ['./session-warning.css']
})
export class SessionWarning {
  showWarning$: Observable<boolean>;

  constructor(
    private authService: AuthService,
    private sessionService: SessionService
  ) {
    this.showWarning$ = this.sessionService.sessionExpires$;
  }

  extendSession(): void {
    this.authService.refreshToken().subscribe({
      next: () => {
        console.log('Sesión extendida exitosamente');
        this.sessionService.extendSession();
      },
      error: () => {
        console.error('Error al extender la sesión');
        this.authService.logout();
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}