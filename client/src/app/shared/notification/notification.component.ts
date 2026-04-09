import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, NotificationMessage } from '../../core/notification.service'; 

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css'
})
export class NotificationComponent {
  notifica: NotificationMessage | null = null;

  constructor(private notificationService: NotificationService) {
    this.notificationService.notifica$.subscribe(messaggio => {
      this.notifica = messaggio;
    });
  }

  chiudi() {
    this.notificationService.chiudi();
  }
}