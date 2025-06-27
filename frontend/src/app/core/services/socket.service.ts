import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';

interface SocketEvent {
  type: string;
  data: any;
}

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | null = null;
  private socketEvents = new BehaviorSubject<SocketEvent>({
    type: '',
    data: null
  });

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket(): void {
    if (!this.socket) {
      this.socket = io(environment.apiUrl, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });

      this.socket.on('connect', () => {
        console.log('Socket connected');
      });

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      // Listen for all events
      this.socket.onAny((event: string, data: any) => {
        this.socketEvents.next({ type: event, data });
      });
    }
  }

  // Connect user to socket
  connectUser(userId: string): void {
    if (this.socket) {
      this.socket.emit('join', userId);
    }
  }

  // Disconnect user
  disconnectUser(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Listen for events
  listenForEvent(event: string): Observable<any> {
    return this.socketEvents.pipe(
      filter(({ type }) => type === event),
      map(({ data }) => data)
    );
  }

  // Emit events
  emitEvent(event: string, data: any): void {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  // Report status updates
  updateReportStatus(reportId: string, status: string, progress: number): void {
    this.emitEvent('report:status', {
      reportId,
      status,
      progress
    });
  }

  // Send notifications
  sendNotification(userId: string, message: string, type: string): void {
    this.emitEvent('notification:create', {
      userId,
      message,
      type
    });
  }
}
