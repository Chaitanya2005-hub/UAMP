import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TeacherSidebarComponent } from '../teacher-sidebar/teacher-sidebar.component';
import { NotificationsComponent } from '../../shared/components/notifications/notifications.component';
import { ExamManagementService } from '../services/exam-management.service';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, TeacherSidebarComponent, NotificationsComponent],
  template: `
    <div class="teacher-layout">
      <app-teacher-sidebar></app-teacher-sidebar>
      <main class="teacher-content">
        <div class="top-bar">
          <div class="container">
            <div class="notifications-wrapper">
              <app-notifications></app-notifications>
            </div>
          </div>
        </div>
        <div class="container">
          <div class="page-header">
            <h1>👨‍🏫 Teacher Dashboard</h1>
            <p>Overview of your examinations and question papers</p>
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
              <div class="stat-icon">📝</div>
              <div class="stat-info">
                <span class="stat-value">{{ questionPapers() }}</span>
                <span class="stat-label">Question Papers</span>
              </div>
            </div>

            <div class="stat-card glass-panel">
              <div class="stat-icon">👥</div>
              <div class="stat-info">
                <span class="stat-value">{{ totalStudents() }}</span>
                <span class="stat-label">Enrolled Students</span>
              </div>
            </div>
          </div>

          <div class="quick-actions">
            <h2>Quick Actions</h2>
            <div class="actions-grid">
              <a routerLink="/teacher/schedule" class="action-card glass-panel">
                <span class="action-icon">📋</span>
                <span class="action-text">Schedule Exam</span>
              </a>

              <a routerLink="/teacher/question-paper/upload" class="action-card glass-panel">
                <span class="action-icon">📤</span>
                <span class="action-text">Upload Paper</span>
              </a>

              <a routerLink="/teacher/question-paper/mcq-builder" class="action-card glass-panel">
                <span class="action-icon">✏️</span>
                <span class="action-text">MCQ Builder</span>
              </a>

              <a routerLink="/teacher/monitoring/live-proctoring" class="action-card glass-panel">
                <span class="action-icon">📹</span>
                <span class="action-text">Live Monitoring</span>
              </a>
            </div>
          </div>

          <div class="upcoming-exams glass-panel">
            <h2>Upcoming Exams</h2>
            <div class="exams-list" *ngIf="upcomingExamsList().length > 0; else noExams">
              <div class="exam-item" *ngFor="let exam of upcomingExamsList()">
                <div class="exam-info">
                  <h3>{{ exam.title }}</h3>
                  <p>{{ exam.course }}</p>
                </div>
                <div class="exam-meta">
                  <span class="exam-time">{{ exam.scheduled_start | date:'short' }}</span>
                  <span class="exam-duration">{{ exam.duration_minutes }} mins</span>
                </div>
              </div>
            </div>
            <ng-template #noExams>
              <p class="no-exams">No upcoming exams scheduled</p>
            </ng-template>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .teacher-layout {
      display: flex;
      min-height: 100vh;
    }

    .teacher-content {
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

    .upcoming-exams {
      padding: 1.5rem;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .upcoming-exams h2 {
      margin: 0 0 1rem 0;
      color: #e6ebf5;
    }

    .exams-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .exam-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.03);
    }

    .exam-info h3 {
      margin: 0 0 0.25rem 0;
      color: #e6ebf5;
      font-size: 1rem;
    }

    .exam-info p {
      margin: 0;
      color: #94a3b8;
      font-size: 0.875rem;
    }

    .exam-meta {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .exam-time {
      font-size: 0.875rem;
      color: #94a3b8;
    }

    .exam-duration {
      font-size: 0.875rem;
      color: #34d399;
      font-weight: 500;
    }

    .no-exams {
      text-align: center;
      padding: 2rem;
      color: #94a3b8;
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
      .teacher-content {
        margin-left: 240px;
        padding: 1rem;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .actions-grid {
        grid-template-columns: 1fr;
      }

      .exam-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }
    }
  `]
})
export class TeacherDashboardComponent implements OnInit {
  scheduledExams = signal(0);
  liveExams = signal(0);
  questionPapers = signal(0);
  totalStudents = signal(0);
  upcomingExamsList = signal<any[]>([]);

  constructor(private examManagementService: ExamManagementService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.examManagementService.getActiveExams().subscribe({
      next: (exams) => {
        this.scheduledExams.set(exams.filter(e => e.status === 'scheduled').length);
        this.liveExams.set(exams.filter(e => e.status === 'live').length);
        this.totalStudents.set(exams.reduce((sum, exam) => sum + (exam.student_count || 0), 0));
        this.upcomingExamsList.set(exams.filter(e => e.status === 'scheduled').slice(0, 5));
        this.questionPapers.set(exams.length); // Using exam count as proxy for papers
      },
      error: (err) => {
        console.error('Error loading dashboard data:', err);
      }
    });
  }
}