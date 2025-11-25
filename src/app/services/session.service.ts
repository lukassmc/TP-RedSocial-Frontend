import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private warningShown = false;
  private sessionTimer: any;

  sessionExpires$ = new BehaviorSubject<boolean>(false);

  startSessionTimer() {
    this.clearTimer();

    this.sessionTimer = setTimeout(() => {
      this.sessionExpires$.next(true);
    }, 10 * 60 * 1000);
  }

  clearTimer() {
    if (this.sessionTimer) clearTimeout(this.sessionTimer);
    this.warningShown = false;
  }
}