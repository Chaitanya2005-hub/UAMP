import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Exam {
  id: string;
  title: string;
  duration_minutes: number;
  scheduled_start: string;
  scheduled_end: string;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  proctoring_enabled: boolean;
  tab_switch_limit: number;
  course: string;
  student_count?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ExamManagementService {
  private apiUrl = `${environment.apiBaseUrl}/exams`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('uamp_access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  getActiveExams(): Observable<Exam[]> {
    return this.http.get<Exam[]>(`${this.apiUrl}/active`, { headers: this.getHeaders() });
  }

  getExam(examId: string): Observable<Exam> {
    return this.http.get<Exam>(`${this.apiUrl}/${examId}`, { headers: this.getHeaders() });
  }

  startExam(examId: string): Observable<{ message: string; exam: any }> {
    return this.http.post<{ message: string; exam: any }>(`${this.apiUrl}/${examId}/start`, {}, { headers: this.getHeaders() });
  }

  endExam(examId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${examId}/end`, {}, { headers: this.getHeaders() });
  }

  getExamStudents(examId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${examId}/students`, { headers: this.getHeaders() });
  }
}