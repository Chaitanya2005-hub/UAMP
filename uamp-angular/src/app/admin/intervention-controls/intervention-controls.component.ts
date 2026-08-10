import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-intervention-controls',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="intervention-controls-container">
      <div class="glass-panel">
        <div class="controls-header">
          <h2>Intervention Controls</h2>
          <div class="header-controls">
            <select class="exam-select" [(ngModel)]="selectedExam" (ngModelChange)="loadStudents()">
              <option value="">Select Exam</option>
              <option *ngFor="let exam of activeExams" [value]="exam.id">
                {{ exam.title }} - {{ exam.course }}
              </option>
            </select>
          </div>
        </div>

        <div class="controls-grid" *ngIf="selectedExam">
          <div class="control-section">
            <h3>Student Interventions</h3>
            <div class="student-search">
              <input type="text" placeholder="Search by name or enrollment number..." [(ngModel)]="searchQuery" />
            </div>
            <div class="student-list">
              <div class="student-item" *ngFor="let student of filteredStudents">
                <div class="student-info">
                  <span class="student-name">{{ student.name }}</span>
                  <span class="student-id">{{ student.enrollmentNumber }}</span>
                </div>
                <div class="student-status">
                  <span class="status-badge" [class.status-active]="student.status === 'active'"
                        [class.status-warning]="student.status === 'warning'"
                        [class.status-critical]="student.status === 'critical'">
                    {{ student.status }}
                  </span>
                </div>
                <div class="student-actions">
                  <button class="btn-warn" (click)="sendWarning(student)" title="Send Warning">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                  </button>
                  <button class="btn-message" (click)="sendMessage(student)" title="Send Message">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                  </button>
                  <button class="btn-force-submit" (click)="forceSubmit(student)" title="Force Submit">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                      <line x1="15" y1="9" x2="9" y2="15"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="control-section">
            <h3>Exam Controls</h3>
            <div class="exam-actions">
              <button class="btn-pause" (click)="pauseExam()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="6" y="4" width="4" height="16"/>
                  <rect x="14" y="4" width="4" height="16"/>
                </svg>
                Pause Exam
              </button>
              <button class="btn-resume" (click)="resumeExam()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                Resume Exam
              </button>
              <button class="btn-extend" (click)="extendTime()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                Extend Time
              </button>
              <button class="btn-terminate" (click)="terminateExam()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                </svg>
                Terminate Exam
              </button>
            </div>

            <div class="bulk-actions">
              <h4>Bulk Actions</h4>
              <div class="bulk-buttons">
                <button class="btn-bulk-warn" (click)="bulkWarn()">Warn All Critical</button>
                <button class="btn-bulk-submit" (click)="bulkSubmit()">Force Submit All Critical</button>
                <button class="btn-bulk-message" (click)="bulkMessage()">Send Announcement</button>
              </div>
            </div>
          </div>

          <div class="control-section">
            <h3>Ad-Hoc Student Management</h3>
            <div class="adhoc-form">
              <div class="form-group">
                <label>Student Enrollment Number</label>
                <input type="text" placeholder="Enter enrollment number" [(ngModel)]="adhocStudentId" />
              </div>
              <div class="form-group">
                <label>Reason</label>
                <textarea [(ngModel)]="adhocReason" rows="3" placeholder="Explain why this student needs to be added..."></textarea>
              </div>
              <button class="btn-add-student" (click)="addAdhocStudent()">Add Student to Exam</button>
            </div>
          </div>
        </div>

        <div class="empty-state" *ngIf="!selectedExam">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <h3>Select an Exam to Control</h3>
          <p>Choose an active exam to access intervention controls</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .intervention-controls-container {
      padding: 2rem;
      max-width: 1400px;
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

    .controls-header {
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

    .controls-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }

    .control-section {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 1.5rem;
    }

    h3 {
      color: #e6ebf5;
      margin: 0 0 1rem 0;
      font-size: 1.25rem;
    }

    h4 {
      color: #e6ebf5;
      margin: 1.5rem 0 0.75rem 0;
      font-size: 1rem;
    }

    .student-search {
      margin-bottom: 1rem;
    }

    .student-search input {
      width: 100%;
      padding: 0.75rem 1rem;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 8px;
      color: #e6ebf5;
      font-size: 0.95rem;
    }

    .student-list {
      max-height: 400px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .student-item {
      background: rgba(255, 255, 255, 0.04);
      border-radius: 8px;
      padding: 1rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .student-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .student-name {
      color: #e6ebf5;
      font-weight: 500;
    }

    .student-id {
      color: #94a3b8;
      font-size: 0.875rem;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-badge.status-active {
      background: rgba(52, 211, 153, 0.2);
      color: #34d399;
    }

    .status-badge.status-warning {
      background: rgba(251, 191, 36, 0.2);
      color: #fbbf24;
    }

    .status-badge.status-critical {
      background: rgba(248, 113, 113, 0.2);
      color: #f87171;
    }

    .student-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-warn,
    .btn-message,
    .btn-force-submit {
      padding: 0.5rem;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      transition: all 0.15s ease;
    }

    .btn-warn {
      background: rgba(251, 191, 36, 0.1);
      color: #fbbf24;
      border: 1px solid rgba(251, 191, 36, 0.3);
    }

    .btn-warn:hover {
      background: rgba(251, 191, 36, 0.2);
    }

    .btn-message {
      background: rgba(34, 211, 238, 0.1);
      color: #22d3ee;
      border: 1px solid rgba(34, 211, 238, 0.3);
    }

    .btn-message:hover {
      background: rgba(34, 211, 238, 0.2);
    }

    .btn-force-submit {
      background: rgba(248, 113, 113, 0.1);
      color: #f87171;
      border: 1px solid rgba(248, 113, 113, 0.3);
    }

    .btn-force-submit:hover {
      background: rgba(248, 113, 113, 0.2);
    }

    .exam-actions {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .btn-pause,
    .btn-resume,
    .btn-extend,
    .btn-terminate {
      padding: 0.875rem 1rem;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      border: none;
      transition: all 0.15s ease;
    }

    .btn-pause {
      background: rgba(251, 191, 36, 0.1);
      color: #fbbf24;
      border: 1px solid rgba(251, 191, 36, 0.3);
    }

    .btn-pause:hover {
      background: rgba(251, 191, 36, 0.2);
    }

    .btn-resume {
      background: rgba(52, 211, 153, 0.1);
      color: #34d399;
      border: 1px solid rgba(52, 211, 153, 0.3);
    }

    .btn-resume:hover {
      background: rgba(52, 211, 153, 0.2);
    }

    .btn-extend {
      background: rgba(99, 102, 241, 0.1);
      color: #6366f1;
      border: 1px solid rgba(99, 102, 241, 0.3);
    }

    .btn-extend:hover {
      background: rgba(99, 102, 241, 0.2);
    }

    .btn-terminate {
      background: rgba(248, 113, 113, 0.1);
      color: #f87171;
      border: 1px solid rgba(248, 113, 113, 0.3);
    }

    .btn-terminate:hover {
      background: rgba(248, 113, 113, 0.2);
    }

    .bulk-buttons {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .btn-bulk-warn,
    .btn-bulk-submit,
    .btn-bulk-message {
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 0.875rem;
      cursor: pointer;
      border: none;
      transition: all 0.15s ease;
    }

    .btn-bulk-warn {
      background: rgba(251, 191, 36, 0.1);
      color: #fbbf24;
      border: 1px solid rgba(251, 191, 36, 0.3);
    }

    .btn-bulk-submit {
      background: rgba(248, 113, 113, 0.1);
      color: #f87171;
      border: 1px solid rgba(248, 113, 113, 0.3);
    }

    .btn-bulk-message {
      background: rgba(34, 211, 238, 0.1);
      color: #22d3ee;
      border: 1px solid rgba(34, 211, 238, 0.3);
    }

    .adhoc-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      color: #e6ebf5;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .form-group input,
    .form-group textarea {
      padding: 0.75rem 1rem;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 8px;
      color: #e6ebf5;
      font-size: 0.95rem;
      resize: vertical;
    }

    .btn-add-student {
      padding: 0.875rem 1rem;
      background: #6366f1;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-add-student:hover {
      background: #5558e3;
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
      opacity: 0.5;
    }

    .empty-state h3 {
      color: #e6ebf5;
      margin: 0;
    }

    .empty-state p {
      margin: 0;
      text-align: center;
    }

    svg {
      width: 18px;
      height: 18px;
    }
  `]
})
export class InterventionControlsComponent implements OnInit {
  selectedExam = '';
  searchQuery = '';
  adhocStudentId = '';
  adhocReason = '';
  activeExams: any[] = [];
  students: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.http.get<any[]>('/api/exams/active').subscribe(exams => this.activeExams = exams); }

  loadStudents(): void {
    if (this.selectedExam) this.http.get<any[]>(`/api/exams/${this.selectedExam}/students`).subscribe(students => this.students = students);
  }

  get filteredStudents() {
    if (!this.searchQuery) return this.students;
    const query = this.searchQuery.toLowerCase();
    return this.students.filter(s => 
      s.name.toLowerCase().includes(query) || 
      s.enrollmentNumber.toLowerCase().includes(query)
    );
  }

  sendWarning(student: any): void {
    if (student.submissionId) this.http.post(`/api/submissions/${student.submissionId}/warn`, { message: 'Warning issued by administrator' }).subscribe(() => this.loadStudents());
  }

  sendMessage(student: any): void {
    // Message functionality to be implemented
  }

  forceSubmit(student: any): void {
    if (confirm(`Are you sure you want to force submit ${student.name}'s exam?`)) {
      if (student.submissionId) this.http.post(`/api/submissions/${student.submissionId}/force-submit`, {}).subscribe(() => this.loadStudents());
    }
  }

  pauseExam(): void {
    if (confirm('Are you sure you want to pause this exam?')) {
      // Pause exam functionality to be implemented
    }
  }

  resumeExam(): void {
    // Resume exam functionality to be implemented
  }

  extendTime(): void {
    const minutes = prompt('Enter number of minutes to extend:');
    if (minutes) {
      // Extend time functionality to be implemented
    }
  }

  terminateExam(): void {
    if (confirm('Are you sure you want to terminate this exam? This action cannot be undone.')) {
      // Terminate exam functionality to be implemented
    }
  }

  bulkWarn(): void {
    // Bulk warn functionality to be implemented
  }

  bulkSubmit(): void {
    if (confirm('Are you sure you want to force submit all critical students?')) {
      // Bulk submit functionality to be implemented
    }
  }

  bulkMessage(): void {
    const message = prompt('Enter announcement message:');
    if (message) {
      // Bulk message functionality to be implemented
    }
  }

  addAdhocStudent(): void {
    if (this.adhocStudentId && this.adhocReason) {
      // Add ad-hoc student functionality to be implemented
      this.adhocStudentId = '';
      this.adhocReason = '';
    }
  }
}
