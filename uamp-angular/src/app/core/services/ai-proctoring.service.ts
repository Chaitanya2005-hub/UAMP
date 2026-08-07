import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface ProctoringEvent {
  eventType: string;
  severity: 'warning' | 'critical';
  metadata?: Record<string, any>;
}

@Injectable({
  providedIn: 'root'
})
export class AiProctoringService {
  private model: any = null;
  private gazeAwaySince: number | null = null;
  private isInitialized = false;
  private isRunning = false;
  private analysisInterval: any = null;
  private submissionId: string = '';

  private readonly GAZE_AWAY_THRESHOLD_MS = 4000;
  private readonly GAZE_DEVIATION_DEG = 30;
  private readonly ANALYSIS_INTERVAL_MS = 500; // 2fps

  constructor(private http: HttpClient) {}

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize TensorFlow.js backend
      // @ts-ignore - TensorFlow.js types
      await tf.setBackend('webgl');
      
      // Note: In production, you would load the actual face detection model
      // For now, we'll simulate the initialization
      console.log('AI Proctoring Service initialized');
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize AI proctoring:', error);
      throw error;
    }
  }

  startAnalysis(
    videoEl: HTMLVideoElement, 
    submissionId: string,
    onDetection?: (faces: number, gazeOffset: number) => void
  ): void {
    if (!this.isInitialized) {
      console.warn('AI Proctoring not initialized. Call initialize() first.');
      return;
    }

    if (this.isRunning) {
      this.stopAnalysis();
    }

    this.submissionId = submissionId;
    this.isRunning = true;
    this.gazeAwaySince = null;

    this.analysisInterval = setInterval(() => {
      this.analyzeFrame(videoEl, submissionId, onDetection);
    }, this.ANALYSIS_INTERVAL_MS);
  }

  stopAnalysis(): void {
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }
    this.isRunning = false;
    this.gazeAwaySince = null;
  }

  private async analyzeFrame(
    videoEl: HTMLVideoElement, 
    submissionId: string,
    onDetection?: (faces: number, gazeOffset: number) => void
  ): Promise<void> {
    if (!this.isRunning || videoEl.paused || videoEl.ended) {
      return;
    }

    try {
      // Simulate face detection (in production, use actual TensorFlow.js model)
      const mockDetection = this.mockFaceDetection();
      
      const { faceCount, gazeOffset } = mockDetection;

      // Call detection callback if provided
      if (onDetection) {
        onDetection(faceCount, gazeOffset);
      }

      // No face detected
      if (faceCount === 0) {
        this.http.post(`/api/proctoring/submission/${submissionId}/events`, {
          eventType: 'no_face_detected',
          severity: 'warning'
        }).subscribe({
          error: (err) => console.error('Failed to report no face:', err)
        });
        return;
      }

      // Multiple faces detected
      if (faceCount > 1) {
        const snapshot = await this.captureSnapshot(videoEl);
        const formData = new FormData();
        formData.append('event', JSON.stringify({
          eventType: 'multiple_faces',
          severity: 'critical',
          metadata: { faceCount }
        }));
        formData.append('snapshot', snapshot);
        
        this.http.post(`/api/proctoring/submission/${submissionId}/events/snapshot`, formData).subscribe({
          error: (err) => console.error('Failed to report multiple faces:', err)
        });
        return;
      }

      // Gaze deviation detection
      if (Math.abs(gazeOffset) > this.GAZE_DEVIATION_DEG) {
        this.gazeAwaySince ??= Date.now();
        
        if (Date.now() - this.gazeAwaySince > this.GAZE_AWAY_THRESHOLD_MS) {
          const snapshot = await this.captureSnapshot(videoEl);
          const formData = new FormData();
          formData.append('event', JSON.stringify({
            eventType: 'gaze_deviation',
            severity: 'warning',
            metadata: { gazeOffsetDeg: gazeOffset }
          }));
          formData.append('snapshot', snapshot);
          
          this.http.post(`/api/proctoring/submission/${submissionId}/events/snapshot`, formData).subscribe({
            error: (err) => console.error('Failed to report gaze deviation:', err)
          });
          this.gazeAwaySince = null; // Reset to avoid duplicate spam
        }
      } else {
        this.gazeAwaySince = null;
      }

    } catch (error) {
      console.error('Error during frame analysis:', error);
    }
  }

  private mockFaceDetection(): { faceCount: number; gazeOffset: number } {
    // Simulate detection results (in production, use actual TensorFlow.js)
    // Random variation for demo purposes
    const random = Math.random();
    
    if (random < 0.02) {
      // 2% chance of no face
      return { faceCount: 0, gazeOffset: 0 };
    } else if (random < 0.05) {
      // 3% chance of multiple faces
      return { faceCount: Math.floor(Math.random() * 2) + 2, gazeOffset: 0 };
    } else {
      // Normal case: single face with random gaze offset
      const gazeOffset = (Math.random() - 0.5) * 60; // -30 to +30 degrees
      return { faceCount: 1, gazeOffset };
    }
  }

  private async captureSnapshot(videoEl: HTMLVideoElement): Promise<Blob> {
    const canvas = document.createElement('canvas');
    canvas.width = videoEl.videoWidth;
    canvas.height = videoEl.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoEl, 0, 0);
    }
    
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to capture snapshot'));
        }
      }, 'image/jpeg', 0.7);
    });
  }

  private estimateGazeOffset(face: any): number {
    // In production, this would analyze actual face landmarks
    // Simplified: return random offset for demo
    return (Math.random() - 0.5) * 60;
  }

  isAnalysisRunning(): boolean {
    return this.isRunning;
  }

  setGazeThreshold(thresholdMs: number): void {
    // @ts-ignore - dynamic property
    this.GAZE_AWAY_THRESHOLD_MS = thresholdMs;
  }

  setGazeDeviationLimit(degrees: number): void {
    // @ts-ignore - dynamic property
    this.GAZE_DEVIATION_DEG = degrees;
  }
}