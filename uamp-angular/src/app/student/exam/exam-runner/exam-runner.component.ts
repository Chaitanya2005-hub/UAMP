import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { interval, Subscription, filter, switchMap, tap } from 'rxjs';
import { ExamService } from '../../services/exam.service';
import { IndexedDbExamStoreService } from '../../services/indexeddb-exam-store.service';
import { LocalEncryptionService } from '../../services/local-encryption.service';
import { Question } from '../../../core/models';
import { QuestionPanelComponent } from '../question-panel/question-panel.component';
import { ProctorOverlayComponent } from '../proctor-overlay/proctor-overlay.component';
import { CountdownPipe } from '../../../shared/pipes/countdown.pipe';

@Component({
  selector: 'app-exam-runner',
  standalone: true,
  imports: [CommonModule, QuestionPanelComponent, ProctorOverlayComponent, CountdownPipe],
  template: `
    <div class="exam-runner">
      <!-- Top Bar -->
      <div class="exam-topbar">
        <div class="exam-topbar-left">
          <span class="exam-title">{{ examTitle() }}</span>
          <span class="badge badge--info">{{ currentIndex() + 1 }}/{{ questions().length }}</span>
        </div>
        <div class="exam-topbar-center">
          <div class="exam-timer" [class.timer-warning]="timeRemaining() < 300000">
            ⏱ {{ endTime() | countdown }}
          </div>
        </div>
        <div class="exam-topbar-right">
          <span class="sync-indicator" [class.synced]="lastSynced()">
            {{ lastSynced() ? '☁️ Synced' : '💾 Local' }}
          </span>
          <button class="btn btn-danger btn-sm" (click)="submitExam()">Submit</button>
        </div>
      </div>

      <!-- Main Content -->
      <div class="exam-body">
        <!-- Question Navigator -->
        <aside class="question-nav">
          <h3>Questions</h3>
          <div class="nav-grid">
            <button
              *ngFor="let q of questions(); let i = index"
              class="nav-btn"
              [class.active]="i === currentIndex()"
              [class.answered]="answers()[q.id] !== undefined"
              (click)="goToQuestion(i)"
            >
              {{ i + 1 }}
            </button>
          </div>
        </aside>

        <!-- Active Question -->
        <main class="question-area">
          <app-question-panel
            *ngIf="currentQuestion()"
            [question]="currentQuestion()!"
            [answer]="answers()[currentQuestion()!.id]"
            (answerChanged)="onAnswerChanged($event)"
          />
          <div class="question-actions">
            <button class="btn btn-secondary" (click)="prevQuestion()" [disabled]="currentIndex() === 0">
              ← Previous
            </button>
            <button class="btn btn-primary" (click)="nextQuestion()" [disabled]="currentIndex() === questions().length - 1">
              Next →
            </button>
          </div>
        </main>
      </div>

      <!-- Proctor Overlay (camera pip) -->
      <app-proctor-overlay [submissionId]="submissionId" [examId]="examId" />
    </div>
  `,
  styles: [`
    .exam-runner {
      height: 100vh;
      display: flex;
      flex-direction: column;
      background: var(--uamp-bg-base);
    }

    .exam-topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 24px;
      background: var(--uamp-bg-elevated);
      border-bottom: 1px solid var(--uamp-glass-border);
    }

    .exam-topbar-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .exam-title {
      font-family: var(--uamp-font-display);
      font-weight: 600;
    }

    .exam-timer {
      font-family: var(--uamp-font-display);
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--uamp-accent-secondary);
    }

    .timer-warning {
      color: var(--uamp-accent-critical) !important;
      animation: pulse-live 1s ease-in-out infinite;
    }

    .exam-topbar-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .sync-indicator {
      font-size: 0.8125rem;
      color: var(--uamp-text-muted);
    }

    .sync-indicator.synced {
      color: var(--uamp-accent-success);
    }

    .btn-sm { padding: 6px 16px; font-size: 0.8125rem; }

    .exam-body {
      flex: 1;
      display: flex;
      overflow: hidden;
    }

    .question-nav {
      width: 240px;
      padding: 20px;
      background: var(--uamp-bg-elevated);
      border-right: 1px solid var(--uamp-glass-border);
      overflow-y: auto;

      h3 {
        font-size: 0.875rem;
        color: var(--uamp-text-muted);
        margin-bottom: 16px;
      }
    }

    .nav-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
    }

    .nav-btn {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--uamp-glass-border);
      border-radius: var(--uamp-radius-sm);
      background: transparent;
      color: var(--uamp-text-muted);
      font-size: 0.8125rem;
      cursor: pointer;
      transition: all 150ms;

      &.active {
        background: var(--uamp-accent-primary);
        color: #fff;
        border-color: var(--uamp-accent-primary);
      }

      &.answered:not(.active) {
        background: rgba(52, 211, 153, 0.15);
        border-color: var(--uamp-accent-success);
        color: var(--uamp-accent-success);
      }
    }

    .question-area {
      flex: 1;
      padding: 32px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }

    .question-actions {
      display: flex;
      justify-content: space-between;
      margin-top: auto;
      padding-top: 24px;
    }

    @media (max-width: 1024px) {
      .question-nav { width: 180px; }
      .nav-grid { grid-template-columns: repeat(3, 1fr); }
    }

    @media (max-width: 640px) {
      .question-nav { display: none; }
    }
  `]
})
export class ExamRunnerComponent implements OnInit, OnDestroy {
  examId = '';
  submissionId = '';
  examTitle = signal('');
  questions = signal<Question[]>([]);
  currentIndex = signal(0);
  currentQuestion = signal<Question | null>(null);
  answers = signal<Record<string, unknown>>({});
  endTime = signal<Date>(new Date());
  lastSynced = signal(false);
  submissionInProgress = true;
  isSubmitted = false;
  timeRemaining = signal(0);

