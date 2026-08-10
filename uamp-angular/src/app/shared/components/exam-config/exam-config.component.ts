import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface ExamConfig {
  shuffleSections?: boolean;
  shuffleQuestionsWithinSection?: boolean;
  showOneQuestionAtATime?: boolean;
  allowBackNavigation?: boolean;
  negativeMarking?: {
    enabled: boolean;
    penaltyPerWrong: number;
  };
  passingScorePercentage?: number;
  integrityMonitoring?: {
    enabled: boolean;
    strikeThreshold: number;
    autoSubmitOnThreshold: boolean;
    trackedEvents: string[];
  };
  resultVisibility?: 'immediate' | 'on_release_date' | 'manual_release';
  resultsReleaseAt?: string;
}

@Component({
  selector: 'app-exam-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="exam-config-container">
      <div class="config-header">
        <h3>⚙️ Advanced Exam Configuration</h3>
      </div>

      <div class="config-section">
        <h4>Question Display</h4>
        <div class="config-item">
          <label class="checkbox-label">
            <input
              type="checkbox"
              [(ngModel)]="config().shuffleSections"
              (change)="updateConfig()"
            />
            <span>Shuffle Sections</span>
          </label>
          <p class="config-description">Randomize the order of exam sections</p>
        </div>

        <div class="config-item">
          <label class="checkbox-label">
            <input
              type="checkbox"
              [(ngModel)]="config().shuffleQuestionsWithinSection"
              (change)="updateConfig()"
            />
            <span>Shuffle Questions Within Sections</span>
          </label>
          <p class="config-description">Randomize question order within each section</p>
        </div>

        <div class="config-item">
          <label class="checkbox-label">
            <input
              type="checkbox"
              [(ngModel)]="config().showOneQuestionAtATime"
              (change)="updateConfig()"
            />
            <span>Show One Question at a Time</span>
          </label>
          <p class="config-description">Display questions individually instead of all at once</p>
        </div>

        <div class="config-item">
          <label class="checkbox-label">
            <input
              type="checkbox"
              [(ngModel)]="config().allowBackNavigation"
              (change)="updateConfig()"
            />
            <span>Allow Back Navigation</span>
          </label>
          <p class="config-description">Allow students to return to previous questions</p>
        </div>
      </div>

      <div class="config-section">
        <h4>Grading & Scoring</h4>
        <div class="config-item">
          <label class="checkbox-label">
            <input
              type="checkbox"
              [checked]="config().negativeMarking?.enabled"
              (change)="toggleNegativeMarkingEnabled()"
            />
            <span>Enable Negative Marking</span>
          </label>
          <div class="config-input" *ngIf="config().negativeMarking?.enabled">
            <label>Penalty per wrong answer:</label>
            <input
              type="number"
              [value]="config().negativeMarking?.penaltyPerWrong"
              (input)="updateNegativeMarkingPenalty($event)"
              min="0"
              max="10"
              step="0.5"
            />
          </div>
        </div>

        <div class="config-item">
          <label>Passing Score Percentage:</label>
          <input
            type="number"
            [(ngModel)]="config().passingScorePercentage"
            (change)="updateConfig()"
            min="0"
            max="100"
            step="1"
          />
          <p class="config-description">Minimum percentage required to pass (leave empty for no minimum)</p>
        </div>
      </div>

      <div class="config-section">
        <h4>Integrity Monitoring</h4>
        <div class="config-item">
          <label class="checkbox-label">
            <input
              type="checkbox"
              [checked]="config().integrityMonitoring?.enabled"
              (change)="toggleIntegrityMonitoringEnabled()"
            />
            <span>Enable Integrity Monitoring</span>
          </label>
        </div>

        <div class="config-input" *ngIf="config().integrityMonitoring?.enabled">
          <label>Strike Threshold:</label>
          <input
            type="number"
            [value]="config().integrityMonitoring?.strikeThreshold"
            (input)="updateStrikeThreshold($event)"
            min="1"
            max="10"
          />
          <p class="config-description">Number of strikes before auto-submit</p>
        </div>

        <div class="config-item" *ngIf="config().integrityMonitoring?.enabled">
          <label class="checkbox-label">
            <input
              type="checkbox"
              [checked]="config().integrityMonitoring?.autoSubmitOnThreshold"
              (change)="toggleAutoSubmitOnThreshold()"
            />
            <span>Auto-Submit on Threshold</span>
          </label>
        </div>

        <div class="config-item" *ngIf="config().integrityMonitoring?.enabled">
          <label>Tracked Events:</label>
          <div class="checkbox-group">
            <label class="checkbox-label">
              <input
                type="checkbox"
                [checked]="isEventTracked('focus_loss')"
                (change)="toggleEvent('focus_loss')"
              />
              <span>Focus Loss</span>
            </label>
            <label class="checkbox-label">
              <input
                type="checkbox"
                [checked]="isEventTracked('visibility_hidden')"
                (change)="toggleEvent('visibility_hidden')"
              />
              <span>Visibility Hidden</span>
            </label>
            <label class="checkbox-label">
              <input
                type="checkbox"
                [checked]="isEventTracked('copy')"
                (change)="toggleEvent('copy')"
              />
              <span>Copy Events</span>
            </label>
            <label class="checkbox-label">
              <input
                type="checkbox"
                [checked]="isEventTracked('paste')"
                (change)="toggleEvent('paste')"
              />
              <span>Paste Events</span>
            </label>
            <label class="checkbox-label">
              <input
                type="checkbox"
                [checked]="isEventTracked('fullscreen_exit')"
                (change)="toggleEvent('fullscreen_exit')"
              />
              <span>Fullscreen Exit</span>
            </label>
          </div>
        </div>
      </div>

      <div class="config-section">
        <h4>Result Visibility</h4>
        <div class="config-item">
          <label>Result Release Policy:</label>
          <select
            [(ngModel)]="config().resultVisibility"
            (change)="updateConfig()"
          >
            <option value="immediate">Immediate (show results after submission)</option>
            <option value="on_release_date">On Release Date</option>
            <option value="manual_release">Manual Release</option>
          </select>
        </div>

        <div class="config-item" *ngIf="config().resultVisibility === 'on_release_date'">
          <label>Release Date:</label>
          <input
            type="datetime-local"
            [(ngModel)]="releaseDate"
            (change)="updateConfig()"
          />
        </div>
      </div>

      <div class="config-footer">
        <button
          (click)="saveConfig()"
          [disabled]="saving()"
          class="save-btn"
        >
          {{ saving() ? 'Saving...' : 'Save Configuration' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .exam-config-container {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 24px;
      backdrop-filter: blur(10px);
    }

    .config-header {
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .config-header h3 {
      margin: 0;
      color: #e6ebf5;
      font-size: 1.25rem;
    }

    .config-section {
      margin-bottom: 24px;
    }

    .config-section h4 {
      margin: 0 0 16px 0;
      color: #e6ebf5;
      font-size: 1rem;
    }

    .config-item {
      margin-bottom: 16px;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #e6ebf5;
      font-size: 0.875rem;
      cursor: pointer;
    }

    .checkbox-label input[type="checkbox"] {
      width: 16px;
      height: 16px;
      cursor: pointer;
    }

    .config-description {
      margin: 4px 0 0 24px;
      color: #94a3b8;
      font-size: 0.75rem;
    }

    .config-input {
      margin-top: 12px;
      padding-left: 24px;
    }

    .config-input label {
      display: block;
      color: #94a3b8;
      font-size: 0.875rem;
      margin-bottom: 8px;
    }

    .config-input input,
    .config-input select {
      width: 100%;
      max-width: 300px;
      padding: 8px 12px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      color: #e6ebf5;
      font-size: 0.875rem;
    }

    .config-input input:focus,
    .config-input select:focus {
      outline: none;
      border-color: #6366f1;
    }

    .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 8px;
    }

    .config-footer {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .save-btn {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .save-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }

    .save-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `]
})
export class ExamConfigComponent implements OnInit {
  @Input() examId: string = '';
  config = signal<ExamConfig>({
    shuffleSections: false,
    shuffleQuestionsWithinSection: false,
    showOneQuestionAtATime: false,
    allowBackNavigation: true,
    negativeMarking: {
      enabled: false,
      penaltyPerWrong: 0.5
    },
    passingScorePercentage: undefined,
    integrityMonitoring: {
      enabled: true,
      strikeThreshold: 3,
      autoSubmitOnThreshold: true,
      trackedEvents: ['focus_loss', 'visibility_hidden']
    },
    resultVisibility: 'immediate',
    resultsReleaseAt: undefined
  });
  releaseDate = signal<string>('');
  saving = signal(false);

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    if (this.examId) {
      this.loadConfig();
    }
  }

  loadConfig(): void {
    const token = localStorage.getItem('auth_token');
    this.http.get<ExamConfig>(`${environment.apiBaseUrl}/exams/${this.examId}/config`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: (data) => {
        this.config.set(data);
        if (data.resultsReleaseAt) {
          this.releaseDate.set(new Date(data.resultsReleaseAt).toISOString().slice(0, 16));
        }
      },
      error: (err) => console.error('Failed to load exam config:', err)
    });
  }

  toggleNegativeMarkingEnabled(): void {
    this.config.update(c => ({
      ...c,
      negativeMarking: {
        ...c.negativeMarking!,
        enabled: !c.negativeMarking?.enabled
      }
    }));
    this.saveConfig();
  }

  updateNegativeMarkingPenalty(event: Event): void {
    const value = parseFloat((event.target as HTMLInputElement).value);
    this.config.update(c => ({
      ...c,
      negativeMarking: {
        ...c.negativeMarking!,
        penaltyPerWrong: value
      }
    }));
    this.saveConfig();
  }

  toggleIntegrityMonitoringEnabled(): void {
    this.config.update(c => ({
      ...c,
      integrityMonitoring: {
        ...c.integrityMonitoring!,
        enabled: !c.integrityMonitoring?.enabled
      }
    }));
    this.saveConfig();
  }

  updateStrikeThreshold(event: Event): void {
    const value = parseInt((event.target as HTMLInputElement).value);
    this.config.update(c => ({
      ...c,
      integrityMonitoring: {
        ...c.integrityMonitoring!,
        strikeThreshold: value
      }
    }));
    this.saveConfig();
  }

  toggleAutoSubmitOnThreshold(): void {
    this.config.update(c => ({
      ...c,
      integrityMonitoring: {
        ...c.integrityMonitoring!,
        autoSubmitOnThreshold: !c.integrityMonitoring?.autoSubmitOnThreshold
      }
    }));
    this.saveConfig();
  }

  updateConfig(): void {
    // Update resultsReleaseAt when releaseDate changes
    if (this.releaseDate()) {
      this.config.update(c => ({
        ...c,
        resultsReleaseAt: new Date(this.releaseDate()).toISOString()
      }));
    }
  }

  isEventTracked(event: string): boolean {
    return this.config().integrityMonitoring?.trackedEvents?.includes(event) || false;
  }

  toggleEvent(event: string): void {
    const currentEvents = this.config().integrityMonitoring?.trackedEvents || [];
    const newEvents = currentEvents.includes(event)
      ? currentEvents.filter(e => e !== event)
      : [...currentEvents, event];

    this.config.update(c => ({
      ...c,
      integrityMonitoring: {
        ...c.integrityMonitoring!,
        trackedEvents: newEvents
      }
    }));
    this.saveConfig();
  }

  saveConfig(): void {
    if (!this.examId) return;

    this.saving.set(true);
    const token = localStorage.getItem('auth_token');

    this.http.put(`${environment.apiBaseUrl}/exams/${this.examId}/config`, this.config(), {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: () => {
        this.saving.set(false);
        alert('Configuration saved successfully!');
      },
      error: (err) => {
        this.saving.set(false);
        alert('Failed to save configuration: ' + (err.error?.error || err.message));
        console.error('Failed to save config:', err);
      }
    });
  }
}