import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-incident-timeline',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="incident-timeline-container">
      <div class="timeline-header">
        <h2>Incident Timeline</h2>
        <div class="header-controls">
          <select class="exam-select" [(ngModel)]="selectedExam">
            <option value="">Select Exam</option>
            <option *ngFor="let exam of exams" [value]="exam.id">
              {{ exam.title }}
            </option>
          </select>
          <select class="filter-select" [(ngModel)]="severityFilter">
            <option value="all">All Severities</option>
            <option value="critical">Critical Only</option>
            <option value="warning">Warnings Only</option>
          </select>
          <button class="btn-export" (click)="exportTimeline()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export
          </button>
        </div>
      </div>

      <div class="timeline-content" *ngIf="selectedExam">
        <div class="timeline-stats">
          <div class="stat-card">
            <span class="stat-label">Total Incidents</span>
            <span class="stat-value">{{ stats.total }}</span>
          </div>
          <div class="stat-card stat-critical">
            <span class="stat-label">Critical</span>
            <span class="stat-value">{{ stats.critical }}</span>
          </div>
          <div class="stat-card stat-warning">
            <span class="stat-label">Warnings</span>
            <span class="stat-value">{{ stats.warnings }}</span>
          </div>
          <div class="stat-card stat-resolved">
            <span class="stat-label">Resolved</span>
            <span class="stat-value">{{ stats.resolved }}</span>
          </div>
        </div>

        <div class="timeline-list">
          <div class="incident-item" 
               *ngFor="let incident of filteredIncidents"
               [class.severity-critical]="incident.severity === 'critical'"
               [class.severity-warning]="incident.severity === 'warning'"
               [class.status-resolved]="incident.status === 'resolved'">
            <div class="incident-timestamp">
              <span class="time">{{ incident.time }}</span>
              <span class="date">{{ incident.date }}</span>
            </div>

            <div class="incident-content">
              <div class="incident-header">
                <div class="incident-type">
                  <span class="type-icon">
                    <svg [attr.viewBox]="getIconViewBox(incident.type)">
                      <path [attr.d]="getIconPath(incident.type)"/>
                    </svg>
                  </span>
                  <span class="type-text">{{ incident.type }}</span>
                </div>
                <div class="incident-severity">
                  <span class="severity-badge" [class.badge-critical]="incident.severity === 'critical'">
                    {{ incident.severity }}
                  </span>
                </div>
              </div>

              <div class="incident-details">
                <div class="student-info">
                  <span class="student-name">{{ incident.studentName }}</span>
                  <span class="student-id">{{ incident.studentId }}</span>
                </div>
                <p class="incident-description">{{ incident.description }}</p>
              </div>

              <div class="incident-evidence" *ngIf="incident.hasSnapshot">
                <button class="btn-view-snapshot" (click)="viewSnapshot(incident)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  View Snapshot
                </button>
              </div>

              <div class="incident-actions">
                <button class="btn-resolve" 
                        (click)="resolveIncident(incident)"
                        *ngIf="incident.status !== 'resolved'">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Mark Resolved
                </button>
                <button class="btn-flag" (click)="flagForReview(incident)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                    <line x1="4" y1="22" x2="4" y2="15"/>
                  </svg>
                  Flag for Review
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="empty-state" *ngIf="!selectedExam">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        <h3>Select an Exam to View Incidents</h3>
        <p>Choose an exam to view its proctoring incident timeline</p>
      </div>
    </div>
  `,
  styles: [`
    .incident-timeline-container {
      padding: 2rem;
      height: calc(100vh - 120px);
      display: flex;
      flex-direction: column;
    }

    .timeline-header {
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
      gap: 1rem;
      align-items: center;
    }

    .exam-select,
    .filter-select {
      padding: 0.75rem 1rem;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 8px;
      color: #e6ebf5;
      font-size: 1rem;
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

    .timeline-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      overflow: hidden;
    }

    .timeline-stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
    }

    .stat-card {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 12px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .stat-card.stat-critical {
      border-color: rgba(248, 113, 113, 0.3);
    }

    .stat-card.stat-warning {
      border-color: rgba(251, 191, 36, 0.3);
    }

    .stat-card.stat-resolved {
      border-color: rgba(52, 211, 153, 0.3);
    }

    .stat-label {
      color: #94a3b8;
      font-size: 0.875rem;
    }

    .stat-value {
      color: #e6ebf5;
      font-size: 1.75rem;
      font-weight: 600;
    }

    .timeline-list {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .incident-item {
      display: flex;
      gap: 1.5rem;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 1.25rem;
      transition: all 0.15s ease;
    }

    .incident-item:hover {
      background: rgba(255, 255, 255, 0.06);
    }

    .incident-item.severity-critical {
      border-left: 3px solid #f87171;
    }

    .incident-item.severity-warning {
      border-left: 3px solid #fbbf24;
    }

    .incident-item.status-resolved {
      opacity: 0.6;
    }

    .incident-timestamp {
      min-width: 80px;
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

    .incident-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .incident-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .incident-type {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .type-icon {
      width: 32px;
      height: 32px;
      background: rgba(99, 102, 241, 0.1);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6366f1;
    }

    .type-icon svg {
      width: 18px;
      height: 18px;
    }

    .type-text {
      color: #e6ebf5;
      font-weight: 600;
    }

    .severity-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      background: rgba(251, 191, 36, 0.2);
      color: #fbbf24;
    }

    .severity-badge.badge-critical {
      background: rgba(248, 113, 113, 0.2);
      color: #f87171;
    }

    .incident-details {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .student-info {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }

    .student-name {
      color: #e6ebf5;
      font-weight: 500;
    }

    .student-id {
      color: #94a3b8;
      font-size: 0.875rem;
    }

    .incident-description {
      color: #94a3b8;
      margin: 0;
      line-height: 1.5;
    }

    .incident-evidence {
      margin-top: 0.5rem;
    }

    .btn-view-snapshot {
      padding: 0.5rem 1rem;
      background: rgba(34, 211, 238, 0.1);
      color: #22d3ee;
      border: 1px solid rgba(34, 211, 238, 0.3);
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      transition: all 0.15s ease;
    }

    .btn-view-snapshot:hover {
      background: rgba(34, 211, 238, 0.2);
    }

    .incident-actions {
      display: flex;
      gap: 0.75rem;
      margin-top: 0.5rem;
    }

    .btn-resolve,
    .btn-flag {
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-size: 0.875rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      border: none;
      transition: all 0.15s ease;
    }

    .btn-resolve {
      background: rgba(52, 211, 153, 0.1);
      color: #34d399;
      border: 1px solid rgba(52, 211, 153, 0.3);
    }

    .btn-resolve:hover {
      background: rgba(52, 211, 153, 0.2);
    }

    .btn-flag {
      background: rgba(251, 191, 36, 0.1);
      color: #fbbf24;
      border: 1px solid rgba(251, 191, 36, 0.3);
    }

    .btn-flag:hover {
      background: rgba(251, 191, 36, 0.2);
    }

    .empty-state {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
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
export class IncidentTimelineComponent implements OnInit {
  selectedExam = '';
  severityFilter = 'all';
  exams = [
    { id: '1', title: 'Midterm Exam - CS201' },
    { id: '2', title: 'Quiz 3 - CS301' }
  ];
  stats = {
    total: 12,
    critical: 3,
    warnings: 9,
    resolved: 7
  };
  incidents = [
    {
      id: '1',
      type: 'tab_switch',
      severity: 'critical',
      status: 'resolved',
      time: '10:23 AM',
      date: 'Aug 7',
      studentName: 'John Doe',
      studentId: 'EN2021001',
      description: 'Student exceeded tab switch limit (3/3)',
      hasSnapshot: false
    },
    {
      id: '2',
      type: 'multiple_faces',
      severity: 'critical',
      status: 'pending',
      time: '10:15 AM',
      date: 'Aug 7',
      studentName: 'Jane Smith',
      studentId: 'EN2021002',
      description: 'Multiple faces detected in camera frame',
      hasSnapshot: true
    },
    {
      id: '3',
      type: 'gaze_deviation',
      severity: 'warning',
      status: 'pending',
      time: '10:08 AM',
      date: 'Aug 7',
      studentName: 'Bob Johnson',
      studentId: 'EN2021003',
      description: 'Prolonged gaze deviation detected (>4s)',
      hasSnapshot: true
    },
    {
      id: '4',
      type: 'fullscreen_exit',
      severity: 'warning',
      status: 'resolved',
      time: '09:55 AM',
      date: 'Aug 7',
      studentName: 'Alice Williams',
      studentId: 'EN2021004',
      description: 'Student exited fullscreen mode',
      hasSnapshot: false
    }
  ];

  ngOnInit(): void {
    // Initialize with mock data
  }

  get filteredIncidents() {
    let filtered = this.incidents;
    if (this.severityFilter !== 'all') {
      filtered = filtered.filter(i => i.severity === this.severityFilter);
    }
    return filtered;
  }

  getIconViewBox(type: string): string {
    const icons: Record<string, string> = {
      tab_switch: '0 0 24 24',
      multiple_faces: '0 0 24 24',
      gaze_deviation: '0 0 24 24',
      fullscreen_exit: '0 0 24 24'
    };
    return icons[type] || '0 0 24 24';
  }

  getIconPath(type: string): string {
    const paths: Record<string, string> = {
      tab_switch: 'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22',
      multiple_faces: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm7 4a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 4v2 M23 21v-2a4 4 0 0 0-3-3.87',
      gaze_deviation: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
      fullscreen_exit: 'M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3'
    };
    return paths[type] || '';
  }

  viewSnapshot(incident: any): void {
    console.log('Viewing snapshot for incident:', incident.id);
  }

  resolveIncident(incident: any): void {
    incident.status = 'resolved';
    this.stats.resolved++;
  }

  flagForReview(incident: any): void {
    console.log('Flagging incident for review:', incident.id);
  }

  exportTimeline(): void {
    console.log('Exporting incident timeline');
  }
}