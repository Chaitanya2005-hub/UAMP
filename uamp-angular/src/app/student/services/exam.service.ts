import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Exam, ExamSlot, Submission, SubmissionAnswer, BloomMasteryPoint } from '../../core/models';

@Injectable({ providedIn: 'root' })
export class ExamService {
  private readonly baseUrl = `${environment.apiBaseUrl}/exams`;

  constructor(private http: HttpClient) {}

  getExam(examId: string): Observable<Exam> {
    return this.http.get<Exam>(`${this.baseUrl}/${examId}`);
  }

  getMyExams(): Observable<ExamSlot[]> {
    return this.http.get<ExamSlot[]>(`${environment.apiBaseUrl}/student/exams`);
  }

  getMySubmissions(): Observable<Submission[]> {
    return this.http.get<Submission[]>(`${environment.apiBaseUrl}/student/submissions`);
  }

  startExam(examId: string): Observable<{ submissionId: string; sessionSecret: string; questions: any[] }> {
    return this.http.post<any>(`${this.baseUrl}/${examId}/start`, {});
  }

  syncAnswers(submissionId: string, answers: Record<string, unknown>): Observable<{ synced: boolean }> {
    return this.http.put<{ synced: boolean }>(`${environment.apiBaseUrl}/submissions/${submissionId}/sync`, { answers });
  }

  submitExam(submissionId: string, data?: { reason?: string }): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(`${environment.apiBaseUrl}/submissions/${submissionId}/submit`, data ?? {});
  }

  getBloomMastery(): Observable<BloomMasteryPoint[]> {
    return this.http.get<BloomMasteryPoint[]>(`${environment.apiBaseUrl}/student/bloom-mastery`);
  }

  getHallTicket(examSlotId: string): Observable<Blob> {
    return this.http.get(`${environment.apiBaseUrl}/hall-tickets/${examSlotId}/pdf`, { responseType: 'blob' });
  }
}
