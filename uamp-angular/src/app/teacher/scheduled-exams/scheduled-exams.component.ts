import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExamManagementService, Exam } from '../services/exam-management.service';

@Component({
  selector: 'app-scheduled-exams',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <div class="page-header">
        <h1>📅 Scheduled Exams</h1>
        <p>View and manage your scheduled examinations</p>
      </div>

      <div class="glass-panel">
        <div class="exams-list" *ngIf="!loading()">
        <div *ngIf="exams().length === 0" class="empty-state">
          <p>No scheduled exams found.</p>
        </div>

        <div *ngFor="let exam of exams()" class="exam-card">
          <div class="exam-header">
            <h3>{{ exam.title }}</h3>
            <span class="badge" [class.scheduled]="exam.status === 'scheduled'" [class.live]="exam.status === 'live'">
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
              (click)="viewDetails(exam.id)"
            >
              📋 View Details
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
              {{ endingExam() === exam.id ? 'Ending...' : '⏹ End Exam' }}
            </button>
          </div>
        </div>
      </div>

        <div *ngIf="loading()">
          <p class="loading">Loading scheduled exams...</p>
        </div>

        <div *ngIf="error()">
          <p class="error">{{ error() }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .glass-panel {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      backdrop-filter: blur(10px);
      padding: 20px;
    }

    .exams-list {
      padding: 20px;
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: var(--uamp-text-muted);
      background: rgba(255, 255, 255, 0.03);
      border-radius: 12px;
    }

    .exam-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--uamp-glass-border);
      border-radius: var(--uamp-radius-md);
      padding: 20px;
      margin-bottom: 16px;
      transition: all 0.3s ease;
    }

    .exam-card:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: var(--uamp-accent-primary);
    }

    .exam-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .exam-header h3 {
      margin: 0;
      font-size: 1.1rem;
      color: var(--uamp-text-primary);
    }

    .badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .badge.scheduled {
      background: rgba(59, 130, 246, 0.2);
      color: #3b82f6;
    }

    .badge.live {
      background: rgba(16, 185, 129, 0.2);
      color: #10b981;
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
      color: var(--uamp-text-muted);
      margin-bottom: 4px;
    }

    .detail-item .value {
      font-size: 0.875rem;
      color: var(--uamp-text-primary);
      font-weight: 500;
    }

    .exam-actions {
      display: flex;
      gap: 10px;
      padding-top: 16px;
      border-top: 1px solid var(--uamp-glass-border);
    }

    .start-btn {
      background: linear-gradient(135deg, var(--uamp-accent-primary), var(--uamp-accent-secondary));
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
export class ScheduledExamsComponent implements OnInit {
  exams = signal<Exam[]>([]);
  loading = signal(true);
  error = signal('');
  startingExam = signal<string | null>(null);
  endingExam = signal<string | null>(null);

  constructor(private examManagementService: ExamManagementService) {}

  ngOnInit(): void {
    this.loadScheduledExams();
  }

  loadScheduledExams(): void {
    this.loading.set(true);
    this.error.set('');

    this.examManagementService.getActiveExams().subscribe({
      next: (exams) => {
        this.exams.set(exams);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load scheduled exams. Please try again.');
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
      next: () => {
        this.startingExam.set(null);
        this.loadScheduledExams(); // Refresh the list
        alert('Exam started successfully!');
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
        this.loadScheduledExams(); // Refresh the list
        alert('Exam ended successfully!');
      },
      error: (err) => {
        this.endingExam.set(null);
        alert('Failed to end exam: ' + (err.error?.error || err.message));
        console.error('Error ending exam:', err);
      }
    });
  }

  viewDetails(examId: string): void {
    // Navigate to exam details or show modal
    console.log('View details for exam:', examId);
    // For now, just show a simple alert
    alert('Exam details view - ID: ' + examId);
  }

  goToMonitoring(examId: string): void {
    // Navigate to live proctoring
    window.location.href = `/teacher/monitoring/live-proctoring?examId=${examId}`;
  }
}