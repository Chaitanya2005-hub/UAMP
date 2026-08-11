import { Component, OnInit, OnDestroy, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProctoringFeedService, StudentProctoringStatus } from '../../services/proctoring-feed.service';

@Component({
  selector: 'app-live-proctoring',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="live-proctoring-container">
      <div class="proctoring-header">
        <h2>Live Proctoring Dashboard</h2>
        <div class="header-controls">
          <select class="exam-select" [(ngModel)]="selectedExam" (change)="onExamChange()">
            <option value="">Select Exam</option>
            <option *ngFor="let exam of activeExams" [value]="exam.id">
              {{ exam.title }} - {{ exam.course }}
            </option>
          </select>
          <button class="btn-refresh" (click)="refreshFeeds()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M23 4v6h-6"/>
              <path d="M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            Refresh
          </button>
        </div>
      </div>

      <div class="stats-bar" *ngIf="selectedExam">
        <div class="stat-item">
          <span class="stat-label">Total Students</span>
          <span class="stat-value">{{ stats.total }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Active</span>
          <span class="stat-value status-active">{{ stats.active }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Warnings</span>
          <span class="stat-value status-warning">{{ stats.warnings }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Critical</span>
          <span class="stat-value status-critical">{{ stats.critical }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Completed</span>
          <span class="stat-value status-completed">{{ stats.completed }}</span>
        </div>
      </div>

      <div class="student-grid" *ngIf="selectedExam">
        <div class="student-card"
             *ngFor="let student of students()"
             [class.status-warning]="student.status === 'warning'"
             [class.status-critical]="student.status === 'critical'"
             [class.status-offline]="student.status === 'offline'">
          <div class="student-header">
            <div class="student-info">
              <span class="student-name">{{ student.studentName }}</span>
              <span class="student-id">{{ student.enrollmentNumber }}</span>
            </div>
            <div class="status-indicator" [class.status-live]="student.isLive">
              <span class="status-dot"></span>
              <span class="status-text">{{ student.isLive ? 'Live' : 'Away' }}</span>
            </div>
          </div>

          <div class="student-feed">
            <video
              #videoElement
              class="student-video"
              [attr.data-submission-id]="student.submissionId"
              [muted]="true"
              [autoplay]="true"
              [playsInline]="true"
              *ngIf="student.cameraConnected"
            ></video>
            <div class="video-placeholder" *ngIf="!student.cameraConnected">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M23 7l-7 5 7 5V7z"/>
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
              </svg>
              <span>Camera Offline</span>
            </div>
          </div>

          <div class="student-metrics">
            <div class="metric">
              <span class="metric-label">Tab Switches</span>
              <span class="metric-value" [class.metric-warning]="student.tabSwitches >= 2">
                {{ student.tabSwitches }}/3
              </span>
            </div>
            <div class="metric">
              <span class="metric-label">Fullscreen Exits</span>
              <span class="metric-value">{{ student.fullscreenExits }}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Gaze Alerts</span>
              <span class="metric-value" [class.metric-warning]="student.gazeAlerts > 0">
                {{ student.gazeAlerts }}
              </span>
            </div>
          </div>

          <div class="student-actions">
            <button class="btn-view" (click)="viewStudent(student)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              Focus
            </button>
            <button class="btn-message" (click)="sendMessage(student)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Message
            </button>
            <button class="btn-intervene" (click)="intervene(student)" *ngIf="student.status === 'critical'">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Intervene
            </button>
          </div>
        </div>
      </div>

      <div class="empty-state" *ngIf="!selectedExam">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M15 10l5 5-5 5"/>
          <path d="M4 4v7a4 4 0 0 0 4 4h12"/>
        </svg>
        <h3>Select an Exam to Monitor</h3>
        <p>Choose an active exam from the dropdown to view live proctoring feeds</p>
      </div>
    </div>
  `,
  styles: [`
    .live-proctoring-container {
      padding: 2rem;
      height: calc(100vh - 120px);
      display: flex;
      flex-direction: column;
    }

    .proctoring-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    h2 {
      margin: 0;
      color: #e6ebf5;
      font-size: 1.75rem;
    }

    .header-controls {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .exam-select {
      padding: 0.75rem 1rem;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 8px;
      color: #e6ebf5;
      font-size: 1rem;
      min-width: 250px;
    }

    .btn-refresh {
      padding: 0.75rem 1rem;
      background: rgba(99, 102, 241, 0.1);
      color: #6366f1;
      border: 1px solid rgba(99, 102, 241, 0.3);
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.15s ease;
    }

    .btn-refresh:hover {
      background: rgba(99, 102, 241, 0.2);
    }

    .stats-bar {
      display: flex;
      gap: 2rem;
      padding: 1rem 1.5rem;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      margin-bottom: 1.5rem;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .stat-label {
      color: #94a3b8;
      font-size: 0.875rem;
    }

    .stat-value {
      color: #e6ebf5;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .stat-value.status-active {
      color: #22d3ee;
    }

    .stat-value.status-warning {
      color: #fbbf24;
    }

    .stat-value.status-critical {
      color: #f87171;
    }

    .stat-value.status-completed {
      color: #34d399;
    }

    .student-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
      overflow-y: auto;
      flex: 1;
    }

    .student-card {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 14px;
      padding: 1.25rem;
      transition: all 0.15s ease;
    }

    .student-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    }

    .student-card.status-warning {
      border-color: rgba(251, 191, 36, 0.5);
      box-shadow: 0 0 0 1px rgba(251, 191, 36, 0.2);
    }

    .student-card.status-critical {
      border-color: rgba(248, 113, 113, 0.5);
      box-shadow: 0 0 0 1px rgba(248, 113, 113, 0.2);
    }

    .student-card.status-offline {
      opacity: 0.6;
    }

    .student-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .student-info {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    .student-name {
      color: #e6ebf5;
      font-weight: 500;
      font-size: 0.9375rem;
    }

    .student-id {
      color: #94a3b8;
      font-size: 0.75rem;
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.25rem 0.5rem;
      background: rgba(255, 255, 255, 0.04);
      border-radius: 9999px;
      font-size: 0.75rem;
      color: #94a3b8;
    }

    .status-indicator.status-live {
      color: #22d3ee;
      background: rgba(34, 211, 238, 0.1);
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #94a3b8;
    }

    .status-indicator.status-live .status-dot {
      background: #22d3ee;
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .student-feed {
      position: relative;
      aspect-ratio: 16/9;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 1rem;
    }

    .student-video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .video-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #94a3b8;
      gap: 0.5rem;
    }

    .video-placeholder svg {
      width: 32px;
      height: 32px;
      opacity: 0.5;
    }

    .student-metrics {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .metric {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .metric-label {
      color: #94a3b8;
      font-size: 0.75rem;
    }

    .metric-value {
      color: #e6ebf5;
      font-weight: 600;
      font-size: 1rem;
    }

    .metric-value.metric-warning {
      color: #fbbf24;
    }

    .student-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-view,
    .btn-message,
    .btn-intervene {
      flex: 1;
      padding: 0.5rem;
      border-radius: 6px;
      font-size: 0.875rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.25rem;
      border: none;
      transition: all 0.15s ease;
    }

    .btn-view {
      background: rgba(99, 102, 241, 0.1);
      color: #6366f1;
      border: 1px solid rgba(99, 102, 241, 0.3);
    }

    .btn-view:hover {
      background: rgba(99, 102, 241, 0.2);
    }

    .btn-message {
      background: rgba(34, 211, 238, 0.1);
      color: #22d3ee;
      border: 1px solid rgba(34, 211, 238, 0.3);
    }

    .btn-message:hover {
      background: rgba(34, 211, 238, 0.2);
    }

    .btn-intervene {
      background: rgba(248, 113, 113, 0.1);
      color: #f87171;
      border: 1px solid rgba(248, 113, 113, 0.3);
    }

    .btn-intervene:hover {
      background: rgba(248, 113, 113, 0.2);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex: 1;
      color: #94a3b8;
      gap: 1rem;
    }

    .empty-state svg {
      width: 48px;
      height: 48px;
      opacity: 0.5;
    }

    .empty-state h3 {
      margin: 0;
      color: #e6ebf5;
    }

    .empty-state p {
      margin: 0;
      font-size: 0.875rem;
    }
  `]
})
export class LiveProctoringComponent implements OnInit {
  selectedExam = '';
  activeExams: Array<{ id: string; title: string; course: string }> = [];
  stats = {
    total: 0,
    active: 0,
    warnings: 0,
    critical: 0,
    completed: 0
  };
  students = signal<StudentProctoringStatus[]>([]);
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  private peerConnections = new Map<string, RTCPeerConnection>(); // submissionId -> RTCPeerConnection
  private webSockets = new Map<string, WebSocket>(); // submissionId -> WebSocket

  constructor(private proctoringService: ProctoringFeedService) {}

  ngOnInit(): void {
    this.loadActiveExams();
  }

  loadActiveExams(): void {
    // Load active exams from API
    this.proctoringService.getActiveExams().subscribe({
      next: (exams) => {
        console.log('Loaded active exams:', exams);
        this.activeExams = exams;
      },
      error: (error) => {
        console.error('Failed to load active exams:', error);
        // Show empty state
        this.activeExams = [];
        alert('Failed to load active exams. Please refresh.');
      }
    });
  }

  onExamChange(): void {
    if (this.selectedExam) {
      this.loadStudentStatus();
      this.loadStats();
    }
  }

  loadStudentStatus(): void {
    this.proctoringService.getStudentProctoringStatus(this.selectedExam).subscribe({
      next: (students) => {
        console.log('Loaded student proctoring status:', students);
        
        // If no students returned, show empty state
        if (!students || students.length === 0) {
          this.students.set([]);
          console.log('No students found for this exam');
          return;
        }
        
        this.students.set(students);
        
        // Attempt to connect to video streams for connected students
        students.forEach(student => {
          if (student.cameraConnected) {
            this.connectToStudentVideo(student.submissionId);
          }
        });
      },
      error: (error) => {
        console.error('Failed to load student status:', error);
        // Show empty state instead of mock data
        this.students.set([]);
        alert('Failed to load student data. Please refresh or check if students have started the exam.');
      }
    });
  }

  loadStats(): void {
    this.proctoringService.getLiveProctoringStats(this.selectedExam).subscribe({
      next: (stats) => {
        this.stats = {
          total: stats.totalStudents,
          active: stats.activeStudents,
          warnings: stats.warningCount,
          critical: stats.criticalCount,
          completed: stats.completedCount
        };
      },
      error: (error) => {
        console.error('Failed to load stats:', error);
      }
    });
  }

  async connectToStudentVideo(submissionId: string): Promise<void> {
    try {
      // Create WebRTC peer connection for receiving student stream
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      // Store peer connection for cleanup
      this.peerConnections.set(submissionId, peerConnection);

      // Set up video transceiver to receive stream
      peerConnection.addTransceiver('video', { direction: 'recvonly' });
      peerConnection.addTransceiver('audio', { direction: 'recvonly' });

      // Connect to WebSocket signaling server
      const ws = this.proctoringService.connectToLiveFeed(this.selectedExam);
      
      // Store WebSocket for cleanup
      this.webSockets.set(submissionId, ws);
      
      ws.onopen = () => {
        console.log('[Teacher] WebSocket connected for student:', submissionId);
        // Request video stream from specific student
        ws.send(JSON.stringify({
          type: 'request-stream',
          submissionId: submissionId,
          examId: this.selectedExam
        }));
      };

      ws.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        
        if (message.type === 'offer' && message.submissionId === submissionId) {
          // Handle WebRTC offer from student
          await peerConnection.setRemoteDescription(new RTCSessionDescription(message.sdp));
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          
          ws.send(JSON.stringify({
            type: 'answer',
            sdp: answer,
            submissionId: submissionId,
            examId: this.selectedExam
          }));
        } else if (message.type === 'ice-candidate' && message.submissionId === submissionId) {
          // Handle ICE candidates
          await peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate));
        }
      };

      // Handle incoming stream
      peerConnection.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          // Find the correct video element for this student
          const videoElement = document.querySelector(`[data-submission-id="${submissionId}"] video`) as HTMLVideoElement;
          if (videoElement) {
            videoElement.srcObject = event.streams[0];
          }
        }
      };

      // Send ICE candidates to server
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          ws.send(JSON.stringify({
            type: 'ice-candidate',
            candidate: event.candidate,
            submissionId: submissionId,
            from: 'teacher',
            examId: this.selectedExam
          }));
        }
      };

    } catch (error) {
      console.error('Failed to connect to student video:', error);
    }
  }

  refreshFeeds(): void {
    this.loadStudentStatus();
    this.loadStats();
  }

  viewStudent(student: StudentProctoringStatus): void {
    console.log('Viewing student:', student);
    // Focus on specific student - could expand card or show detailed view
    alert(`Focusing on ${student.studentName} (${student.enrollmentNumber})`);
  }

  sendMessage(student: StudentProctoringStatus): void {
    console.log('Sending message to student:', student);
    const message = prompt('Enter warning message for student:');
    if (message) {
      this.proctoringService.sendWarningToStudent(student.submissionId, message).subscribe({
        next: () => {
          console.log('Warning sent successfully');
          alert('Warning sent to student');
        },
        error: (error) => {
          console.error('Failed to send warning:', error);
          alert('Failed to send warning');
        }
      });
    }
  }

  intervene(student: StudentProctoringStatus): void {
    console.log('Intervening with student:', student);
    if (confirm(`Are you sure you want to force submit ${student.studentName}'s exam?`)) {
      this.proctoringService.forceSubmitStudent(student.submissionId, 'Teacher intervention').subscribe({
        next: () => {
          console.log('Student exam force submitted');
          alert('Student exam has been force submitted');
          this.refreshFeeds();
        },
        error: (error) => {
          console.error('Failed to force submit:', error);
          alert('Failed to force submit exam');
        }
      });
    }
  }

  ngOnDestroy(): void {
    // Clean up all peer connections and WebSockets
    this.peerConnections.forEach((pc, submissionId) => {
      pc.close();
      console.log('Closed peer connection for student:', submissionId);
    });
    this.peerConnections.clear();

    this.webSockets.forEach((ws, submissionId) => {
      ws.close();
      console.log('Closed WebSocket for student:', submissionId);
    });
    this.webSockets.clear();
  }
}