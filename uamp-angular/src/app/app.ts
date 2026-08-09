import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { UserRole } from './core/models';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('uamp-angular');
  sidebarOpen = signal(false);
  notifications = signal<any[]>([]);
  notificationsOpen = signal(false);

  constructor(protected authService: AuthService, private http: HttpClient) {}

  ngOnInit(): void { if (this.authService.authenticated()) this.loadNotifications(); }

  loadNotifications(): void { this.http.get<any[]>('/api/notifications').subscribe({ next: rows => this.notifications.set(rows), error: () => this.notifications.set([]) }); }
  unreadNotifications(): number { return this.notifications().filter(item => !item.readAt).length; }
  toggleNotifications(): void { this.notificationsOpen.set(!this.notificationsOpen()); if (this.notificationsOpen()) this.loadNotifications(); }
  markRead(item: any): void { if (item.readAt) return; this.http.post(`/api/notifications/${item.id}/read`, {}).subscribe(() => this.notifications.update(rows => rows.map(row => row.id === item.id ? { ...row, readAt: new Date().toISOString() } : row))); }

  navItems(role: UserRole | null): { label: string; icon: string; link: string }[] {
    switch (role) {
      case 'admin':
        return [
          { label: 'Approvals', icon: '✓', link: '/admin/approvals' },
          { label: 'Manage Exams', icon: '▣', link: '/admin/exams' },
          { label: 'Live Audit', icon: '◉', link: '/admin/live-audit' },
          { label: 'Intervention', icon: '⚡', link: '/admin/intervention' },
          { label: 'Audit Trail', icon: '☷', link: '/admin/audit-trail' },
        ];
      case 'teacher':
        return [
          { label: 'Exam Schedule', icon: '▣', link: '/teacher/schedule' },
          { label: 'Upload Paper', icon: '↑', link: '/teacher/question-paper/upload' },
          { label: 'MCQ Builder', icon: '☷', link: '/teacher/question-paper/mcq-builder' },
          { label: 'AI Generator', icon: '✦', link: '/teacher/question-paper/ai-generator' },
          { label: 'Live Proctoring', icon: '◉', link: '/teacher/monitoring/live-proctoring' },
          { label: 'Incidents', icon: '!', link: '/teacher/monitoring/incident-timeline' },
        ];
      case 'student':
        return [{ label: 'My Exams', icon: '▣', link: '/student/dashboard' }];
      default:
        return [];
    }
  }

  roleLabel(role: UserRole | null): string {
    return role ? `${role.charAt(0).toUpperCase()}${role.slice(1)} Portal` : 'UAMP';
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  logout(): void {
    this.closeSidebar();
    this.authService.logout();
  }
}
