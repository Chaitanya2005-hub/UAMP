import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ProctoringEvent {
  id: string;
  submissionId: string;
  eventType: 'tab_switch' | 'fullscreen_exit' | 'no_face_detected' | 'multiple_faces' | 'gaze_deviation' | 'audio_anomaly';
  severity: 'warning' | 'critical';
  timestamp: Date;
  metadata?: Record<string, any>;
  snapshotFileKey?: string;
  reviewed: boolean;
  reviewedBy?: string;
  reviewedAt?: Date;
}

export interface ActiveExam {
  id: string;
  title: string;
  course: string;
}

export interface StudentProctoringStatus {
  submissionId: string;
  studentId: string;
  studentName: string;
  enrollmentNumber: string;
  examId: string;
  status: 'active' | 'warning' | 'critical' | 'offline';
  isLive: boolean;
  tabSwitches: number;
  fullscreenExits: number;
  gazeAlerts: number;
  lastActivity: Date;
  cameraConnected: boolean;
  microphoneConnected: boolean;
}

export interface LiveProctoringStats {
  totalStudents: number;
  activeStudents: number;
  warningCount: number;
  criticalCount: number;
  completedCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProctoringFeedService {
  private apiUrl = `${environment.apiBaseUrl}/proctoring`;
  private wsUrl = `${environment.websocketUrl}/proctoring`;

  constructor(private http: HttpClient) {}

  getActiveExams(): Observable<ActiveExam[]> {
    return this.http.get<ActiveExam[]>(`${this.apiUrl}/active-exams`);
  }

  getLiveProctoringStats(examId: string): Observable<LiveProctoringStats> {
    return this.http.get<LiveProctoringStats>(`${this.apiUrl}/exam/${examId}/stats`);
  }

  getStudentProctoringStatus(examId: string): Observable<StudentProctoringStatus[]> {
    return this.http.get<StudentProctoringStatus[]>(`${this.apiUrl}/exam/${examId}/students`);
  }

  getIncidentTimeline(examId: string, filters?: { severity?: string; studentId?: string }): Observable<ProctoringEvent[]> {
    return this.http.get<ProctoringEvent[]>(`${this.apiUrl}/exam/${examId}/incidents`, { params: filters as any });
  }

  getStudentIncidents(submissionId: string): Observable<ProctoringEvent[]> {
    return this.http.get<ProctoringEvent[]>(`${this.apiUrl}/submission/${submissionId}/incidents`);
  }

  reportEvent(submissionId: string, event: Omit<ProctoringEvent, 'id' | 'submissionId' | 'timestamp' | 'reviewed'>): Observable<ProctoringEvent> {
    return this.http.post<ProctoringEvent>(`${this.apiUrl}/submission/${submissionId}/events`, event);
  }

  reportEventWithSnapshot(submissionId: string, event: Omit<ProctoringEvent, 'id' | 'submissionId' | 'timestamp' | 'reviewed'>, snapshot: Blob): Observable<ProctoringEvent> {
    const formData = new FormData();
    formData.append('event', JSON.stringify(event));
    formData.append('snapshot', snapshot);

    return this.http.post<ProctoringEvent>(`${this.apiUrl}/submission/${submissionId}/events/snapshot`, formData);
  }

  markIncidentReviewed(incidentId: string, reviewed: boolean): Observable<ProctoringEvent> {
    return this.http.patch<ProctoringEvent>(`${this.apiUrl}/incidents/${incidentId}`, { reviewed });
  }

  flagIncidentForReview(incidentId: string, notes?: string): Observable<ProctoringEvent> {
    return this.http.post<ProctoringEvent>(`${this.apiUrl}/incidents/${incidentId}/flag`, { notes });
  }

  getSnapshot(snapshotKey: string): Observable<Blob> {
    return this.http.get(`/api/storage/${snapshotKey}`, { responseType: 'blob' });
  }

  sendWarningToStudent(submissionId: string, message: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/submission/${submissionId}/warn`, { message });
  }

  forceSubmitStudent(submissionId: string, reason: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/submission/${submissionId}/force-submit`, { reason });
  }

  connectToLiveFeed(examId: string): WebSocket {
    return new WebSocket(`${this.wsUrl}?examId=${examId}`);
  }

  getStudentVideoStream(submissionId: string): Promise<MediaStream> {
    // This would typically establish a WebRTC connection
    // For now, return a stream that can be used for testing
    return navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  }
}