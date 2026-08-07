import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

export interface QuestionPaper {
  id: string;
  courseId: string;
  title: string;
  sourceMethod: 'docx_upload' | 'pdf_upload' | 'manual_builder' | 'ai_generated';
  sourceFileKey?: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'archived';
  reviewedBy?: string;
  reviewedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: string;
  questionPaperId: string;
  prompt: string;
  type: 'mcq_single' | 'mcq_multi' | 'true_false' | 'short_answer' | 'essay';
  bloomLevel: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
  marks: number;
  options?: Array<{ id: string; text: string; isCorrect: boolean }>;
  correctAnswer?: string;
  difficulty?: number;
  orderIndex: number;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class QuestionPaperService {
  private apiUrl = '/api/question-papers';

  constructor(private http: HttpClient) {}

  getQuestionPapers(filters?: { status?: string; courseId?: string }): Observable<QuestionPaper[]> {
    // Mock implementation - replace with actual HTTP call
    return of([
      {
        id: '1',
        courseId: 'CS201',
        title: 'Data Structures Midterm',
        sourceMethod: 'manual_builder',
        status: 'approved',
        createdAt: new Date('2026-08-01'),
        updatedAt: new Date('2026-08-01')
      },
      {
        id: '2',
        courseId: 'CS301',
        title: 'Database Systems Quiz',
        sourceMethod: 'ai_generated',
        status: 'pending_approval',
        createdAt: new Date('2026-08-05'),
        updatedAt: new Date('2026-08-05')
      }
    ]);
  }

  getQuestionPaper(id: string): Observable<QuestionPaper> {
    return this.http.get<QuestionPaper>(`${this.apiUrl}/${id}`);
  }

  createQuestionPaper(paper: Partial<QuestionPaper>): Observable<QuestionPaper> {
    return this.http.post<QuestionPaper>(this.apiUrl, paper);
  }

  updateQuestionPaper(id: string, paper: Partial<QuestionPaper>): Observable<QuestionPaper> {
    return this.http.put<QuestionPaper>(`${this.apiUrl}/${id}`, paper);
  }

  deleteQuestionPaper(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  submitForApproval(id: string): Observable<QuestionPaper> {
    return this.http.post<QuestionPaper>(`${this.apiUrl}/${id}/submit`, {});
  }

  getQuestions(paperId: string): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.apiUrl}/${paperId}/questions`);
  }

  createQuestion(paperId: string, question: Partial<Question>): Observable<Question> {
    return this.http.post<Question>(`${this.apiUrl}/${paperId}/questions`, question);
  }

  updateQuestion(questionId: string, question: Partial<Question>): Observable<Question> {
    return this.http.put<Question>(`/api/questions/${questionId}`, question);
  }

  deleteQuestion(questionId: string): Observable<void> {
    return this.http.delete<void>(`/api/questions/${questionId}`);
  }

  reorderQuestions(paperId: string, questionIds: string[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${paperId}/questions/reorder`, { questionIds });
  }

  uploadAndParse(file: File, courseId: string): Observable<{ questions: Partial<Question>[] }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('courseId', courseId);

    return this.http.post<{ questions: Partial<Question>[] }>(`${this.apiUrl}/upload-parse`, formData);
  }

  generateWithAI(params: {
    courseId: string;
    topic: string;
    questionCount: number;
    difficulty: number;
    bloomLevel: string;
    questionType: string;
    context?: string;
  }): Observable<{ questions: Partial<Question>[] }> {
    return this.http.post<{ questions: Partial<Question>[] }>(`${this.apiUrl}/ai-generate`, params);
  }
}