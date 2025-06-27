import { Component, OnInit, OnDestroy } from '@angular/core';
import { SocketService } from '../../core/services/socket.service';
import { Subscription } from 'rxjs';
import { ToastService } from '../services/toast.service';

interface Notification {
  userId: string;
  message: string;
  type: string;
  timestamp: Date;
}

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit, OnDestroy {
  private notificationSubscription: Subscription | null = null;

  constructor(
    private socketService: SocketService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    // Listen for notifications
    this.notificationSubscription = this.socketService
      .listenForEvent('notification:received')
      .subscribe((notification: Notification) => {
        this.handleNotification(notification);
      });
  }

  ngOnDestroy(): void {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
  }

  private handleNotification(notification: Notification): void {
    const { message, type } = notification;
    
    switch (type) {
      case 'success':
        this.toastService.showSuccess(message);
        break;
      case 'error':
        this.toastService.showError(message);
        break;
      case 'warning':
        this.toastService.showWarning(message);
        break;
      case 'info':
      default:
        this.toastService.showInfo(message);
    }
  }
}
