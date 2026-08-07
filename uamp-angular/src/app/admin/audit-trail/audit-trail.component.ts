import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-audit-trail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="audit-trail-container">
      <div class="glass-panel">
        <div class="audit-header">
          <h2>Audit Trail</h2>
          <div class="header-controls">
            <select class="filter-select" [(ngModel)]="actionFilter">
              <option value="all">All Actions</option>
              <option value="exam">Exam Management</option>
              <option value="user">User Management</option>
              <option value="approval">Approvals</option>
              <option value="intervention">Interventions</option>
            </select>
            <select class="filter-select" [(ngModel)]="userFilter">
              <option value="all">All Users</option>
              <option *ngFor="let user of users" [value]="user.id">{{ user.name }}</option>
            </select>
            <input type="date" class="date-filter" [(ngModel)]="dateFilter" />
            <button class="btn-export" (click)="exportAuditTrail()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export
            </button>
          </div>
        </div>

        <div class="audit-stats">
          <div class="stat-item">
            <span class="stat-label">Total Actions</span>
            <span class="stat-value">{{ stats.total }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Today</span>
            <span class="stat-value">{{ stats.today }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">This Week</span>
            <span class="stat-value">{{ stats.thisWeek }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Critical Actions</span>
            <span class="stat-value stat-critical">{{ stats.critical }}</span>
          </div>
        </div>

        <div class="audit-list">
          <div class="audit-item" *ngFor="let audit of filteredAudits">
            <div class="audit-timestamp">
              <span class="time">{{ audit.timestamp | date:'shortTime' }}</span>
              <span class="date">{{ audit.timestamp | date:'mediumDate' }}</span>
            </div>

            <div class="audit-content">
              <div class="audit-header">
                <div class="action-type">
                  <span class="action-icon">
                    <svg [attr.viewBox]="getIconViewBox(audit.actionType)">
                      <path [attr.d]="getIconPath(audit.actionType)"/>
                    </svg>
                  </span>
                  <span class="action-text">{{ audit.action }}</span>
                </div>
                <div class="action-importance" [class.importance-critical]="audit.importance === 'critical'">
                  <span class="importance-badge">{{ audit.importance }}</span>
                </div>
              </div>

              <div class="audit-details">
                <div class="actor-info">
                  <span class="actor-name">{{ audit.actorName }}</span>
                  <span class="actor-role">{{ audit.actorRole }}</span>
                </div>
                <p class="audit-description">{{ audit.description }}</p>
                <div class="audit-metadata" *ngIf="audit.metadata">
                  <div class="metadata-item" *ngFor="let meta of audit.metadata | keyvalue">
                    <span class="metadata-key">{{ meta.key }}:</span>
                    <span class="metadata-value">{{ meta.value }}</span>
                  </div>
                </div>
              </div>

              <div class="audit-ip">
                <span class="ip-label">IP:</span>
                <span class="ip-value">{{ audit.ipAddress }}</span>
                <span class="user-agent">{{ audit.userAgent }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="pagination">
          <button class="btn-page" [disabled]="currentPage === 1" (click)="previousPage()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Previous
          </button>
          <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
          <button class="btn-page" [disabled]="currentPage === totalPages" (click)="nextPage()">
            Next
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .audit-trail-container {
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

    .audit-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    h2 {
      margin: 0;
      color: #e6ebf5;
      font-size: 1.75rem;
    }

    .header-controls {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }

    .filter-select,
    .date-filter {
      padding: 0.75rem 1rem;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 8px;
      color: #e6ebf5;
      font-size: 0.95rem;
    }

    .btn-export {
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

    .btn-export:hover {
      background: rgba(99, 102, 241, 0.2);
    }

    .audit-stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.04);
      border-radius: 12px;
    }

    .stat-item {
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

    .stat-value.stat-critical {
      color: #f87171;
    }

    .audit-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-height: 600px;
      overflow-y: auto;
    }

    .audit-item {
      display: flex;
      gap: 1.5rem;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 1.25rem;
      transition: all 0.15s ease;
    }

    .audit-item:hover {
      background: rgba(255, 255, 255, 0.06);
    }

    .audit-timestamp {
      min-width: 100px;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      text-align: right;
    }

    .time {
      color: #e6ebf5;
      font-weight: 600;
      font-size: 1.1rem;
    }

    .date {
      color: #94a3b8;
      font-size: 0.875rem;
    }

    .audit-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .audit-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .action-type {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .action-icon {
      width: 32px;
      height: 32px;
      background: rgba(99, 102, 241, 0.1);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6366f1;
    }

    .action-icon svg {
      width: 18px;
      height: 18px;
    }

    .action-text {
      color: #e6ebf5;
      font-weight: 600;
    }

    .importance-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      background: rgba(52, 211, 153, 0.2);
      color: #34d399;
    }

    .action-importance.importance-critical .importance-badge {
      background: rgba(248, 113, 113, 0.2);
      color: #f87171;
    }

    .audit-details {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .actor-info {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }

    .actor-name {
      color: #e6ebf5;
      font-weight: 500;
    }

    .actor-role {
      color: #94a3b8;
      font-size: 0.875rem;
    }

    .audit-description {
      color: #94a3b8;
      margin: 0;
      line-height: 1.5;
    }

    .audit-metadata {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      padding: 0.5rem;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 6px;
    }

    .metadata-item {
      display: flex;
      gap: 0.5rem;
      font-size: 0.875rem;
    }

    .metadata-key {
      color: #94a3b8;
    }

    .metadata-value {
      color: #e6ebf5;
    }

    .audit-ip {
      display: flex;
      gap: 1rem;
      padding-top: 0.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      font-size: 0.875rem;
    }

    .ip-label {
      color: #94a3b8;
    }

    .ip-value {
      color: #e6ebf5;
      font-family: monospace;
    }

    .user-agent {
      color: #94a3b8;
      max-width: 400px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.14);
    }

    .btn-page {
      padding: 0.75rem 1.25rem;
      background: rgba(255, 255, 255, 0.08);
      color: #e6ebf5;
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.15s ease;
    }

    .btn-page:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.12);
    }

    .btn-page:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .page-info {
      color: #94a3b8;
    }

    svg {
      width: 18px;
      height: 18px;
    }
  `]
})
export class AuditTrailComponent {
  actionFilter = 'all';
  userFilter = 'all';
  dateFilter = '';
  currentPage = 1;
  totalPages = 5;
  users = [
    { id: '1', name: 'Admin User' },
    { id: '2', name: 'Dr. Smith' },
    { id: '3', name: 'Prof. Johnson' }
  ];
  stats = {
    total: 1250,
    today: 45,
    thisWeek: 234,
    critical: 12
  };
  audits = [
    {
      id: '1',
      action: 'Question Paper Approved',
      actionType: 'approval',
      importance: 'high',
      timestamp: new Date('2026-08-07T10:30:00'),
      actorName: 'Admin User',
      actorRole: 'admin',
      description: 'Approved question paper "Data Structures Midterm" submitted by Dr. Smith',
      metadata: {
        paperId: 'QP-2026-001',
        submittedBy: 'Dr. Smith',
        questions: 25
      },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    },
    {
      id: '2',
      action: 'Exam Force Submitted',
      actionType: 'intervention',
      importance: 'critical',
      timestamp: new Date('2026-08-07T10:15:00'),
      actorName: 'Admin User',
      actorRole: 'admin',
      description: 'Force submitted exam for student John Doe due to repeated tab switch violations',
      metadata: {
        studentId: 'EN2021001',
        examId: 'EXAM-2026-001',
        reason: 'tab_switch_limit_exceeded'
      },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    },
    {
      id: '3',
      action: 'User Role Modified',
      actionType: 'user',
      importance: 'medium',
      timestamp: new Date('2026-08-07T09:45:00'),
      actorName: 'Admin User',
      actorRole: 'admin',
      description: 'Changed role for Jane Smith from student to teacher',
      metadata: {
        userId: 'USR-2026-0042',
        previousRole: 'student',
        newRole: 'teacher'
      },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    },
    {
      id: '4',
      action: 'Exam Schedule Modified',
      actionType: 'exam',
      importance: 'high',
      timestamp: new Date('2026-08-07T09:00:00'),
      actorName: 'Dr. Smith',
      actorRole: 'teacher',
      description: 'Extended exam duration by 15 minutes for Database Systems Quiz',
      metadata: {
        examId: 'EXAM-2026-002',
        previousDuration: 60,
        newDuration: 75,
        reason: 'technical_difficulties'
      },
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
    },
    {
      id: '5',
      action: 'Question Paper Rejected',
      actionType: 'approval',
      importance: 'medium',
      timestamp: new Date('2026-08-06T16:30:00'),
      actorName: 'Admin User',
      actorRole: 'admin',
      description: 'Rejected question paper "Algorithms Final" due to misalignment with learning objectives',
      metadata: {
        paperId: 'QP-2026-003',
        submittedBy: 'Dr. Williams',
        rejectionReason: 'Questions do not align with course learning objectives'
      },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
  ];

  get filteredAudits() {
    let filtered = this.audits;
    
    if (this.actionFilter !== 'all') {
      filtered = filtered.filter(a => a.actionType === this.actionFilter);
    }
    
    if (this.userFilter !== 'all') {
      filtered = filtered.filter(a => a.actorName === this.users.find(u => u.id === this.userFilter)?.name);
    }
    
    if (this.dateFilter) {
      const filterDate = new Date(this.dateFilter).toDateString();
      filtered = filtered.filter(a => a.timestamp.toDateString() === filterDate);
    }
    
    return filtered;
  }

  getIconViewBox(actionType: string): string {
    return '0 0 24 24';
  }

  getIconPath(actionType: string): string {
    const paths: Record<string, string> = {
      approval: 'M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3',
      intervention: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
      user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
      exam: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M10 13l-2 2 2 2 M14 17l2-2-2-2'
    };
    return paths[actionType] || '';
  }

  exportAuditTrail(): void {
    console.log('Exporting audit trail');
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }
}