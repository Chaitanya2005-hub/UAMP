import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-proctor-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="proctor-overlay" [class.minimized]="isMinimized">
      <div class="proctor-header" (click)="toggleMinimize()">
        <div class="status-dot--live"></div>
        <span>Proctoring Active</span>
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
  private stream: MediaStream | null = null;

  async ngOnInit(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, frameRate: { ideal: 5, max: 8 } },
        audio: true,
      });
      this.videoEl.nativeElement.srcObject = this.stream;
    } catch {
      console.warn('[Proctor] Camera access denied');
    }
  }

  toggleMinimize(): void {
    this.isMinimized = !this.isMinimized;
  }

  ngOnDestroy(): void {
    this.stream?.getTracks().forEach(t => t.stop());
    this.stream = null;
  }
}
