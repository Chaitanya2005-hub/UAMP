import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // Auth endpoints
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, { email, password });
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, userData);
  }

  // User endpoints
  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/me`, { headers: this.getHeaders() });
  }

  // Course endpoints
  getCourses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/courses`, { headers: this.getHeaders() });
  }

  // Question paper endpoints
  getQuestionPapers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/question-papers`, { headers: this.getHeaders() });
  }

  createQuestionPaper(paperData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/question-papers`, paperData, { headers: this.getHeaders() });
  }

  // Exam endpoints
  getExams(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/exams`, { headers: this.getHeaders() });
  }

  // Submission endpoints
  createSubmission(submissionData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/submissions`, submissionData, { headers: this.getHeaders() });
  }

  updateSubmission(submissionId: string, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/submissions/${submissionId}`, data, { headers: this.getHeaders() });
  }

  // Proctoring endpoints
  logProctoringEvent(eventData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/proctoring/events`, eventData, { headers: this.getHeaders() });
  }
}