  private autosaveSub?: Subscription;
  private syncSub?: Subscription;
  private timerSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private examService: ExamService,
    private localStore: IndexedDbExamStoreService,
    private encryption: LocalEncryptionService
  ) {}

  ngOnInit(): void {
    this.examId = this.route.snapshot.paramMap.get('examId')!;

    this.examService.startExam(this.examId).subscribe({
      next: async (res) => {
        this.submissionId = res.submissionId;
        await this.encryption.deriveKey(res.sessionSecret);
        this.questions.set(res.questions);
        if (res.questions.length > 0) {
          this.currentQuestion.set(res.questions[0]);
        }

        // Try restoring from IndexedDB
        const restored = await this.localStore.loadAnswers(this.submissionId);
        if (restored) {
          this.answers.set(restored as Record<string, unknown>);
        }

        // Fetch exam info for timer
        this.examService.getExam(this.examId).subscribe(exam => {
          this.examTitle.set(exam.title);
          this.endTime.set(new Date(exam.scheduledEnd));
        });

        this.startAutosave();
        this.startSync();
        this.startTimer();
      },
    });
  }

  onAnswerChanged(event: { questionId: string; value: unknown }): void {
    const current = { ...this.answers() };
    current[event.questionId] = event.value;
    this.answers.set(current);
  }

  goToQuestion(index: number): void {
    this.currentIndex.set(index);
    this.currentQuestion.set(this.questions()[index]);
  }

  nextQuestion(): void {
    if (this.currentIndex() < this.questions().length - 1) {
      this.goToQuestion(this.currentIndex() + 1);
    }
  }

  prevQuestion(): void {
    if (this.currentIndex() > 0) {
      this.goToQuestion(this.currentIndex() - 1);
    }
  }

  submitExam(): void {
    if (!confirm('Are you sure you want to submit? You cannot undo this action.')) return;

    this.examService.submitExam(this.submissionId).subscribe({
      next: () => {
        this.isSubmitted = true;
        this.submissionInProgress = false;
        this.router.navigate(['/student/exam', this.examId, 'submitted']);
      },
    });
  }

  private startAutosave(): void {
    this.autosaveSub = interval(5000).subscribe(() => {
      this.localStore.saveAnswers(this.submissionId, this.examId, this.answers());
    });
  }

  private startSync(): void {
    this.syncSub = interval(15000).pipe(
      filter(() => navigator.onLine),
      switchMap(() => this.examService.syncAnswers(this.submissionId, this.answers())),
      tap(() => {
        this.localStore.markSynced(this.submissionId);
        this.lastSynced.set(true);
      })
    ).subscribe({
      error: () => this.lastSynced.set(false),
    });
  }

  private startTimer(): void {
    this.timerSub = interval(1000).subscribe(() => {
      const remaining = this.endTime().getTime() - Date.now();
      this.timeRemaining.set(remaining);
      if (remaining <= 0) {
        this.examService.submitExam(this.submissionId, { reason: 'expired' }).subscribe(() => {
          this.isSubmitted = true;
          this.submissionInProgress = false;
          this.router.navigate(['/student/exam', this.examId, 'submitted']);
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.autosaveSub?.unsubscribe();
    this.syncSub?.unsubscribe();
    this.timerSub?.unsubscribe();
  }
}
