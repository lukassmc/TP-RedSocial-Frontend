import { Injectable } from '@angular/core';
import { BehaviorSubject, timer } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  private platformId = inject(PLATFORM_ID);
  
 
  private sessionWarningSubject = new BehaviorSubject<boolean>(false);
  public sessionExpires$ = this.sessionWarningSubject.asObservable();
  
 
  private sessionTimer: any;
  private warningTimer: any;
  private sessionTimeout: number = 2 * 60 * 1000;
  private warningTime: number = 1 * 60 * 1000;

  constructor() {
    this.initializeSessionTimers();
  }

  private initializeSessionTimers(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
  
    this.clearSessionTimers();
    
    const expirationTime = localStorage.getItem('token_expiration');
    
    if (expirationTime) {
      const remainingTime = parseInt(expirationTime) - Date.now();
      
      if (remainingTime > 0) {
  
        const warningTime = remainingTime - (5 * 60 * 1000);
        
        if (warningTime > 0) {
          this.warningTimer = timer(warningTime).subscribe(() => {
            console.log('Quedan 5 minutos de sesión');
            this.sessionWarningSubject.next(true);
          });
        }
        
   
        this.sessionTimer = timer(remainingTime).subscribe(() => {
          console.log('Sesión expirada');
          this.sessionWarningSubject.next(false);
          
        });
      }
    }
  }

  private clearSessionTimers(): void {
    if (this.sessionTimer) {
      this.sessionTimer.unsubscribe();
    }
    if (this.warningTimer) {
      this.warningTimer.unsubscribe();
    }
  }

  startSessionTimer(): void {
    this.sessionWarningSubject.next(false);
    this.initializeSessionTimers();
  }

  extendSession(): void {
    this.sessionWarningSubject.next(false);
   
    this.clearSessionTimers();
    this.initializeSessionTimers();
  }

  clearSession(): void {
    this.clearSessionTimers();
    this.sessionWarningSubject.next(false);
  }
}