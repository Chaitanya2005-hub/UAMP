import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Question {
  id?: string;
  type: 'mcq_single' | 'mcq_multi' | 'true_false' | 'short_answer' | 'numeric' | 'essay' | 'matching' | 'ordering' | 'fill_blank' | 'code';
  prompt: string;
  options?: Array<{ id: string; text: string; isCorrect: boolean }>;
  correctAnswer?: string;
  marks: number;
  orderIndex: number;
  bloomLevel?: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
}

@Component({
  selector: 'app-question-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="question-builder">
      <div class="question-header">
        <select [(ngModel)]="question().type" (change)="onTypeChange()" class="question-type-select">
          <option value="mcq_single">Single Choice MCQ</option>
          <option value="mcq_multi">Multiple Choice MCQ</option>
          <option value="true_false">True/False</option>
          <option value="short_answer">Short Answer</option>
          <option value="numeric">Numeric Answer</option>
          <option value="essay">Essay Question</option>
          <option value="matching">Matching Items</option>
          <option value="ordering">Ordering/Sequence</option>
          <option value="fill_blank">Fill in the Blanks</option>
          <option value="code">Code Answer</option>
        </select>

        <input
          type="number"
          [(ngModel)]="question().marks"
          class="marks-input"
          placeholder="Marks"
          min="1"
        />

        <select [(ngModel)]="question().bloomLevel" class="bloom-select">
          <option value="">Bloom's Level</option>
          <option value="remember">Remember</option>
          <option value="understand">Understand</option>
          <option value="apply">Apply</option>
          <option value="analyze">Analyze</option>
          <option value="evaluate">Evaluate</option>
          <option value="create">Create</option>
        </select>
      </div>

      <div class="question-body">
        <textarea
          [(ngModel)]="question().prompt"
          class="question-prompt"
          placeholder="Enter your question here..."
          rows="3"
        ></textarea>

        <!-- MCQ Options -->
        <div *ngIf="isMCQType()" class="options-section">
          <div class="options-header">
            <h4>Options</h4>
            <button (click)="addOption()" class="add-option-btn">+ Add Option</button>
          </div>
          <div *ngFor="let option of question().options; let i = index" class="option-item">
            <input
              type="checkbox"
              [(ngModel)]="option.isCorrect"
              class="option-correct"
            />
            <input
              [(ngModel)]="option.text"
              class="option-text"
              [placeholder]="'Option ' + (i + 1)"
            />
            <button (click)="removeOption(i)" class="remove-option-btn">×</button>
          </div>
        </div>

        <!-- True/False -->
        <div *ngIf="question().type === 'true_false'" class="tf-section">
          <label class="radio-label">
            <input type="radio" [(ngModel)]="question().correctAnswer" value="true" />
            <span>True</span>
          </label>
          <label class="radio-label">
            <input type="radio" [(ngModel)]="question().correctAnswer" value="false" />
            <span>False</span>
          </label>
        </div>

        <!-- Short Answer -->
        <div *ngIf="question().type === 'short_answer'" class="answer-section">
          <label>Accepted Answers (comma-separated):</label>
          <input
            [(ngModel)]="question().correctAnswer"
            class="answer-input"
            placeholder="e.g., answer1, answer2, answer3"
          />
          <p class="help-text">Multiple acceptable answers can be provided</p>
        </div>

        <!-- Numeric -->
        <div *ngIf="question().type === 'numeric'" class="numeric-section">
          <div class="numeric-group">
            <label>Correct Answer:</label>
            <input
              type="number"
              [(ngModel)]="numericAnswer"
              class="answer-input"
            />
          </div>
          <div class="numeric-group">
            <label>Tolerance (±):</label>
            <input
              type="number"
              [(ngModel)]="tolerance"
              class="answer-input"
              step="0.1"
            />
          </div>
        </div>

        <!-- Essay -->
        <div *ngIf="question().type === 'essay'" class="essay-section">
          <label>Rubric/Grading Criteria:</label>
          <textarea
            [(ngModel)]="rubric"
            class="rubric-textarea"
            placeholder="Enter grading criteria for this essay question..."
            rows="4"
          ></textarea>
        </div>

        <!-- Code -->
        <div *ngIf="question().type === 'code'" class="code-section">
          <label>Programming Language:</label>
          <select [(ngModel)]="language" class="language-select">
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="c">C</option>
          </select>
          <label>Expected Output:</label>
          <textarea
            [(ngModel)]="expectedOutput"
            class="code-textarea"
            placeholder="Enter expected output..."
            rows="3"
          ></textarea>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .question-builder {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 16px;
    }

    .question-header {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .question-type-select,
    .marks-input,
    .bloom-select {
      padding: 8px 12px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      color: #e6ebf5;
      font-size: 0.875rem;
    }

    .question-type-select {
      flex: 1;
      min-width: 200px;
    }

    .marks-input {
      width: 80px;
    }

    .bloom-select {
      width: 150px;
    }

    .question-body {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .question-prompt {
      width: 100%;
      padding: 12px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      color: #e6ebf5;
      font-size: 0.875rem;
      resize: vertical;
    }

    .options-section {
      background: rgba(255, 255, 255, 0.03);
      border-radius: 8px;
      padding: 16px;
    }

    .options-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .options-header h4 {
      margin: 0;
      color: #e6ebf5;
      font-size: 0.875rem;
    }

    .add-option-btn {
      background: rgba(99, 102, 241, 0.2);
      color: #6366f1;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 0.75rem;
      cursor: pointer;
    }

    .option-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .option-correct {
      width: 16px;
      height: 16px;
      cursor: pointer;
    }

    .option-text {
      flex: 1;
      padding: 8px 12px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      color: #e6ebf5;
      font-size: 0.875rem;
    }

    .remove-option-btn {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
      border: none;
      width: 24px;
      height: 24px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
    }

    .tf-section,
    .answer-section,
    .numeric-section,
    .essay-section,
    .code-section {
      background: rgba(255, 255, 255, 0.03);
      border-radius: 8px;
      padding: 16px;
    }

    .radio-label {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #e6ebf5;
      font-size: 0.875rem;
      margin-right: 16px;
    }

    .answer-section label,
    .numeric-section label,
    .essay-section label,
    .code-section label {
      display: block;
      color: #94a3b8;
      font-size: 0.875rem;
      margin-bottom: 8px;
    }

    .answer-input,
    .language-select {
      width: 100%;
      padding: 8px 12px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      color: #e6ebf5;
      font-size: 0.875rem;
    }

    .help-text {
      margin: 8px 0 0 0;
      color: #94a3b8;
      font-size: 0.75rem;
    }

    .numeric-group {
      margin-bottom: 12px;
    }

    .rubric-textarea,
    .code-textarea {
      width: 100%;
      padding: 12px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      color: #e6ebf5;
      font-size: 0.875rem;
      resize: vertical;
    }
  `]
})
export class QuestionBuilderComponent {
  @Input() question = signal<Question>({
    type: 'mcq_single',
    prompt: '',
    options: [
      { id: 'a', text: '', isCorrect: false },
      { id: 'b', text: '', isCorrect: false },
      { id: 'c', text: '', isCorrect: false },
      { id: 'd', text: '', isCorrect: false }
    ],
    marks: 1,
    orderIndex: 0
  });

  // Additional properties for complex question types
  numericAnswer = signal(0);
  tolerance = signal(0.1);
  rubric = signal('');
  language = signal('python');
  expectedOutput = signal('');

  isMCQType(): boolean {
    return this.question().type === 'mcq_single' || this.question().type === 'mcq_multi';
  }

  onTypeChange(): void {
    const type = this.question().type;

    // Reset options for MCQ types
    if (this.isMCQType()) {
      this.question.update(q => ({
        ...q,
        options: [
          { id: 'a', text: '', isCorrect: false },
          { id: 'b', text: '', isCorrect: false },
          { id: 'c', text: '', isCorrect: false },
          { id: 'd', text: '', isCorrect: false }
        ]
      }));
    } else {
      this.question.update(q => ({ ...q, options: undefined }));
    }

    // Reset correct answer for non-MCQ types
    if (!this.isMCQType() && type !== 'true_false') {
      this.question.update(q => ({ ...q, correctAnswer: undefined }));
    }
  }

  addOption(): void {
    const currentOptions = this.question().options || [];
    const nextId = String.fromCharCode(97 + currentOptions.length);
    this.question.update(q => ({
      ...q,
      options: [...currentOptions, { id: nextId, text: '', isCorrect: false }]
    }));
  }

  removeOption(index: number): void {
    const currentOptions = this.question().options || [];
    if (currentOptions.length > 2) {
      this.question.update(q => ({
        ...q,
        options: currentOptions.filter((_, i) => i !== index)
      }));
    }
  }
}