import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-manage-exams',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="manage-exams-container">
      <div class="glass-panel">
        <div class="header-section">
          <div>
            <h2>Manage Exams</h2>
            <p class="subtitle">View scheduled, live, and completed exams</p>
          </div>
          <button routerLink="/admin/schedule" class="btn-primary">
            + Schedule New Exam
          </button>
        </div>

        <div class="exams-list" *ngIf="exams.length > 0; else emptyState">
          <div class="exam-card" *ngFor="let exam of exams">
            <div class="exam-header">
              <div class="exam-title-group">
                <h3>{{ exam.title }}</h3>
                <span class="exam-meta">
                  Question Paper: {{ exam.question_paper_title }}
                </span>
              </div>
              <span class="status-badge" 
                    [class.status-scheduled]="exam.status === 'scheduled'"
                    [class.status-live]="exam.status === 'live'"
                    [class.status-completed]="exam.status === 'completed'"
                    [class.status-cancelled]="exam.status === 'cancelled'">
                {{ exam.status | uppercase }}
              </span>
            </div>

            <div class="exam-details">
              <div class="detail-item">
                <span class="label">Duration:</span>
                <span class="value">{{ exam.duration_minutes }} mins</span>
              </div>
              <div class="detail-item">
                <span class="label">Scheduled Start:</span>
                <span class="value">{{ exam.scheduled_start | date:'medium' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Scheduled End:</span>
                <span class="value">{{ exam.scheduled_end | date:'medium' }}</span>
              </div>
            </div>

            <div class="exam-actions">
              <button *ngIf="exam.status === 'scheduled'" 
                      (click)="startExam(exam)" 
                      class="btn-action btn-start">
                Start Exam Now
              </button>
              <button *ngIf="exam.status === 'scheduled'" (click)="cancelExam(exam)" class="btn-action btn-end">Cancel</button>
              <button (click)="viewAttendance(exam)" class="btn-action">Attendance</button>
              <button *ngIf="exam.status === 'live'" 
                      (click)="endExam(exam)" 
                      class="btn-action btn-end">
                Force End Exam
              </button>
              <span class="action-meta" *ngIf="exam.status === 'completed'">
                Exam Completed
              </span>
              <span class="action-meta" *ngIf="exam.status === 'cancelled'">
                Exam Cancelled
              </span>
            </div>
          </div>
        </div>

        <ng-template #emptyState>
          <div class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <h3>No Scheduled Exams</h3>
            <p>Schedule a new exam timetable using the button above.</p>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .manage-exams-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .glass-panel {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 22px;
      backdrop-filter: blur(18px) saturate(140%);
      padding: 2rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.37);
    }

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    h2 {
      margin: 0 0 0.25rem 0;
      color: #e6ebf5;
      font-size: 1.75rem;
    }

    .subtitle {
      color: #94a3b8;
      margin: 0;
    }

    .btn-primary {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      background: #6366f1;
      color: white;
      font-weight: 500;
      border: none;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-primary:hover {
      background: #5558e3;
      transform: translateY(-1px);
    }

    .exams-list {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.25rem;
    }

    .exam-card {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 1.5rem;
      transition: all 0.15s ease;
    }

    .exam-card:hover {
      background: rgba(255, 255, 255, 0.06);
    }

    .exam-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.25rem;
    }

    .exam-title-group h3 {
      margin: 0 0 0.25rem 0;
      color: #e6ebf5;
      font-size: 1.25rem;
    }

    .exam-meta {
      color: #94a3b8;
      font-size: 0.875rem;
    }

    .status-badge {
      padding: 0.375rem 0.875rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 700;
    }

    .status-badge.status-scheduled {
      background: rgba(251, 191, 36, 0.15);
      color: #fbbf24;
    }

    .status-badge.status-live {
      background: rgba(52, 211, 153, 0.15);
      color: #34d399;
    }

    .status-badge.status-completed {
      background: rgba(148, 163, 184, 0.15);
      color: #94a3b8;
    }

    .status-badge.status-cancelled {
      background: rgba(248, 113, 113, 0.15);
      color: #f87171;
    }

    .exam-details {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-bottom: 1.25rem;
      padding-bottom: 1.25rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .detail-item .label {
      color: #94a3b8;
      font-size: 0.875rem;
    }

    .detail-item .value {
      color: #e6ebf5;
      font-weight: 500;
    }

    .exam-actions {
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }

    .btn-action {
      padding: 0.6rem 1.25rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.15s ease;
    }

    .btn-start {
      background: rgba(52, 211, 153, 0.2);
      color: #34d399;
      border: 1px solid rgba(52, 211, 153, 0.3);
    }

    .btn-start:hover {
      background: rgba(52, 211, 153, 0.35);
      transform: translateY(-1px);
    }

    .btn-end {
      background: rgba(248, 113, 113, 0.2);
      color: #f87171;
      border: 1px solid rgba(248, 113, 113, 0.3);
    }

    .btn-end:hover {
      background: rgba(248, 113, 113, 0.35);
      transform: translateY(-1px);
    }

    .action-meta {
      color: #94a3b8;
      font-size: 0.875rem;
      font-style: italic;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      gap: 1rem;
      color: #94a3b8;
    }

    .empty-state svg {
      width: 64px;
      height: 64px;
      opacity: 0.4;
    }

    .empty-state h3 {
      color: #e6ebf5;
      margin: 0;
    }

    .empty-state p {
      margin: 0;
      text-align: center;
    }
  `]
})
export class ManageExamsComponent implements OnInit {
  exams: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadExams();
  }

  loadExams(): void {
    this.http.get<any[]>('/api/exams').subscribe({
      next: (data) => this.exams = data,
      error: (err) => console.error('Failed to load exams', err)
    });
  }

  startExam(exam: any): void {
    if (confirm(`Are you sure you want to start the exam "${exam.title}" immediately? This will make it active for all assigned students right now.`)) {
      this.http.post(`/api/exams/${exam.id}/start`, {}).subscribe({
        next: () => {
          this.loadExams();
        },
        error: (err) => {
          console.error('Failed to start exam', err);
          alert('Error starting exam');
        }
      });
    }
  }

  endExam(exam: any): void {
    if (confirm(`Are you sure you want to end the live exam "${exam.title}"? This will terminate the slot for all students.`)) {
      this.http.post(`/api/exams/${exam.id}/end`, {}).subscribe({
        next: () => {
          this.loadExams();
        },
        error: (err) => {
          console.error('Failed to end exam', err);
          alert('Error ending exam');
        }
      });
    }
  }

  cancelExam(exam: any): void {
    if (!confirm(`Cancel "${exam.title}"? Assigned students will no longer be able to start it.`)) return;
    this.http.post(`/api/exams/${exam.id}/cancel`, {}).subscribe({
      next: () => this.loadExams(),
      error: (err) => alert(err.error?.error || 'Could not cancel exam')
    });
  }

  viewAttendance(exam: any): void {
    this.http.get<any[]>(`/api/exams/${exam.id}/attendance`).subscribe({
      next: rows => {
        const summary = rows.map(row => `${row.name}: ${row.submissionStatus || 'absent'}`).join('\n') || 'No assigned students.';
        alert(`Attendance — ${exam.title}\n\n${summary}`);
      },
      error: (err) => alert(err.error?.error || 'Could not load attendance')
    });
  }
}
