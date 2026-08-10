import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GlassPanelComponent } from '../../../shared/components/glass-panel/glass-panel.component';
import { CountdownPipe } from '../../../shared/pipes/countdown.pipe';
import { ExamService } from '../../services/exam.service';
import { Exam } from '../../../core/models';
import { Subscription, switchMap, timer } from 'rxjs';

@Component({
  selector: 'app-exam-lobby',
  standalone: true,
  imports: [CommonModule, GlassPanelComponent, CountdownPipe],
  template: `
    <div class="lobby-page">
      <div class="lobby-bg-gradient"></div>
      <div class="lobby-container">
        <app-glass-panel [hoverable]="false" padding="48px">
          <div class="lobby-content" *ngIf="exam()">
            <div class="lobby-icon">📋</div>
            <h1>{{ exam()!.title }}</h1>
            <p class="lobby-subtitle">Exam Lobby — Please wait for the exam to begin</p>

            <div class="lobby-info-grid">
              <div class="lobby-info-item">
                <span class="info-label">Duration</span>
                <span class="info-value">{{ exam()!.durationMinutes }} minutes</span>
              </div>
              <div class="lobby-info-item">
                <span class="info-label">Starts At</span>
                <span class="info-value">{{ exam()!.scheduledStart | date:'medium' }}</span>
              </div>
              <div class="lobby-info-item">
                <span class="info-label">Proctoring</span>
                <span class="info-value">
                  <span class="badge" [class]="exam()!.proctoringEnabled ? 'badge--info' : 'badge--warning'">
                    {{ exam()!.proctoringEnabled ? 'Enabled' : 'Disabled' }}
                  </span>
                </span>
              </div>
              <div class="lobby-info-item">
                <span class="info-label">Tab Switch Limit</span>
                <span class="info-value">{{ exam()!.tabSwitchLimit }} switches</span>
              </div>
            </div>

            <div class="countdown-section">
              <span class="countdown-label">Exam starts in</span>
              <div class="countdown-timer">{{ exam()!.scheduledStart | countdown }}</div>
            </div>

            <div class="lobby-checklist">
              <h3>Pre-Exam Checklist</h3>
              <div class="checklist-item" [class.checked]="checks.stableConnection">
                <span class="check-icon">{{ checks.stableConnection ? '✅' : '⬜' }}</span>
                Stable internet connection
              </div>
              <div class="checklist-item" [class.checked]="checks.cameraReady">
                <span class="check-icon">{{ checks.cameraReady ? '✅' : '⬜' }}</span>
                Camera access granted
              </div>
              <div class="checklist-item" [class.checked]="checks.fullscreenReady">
                <span class="check-icon">{{ checks.fullscreenReady ? '✅' : '⬜' }}</span>
                Fullscreen mode available
              </div>
            </div>

            <button
              class="btn btn-primary lobby-start-btn"
              [disabled]="!canStart()"
              (click)="startExam()"
            >
              {{ canStart() ? 'Start Exam' : 'Waiting...' }}
            </button>
          </div>
        </app-glass-panel>
      </div>
    </div>
  `,
  styles: [`
    .lobby-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .lobby-bg-gradient {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse at 30% 40%, rgba(99, 102, 241, 0.12) 0%, transparent 50%),
        radial-gradient(ellipse at 70% 60%, rgba(34, 211, 238, 0.08) 0%, transparent 50%);
    }

    .lobby-container {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 620px;
      padding: 24px;
    }

    .lobby-content {
      text-align: center;
    }

    .lobby-icon { font-size: 3rem; margin-bottom: 16px; }

    h1 { font-size: 1.75rem; margin-bottom: 8px; }

    .lobby-subtitle {
      color: var(--uamp-text-muted);
      margin-bottom: 32px;
    }

    .lobby-info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 32px;
    }

    .lobby-info-item {
      text-align: left;
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: var(--uamp-radius-sm);
    }

    .info-label {
      display: block;
      font-size: 0.75rem;
      color: var(--uamp-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 4px;
    }

    .info-value { font-weight: 500; }

    .countdown-section {
      margin-bottom: 32px;
    }

    .countdown-label {
      display: block;
      font-size: 0.8125rem;
      color: var(--uamp-text-muted);
      margin-bottom: 8px;
    }

    .countdown-timer {
      font-family: var(--uamp-font-display);
      font-size: 2.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, var(--uamp-accent-primary), var(--uamp-accent-secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .lobby-checklist {
      text-align: left;
      margin-bottom: 32px;

      h3 {
        font-size: 0.9375rem;
        margin-bottom: 12px;
      }
    }

    .checklist-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 0;
      font-size: 0.875rem;
      color: var(--uamp-text-muted);

      &.checked { color: var(--uamp-text-primary); }
    }

    .lobby-start-btn {
      width: 100%;
      padding: 14px;
      font-size: 1.05rem;

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  `]
})
export class ExamLobbyComponent implements OnInit, OnDestroy {
  exam = signal<Exam | null>(null);
  canStart = signal(false);
  checks = { stableConnection: false, cameraReady: false, fullscreenReady: false };
  private tickSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private examService: ExamService
  ) {}

  ngOnInit(): void {
    const examId = this.route.snapshot.paramMap.get('examId')!;
    // Run pre-checks
    this.checks.stableConnection = navigator.onLine;
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        stream.getTracks().forEach(t => t.stop());
        this.checks.cameraReady = true;
      })
      .catch(() => (this.checks.cameraReady = false));
    this.checks.fullscreenReady = !!document.documentElement.requestFullscreen;

    // Refresh the timetable so an admin's force-start becomes available in the lobby.
    this.tickSub = timer(0, 3000).pipe(
      switchMap(() => this.examService.getExam(examId))
    ).subscribe({
      next: exam => {
        this.exam.set(exam);
        const now = Date.now();
        const startTime = new Date(exam.scheduledStart).getTime();
        const endTime = new Date(exam.scheduledEnd).getTime();



        // Allow start if exam is live (primary check - server authority)
        // Also allow if exam is 'scheduled' but start time has passed (auto-start)
        // Prioritize server status over client time for live exams
        const shouldStart = exam.status === 'live' || 
                           (exam.status === 'scheduled' && now >= startTime && now < endTime);

        this.canStart.set(shouldStart);
        
        // Auto-navigate if exam becomes live and user can start
        if (shouldStart && this.checks.stableConnection && this.checks.cameraReady) {
          // Optionally auto-start: this.startExam();
        }
      },
      error: (error) => {
        console.error('Failed to load exam in lobby:', error);
        this.canStart.set(false);
      }
    });
  }

  startExam(): void {
    const exam = this.exam();
    if (exam) {
      this.router.navigate(['/student/exam', exam.id, 'runner']);
    }
  }

  ngOnDestroy(): void {
    this.tickSub?.unsubscribe();
  }
}
