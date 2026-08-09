import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-live-audit-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="live-audit-dashboard-container">
      <div class="dashboard-header">
        <h2>Live Audit Dashboard</h2>
        <div class="header-controls">
          <select class="exam-select" [(ngModel)]="selectedExam">
            <option value="">All Active Exams</option>
            <option *ngFor="let exam of activeExams" [value]="exam.id">
              {{ exam.title }} - {{ exam.course }}
            </option>
          </select>
          <button class="btn-refresh" (click)="refreshData()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M23 4v6h-6"/>
              <path d="M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            Refresh
          </button>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card stat-primary">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-label">Active Students</span>
            <span class="stat-value">{{ stats.activeStudents }}</span>
          </div>
        </div>

        <div class="stat-card stat-warning">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-label">Warnings</span>
            <span class="stat-value">{{ stats.warnings }}</span>
          </div>
        </div>

        <div class="stat-card stat-critical">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-label">Critical Incidents</span>
            <span class="stat-value">{{ stats.critical }}</span>
          </div>
        </div>

        <div class="stat-card stat-success">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-label">Completed</span>
            <span class="stat-value">{{ stats.completed }}</span>
          </div>
        </div>
      </div>

      <div class="dashboard-content">
        <div class="activity-feed">
          <h3>Live Activity Feed</h3>
          <div class="feed-list">
            <div class="feed-item" 
                 *ngFor="let activity of recentActivities"
                 [class.activity-critical]="activity.severity === 'critical'"
                 [class.activity-warning]="activity.severity === 'warning'">
              <div class="feed-time">{{ activity.time }}</div>
              <div class="feed-content">
                <div class="feed-header">
                  <span class="feed-type">{{ activity.type }}</span>
                  <span class="feed-student">{{ activity.studentName }}</span>
                </div>
                <p class="feed-description">{{ activity.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="exam-list">
          <h3>Active Exams</h3>
          <div class="exam-item" *ngFor="let exam of activeExams">
            <div class="exam-info">
              <h4>{{ exam.title }}</h4>
              <span class="exam-course">{{ exam.course }}</span>
            </div>
            <div class="exam-progress">
              <div class="progress-bar">
                <div class="progress-fill" [style.width.%]="exam.progress"></div>
              </div>
              <span class="progress-text">{{ exam.progress }}% complete</span>
            </div>
            <div class="exam-actions">
              <button class="btn-view" (click)="viewExamDetails(exam)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                View
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .live-audit-dashboard-container {
      padding: 2rem;
      height: calc(100vh - 120px);
      display: flex;
      flex-direction: column;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    h2 {
      margin: 0;
      color: #e6ebf5;
      font-size: 1.75rem;
    }

    .header-controls {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .exam-select {
      padding: 0.75rem 1rem;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 8px;
      color: #e6ebf5;
      font-size: 1rem;
      min-width: 250px;
    }

    .btn-refresh {
      padding: 0.75rem 1rem;
      background: rgba(99, 102, 241, 0.1);
      color: #6366f1;
      border: 1px solid rgba(99, 102, 241, 0.3);
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.15s ease;
    }

    .btn-refresh:hover {
      background: rgba(99, 102, 241, 0.2);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 14px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-card.stat-primary .stat-icon {
      background: rgba(99, 102, 241, 0.2);
      color: #6366f1;
    }

    .stat-card.stat-warning .stat-icon {
      background: rgba(251, 191, 36, 0.2);
      color: #fbbf24;
    }

    .stat-card.stat-critical .stat-icon {
      background: rgba(248, 113, 113, 0.2);
      color: #f87171;
    }

    .stat-card.stat-success .stat-icon {
      background: rgba(52, 211, 153, 0.2);
      color: #34d399;
    }

    .stat-icon svg {
      width: 24px;
      height: 24px;
    }

    .stat-content {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .stat-label {
      color: #94a3b8;
      font-size: 0.875rem;
    }

    .stat-value {
      color: #e6ebf5;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .dashboard-content {
      flex: 1;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      overflow: hidden;
    }

    .activity-feed,
    .exam-list {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    h3 {
      color: #e6ebf5;
      margin: 0 0 1rem 0;
      font-size: 1.25rem;
    }

    .feed-list {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .feed-item {
      padding: 1rem;
      background: rgba(255, 255, 255, 0.04);
      border-radius: 8px;
      border-left: 3px solid transparent;
    }

    .feed-item.activity-critical {
      border-left-color: #f87171;
    }

    .feed-item.activity-warning {
      border-left-color: #fbbf24;
    }

    .feed-time {
      color: #94a3b8;
      font-size: 0.75rem;
      margin-bottom: 0.5rem;
    }

    .feed-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.25rem;
    }

    .feed-type {
      color: #e6ebf5;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .feed-student {
      color: #94a3b8;
      font-size: 0.875rem;
    }

    .feed-description {
      color: #94a3b8;
      margin: 0;
      font-size: 0.875rem;
      line-height: 1.4;
    }

    .exam-item {
      padding: 1rem;
      background: rgba(255, 255, 255, 0.04);
      border-radius: 8px;
      margin-bottom: 0.75rem;
    }

    .exam-info h4 {
      color: #e6ebf5;
      margin: 0 0 0.25rem 0;
      font-size: 1rem;
    }

    .exam-course {
      color: #94a3b8;
      font-size: 0.875rem;
    }

    .exam-progress {
      margin: 0.75rem 0;
    }

    .progress-bar {
      height: 6px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
      overflow: hidden;
      margin-bottom: 0.25rem;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #6366f1, #22d3ee);
      transition: width 0.3s ease;
    }

    .progress-text {
      color: #94a3b8;
      font-size: 0.75rem;
    }

    .exam-actions {
      display: flex;
      justify-content: flex-end;
    }

    .btn-view {
      padding: 0.5rem 1rem;
      background: rgba(99, 102, 241, 0.1);
      color: #6366f1;
      border: 1px solid rgba(99, 102, 241, 0.3);
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      transition: all 0.15s ease;
    }

    .btn-view:hover {
      background: rgba(99, 102, 241, 0.2);
    }

    svg {
      width: 18px;
      height: 18px;
    }
  `]
})
export class LiveAuditDashboardComponent implements OnInit {
  selectedExam = '';
  activeExams: any[] = [];
  stats = {
    activeStudents: 0, warnings: 0, critical: 0, completed: 0
  };
  recentActivities: any[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.refreshData();
  }

  refreshData(): void {
    this.http.get<any[]>('/api/exams/active').subscribe(exams => this.activeExams = exams.map(exam => ({ ...exam, progress: 0 })));
    this.http.get<any>('/api/admin/dashboard/stats').subscribe(stats => this.stats = stats);
    this.http.get<any[]>('/api/admin/dashboard/activity').subscribe(rows => this.recentActivities = rows.map(row => ({ ...row, time: new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })));
  }

  viewExamDetails(exam: any): void {
    this.router.navigate(['/admin/intervention'], { queryParams: { exam: exam.id } });
  }
}
