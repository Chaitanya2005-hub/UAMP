import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface ProctoringConfig {
  webcamEnabled: boolean;
  audioEnabled: boolean;
  fullscreenEnabled: boolean;
  gazeDetectionEnabled: boolean;
  tabSwitchMonitoring: boolean;
}

export interface ProctoringIncident {
  id: string;
  incident_type: string;
  severity: 'warning' | 'critical';
  metadata: any;
  snapshot_url?: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdvancedProctoringService {
  private videoStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private isMonitoring = false;
  private strikeCount = 0;
  private maxStrikes = 3;

  constructor(private http: HttpClient) {}

  async initializeWebcam(): Promise<MediaStream> {
    try {
      this.videoStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: false
      });
      return this.videoStream;
    } catch (error) {
      console.error('Failed to initialize webcam:', error);
      throw new Error('Camera access denied or unavailable');
    }
  }

  async initializeAudioMonitoring(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);
    } catch (error) {
      console.error('Failed to initialize audio monitoring:', error);
      throw new Error('Microphone access denied or unavailable');
    }
  }

  getAudioLevel(): number {
    if (!this.analyser) return 0;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    return sum / dataArray.length;
  }

  detectAudioAnomaly(threshold: number = 70): boolean {
    const level = this.getAudioLevel();
    return level > threshold;
  }

  async requestFullscreen(): Promise<void> {
    try {
      await document.documentElement.requestFullscreen();
    } catch (error) {
      console.error('Fullscreen request failed:', error);
      throw new Error('Fullscreen request denied');
    }
  }

  exitFullscreen(): void {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  }

  setupFullscreenMonitor(callback: () => void): void {
    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement) {
        callback();
      }
    });
  }

  async captureSnapshot(): Promise<string> {
    if (!this.videoStream) throw new Error('Webcam not initialized');

    const video = document.createElement('video');
    video.srcObject = this.videoStream;
    video.play();

    await new Promise(resolve => video.onloadedmetadata = resolve);

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');

    ctx.drawImage(video, 0, 0);

    return canvas.toDataURL('image/jpeg', 0.8);
  }

  reportIncident(attemptId: string, incidentType: string, severity: 'warning' | 'critical', metadata: any, snapshot?: string): void {
    const token = localStorage.getItem('auth_token');

    const payload: any = {
      attempt_id: attemptId,
      incident_type: incidentType,
      severity,
      metadata
    };

    if (snapshot) {
      // Convert data URL to blob and upload
      fetch(snapshot)
        .then(res => res.blob())
        .then(blob => {
          const formData = new FormData();
          formData.append('image', blob, 'incident.jpg');
          formData.append('attempt_id', attemptId);
          formData.append('incident_type', incidentType);
          formData.append('severity', severity);
          formData.append('metadata', JSON.stringify(metadata));

          return this.http.post(`${environment.apiBaseUrl}/proctoring/incident`, formData, {
            headers: { 'Authorization': `Bearer ${token}` }
          }).subscribe({
            error: (err) => console.error('Failed to report incident:', err)
          });
        });
    } else {
      this.http.post(`${environment.apiBaseUrl}/proctoring/incident`, payload, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).subscribe({
        error: (err) => console.error('Failed to report incident:', err)
      });
    }

    this.strikeCount++;
    if (this.strikeCount >= this.maxStrikes) {
      this.triggerAutoSubmit();
    }
  }

  triggerAutoSubmit(): void {
    // This should trigger the exam auto-submit logic
    console.log('Auto-submit triggered due to proctoring violations');
    // Emit event or call service to submit exam
  }

  getStrikeCount(): number {
    return this.strikeCount;
  }

  resetStrikes(): void {
    this.strikeCount = 0;
  }

  startMonitoring(config: ProctoringConfig): void {
    this.isMonitoring = true;
    this.maxStrikes = 3; // Could be configurable

    if (config.webcamEnabled) {
      this.initializeWebcam().catch(console.error);
    }

    if (config.audioEnabled) {
      this.initializeAudioMonitoring().catch(console.error);
    }

    if (config.fullscreenEnabled) {
      this.requestFullscreen().catch(console.error);
      this.setupFullscreenMonitor(() => {
        this.reportIncident('', 'fullscreen_exit', 'warning', { timestamp: new Date().toISOString() });
      });
    }
  }

  stopMonitoring(): void {
    this.isMonitoring = false;

    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
      this.videoStream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
      this.analyser = null;
    }

    this.exitFullscreen();
  }

  getIncidents(attemptId: string): Promise<ProctoringIncident[]> {
    const token = localStorage.getItem('auth_token');
    return this.http.get<ProctoringIncident[]>(`${environment.apiBaseUrl}/attempts/${attemptId}/proctoring-events`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).toPromise().then(data => data || []) || Promise.resolve([]);
  }

  cleanup(): void {
    this.stopMonitoring();
    this.resetStrikes();
  }
}