import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface Notification {
  id: string;
  notification_type: string;
  payload: any;
  read: boolean;
  read_at: string | null;
  created_at: string;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notifications-container">
      <div class="notifications-header">
        <h3>🔔 Notifications</h3>
        <button
          *ngIf="unreadCount() > 0"
          (click)="markAllAsRead()"
          class="mark-read-btn"
        >
          Mark all as read
        </button>
      </div>

      <div class="notifications-list" *ngIf="!loading()">
        <div
          *ngFor="let notification of notifications()"
          class="notification-item"
          [class.unread]="!notification.read"
          (click)="markAsRead(notification.id)"
        >
          <div class="notification-icon">
            <span [class]="getNotificationIcon(notification.notification_type)"></span>
          </div>
          <div class="notification-content">
            <div class="notification-title">
              {{ getNotificationTitle(notification.notification_type) }}
            </div>
            <div class="notification-message">
              {{ getNotificationMessage(notification) }}
            </div>
            <div class="notification-time">
              {{ formatTime(notification.created_at) }}
            </div>
          </div>
          <div class="notification-status">
            <div *ngIf="!notification.read" class="unread-dot"></div>
          </div>
        </div>

        <div *ngIf="notifications().length === 0" class="no-notifications">
          <p>No notifications</p>
        </div>
      </div>

      <div *ngIf="loading()" class="loading">
        <p>Loading notifications...</p>
      </div>
    </div>
  `,
  styles: [`
    .notifications-container {
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      backdrop-filter: blur(10px);
      max-width: 400px;
      max-height: 500px;
      overflow: hidden;
    }

    .notifications-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .notifications-header h3 {
      margin: 0;
      color: #e6ebf5;
      font-size: 1rem;
    }

    .mark-read-btn {
      background: rgba(99, 102, 241, 0.2);
      color: #6366f1;
      border: none;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.75rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .mark-read-btn:hover {
      background: rgba(99, 102, 241, 0.3);
    }

    .notifications-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .notification-item {
      display: flex;
      gap: 12px;
      padding: 12px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .notification-item:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    .notification-item.unread {
      background: rgba(99, 102, 241, 0.1);
    }

    .notification-icon {
      font-size: 1.5rem;
    }

    .notification-content {
      flex: 1;
    }

    .notification-title {
      font-weight: 600;
      color: #e6ebf5;
      font-size: 0.875rem;
      margin-bottom: 4px;
    }

    .notification-message {
      color: #94a3b8;
      font-size: 0.8rem;
      margin-bottom: 4px;
    }

    .notification-time {
      color: #64748b;
      font-size: 0.75rem;
    }

    .notification-status {
      display: flex;
      align-items: center;
    }

    .unread-dot {
      width: 8px;
      height: 8px;
      background: #6366f1;
      border-radius: 50%;
    }

    .no-notifications {
      text-align: center;
      padding: 32px;
      color: #94a3b8;
    }

    .loading {
      text-align: center;
      padding: 32px;
      color: #94a3b8;
    }

    .icon-hall-ticket::before { content: '🎟'; }
    .icon-exam-published::before { content: '📅'; }
    .icon-grade-released::before { content: '✅'; }
    .icon-approval-needed::before { content: '⏳'; }
    .icon-approval-granted::before { content: '🎉'; }
    .icon-approval-rejected::before { content: '❌'; }
    .icon-exam-reminder::before { content: '⏰'; }
    .icon-default::before { content: '📌'; }
  `]
})
export class NotificationsComponent implements OnInit {
  notifications = signal<Notification[]>([]);
  loading = signal(true);
  unreadCount = signal(0);

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    const token = localStorage.getItem('auth_token');
    this.http.get<Notification[]>(`${environment.apiBaseUrl}/notifications`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: (data) => {
        this.notifications.set(data);
        this.unreadCount.set(data.filter(n => !n.read).length);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load notifications:', err);
        this.loading.set(false);
      }
    });
  }

  markAsRead(notificationId: string): void {
    const token = localStorage.getItem('auth_token');
    this.http.post(`${environment.apiBaseUrl}/notifications/${notificationId}/read`, {}, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: () => {
        this.notifications.update(notifs =>
          notifs.map(n => n.id === notificationId ? { ...n, read: true, read_at: new Date().toISOString() } : n)
        );
        this.unreadCount.update(count => Math.max(0, count - 1));
      },
      error: (err) => console.error('Failed to mark notification as read:', err)
    });
  }

  markAllAsRead(): void {
    const token = localStorage.getItem('auth_token');
    this.http.post(`${environment.apiBaseUrl}/notifications/mark-all-read`, {}, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: () => {
        this.notifications.update(notifs =>
          notifs.map(n => ({ ...n, read: true, read_at: new Date().toISOString() }))
        );
        this.unreadCount.set(0);
      },
      error: (err) => console.error('Failed to mark all notifications as read:', err)
    });
  }

  getNotificationIcon(type: string): string {
    const iconMap: Record<string, string> = {
      'hall_ticket_released': 'icon-hall-ticket',
      'exam_published': 'icon-exam-published',
      'grade_released': 'icon-grade-released',
      'approval_needed': 'icon-approval-needed',
      'approval_granted': 'icon-approval-granted',
      'approval_rejected': 'icon-approval-rejected',
      'exam_reminder': 'icon-exam-reminder',
      'exam_scheduled': 'icon-exam-published',
      'schedule': 'icon-exam-published',
      'warning': 'icon-approval-needed',
      'info': 'icon-default'
    };
    return iconMap[type] || 'icon-default';
  }

  getNotificationTitle(type: string): string {
    const titleMap: Record<string, string> = {
      'hall_ticket_released': 'Hall Ticket Available',
      'exam_published': 'New Exam Published',
      'grade_released': 'Grades Released',
      'approval_needed': 'Approval Required',
      'approval_granted': 'Approval Granted',
      'approval_rejected': 'Approval Rejected',
      'exam_reminder': 'Exam Reminder',
      'exam_scheduled': 'New Exam Scheduled',
      'schedule': 'Exam Schedule Update',
      'warning': 'Warning',
      'info': 'Information'
    };
    return titleMap[type] || 'Notification';
  }

  getNotificationMessage(notification: Notification): string {
    if (notification.payload) {
      if (notification.payload.exam_title) {
        return notification.payload.exam_title;
      }
      if (notification.payload.message) {
        return notification.payload.message;
      }
    }
    return 'New notification';
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }
}