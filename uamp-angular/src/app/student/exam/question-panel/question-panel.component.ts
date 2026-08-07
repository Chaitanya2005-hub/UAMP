import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Question } from '../../../core/models';
import { BloomLevelLabelPipe } from '../../../shared/pipes/bloom-level-label.pipe';

@Component({
  selector: 'app-question-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, BloomLevelLabelPipe],
  template: `
    <div class="question-panel">
      <div class="question-header">
        <div class="question-meta">
          <span class="badge badge--primary">{{ question.bloomLevel | bloomLevelLabel }}</span>
          <span class="question-marks">{{ question.marks }} mark{{ question.marks !== 1 ? 's' : '' }}</span>
        </div>
      </div>

      <div class="question-prompt">
        <p>{{ question.prompt }}</p>
      </div>

      <!-- MCQ Single / True-False -->
      <div class="options-list" *ngIf="question.type === 'mcq_single' || question.type === 'true_false'">
        <div
          *ngFor="let option of question.options; let i = index"
          class="mcq-option"
          [class.selected]="answer === option.id"
          (click)="selectOption(option.id)"
        >
          <span class="option-letter">{{ getOptionLetter(i) }}</span>
          <span class="option-text">{{ option.text }}</span>
        </div>
      </div>

      <!-- MCQ Multi -->
      <div class="options-list" *ngIf="question.type === 'mcq_multi'">
        <div
          *ngFor="let option of question.options; let i = index"
          class="mcq-option"
          [class.selected]="isMultiSelected(option.id)"
          (click)="toggleMultiOption(option.id)"
        >
          <span class="option-check">{{ isMultiSelected(option.id) ? '☑' : '☐' }}</span>
          <span class="option-text">{{ option.text }}</span>
        </div>
      </div>

      <!-- Short Answer -->
      <div class="text-answer" *ngIf="question.type === 'short_answer'">
        <input
          type="text"
          class="form-input"
          placeholder="Type your answer..."
          [ngModel]="answer"
          (ngModelChange)="emitAnswer($event)"
        />
      </div>

      <!-- Essay -->
      <div class="text-answer" *ngIf="question.type === 'essay'">
        <textarea
          class="form-input essay-input"
          placeholder="Write your essay answer..."
          rows="8"
          [ngModel]="answer"
          (ngModelChange)="emitAnswer($event)"
        ></textarea>
      </div>
    </div>
  `,
  styles: [`
    .question-panel {
      flex: 1;
    }

    .question-header {
      margin-bottom: 20px;
    }

    .question-meta {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .question-marks {
      font-size: 0.8125rem;
      color: var(--uamp-text-muted);
    }

    .question-prompt {
      margin-bottom: 28px;

      p {
        font-size: 1.0625rem;
        line-height: 1.7;
      }
    }

    .options-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .mcq-option {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 20px;
      border: 1px solid var(--uamp-glass-border);
      border-radius: var(--uamp-radius-md);
      background: rgba(255, 255, 255, 0.02);
      cursor: pointer;
      transition: background 150ms, border-color 150ms, transform 150ms;

      &:active { transform: scale(0.98); }

      &.selected {
        background: rgba(99, 102, 241, 0.16);
        border-color: var(--uamp-accent-primary);
        box-shadow: 0 0 0 1px var(--uamp-accent-primary) inset;
      }
    }

    .option-letter {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.06);
      font-weight: 600;
      font-size: 0.8125rem;
      flex-shrink: 0;
    }

    .selected .option-letter {
      background: var(--uamp-accent-primary);
      color: #fff;
    }

    .option-check {
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .essay-input {
      resize: vertical;
      min-height: 160px;
    }
  `]
})
export class QuestionPanelComponent {
  @Input() question!: Question;
  @Input() answer: unknown;
  @Output() answerChanged = new EventEmitter<{ questionId: string; value: unknown }>();

  selectOption(optionId: string): void {
    this.answerChanged.emit({ questionId: this.question.id, value: optionId });
  }

  toggleMultiOption(optionId: string): void {
    const current = (this.answer as string[]) || [];
    const updated = current.includes(optionId)
      ? current.filter(id => id !== optionId)
      : [...current, optionId];
    this.answerChanged.emit({ questionId: this.question.id, value: updated });
  }

  isMultiSelected(optionId: string): boolean {
    return Array.isArray(this.answer) && this.answer.includes(optionId);
  }

  emitAnswer(value: unknown): void {
    this.answerChanged.emit({ questionId: this.question.id, value });
  }

  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }
}
