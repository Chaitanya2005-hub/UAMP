import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ai-generator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="ai-generator-container">
      <div class="glass-panel">
        <h2>AI Question Generator</h2>
        <p class="subtitle">Generate questions automatically using AI based on your course content</p>

        <form [formGroup]="generatorForm" (ngSubmit)="onGenerate()">
          <div class="form-group">
            <label for="course">Course</label>
            <select id="course" formControlName="course">
              <option value="">Select a course</option>
              <option *ngFor="let course of courses" [value]="course.id">
                {{ course.code }} - {{ course.title }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="topic">Topic/Chapter</label>
            <input 
              id="topic" 
              type="text" 
              formControlName="topic" 
              placeholder="e.g., Arrays and Linked Lists"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="questionCount">Number of Questions</label>
              <input 
                id="questionCount" 
                type="number" 
                formControlName="questionCount" 
                min="1" 
                max="20"
              />
            </div>

            <div class="form-group">
              <label for="difficulty">Difficulty Level</label>
              <select id="difficulty" formControlName="difficulty">
                <option value="1">Beginner</option>
                <option value="2">Easy</option>
                <option value="3">Medium</option>
                <option value="4">Hard</option>
                <option value="5">Expert</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="bloomLevel">Bloom's Taxonomy Level</label>
            <select id="bloomLevel" formControlName="bloomLevel">
              <option value="remember">Remember</option>
              <option value="understand">Understand</option>
              <option value="apply">Apply</option>
              <option value="analyze">Analyze</option>
              <option value="evaluate">Evaluate</option>
              <option value="create">Create</option>
            </select>
          </div>

          <div class="form-group">
            <label for="questionType">Question Type</label>
            <select id="questionType" formControlName="questionType">
              <option value="mcq_single">Single Choice MCQ</option>
              <option value="mcq_multi">Multiple Choice MCQ</option>
              <option value="true_false">True/False</option>
              <option value="short_answer">Short Answer</option>
            </select>
          </div>

          <div class="form-group">
            <label for="context">Additional Context (Optional)</label>
            <textarea 
              id="context" 
              formControlName="context" 
              rows="3"
              placeholder="Provide any specific context, learning objectives, or key concepts to focus on..."
            ></textarea>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" (click)="onReset()">Reset</button>
            <button type="submit" class="btn-primary" [disabled]="generatorForm.invalid || isGenerating">
              {{ isGenerating ? 'Generating...' : 'Generate Questions' }}
            </button>
          </div>
        </form>

        <div class="generated-questions" *ngIf="generatedQuestions.length > 0">
          <div class="generated-header">
            <h3>Generated Questions</h3>
            <div class="generated-actions">
              <button class="btn-secondary" (click)="onRegenerate()">Regenerate</button>
              <button class="btn-primary" (click)="onAddToPaper()">Add to Question Paper</button>
            </div>
          </div>

          <div class="questions-list">
            <div class="question-item" *ngFor="let question of generatedQuestions; let i = index">
              <div class="question-header">
                <span class="question-number">Q{{ i + 1 }}</span>
                <span class="question-type">{{ question.type }}</span>
                <span class="question-bloom">{{ question.bloomLevel }}</span>
                <span class="question-marks">{{ question.marks }} marks</span>
              </div>
              <p class="question-text">{{ question.prompt }}</p>
              <div class="question-options" *ngIf="question.options">
                <div class="option" *ngFor="let option of question.options; let j = index"
                     [class.correct]="option.isCorrect">
                  {{ getOptionLabel(j) }}. {{ option.text }}
                </div>
              </div>
              <div class="question-actions">
                <button class="btn-edit" (click)="onEditQuestion(i)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Edit
                </button>
                <button class="btn-delete" (click)="onDeleteQuestion(i)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ai-generator-container {
      padding: 2rem;
      max-width: 900px;
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

    h2 {
      margin: 0 0 0.5rem 0;
      color: #e6ebf5;
      font-size: 1.75rem;
    }

    .subtitle {
      color: #94a3b8;
      margin: 0 0 2rem 0;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    label {
      display: block;
      color: #e6ebf5;
      margin-bottom: 0.5rem;
      font-weight: 500;
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
      font-size: 1rem;
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

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
    }

    .btn-primary,
    .btn-secondary,
    .btn-edit,
    .btn-delete {
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

    .btn-primary:hover:not(:disabled) {
      background: #5558e3;
      transform: translateY(-1px);
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.08);
      color: #e6ebf5;
      border: 1px solid rgba(255, 255, 255, 0.14);
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.12);
    }

    .generated-questions {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid rgba(255, 255, 255, 0.14);
    }

    .generated-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .generated-header h3 {
      color: #e6ebf5;
      margin: 0;
    }

    .generated-actions {
      display: flex;
      gap: 0.75rem;
    }

    .questions-list {
      max-height: 500px;
      overflow-y: auto;
    }

    .question-item {
      background: rgba(255, 255, 255, 0.04);
      border-radius: 8px;
      padding: 1.25rem;
      margin-bottom: 0.75rem;
    }

    .question-header {
      display: flex;
      gap: 1rem;
      margin-bottom: 0.75rem;
      font-size: 0.875rem;
      flex-wrap: wrap;
    }

    .question-number {
      color: #6366f1;
      font-weight: 600;
    }

    .question-type {
      color: #94a3b8;
    }

    .question-bloom {
      color: #22d3ee;
    }

    .question-marks {
      color: #34d399;
      margin-left: auto;
    }

    .question-text {
      color: #e6ebf5;
      margin: 0.5rem 0;
      line-height: 1.5;
    }

    .question-options {
      margin-top: 0.75rem;
      padding-left: 1rem;
    }

    .option {
      color: #94a3b8;
      padding: 0.25rem 0;
    }

    .option.correct {
      color: #34d399;
    }

    .question-actions {
      display: flex;
      gap: 0.75rem;
      margin-top: 1rem;
      padding-top: 0.75rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }

    .btn-edit {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      background: rgba(99, 102, 241, 0.1);
      color: #6366f1;
      border: 1px solid rgba(99, 102, 241, 0.3);
    }

    .btn-edit:hover {
      background: rgba(99, 102, 241, 0.2);
    }

    .btn-delete {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      background: rgba(248, 113, 113, 0.1);
      color: #f87171;
      border: 1px solid rgba(248, 113, 113, 0.3);
    }

    .btn-delete:hover {
      background: rgba(248, 113, 113, 0.2);
    }

    svg {
      width: 16px;
      height: 16px;
    }
  `]
})
export class AiGeneratorComponent {
  generatorForm: FormGroup;
  isGenerating = false;
  courses = [
    { id: '1', code: 'CS101', title: 'Introduction to Computer Science' },
    { id: '2', code: 'CS201', title: 'Data Structures and Algorithms' },
    { id: '3', code: 'CS301', title: 'Database Systems' }
  ];
  generatedQuestions: any[] = [];

  constructor(private fb: FormBuilder) {
    this.generatorForm = this.fb.group({
      course: ['', Validators.required],
      topic: ['', Validators.required],
      questionCount: [5, [Validators.required, Validators.min(1), Validators.max(20)]],
      difficulty: [3],
      bloomLevel: ['understand'],
      questionType: ['mcq_single'],
      context: ['']
    });
  }

  onGenerate(): void {
    if (this.generatorForm.valid) {
      this.isGenerating = true;
      // Simulate AI generation
      setTimeout(() => {
        this.generatedQuestions = this.generateMockQuestions();
        this.isGenerating = false;
      }, 3000);
    }
  }

  generateMockQuestions(): any[] {
    const count = this.generatorForm.value.questionCount;
    const questions = [];
    
    for (let i = 0; i < count; i++) {
      questions.push({
        type: this.generatorForm.value.questionType,
        bloomLevel: this.generatorForm.value.bloomLevel,
        marks: 2,
        prompt: `Sample question ${i + 1} about ${this.generatorForm.value.topic}`,
        options: [
          { text: 'Option A', isCorrect: i % 4 === 0 },
          { text: 'Option B', isCorrect: i % 4 === 1 },
          { text: 'Option C', isCorrect: i % 4 === 2 },
          { text: 'Option D', isCorrect: i % 4 === 3 }
        ]
      });
    }
    
    return questions;
  }

  onRegenerate(): void {
    this.onGenerate();
  }

  onAddToPaper(): void {
    console.log('Adding questions to paper:', this.generatedQuestions);
  }

  onEditQuestion(index: number): void {
    console.log('Editing question:', index);
  }

  onDeleteQuestion(index: number): void {
    this.generatedQuestions.splice(index, 1);
  }

  onReset(): void {
    this.generatorForm.reset();
    this.generatedQuestions = [];
  }

  getOptionLabel(index: number): string {
    return String.fromCharCode(65 + index);
  }
}