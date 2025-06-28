import { Injectable } from '@angular/core';
import { Subject, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReportWorkerService {
  private worker: Worker | null = null;
  private readonly workerUrl = './workers/report.worker.js';
  private readonly messageSubject = new Subject<any>();
  private readonly errorSubject = new Subject<any>();
  private workerInitialized = false;

  constructor() {
    this.initializeWorker();
  }

  public initializeWorker(): void {
    if (typeof Worker !== 'undefined') {
      try {
        // Create a new worker
        this.worker = new Worker(this.workerUrl);
        this.workerInitialized = true;

        // Listen for messages from the worker
        this.worker.onmessage = (event) => {
          this.messageSubject.next(event.data);
        };

        // Handle errors
        this.worker.onerror = (error) => {
          console.error('Worker error:', error);
          this.errorSubject.next(error);
        };

        // Handle worker termination
        this.worker.onmessageerror = (error) => {
          console.error('Worker message error:', error);
          this.errorSubject.next(error);
        };

      } catch (error) {
        console.error('Failed to initialize worker:', error);
        this.workerInitialized = false;
        this.errorSubject.next(error);
      }
    } else {
      console.warn('Web Workers are not supported in this environment');
      this.workerInitialized = false;
    }
  }

  // Check if worker is initialized
  isInitialized(): boolean {
    return this.workerInitialized;
  }

  // Send a message to the worker with error handling
  sendMessage(data: any): Observable<void> {
    return new Observable<void>(observer => {
      if (!this.workerInitialized) {
        observer.error(new Error('Worker is not initialized'));
        return;
      }

      if (this.worker) {
        this.worker.postMessage(data);
        observer.next();
      } else {
        observer.error(new Error('Worker is not available'));
      }
    }).pipe(
      catchError(error => {
        console.error('Error sending message to worker:', error);
        return throwError(error);
      })
    );
  }

  // Get messages from the worker as Observable
  getMessage(): Observable<any> {
    return this.messageSubject.asObservable();
  }

  // Get worker errors as Observable
  getErrors(): Observable<any> {
    return this.errorSubject.asObservable();
  }

  // Terminate the worker gracefully
  terminate(): void {
    if (this.worker) {
      try {
        this.worker.terminate();
        this.workerInitialized = false;
      } catch (error) {
        console.error('Error terminating worker:', error);
        this.errorSubject.next(error);
      }
    }
  }

  // Cleanup when service is destroyed
  ngOnDestroy(): void {
    this.terminate();
    this.messageSubject.complete();
    this.errorSubject.complete();
  }
}

}
