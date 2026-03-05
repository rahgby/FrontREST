import { Component, HostListener } from '@angular/core';
import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent {
  showNotifications = false;
  
  // Datos de ejemplo
  notifications = [
    {
      id: 1,
      title: 'Nuevo pedido',
      message: 'Mesa 5 - 2 hamburguesas',
      time: 'Hace 2 min',
      read: false,
      icon: 'fastfood'
    },
    {
      id: 2,
      title: 'Pago registrado',
      message: 'Mesa 3 - S/ 45.00',
      time: 'Hace 15 min',
      read: false,
      icon: 'payments'
    }
  ];

  constructor(public authService: AuthService) {}

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  markAsRead(notification: any): void {
    notification.read = true;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.notification-wrapper')) {
      this.showNotifications = false;
    }
  }
}