export type BloomLevel = 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
export type QuestionType = 'mcq_single' | 'mcq_multi' | 'true_false' | 'short_answer' | 'essay';
export type PaperStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'archived';
export type ExamStatus = 'scheduled' | 'live' | 'completed' | 'cancelled';
export type SubmissionStatus = 'in_progress' | 'submitted' | 'auto_submitted' | 'force_submitted' | 'expired';
export type ProctorEventType =
  | 'tab_switch'
  | 'fullscreen_exit'
  | 'gaze_deviation'
  | 'multiple_faces'
  | 'no_face_detected'
  | 'audio_anomaly'
  | 'connection_lost'
  | 'connection_restored';
export type ProctorSeverity = 'info' | 'warning' | 'critical';

export interface McqOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  questionPaperId: string;
  prompt: string;
  type: QuestionType;
  bloomLevel: BloomLevel;
  marks: number;
  options?: McqOption[];
  correctAnswer?: string;
  difficulty?: number;
  orderIndex: number;
}

export interface QuestionPaper {
  id: string;
  courseId: string;
  createdBy: string;
  title: string;
  sourceMethod: 'docx_upload' | 'pdf_upload' | 'manual_builder' | 'ai_generated';
  sourceFileKey?: string;
  status: PaperStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  questions?: Question[];
  createdAt: string;
  updatedAt: string;
}

export interface Exam {
  id: string;
  questionPaperId: string;
  title: string;
  durationMinutes: number;
  scheduledStart: string;
  scheduledEnd: string;
  status: ExamStatus;
  proctoringEnabled: boolean;
  tabSwitchLimit: number;
  createdBy: string;
  createdAt: string;
}

export interface ExamSlot {
  id: string;
  examId: string;
  studentId: string;
  registrationStatus: 'pending' | 'approved' | 'rejected' | 'ad_hoc_added';
  approvedBy?: string;
  approvedAt?: string;
  exam?: Exam;
}

export interface HallTicket {
  id: string;
  examSlotId: string;
  ticketNumber: string;
  qrPayload: string;
  pdfFileKey: string;
  issuedAt: string;
  releasedBy: string;
}

export interface Submission {
  id: string;
  examSlotId: string;
  startedAt?: string;
  submittedAt?: string;
  status: SubmissionStatus;
  totalScore?: number;
  tabSwitchCount: number;
  forceSubmittedBy?: string;
  lastSyncAt?: string;
}

export interface SubmissionAnswer {
  id: string;
  submissionId: string;
  questionId: string;
  answerValue: Record<string, unknown>;
  marksAwarded?: number;
  answeredAt: string;
  syncedAt?: string;
}

export interface ProctoringLog {
  id: string;
  submissionId: string;
  eventType: ProctorEventType;
  severity: ProctorSeverity;
  detectedAt: string;
  metadata?: Record<string, unknown>;
  snapshotFileKey?: string;
  reviewed: boolean;
}

export interface BloomMasteryPoint {
  axis: 'Remember' | 'Understand' | 'Apply' | 'Analyze' | 'Evaluate' | 'Create';
  masteryPct: number;
  questionCount?: number;
}

export interface Course {
  id: string;
  institutionId: string;
  code: string;
  title: string;
  createdAt: string;
}

export interface AuditTrail {
  id: number;
  actorId: string;
  actorRole: string;
  actionCode: string;
  targetTable?: string;
  targetId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface ProctoringEvent {
  eventType: ProctorEventType;
  severity: ProctorSeverity;
  metadata?: Record<string, unknown>;
}
