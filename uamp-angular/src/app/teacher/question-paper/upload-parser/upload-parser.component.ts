import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-upload-parser',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="upload-parser-container">
      <div class="glass-panel">
        <h2>Upload Question Paper</h2>
        <p class="subtitle">Upload DOCX or PDF files to parse questions automatically</p>

        <form [formGroup]="uploadForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="title">Paper Title</label>
            <input 
              id="title" 
              type="text" 
              formControlName="title" 
              placeholder="Enter paper title"
            />
            <div class="error" *ngIf="uploadForm.get('title')?.touched && uploadForm.get('title')?.invalid">
              Title is required
            </div>
          </div>

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
            <label for="file">Upload File</label>
            <div class="file-drop-zone" 
                 (dragover)="onDragOver($event)" 
                 (dragleave)="onDragLeave($event)"
                 (drop)="onDrop($event)"
                 [class.drag-over]="isDragOver">
              <input 
                id="file" 
                type="file" 
                formControlName="file" 
                accept=".docx,.pdf"
                (change)="onFileSelect($event)"
              />
              <div class="file-drop-content">
                <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <p>Drag and drop your file here, or click to browse</p>
                <p class="file-info" *ngIf="selectedFile">
                  {{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})
                </p>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" (click)="onCancel()">Cancel</button>
            <button type="submit" class="btn-primary" [disabled]="uploadForm.invalid || isUploading">
              {{ isUploading ? 'Uploading...' : 'Upload & Parse' }}
            </button>
          </div>
        </form>

        <div class="parse-preview" *ngIf="parsedQuestions.length > 0">
          <h3>Parsed Questions Preview</h3>
          <div class="questions-list">
            <div class="question-item" *ngFor="let question of parsedQuestions; let i = index">
              <div class="question-header">
                <span class="question-number">Q{{ i + 1 }}</span>
                <span class="question-type">{{ question.type }}</span>
                <span class="question-marks">{{ question.marks }} marks</span>
              </div>
              <p class="question-text">{{ question.prompt }}</p>
              <div class="question-options" *ngIf="question.options">
                <div class="option" *ngFor="let option of question.options; let j = index"
                     [class.correct]="option.isCorrect">
                  {{ getOptionLabel(j) }}. {{ option.text }}
                </div>
              </div>
            </div>
          </div>
          <div class="parse-actions">
            <button class="btn-secondary" (click)="onEditParsed()">Edit Questions</button>
            <button class="btn-primary" (click)="onSubmitForApproval()">Submit for Approval</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .upload-parser-container {
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

    label {
      display: block;
      color: #e6ebf5;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    input[type="text"],
    select {
      width: 100%;
      padding: 0.75rem 1rem;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 8px;
      color: #e6ebf5;
      font-size: 1rem;
      transition: all 0.15s ease;
    }

    input[type="text"]:focus,
    select:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
    }

    .error {
      color: #f87171;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .file-drop-zone {
      border: 2px dashed rgba(255, 255, 255, 0.2);
      border-radius: 14px;
      padding: 2rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.15s ease;
      position: relative;
    }

    .file-drop-zone:hover,
    .file-drop-zone.drag-over {
      border-color: #6366f1;
      background: rgba(99, 102, 241, 0.08);
    }

    .file-drop-zone input[type="file"] {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      cursor: pointer;
    }

    .upload-icon {
      width: 48px;
      height: 48px;
      margin: 0 auto 1rem;
      color: #94a3b8;
    }

    .file-drop-content p {
      color: #94a3b8;
      margin: 0.5rem 0;
    }

    .file-info {
      color: #22d3ee !important;
      font-weight: 500;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
    }

    .btn-primary,
    .btn-secondary {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
      border: none;
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

    .parse-preview {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid rgba(255, 255, 255, 0.14);
    }

    .parse-preview h3 {
      color: #e6ebf5;
      margin-bottom: 1rem;
    }

    .questions-list {
      max-height: 400px;
      overflow-y: auto;
      margin-bottom: 1rem;
    }

    .question-item {
      background: rgba(255, 255, 255, 0.04);
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 0.75rem;
    }

    .question-header {
      display: flex;
      gap: 1rem;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
    }

    .question-number {
      color: #6366f1;
      font-weight: 600;
    }

    .question-type {
      color: #94a3b8;
    }

    .question-marks {
      color: #34d399;
      margin-left: auto;
    }

    .question-text {
      color: #e6ebf5;
      margin: 0.5rem 0;
    }

    .question-options {
      margin-top: 0.5rem;
      padding-left: 1rem;
    }

    .option {
      color: #94a3b8;
      padding: 0.25rem 0;
    }

    .option.correct {
      color: #34d399;
    }

    .parse-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }
  `]
})
export class UploadParserComponent {
  uploadForm: FormGroup;
  isDragOver = false;
  isUploading = false;
  selectedFile: File | null = null;
  courses = [
    { id: '1', code: 'CS101', title: 'Introduction to Computer Science' },
    { id: '2', code: 'CS201', title: 'Data Structures and Algorithms' },
    { id: '3', code: 'CS301', title: 'Database Systems' }
  ];
  parsedQuestions: any[] = [];

  constructor(private fb: FormBuilder) {
    this.uploadForm = this.fb.group({
      title: ['', Validators.required],
      course: ['', Validators.required],
      file: [null, Validators.required]
    });
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  handleFile(file: File): void {
    const validTypes = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/pdf'];
    if (validTypes.includes(file.type)) {
      this.selectedFile = file;
      this.uploadForm.patchValue({ file });
    } else {
      alert('Please upload a DOCX or PDF file');
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  onSubmit(): void {
    if (this.uploadForm.valid && this.selectedFile) {
      this.isUploading = true;
      // Simulate file upload and parsing
      setTimeout(() => {
        this.parsedQuestions = this.generateMockParsedQuestions();
        this.isUploading = false;
      }, 2000);
    }
  }

  generateMockParsedQuestions(): any[] {
    return [
      {
        type: 'mcq_single',
        prompt: 'What is the time complexity of binary search?',
        marks: 2,
        options: [
          { text: 'O(n)', isCorrect: false },
          { text: 'O(log n)', isCorrect: true },
          { text: 'O(n²)', isCorrect: false },
          { text: 'O(1)', isCorrect: false }
        ]
      },
      {
        type: 'mcq_single',
        prompt: 'Which data structure uses LIFO?',
        marks: 2,
        options: [
          { text: 'Queue', isCorrect: false },
          { text: 'Stack', isCorrect: true },
          { text: 'Linked List', isCorrect: false },
          { text: 'Tree', isCorrect: false }
        ]
      }
    ];
  }

  onEditParsed(): void {
    // Navigate to MCQ builder with parsed questions
    console.log('Navigate to MCQ builder with:', this.parsedQuestions);
  }

  onSubmitForApproval(): void {
    console.log('Submit for approval:', this.parsedQuestions);
  }

  onCancel(): void {
    this.uploadForm.reset();
    this.selectedFile = null;
    this.parsedQuestions = [];
  }

  getOptionLabel(index: number): string {
    return String.fromCharCode(65 + index);
  }
}