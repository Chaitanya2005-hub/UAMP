import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormControl, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { FormsModule } from '@angular/forms';

interface McqOptionForm {
  text: FormControl<string>;
  isCorrect: FormControl<boolean>;
}

interface QuestionForm {
  prompt: FormControl<string>;
  type: FormControl<'mcq_single' | 'mcq_multi' | 'true_false' | 'short_answer' | 'essay'>;
  bloomLevel: FormControl<'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create'>;
  marks: FormControl<number>;
  options: FormArray<FormGroup<McqOptionForm>>;
}

function buildQuestionForm(fb: FormBuilder): FormGroup<QuestionForm> {
  return fb.group({
    prompt: fb.control('', { nonNullable: true, validators: [Validators.required, Validators.minLength(5)] }),
    type: fb.control<QuestionForm['type']['value']>('mcq_single', { nonNullable: true }),
    bloomLevel: fb.control<QuestionForm['bloomLevel']['value']>('understand', { nonNullable: true }),
    marks: fb.control(1, { nonNullable: true, validators: [Validators.required, Validators.min(0.5)] }),
    options: fb.array<FormGroup<McqOptionForm>>([], atLeastOneCorrectValidator())
  });
}

// Custom validator ensuring MCQ integrity before submission for approval
function atLeastOneCorrectValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const arr = control as FormArray;
    const hasCorrect = arr.controls.some(c => c.get('isCorrect')?.value === true);
    return hasCorrect ? null : { noCorrectOption: true };
  };
}

