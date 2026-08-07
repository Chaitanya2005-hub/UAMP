import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export interface AdminAction {
  action: string;
  targetId: string;
  targetType: 'exam' | 'student' | 'question_paper' | 'user';
  reason?: string;
  metadata?: Record<string, any>;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  actionType: string;
  importance: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  actorName: string;
  actorRole: string;
  actorId: string;
  description: string;
  metadata?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminControlService {
  private apiUrl = '/api/admin';

  constructor(private http: HttpClient) {}

  // Question Paper Approvals
  approveQuestionPaper(paperId: string, reviewedBy: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/question-papers/${paperId}/approve`, { reviewedBy });
  }

  rejectQuestionPaper(paperId: string, reason: string, reviewedBy: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/question-papers/${paperId}/reject`, { reason, reviewedBy });
  }

  getPendingApprovals(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/question-papers/pending`);
  }

  // User Management
  approveStudentRegistration(studentId: string, approvedBy: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/users/${studentId}/approve`, { approvedBy });
  }

  modifyUserRole(userId: string, newRole: string, modifiedBy: string, reason?: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/users/${userId}/role`, { 
      newRole, 
      modifiedBy, 
      reason 
    });
  }

  grantPermissionOverride(userId: string, permissionCode: string, grantedBy: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/users/${userId}/permissions`, {
      permissionCode,
      grantedBy
    });
  }

  revokePermissionOverride(userId: string, permissionCode: string, revokedBy: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${userId}/permissions/${permissionCode}`, {
      body: { revokedBy }
    });
  }

  // Exam Interventions
  pauseExam(examId: string, pausedBy: string, reason?: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/exams/${examId}/pause`, { pausedBy, reason });
  }

  resumeExam(examId: string, resumedBy: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/exams/${examId}/resume`, { resumedBy });
  }

  extendExamTime(examId: string, additionalMinutes: number, extendedBy: string, reason?: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/exams/${examId}/extend`, {
      additionalMinutes,
      extendedBy,
      reason
    });
  }

  terminateExam(examId: string, terminatedBy: string, reason: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/exams/${examId}/terminate`, {
      terminatedBy,
      reason
    });
  }

  // Student Interventions
  forceSubmitStudent(submissionId: string, forceSubmittedBy: string, reason: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/submissions/${submissionId}/force-submit`, {
      forceSubmittedBy,
      reason
    });
  }

  sendWarningToStudent(submissionId: string, message: string, sentBy: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/submissions/${submissionId}/warn`, {
      message,
      sentBy
    });
  }

  addAdhocStudentToExam(examId: string, studentId: string, addedBy: string, reason: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/exams/${examId}/adhoc-student`, {
      studentId,
      addedBy,
      reason
    });
  }

  // Bulk Actions
  bulkWarnCriticalStudents(examId: string, message: string, sentBy: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/exams/${examId}/bulk-warn`, {
      message,
      sentBy
    });
  }

  bulkForceSubmitCriticalStudents(examId: string, forceSubmittedBy: string, reason: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/exams/${examId}/bulk-force-submit`, {
      forceSubmittedBy,
      reason
    });
  }

  sendExamAnnouncement(examId: string, message: string, sentBy: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/exams/${examId}/announcement`, {
      message,
      sentBy
    });
  }

  // Audit Trail
  getAuditTrail(filters?: {
    actionType?: string;
    actorId?: string;
    startDate?: Date;
    endDate?: Date;
    importance?: string;
  }): Observable<AuditLogEntry[]> {
    return this.http.get<AuditLogEntry[]>(`${this.apiUrl}/audit-trail`, { params: filters as any });
  }

  getAuditLogEntry(entryId: string): Observable<AuditLogEntry> {
    return this.http.get<AuditLogEntry>(`${this.apiUrl}/audit-trail/${entryId}`);
  }

  exportAuditTrail(filters?: any): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/audit-trail/export`, {
      params: filters,
      responseType: 'blob'
    });
  }

  // Dashboard Stats
  getLiveAuditStats(): Observable<{
    totalStudents: number;
    activeStudents: number;
    warningCount: number;
    criticalCount: number;
    completedCount: number;
  }> {
    return this.http.get<any>(`${this.apiUrl}/dashboard/stats`);
  }

  getRecentActivity(limit: number = 10): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/dashboard/recent-activity`, {
      params: { limit }
    });
  }

  getActiveExams(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/exams/active`);
  }
}