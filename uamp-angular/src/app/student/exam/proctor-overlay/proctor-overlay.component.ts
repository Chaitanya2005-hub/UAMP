import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-proctor-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="proctor-overlay" [class.minimized]="isMinimized">
      <div class="proctor-header" (click)="toggleMinimize()">
        <div class="status-dot" [class.status-connected]="isStreaming"></div>
        <span>{{ isStreaming ? 'Streaming' : 'Proctoring' }}</span>
        <button class="minimize-btn">{{ isMinimized ? '↗' : '↙' }}</button>
      </div>
      <video
        #videoEl
        autoplay
        muted
        playsinline
        class="proctor-video"
        [class.hidden]="isMinimized"
      ></video>
    </div>
  `,
  styles: [`
    .proctor-overlay {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 900;
      border-radius: var(--uamp-radius-md);
      overflow: hidden;
      background: var(--uamp-bg-elevated);
      border: 1px solid var(--uamp-glass-border);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      transition: all 280ms var(--uamp-ease-standard);
      width: 240px;
    }

    .proctor-overlay.minimized {
      width: 180px;
    }

    .proctor-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      font-size: 0.75rem;
      color: var(--uamp-accent-secondary);
      cursor: pointer;
      user-select: none;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #f87171;
    }

    .status-dot.status-connected {
      background: #34d399;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .minimize-btn {
      margin-left: auto;
      background: none;
      border: none;
      color: var(--uamp-text-muted);
      cursor: pointer;
      font-size: 0.875rem;
    }

    .proctor-video {
      width: 100%;
      display: block;
      border-top: 1px solid var(--uamp-glass-border);
    }

    .proctor-video.hidden {
      display: none;
    }
  `]
})
export class ProctorOverlayComponent implements OnInit, OnDestroy {
  @Input() submissionId = '';
  @Input() examId = '';
  @ViewChild('videoEl', { static: true }) videoEl!: ElementRef<HTMLVideoElement>;

  isMinimized = false;
  isStreaming = false;
  private stream: MediaStream | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  private ws: WebSocket | null = null;

  constructor(private http: HttpClient) {}

  async ngOnInit(): Promise<void> {
    try {
      // Get camera/microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, frameRate: { ideal: 15, max: 30 } },
        audio: true,
      });
      
      // Display local video
      if (this.videoEl && this.stream) {
        this.videoEl.nativeElement.srcObject = this.stream;
      }
      
      // Start streaming to backend
      await this.startStreaming();
    } catch (error) {
      console.error('[Proctor] Camera access denied:', error);
    }
  }

  private async startStreaming(): Promise<void> {
    try {
      // Create WebRTC peer connection
      this.peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      // Add local stream to peer connection
      if (this.stream) {
        const stream = this.stream; // Capture non-null stream
        stream.getTracks().forEach(track => {
          this.peerConnection!.addTrack(track, stream);
        });
      }

      // Connect to WebSocket signaling server
      this.ws = new WebSocket(`${environment.websocketUrl}/proctoring?submissionId=${this.submissionId}&examId=${this.examId}`);
      
      this.ws.onopen = () => {
        console.log('[Proctor] WebSocket connected');
        this.isStreaming = true;
      };

      this.ws.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        
        if (message.type === 'stream-request') {
          // Teacher requested stream - start offering
          console.log('[Proctor] Teacher requested stream, starting WebRTC offer');
          if (this.peerConnection) {
            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);
            
            this.ws!.send(JSON.stringify({
              type: 'offer',
              sdp: offer,
              submissionId: this.submissionId,
              examId: this.examId
            }));
          }
        } else if (message.type === 'answer') {
          // Handle WebRTC answer from teacher
          if (this.peerConnection) {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(message.sdp));
          }
        } else if (message.type === 'ice-candidate') {
          // Handle ICE candidates from teacher
          if (this.peerConnection) {
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate));
          }
        }
      };

      // Send ICE candidates to server
      if (this.peerConnection) {
        this.peerConnection.onicecandidate = (event) => {
          if (event.candidate && this.ws) {
            this.ws.send(JSON.stringify({
              type: 'ice-candidate',
              candidate: event.candidate,
              submissionId: this.submissionId,
              from: 'student',
              examId: this.examId
            }));
          }
        };
      }

    } catch (error) {
      console.error('[Proctor] Failed to start streaming:', error);
    }
  }

  toggleMinimize(): void {
    this.isMinimized = !this.isMinimized;
  }

  ngOnDestroy(): void {
    // Stop video tracks
    this.stream?.getTracks().forEach(t => t.stop());
    this.stream = null;
    
    // Close WebRTC connection
    this.peerConnection?.close();
    this.peerConnection = null;
    
    // Close WebSocket
    this.ws?.close();
    this.ws = null;
    
    this.isStreaming = false;
  }
}
