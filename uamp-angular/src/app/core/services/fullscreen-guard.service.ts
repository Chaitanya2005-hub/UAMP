import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FullscreenGuardService {
  private exitCount = 0;
  private submissionId: string = '';
  private isMonitoring = false;

  constructor(private http: HttpClient) {}

  async enterFullscreen(): Promise<boolean> {
    try {
      await document.documentElement.requestFullscreen();
      return true;
    } catch (error) {
      console.error('Failed to enter fullscreen:', error);
      return false;
    }
  }

  exitFullscreen(): void {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => 
        console.error('Failed to exit fullscreen:', err)
      );
    }
  }

  isFullscreen(): boolean {
    return !!document.fullscreenElement;
  }

  startMonitoring(submissionId: string): void {
    if (this.isMonitoring) return;
    
    this.submissionId = submissionId;
    this.exitCount = 0;
    this.isMonitoring = true;
    
    document.addEventListener('fullscreenchange', this.handleFullscreenChange);
  }

  stopMonitoring(): void {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
  }

  private handleFullscreenChange = (): void => {
    if (!this.isMonitoring) return;

    if (!document.fullscreenElement) {
      this.exitCount++;
      
      this.http.post(`/api/proctoring/submission/${this.submissionId}/events`, {
        eventType: 'fullscreen_exit',
        severity: 'warning',
        metadata: { 
          exitNumber: this.exitCount 
        }
      }).subscribe({
        error: (err) => console.error('Failed to report fullscreen exit:', err)
      });
    }
  };

  getExitCount(): number {
    return this.exitCount;
  }

  reset(): void {
    this.exitCount = 0;
  }
}