@Component({
  selector: 'app-mcq-builder',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="mcq-builder-container">
      <div class="glass-panel">
        <div class="builder-header">
          <h2>MCQ Question Builder</h2>
          <div class="header-actions">
            <button class="btn-secondary" (click)="onSaveDraft()">Save Draft</button>
            <button class="btn-primary" (click)="onSubmitForApproval()">Submit for Approval</button>
          </div>
        </div>

        <div class="questions-container">
          <div class="question-card" *ngFor="let questionGroup of questionsArray.controls; let i = index">
            <div class="question-header">
              <span class="question-number">Question {{ i + 1 }}</span>
              <button class="btn-delete" (click)="removeQuestion(i)" *ngIf="questionsArray.length > 1">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </div>

            <div class="form-row">
              <div class="form-group full-width">
                <label>Question Prompt</label>
                <textarea [formControlName]="'prompt'" rows="3" placeholder="Enter your question here..."></textarea>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Question Type</label>
                <select [formControlName]="'type'" (change)="onTypeChange(i)">
                  <option value="mcq_single">Single Choice MCQ</option>
                  <option value="mcq_multi">Multiple Choice MCQ</option>
                  <option value="true_false">True/False</option>
                  <option value="short_answer">Short Answer</option>
                  <option value="essay">Essay</option>
                </select>
              </div>

              <div class="form-group">
                <label>Bloom's Level</label>
                <select [formControlName]="'bloomLevel'">
                  <option value="remember">Remember</option>
                  <option value="understand">Understand</option>
                  <option value="apply">Apply</option>
                  <option value="analyze">Analyze</option>
                  <option value="evaluate">Evaluate</option>
                  <option value="create">Create</option>
                </select>
              </div>

              <div class="form-group">
                <label>Marks</label>
                <input type="number" [formControlName]="'marks'" min="0.5" step="0.5" />
              </div>
            </div>

            <div class="options-section" *ngIf="isMcqOrTrueFalse(i)">
              <div class="options-header">
                <label>Options</label>
                <button class="btn-add-option" (click)="addOption(i)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Add Option
                </button>
              </div>
              
              <div class="options-list" [formArrayName]="'options'">
                <div class="option-item" *ngFor="let optionGroup of getOptionsArray(i).controls; let j = index">
                  <div class="option-input-group">
                    <span class="option-label">{{ getOptionLabel(j) }}.</span>
                    <input type="text" [formControlName]="'text'" placeholder="Option text" />
                    <label class="correct-checkbox">
                      <input type="checkbox" [formControlName]="'isCorrect'" [disabled]="isSingleChoice(i) && isOptionSelected(i, j)" />
                      <span>Correct</span>
                    </label>
                    <button class="btn-remove-option" (click)="removeOption(i, j)" *ngIf="getOptionsArray(i).length > 2">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="builder-actions">
          <button class="btn-secondary" (click)="addQuestion()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Question
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mcq-builder-container {
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

    .builder-header {
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

    .header-actions {
      display: flex;
      gap: 1rem;
    }

    .btn-primary,
    .btn-secondary,
    .btn-delete,
    .btn-add-option,
    .btn-remove-option {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
      border: none;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-primary {
      background: #6366f1;
      color: white;
    }

    .btn-primary:hover {
      background: #5558e3;
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.08);
      color: #e6ebf5;
      border: 1px solid rgba(255, 255, 255, 0.14);
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.12);
    }

    .btn-delete {
      padding: 0.5rem;
      background: rgba(248, 113, 113, 0.1);
      color: #f87171;
      border: 1px solid rgba(248, 113, 113, 0.3);
    }

    .btn-delete:hover {
      background: rgba(248, 113, 113, 0.2);
    }

    .questions-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .question-card {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 1.5rem;
    }

    .question-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .question-number {
      color: #6366f1;
      font-weight: 600;
      font-size: 1.1rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    label {
      color: #e6ebf5;
      margin-bottom: 0.5rem;
      font-weight: 500;
      font-size: 0.875rem;
    }

    input[type="text"],
    input[type="number"],
    select,
    textarea {
      width: 100%;
      padding: 0.75rem 1rem;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 8px;
      color: #e6ebf5;
      font-size: 0.95rem;
      transition: all 0.15s ease;
    }

    input:focus,
    select:focus,
    textarea:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
    }

    textarea {
      resize: vertical;
      min-height: 80px;
    }

    .options-section {
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    .options-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .btn-add-option {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      background: rgba(34, 211, 238, 0.1);
      color: #22d3ee;
      border: 1px solid rgba(34, 211, 238, 0.3);
    }

    .btn-add-option:hover {
      background: rgba(34, 211, 238, 0.2);
    }

    .options-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .option-item {
      background: rgba(255, 255, 255, 0.02);
      border-radius: 8px;
      padding: 0.75rem;
    }

    .option-input-group {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .option-label {
      color: #94a3b8;
      font-weight: 600;
      min-width: 24px;
    }

    .option-input-group input[type="text"] {
      flex: 1;
    }

    .correct-checkbox {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      color: #94a3b8;
      font-size: 0.875rem;
    }

    .correct-checkbox input[type="checkbox"] {
      width: 18px;
      height: 18px;
      accent-color: #34d399;
    }

    .correct-checkbox input[type="checkbox"]:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-remove-option {
      padding: 0.25rem;
      background: transparent;
      color: #94a3b8;
      border: none;
    }

    .btn-remove-option:hover {
      color: #f87171;
    }

    .builder-actions {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid rgba(255, 255, 255, 0.14);
    }

    .builder-actions .btn-secondary {
      width: 100%;
      justify-content: center;
    }

    svg {
      width: 18px;
      height: 18px;
    }
  `]
})
export class McqBuilderComponent implements OnInit {
  questionsForm: FormGroup;
  questionsArray: FormArray;

  constructor(private fb: FormBuilder) {
    this.questionsForm = this.fb.group({
      questions: this.fb.array([])
    });
    this.questionsArray = this.questionsForm.get('questions') as FormArray;
  }

  ngOnInit(): void {
    this.addQuestion();
  }

  buildQuestionForm(): FormGroup {
    return this.fb.group({
      prompt: this.fb.control('', { nonNullable: true, validators: [Validators.required, Validators.minLength(5)] }),
      type: this.fb.control<QuestionForm['type']['value']>('mcq_single', { nonNullable: true }),
      bloomLevel: this.fb.control<QuestionForm['bloomLevel']['value']>('understand', { nonNullable: true }),
      marks: this.fb.control(1, { nonNullable: true, validators: [Validators.required, Validators.min(0.5)] }),
      options: this.fb.array([])
    });
  }

  buildOptionForm(): FormGroup {
    return this.fb.group({
      text: this.fb.control('', Validators.required),
      isCorrect: this.fb.control(false)
    });
  }

  addQuestion(): void {
    const questionForm = this.buildQuestionForm();
    this.questionsArray.push(questionForm);
    // Add default options for MCQ
    this.addOption(this.questionsArray.length - 1);
    this.addOption(this.questionsArray.length - 1);
  }

  removeQuestion(index: number): void {
    this.questionsArray.removeAt(index);
  }

  getOptionsArray(questionIndex: number): FormArray {
    return this.questionsArray.at(questionIndex).get('options') as FormArray;
  }

  addOption(questionIndex: number): void {
    const optionsArray = this.getOptionsArray(questionIndex);
    optionsArray.push(this.buildOptionForm());
  }

  removeOption(questionIndex: number, optionIndex: number): void {
    const optionsArray = this.getOptionsArray(questionIndex);
    optionsArray.removeAt(optionIndex);
  }

  isMcqOrTrueFalse(questionIndex: number): boolean {
    const questionGroup = this.questionsArray.at(questionIndex) as FormGroup;
    const type = questionGroup.get('type')?.value;
    return ['mcq_single', 'mcq_multi', 'true_false'].includes(type);
  }

  isSingleChoice(questionIndex: number): boolean {
    const questionGroup = this.questionsArray.at(questionIndex) as FormGroup;
    return questionGroup.get('type')?.value === 'mcq_single';
  }

  isOptionSelected(questionIndex: number, currentOptionIndex: number): boolean {
    const optionsArray = this.getOptionsArray(questionIndex);
    return optionsArray.controls.some((control, index) => 
      index !== currentOptionIndex && (control as FormGroup).get('isCorrect')?.value === true
    );
  }

  onTypeChange(questionIndex: number): void {
    const questionGroup = this.questionsArray.at(questionIndex) as FormGroup;
    const type = questionGroup.get('type')?.value;
    const optionsArray = this.getOptionsArray(questionIndex);

    if (type === 'true_false') {
      optionsArray.clear();
      optionsArray.push(this.fb.group({ text: ['True'], isCorrect: [false] }));
      optionsArray.push(this.fb.group({ text: ['False'], isCorrect: [false] }));
    } else if (!this.isMcqOrTrueFalse(questionIndex)) {
      optionsArray.clear();
    } else if (optionsArray.length === 0) {
      this.addOption(questionIndex);
      this.addOption(questionIndex);
    }
  }

  onSaveDraft(): void {
    console.log('Saving draft:', this.questionsForm.value);
  }

  onSubmitForApproval(): void {
    if (this.questionsForm.valid) {
      console.log('Submitting for approval:', this.questionsForm.value);
    } else {
      console.log('Form is invalid');
    }
  }

  getOptionLabel(index: number): string {
    return String.fromCharCode(65 + index);
  }
}