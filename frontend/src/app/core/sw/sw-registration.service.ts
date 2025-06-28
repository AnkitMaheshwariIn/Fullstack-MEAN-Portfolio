import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServiceWorkerRegistrationService {
  private readonly isSupported = 'serviceWorker' in navigator;
  private readonly registrationSubject = new BehaviorSubject<ServiceWorkerRegistration | null>(null);

  constructor() {
    this.initializeServiceWorker();
  }

  private initializeServiceWorker(): void {
    if (!this.isSupported) {
      console.log('Service workers are not supported in this browser');
      return;
    }

    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/ngsw-worker.js', {
        scope: '/'
      })
      .then(registration => {
        console.log('ServiceWorker registration successful');
        this.registrationSubject.next(registration);
      })
      .catch(error => {
        console.error('ServiceWorker registration failed:', error);
      });
    });
  }

  getRegistration() {
    return this.registrationSubject.asObservable();
  }

  isServiceWorkerSupported(): boolean {
    return this.isSupported;
  }
}
