import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-approvals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="approvals-container">
      <div class="glass-panel">
        <div class="approvals-header">
          <h2>Question Paper Approvals</h2>
          <div class="header-controls">
            <select class="filter-select" [(ngModel)]="statusFilter">
              <option value="pending">Pending Approval</option>
              <option value="all">All Papers</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div class="approvals-list">
          <div class="approval-item" *ngFor="let paper of filteredPapers">
            <div class="paper-header">
              <div class="paper-info">
                <h3>{{ paper.title }}</h3>
                <span class="paper-meta">
                  {{ paper.courseCode }} • {{ paper.teacherName }} • {{ paper.createdAt | date:'mediumDate' }}
                </span>
              </div>
              <div class="paper-status">
                <span class="status-badge" [class.status-pending]="paper.status === 'pending_approval'"
                      [class.status-approved]="paper.status === 'approved'"
                      [class.status-rejected]="paper.status === 'rejected'">
                  {{ paper.status | titlecase }}
                </span>
              </div>
            </div>

            <div class="paper-details">
              <div class="detail-row">
                <span class="detail-label">Source Method:</span>
                <span class="detail-value">{{ paper.sourceMethod }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Questions:</span>
                <span class="detail-value">{{ paper.questionCount }} questions</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Total Marks:</span>
                <span class="detail-value">{{ paper.totalMarks }} marks</span>
              </div>
            </div>

            <div class="paper-actions" *ngIf="paper.status === 'pending_approval'">
              <button class="btn-preview" (click)="previewPaper(paper)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                Preview
              </button>
              <button class="btn-reject" (click)="rejectPaper(paper)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                Reject
              </button>
              <button class="btn-approve" (click)="approvePaper(paper)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                Approve
              </button>
            </div>

            <div class="rejection-reason" *ngIf="paper.status === 'rejected' && paper.rejectionReason">
              <span class="reason-label">Rejection Reason:</span>
              <span class="reason-text">{{ paper.rejectionReason }}</span>
            </div>
          </div>
        </div>

        <div class="empty-state" *ngIf="filteredPapers.length === 0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          <h3>No Question Papers Found</h3>
          <p>There are no question papers matching the current filter</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .approvals-container {
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

    .approvals-header {
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

    .filter-select {
      padding: 0.75rem 1rem;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 8px;
      color: #e6ebf5;
      font-size: 1rem;
      min-width: 200px;
    }

    .approvals-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .approval-item {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 1.5rem;
      transition: all 0.15s ease;
    }

    .approval-item:hover {
      background: rgba(255, 255, 255, 0.06);
    }

    .paper-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .paper-info h3 {
      margin: 0 0 0.5rem 0;
      color: #e6ebf5;
      font-size: 1.25rem;
    }

    .paper-meta {
      color: #94a3b8;
      font-size: 0.875rem;
    }

    .status-badge {
      padding: 0.375rem 0.875rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-badge.status-pending {
      background: rgba(251, 191, 36, 0.2);
      color: #fbbf24;
    }

    .status-badge.status-approved {
      background: rgba(52, 211, 153, 0.2);
      color: #34d399;
    }

    .status-badge.status-rejected {
      background: rgba(248, 113, 113, 0.2);
      color: #f87171;
    }

    .paper-details {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .detail-row {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .detail-label {
      color: #94a3b8;
      font-size: 0.875rem;
    }

    .detail-value {
      color: #e6ebf5;
      font-weight: 500;
    }

    .paper-actions {
      display: flex;
      gap: 0.75rem;
    }

    .btn-preview,
    .btn-reject,
    .btn-approve {
      padding: 0.75rem 1.25rem;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      border: none;
      transition: all 0.15s ease;
    }

    .btn-preview {
      background: rgba(99, 102, 241, 0.1);
      color: #6366f1;
      border: 1px solid rgba(99, 102, 241, 0.3);
    }

    .btn-preview:hover {
      background: rgba(99, 102, 241, 0.2);
    }

    .btn-reject {
      background: rgba(248, 113, 113, 0.1);
      color: #f87171;
      border: 1px solid rgba(248, 113, 113, 0.3);
    }

    .btn-reject:hover {
      background: rgba(248, 113, 113, 0.2);
    }

    .btn-approve {
      background: rgba(52, 211, 153, 0.1);
      color: #34d399;
      border: 1px solid rgba(52, 211, 153, 0.3);
    }

    .btn-approve:hover {
      background: rgba(52, 211, 153, 0.2);
    }

    .rejection-reason {
      margin-top: 1rem;
      padding: 0.75rem;
      background: rgba(248, 113, 113, 0.1);
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .reason-label {
      color: #f87171;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .reason-text {
      color: #e6ebf5;
      font-size: 0.95rem;
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
export class ApprovalsComponent implements OnInit {
  statusFilter = 'pending';
  papers: any[] = [];
  loading = true;
  error = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadPapers();
  }

  loadPapers(): void {
    this.loading = true;
    this.error = '';

    this.http.get<any[]>(`${environment.apiBaseUrl}/question-papers`).subscribe({
      next: (papers) => {
        this.papers = papers.map(paper => ({
          id: paper.id,
          title: paper.title,
          courseCode: paper.course_title,
          teacherName: paper.created_by_name,
          sourceMethod: paper.source_method,
          status: paper.status,
          questionCount: 0, // Will be updated with actual count
          totalMarks: 0, // Will be calculated
          createdAt: new Date(paper.created_at),
          rejectionReason: paper.rejection_reason
        }));
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load question papers. Please try again.';
        this.loading = false;
        console.error('Error loading papers:', err);
      }
    });
  }

  get filteredPapers() {
    if (this.statusFilter === 'all') {
      return this.papers;
    }
    return this.papers.filter(p => p.status === this.statusFilter);
  }

  previewPaper(paper: any): void {
    console.log('Previewing paper:', paper.id);
  }

  approvePaper(paper: any): void {
    this.http.patch(`${environment.apiBaseUrl}/question-papers/${paper.id}`, {
      status: 'approved',
      reviewedBy: 'admin',
      reviewedAt: new Date().toISOString()
    }).subscribe({
      next: () => {
        paper.status = 'approved';
        this.loadPapers(); // Refresh the list
        console.log('Approved paper:', paper.id);
      },
      error: (err) => {
        console.error('Error approving paper:', err);
        alert('Failed to approve paper');
      }
    });
  }

  rejectPaper(paper: any): void {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      this.http.patch(`${environment.apiBaseUrl}/question-papers/${paper.id}`, {
        status: 'rejected',
        rejectionReason: reason,
        reviewedBy: 'admin',
        reviewedAt: new Date().toISOString()
      }).subscribe({
        next: () => {
          paper.status = 'rejected';
          paper.rejectionReason = reason;
          this.loadPapers(); // Refresh the list
          console.log('Rejected paper:', paper.id, 'Reason:', reason);
        },
        error: (err) => {
          console.error('Error rejecting paper:', err);
          alert('Failed to reject paper');
        }
      });
    }
  }
}