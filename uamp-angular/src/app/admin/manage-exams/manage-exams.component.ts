import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ExamManagementService, Exam } from '../../teacher/services/exam-management.service';

@Component({
  selector: 'app-manage-exams',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="manage-exams-container">
      <div class="glass-panel">
        <div class="header-section">
          <div>
            <h2>📅 Manage Exams</h2>
            <p class="subtitle">View scheduled, live, and completed exams</p>
          </div>
          <button routerLink="/admin/schedule" class="btn-primary">
            + Schedule New Exam
          </button>
        </div>

        <div class="glass-panel exams-container" *ngIf="!loading()">
          <div class="exams-list" *ngIf="exams().length > 0; else emptyState">
            <div class="exam-card" *ngFor="let exam of exams()">
              <div class="exam-header">
                <h3>{{ exam.title }}</h3>
                <span class="badge" 
                      [class.scheduled]="exam.status === 'scheduled'"
                      [class.live]="exam.status === 'live'"
                      [class.completed]="exam.status === 'completed'"
                      [class.cancelled]="exam.status === 'cancelled'">
                  {{ exam.status | uppercase }}
                </span>
              </div>

              <div class="exam-details">
                <div class="detail-item">
                  <span class="label">Course:</span>
                  <span class="value">{{ exam.course }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Duration:</span>
                  <span class="value">{{ exam.duration_minutes }} minutes</span>
                </div>
                <div class="detail-item">
                  <span class="label">Scheduled Start:</span>
                  <span class="value">{{ exam.scheduled_start | date:'medium' }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Scheduled End:</span>
                  <span class="value">{{ exam.scheduled_end | date:'medium' }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Proctoring:</span>
                  <span class="value">{{ exam.proctoring_enabled ? 'Enabled' : 'Disabled' }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Registered Students:</span>
                  <span class="value">{{ exam.student_count || 0 }}</span>
                </div>
              </div>

              <div class="exam-actions" *ngIf="exam.status === 'scheduled'">
                <button
                  class="btn btn-primary start-btn"
                  (click)="startExam(exam.id)"
                  [disabled]="startingExam() === exam.id"
                >
                  {{ startingExam() === exam.id ? 'Starting...' : '▶ Start Exam Now' }}
                </button>
                <button
                  class="btn btn-secondary"
                  (click)="cancelExam(exam.id)"
                >
                  ❌ Cancel Exam
                </button>
                <button
                  class="btn btn-secondary"
                  (click)="viewAttendance(exam.id)"
                >
                  👥 Attendance
                </button>
              </div>

              <div class="exam-actions" *ngIf="exam.status === 'live'">
                <button
                  class="btn btn-success"
                  (click)="goToMonitoring(exam.id)"
                >
                  📹 Monitor Live Exam
                </button>
                <button
                  class="btn btn-danger"
                  (click)="endExam(exam.id)"
                  [disabled]="endingExam() === exam.id"
                >
                  {{ endingExam() === exam.id ? 'Ending...' : '⏹ Force End Exam' }}
                </button>
              </div>

              <div class="exam-actions" *ngIf="exam.status === 'completed'">
                <span class="action-meta">✅ Exam Completed</span>
                <button
                  class="btn btn-secondary"
                  (click)="viewAttendance(exam.id)"
                >
                  👥 View Attendance
                </button>
              </div>

              <div class="exam-actions" *ngIf="exam.status === 'cancelled'">
                <span class="action-meta">❌ Exam Cancelled</span>
              </div>
            </div>
          </div>

          <ng-template #emptyState>
            <div class="empty-state">
              <p>No scheduled exams found.</p>
            </div>
          </ng-template>
        </div>

        <div *ngIf="loading()">
          <p class="loading">Loading exams...</p>
        </div>

        <div *ngIf="error()">
          <p class="error">{{ error() }}</p>
        </div>
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

    .exams-container {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 20px;
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
      align-items: center;
      margin-bottom: 1.25rem;
    }

    .exam-header h3 {
      margin: 0;
      color: #e6ebf5;
      font-size: 1.25rem;
    }

    .badge {
      padding: 0.375rem 0.875rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    .badge.scheduled {
      background: rgba(251, 191, 36, 0.15);
      color: #fbbf24;
    }

    .badge.live {
      background: rgba(52, 211, 153, 0.15);
      color: #34d399;
    }

    .badge.completed {
      background: rgba(148, 163, 184, 0.15);
      color: #94a3b8;
    }

    .badge.cancelled {
      background: rgba(248, 113, 113, 0.15);
      color: #f87171;
    }

    .exam-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
      margin-bottom: 16px;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
    }

    .detail-item .label {
      font-size: 0.75rem;
      color: #94a3b8;
      margin-bottom: 4px;
    }

    .detail-item .value {
      font-size: 0.875rem;
      color: #e6ebf5;
      font-weight: 500;
    }

    .exam-actions {
      display: flex;
      gap: 10px;
      padding-top: 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    .start-btn {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border: none;
    }

    .start-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }

    .btn {
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      border: none;
    }

    .btn-secondary {
      background: #6b7280;
      color: white;
    }

    .btn-success {
      background: #10b981;
      color: white;
    }

    .btn-danger {
      background: #ef4444;
      color: white;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .action-meta {
      color: #94a3b8;
      font-size: 0.875rem;
      font-style: italic;
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #94a3b8;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 12px;
    }

    .loading, .error {
      text-align: center;
      padding: 40px 20px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 12px;
    }

    .error {
      color: #ef4444;
    }

    @media (max-width: 768px) {
      .exam-details {
        grid-template-columns: 1fr;
      }

      .exam-actions {
        flex-direction: column;
      }

      .exam-actions button {
        width: 100%;
      }
    }
  `]
})
export class ManageExamsComponent implements OnInit {
  exams = signal<Exam[]>([]);
  loading = signal(true);
  error = signal('');
  startingExam = signal<string | null>(null);
  endingExam = signal<string | null>(null);

  constructor(private examManagementService: ExamManagementService) {}

  ngOnInit(): void {
    this.loadExams();
  }

  loadExams(): void {
    this.loading.set(true);
    this.error.set('');

    this.examManagementService.getActiveExams().subscribe({
      next: (exams) => {
        this.exams.set(exams);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load exams. Please try again.');
        this.loading.set(false);
        console.error('Error loading exams:', err);
      }
    });
  }

  startExam(examId: string): void {
    if (!confirm('Are you sure you want to start this exam now? This will begin the exam immediately for all registered students.')) {
      return;
    }

    this.startingExam.set(examId);

    this.examManagementService.startExam(examId).subscribe({
      next: (response) => {
        this.startingExam.set(null);
        console.log('Exam start response:', response);
        // Reload exams after a short delay to ensure server has updated
        setTimeout(() => {
          this.loadExams();
        }, 1000);
        alert('Exam started successfully! Students can now enter the exam lobby.');
      },
      error: (err) => {
        this.startingExam.set(null);
        alert('Failed to start exam: ' + (err.error?.error || err.message));
        console.error('Error starting exam:', err);
      }
    });
  }

  endExam(examId: string): void {
    if (!confirm('Are you sure you want to end this exam? This will immediately stop the exam for all students.')) {
      return;
    }

    this.endingExam.set(examId);

    this.examManagementService.endExam(examId).subscribe({
      next: () => {
        this.endingExam.set(null);
        this.loadExams();
        alert('Exam ended successfully!');
      },
      error: (err) => {
        this.endingExam.set(null);
        alert('Failed to end exam: ' + (err.error?.error || err.message));
        console.error('Error ending exam:', err);
      }
    });
  }

  cancelExam(examId: string): void {
    if (!confirm('Are you sure you want to cancel this exam? Assigned students will no longer be able to start it.')) {
      return;
    }

    // Implement cancel exam API call
    alert('Cancel exam functionality - ID: ' + examId);
  }

  viewAttendance(examId: string): void {
    // Implement attendance viewing
    alert('View attendance functionality - ID: ' + examId);
  }

  goToMonitoring(examId: string): void {
    // Navigate to live proctoring
    window.location.href = `/admin/live-audit?examId=${examId}`;
  }
}
