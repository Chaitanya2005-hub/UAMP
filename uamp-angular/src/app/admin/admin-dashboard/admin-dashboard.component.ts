import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { NotificationsComponent } from '../../shared/components/notifications/notifications.component';
import { ExamManagementService } from '../../teacher/services/exam-management.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, AdminSidebarComponent, NotificationsComponent],
  template: `
    <div class="admin-layout">
      <app-admin-sidebar></app-admin-sidebar>
      <main class="admin-content">
        <div class="top-bar">
          <div class="container">
            <div class="notifications-wrapper">
              <app-notifications></app-notifications>
            </div>
          </div>
        </div>
        <div class="container">
          <div class="page-header">
            <h1>👨‍💼 Admin Dashboard</h1>
            <p>Overview of examination system</p>
          </div>

          <div class="stats-grid">
            <div class="stat-card glass-panel">
              <div class="stat-icon">📅</div>
              <div class="stat-info">
                <span class="stat-value">{{ scheduledExams() }}</span>
                <span class="stat-label">Scheduled Exams</span>
              </div>
            </div>

            <div class="stat-card glass-panel">
              <div class="stat-icon">📹</div>
              <div class="stat-info">
                <span class="stat-value">{{ liveExams() }}</span>
                <span class="stat-label">Live Exams</span>
              </div>
            </div>

            <div class="stat-card glass-panel">
              <div class="stat-icon">✅</div>
              <div class="stat-info">
                <span class="stat-value">{{ completedExams() }}</span>
                <span class="stat-label">Completed Exams</span>
              </div>
            </div>

            <div class="stat-card glass-panel">
              <div class="stat-icon">👥</div>
              <div class="stat-info">
                <span class="stat-value">{{ totalStudents() }}</span>
                <span class="stat-label">Total Students</span>
              </div>
            </div>
          </div>

          <div class="quick-actions">
            <h2>Quick Actions</h2>
            <div class="actions-grid">
              <a routerLink="/admin/schedule" class="action-card glass-panel">
                <span class="action-icon">📋</span>
                <span class="action-text">Schedule New Exam</span>
              </a>

              <a routerLink="/admin/approvals" class="action-card glass-panel">
                <span class="action-icon">✅</span>
                <span class="action-text">Review Approvals</span>
              </a>

              <a routerLink="/admin/live-audit" class="action-card glass-panel">
                <span class="action-icon">📹</span>
                <span class="action-text">Live Monitoring</span>
              </a>

              <a routerLink="/admin/audit-trail" class="action-card glass-panel">
                <span class="action-icon">📊</span>
                <span class="action-text">Audit Trail</span>
              </a>
            </div>
          </div>

          <div class="recent-activity glass-panel">
            <h2>Recent Activity</h2>
            <div class="activity-list">
              <div class="activity-item">
                <span class="activity-time">2 hours ago</span>
                <span class="activity-text">Exam "Data Structures Final" completed successfully</span>
              </div>
              <div class="activity-item">
                <span class="activity-time">5 hours ago</span>
                <span class="activity-text">Question paper approved for "Algorithms Midterm"</span>
              </div>
              <div class="activity-item">
                <span class="activity-time">1 day ago</span>
                <span class="activity-text">New exam scheduled: "Database Systems Quiz"</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .admin-layout {
      display: flex;
      min-height: 100vh;
    }

    .admin-content {
      flex: 1;
      margin-left: 280px;
      padding: 5rem 2rem 2rem 2rem;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .page-header h1 {
      margin: 0 0 0.5rem 0;
      color: #e6ebf5;
      font-size: 2rem;
    }

    .page-header p {
      margin: 0;
      color: #94a3b8;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .stat-icon {
      font-size: 2rem;
    }

    .stat-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: #e6ebf5;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #94a3b8;
    }

    .quick-actions {
      margin-bottom: 2rem;
    }

    .quick-actions h2 {
      margin: 0 0 1rem 0;
      color: #e6ebf5;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .action-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding: 1.5rem;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      text-decoration: none;
      color: #e6ebf5;
      transition: all 0.2s ease;
    }

    .action-card:hover {
      background: rgba(255, 255, 255, 0.08);
      transform: translateY(-2px);
    }

    .action-icon {
      font-size: 2rem;
    }

    .action-text {
      font-size: 0.875rem;
      font-weight: 500;
    }

    .recent-activity {
      padding: 1.5rem;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .recent-activity h2 {
      margin: 0 0 1rem 0;
      color: #e6ebf5;
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .activity-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      padding: 1rem;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.03);
    }

    .activity-time {
      font-size: 0.75rem;
      color: #94a3b8;
    }

    .activity-text {
      font-size: 0.875rem;
      color: #e6ebf5;
    }

    .glass-panel {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
    }

    .top-bar {
      position: fixed;
      top: 0;
      right: 0;
      left: 280px;
      background: rgba(15, 23, 42, 0.95);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      z-index: 100;
      padding: 12px 24px;
    }

    .notifications-wrapper {
      display: flex;
      justify-content: flex-end;
    }

    @media (max-width: 768px) {
      .admin-content {
        margin-left: 240px;
        padding: 1rem;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .actions-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  scheduledExams = signal(0);
  liveExams = signal(0);
  completedExams = signal(0);
  totalStudents = signal(0);

  constructor(private examManagementService: ExamManagementService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.examManagementService.getActiveExams().subscribe({
      next: (exams) => {
        this.scheduledExams.set(exams.filter(e => e.status === 'scheduled').length);
        this.liveExams.set(exams.filter(e => e.status === 'live').length);
        this.completedExams.set(exams.filter(e => e.status === 'completed').length);
        this.totalStudents.set(exams.reduce((sum, exam) => sum + (exam.student_count || 0), 0));
      },
      error: (err) => {
        console.error('Error loading dashboard data:', err);
      }
    });
  }
}