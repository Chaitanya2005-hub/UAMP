import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GlassPanelComponent } from '../../shared/components/glass-panel/glass-panel.component';
import { RadarChartComponent } from '../../shared/components/radar-chart/radar-chart.component';
import { NotificationsComponent } from '../../shared/components/notifications/notifications.component';
import { ExamService } from '../services/exam.service';
import { AuthService } from '../../core/services/auth.service';
import { BloomMasteryPoint, ExamSlot } from '../../core/models';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, GlassPanelComponent, RadarChartComponent, NotificationsComponent],
  template: `
    <div class="container">
      <div class="page-header">
        <h1>Welcome back, {{ userName() }} 👋</h1>
        <p>Your exam timetable, alerts, and active assessments.</p>
        <div class="notifications-wrapper">
          <app-notifications></app-notifications>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-4 stats-grid">
        <div class="glass-panel metric-card stat-card">
          <div class="stat-icon">📝</div>
          <div class="stat-info">
            <span class="stat-value">{{ upcomingExams().length }}</span>
            <span class="stat-label">Upcoming Exams</span>
          </div>
        </div>
        <div class="glass-panel metric-card stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-info">
            <span class="stat-value">{{ completedCount() }}</span>
            <span class="stat-label">Completed</span>
          </div>
        </div>
        <div class="glass-panel metric-card stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-info">
            <span class="stat-value">{{ averageScore() }}%</span>
            <span class="stat-label">Average Score</span>
          </div>
        </div>
        <div class="glass-panel metric-card stat-card">
          <div class="stat-icon">🏆</div>
          <div class="stat-info">
            <span class="stat-value">{{ strongestArea() }}</span>
            <span class="stat-label">Strongest Area</span>
          </div>
        </div>
      </div>

      <div class="dashboard-content">
        <!-- Bloom's Mastery Radar -->
        <div class="dashboard-section">
          <app-glass-panel [hoverable]="false" padding="32px">
            <h2 class="section-title">Cognitive Mastery Radar</h2>
            <p class="section-subtitle">Bloom's Taxonomy proficiency across all exams</p>
            <div class="radar-wrapper">
              <app-radar-chart [data]="masteryData()" [size]="320" />
            </div>
            <div class="weak-areas" *ngIf="weakAreas().length > 0">
              <h4>📚 Areas for Improvement</h4>
              <div class="weak-area-item" *ngFor="let area of weakAreas()">
                <span class="badge badge--warning">{{ area.axis }}</span>
                <span class="weak-pct">{{ area.masteryPct }}% mastery</span>
              </div>
            </div>
          </app-glass-panel>
        </div>

        <!-- Upcoming Exams -->
        <div class="dashboard-section">
          <app-glass-panel [hoverable]="false" padding="32px">
            <h2 class="section-title">My Exams</h2>
            <div class="exam-list" *ngIf="upcomingExams().length > 0; else noExams">
              <div
                class="exam-item glass-panel metric-card"
                *ngFor="let slot of upcomingExams(); let i = index"
                [style.animation-delay.ms]="i * 60"
              >
                <div class="exam-item-header">
                  <h3>{{ slot.exam?.title }}</h3>
                  <span class="badge badge--info">{{ slot.registrationStatus }}</span>
                </div>
                <div class="exam-item-meta">
                  <span>⏱ {{ slot.exam?.durationMinutes }} min</span>
                  <span>📅 {{ slot.exam?.scheduledStart | date:'medium' }}</span>
                </div>
                <div class="exam-item-actions">
                  <a [routerLink]="['/student/exam', slot.examId, 'lobby']" class="btn btn-primary btn-sm">
                    Enter Lobby
                  </a>
                  <a [routerLink]="['/student/hall-ticket', slot.id]" class="btn btn-secondary btn-sm">
                    Hall Ticket
                  </a>
                </div>
              </div>
            </div>
            <ng-template #noExams>
              <div class="empty-state">
                <p>No exams have been assigned to this student yet. Once an admin or teacher publishes a timetable, it will appear here with an Enter Lobby button.</p>
              </div>
            </ng-template>
          </app-glass-panel>

        <!-- Mastery Analytics Link -->
        <div class="glass-panel">
          <div class="mastery-link">
            <div class="mastery-icon">📊</div>
            <div class="mastery-content">
              <h3>Bloom's Taxonomy Mastery</h3>
              <p>View your cognitive strengths and areas for improvement</p>
            </div>
            <a routerLink="/student/mastery" class="btn btn-primary">
              View Analytics
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      position: relative;
    }

    .notifications-wrapper {
      position: absolute;
      top: 0;
      right: 0;
      z-index: 100;
    }

    .stats-grid {
      margin-bottom: 32px;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 24px !important;
    }

    .stat-icon {
      font-size: 2rem;
      width: 52px;
      height: 52px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(99, 102, 241, 0.1);
      border-radius: var(--uamp-radius-md);
    }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-family: var(--uamp-font-display);
      font-size: 1.5rem;
      font-weight: 700;
    }

    .stat-label {
      font-size: 0.8125rem;
      color: var(--uamp-text-muted);
    }

    .dashboard-content {
      display: grid;
      grid-template-columns: 1fr 1.2fr;
      gap: 24px;
    }

    .section-title {
      font-size: 1.125rem;
      margin-bottom: 4px;
    }

    .section-subtitle {
      font-size: 0.8125rem;
      color: var(--uamp-text-muted);
      margin-bottom: 24px;
    }

    .radar-wrapper {
      display: flex;
      justify-content: center;
      margin-bottom: 24px;
    }

    .weak-areas h4 {
      font-size: 0.875rem;
      margin-bottom: 12px;
    }

    .weak-area-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);

      &:last-child { border-bottom: none; }
    }

    .weak-pct {
      font-size: 0.8125rem;
      color: var(--uamp-text-muted);
    }

    .exam-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .exam-item {
      padding: 20px !important;
    }

    .exam-item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;

      h3 { font-size: 1rem; }
    }

    .exam-item-meta {
      display: flex;
      gap: 20px;
      font-size: 0.8125rem;
      color: var(--uamp-text-muted);
      margin-bottom: 16px;
    }

    .exam-item-actions {
      display: flex;
      gap: 10px;
    }

    .btn-sm {
      padding: 6px 16px;
      font-size: 0.8125rem;
    }

    .empty-state {
      text-align: center;
      padding: 40px 0;
      color: var(--uamp-text-muted);
    }

    .mastery-link {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
    }

    .mastery-icon {
      font-size: 2rem;
    }

    .mastery-content {
      flex: 1;
    }

    .mastery-content h3 {
      margin: 0 0 4px 0;
      color: var(--uamp-text-primary);
      font-size: 1rem;
    }

    .mastery-content p {
      margin: 0;
      color: var(--uamp-text-muted);
      font-size: 0.8125rem;
    }

    @media (max-width: 1024px) {
      .dashboard-content {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  userName = signal('Student');
  masteryData = signal<BloomMasteryPoint[]>([]);
  upcomingExams = signal<ExamSlot[]>([]);
  completedCount = signal(0);
  averageScore = signal(0);
  strongestArea = signal('—');
  weakAreas = signal<BloomMasteryPoint[]>([]);

  constructor(
    private examService: ExamService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.user();
    if (user) {
      this.userName.set(user.fullName.split(' ')[0]);
    }

    this.examService.getBloomMastery().subscribe({
      next: (data) => {
        this.masteryData.set(data);
        this.weakAreas.set(data.filter(d => d.masteryPct < 60));
        const strongest = data.reduce((a, b) => (a.masteryPct > b.masteryPct ? a : b), data[0]);
        if (strongest) this.strongestArea.set(strongest.axis);
        const avg = data.reduce((sum, d) => sum + d.masteryPct, 0) / (data.length || 1);
        this.averageScore.set(Math.round(avg));
      },
      error: () => { this.masteryData.set([]); this.weakAreas.set([]); this.strongestArea.set('—'); this.averageScore.set(0); },
    });

    this.examService.getMyExams().subscribe({
      next: (exams) => {
        this.upcomingExams.set(exams.filter(e => e.registrationStatus === 'approved'));
      },
      error: () => this.upcomingExams.set([]),
    });
  }
}
