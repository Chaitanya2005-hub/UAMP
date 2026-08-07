import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WebcamStreamService {
  private stream: MediaStream | null = null;

  async acquire(constraints?: MediaStreamConstraints): Promise<MediaStream> {
    try {
      const defaultConstraints: MediaStreamConstraints = {
        video: { 
          width: { ideal: 320 }, 
          height: { ideal: 240 },
          frameRate: { ideal: 5, max: 8 }
        },
        audio: true
      };

      this.stream = await navigator.mediaDevices.getUserMedia(
        constraints || defaultConstraints
      );
      
      return this.stream;
    } catch (error) {
      console.error('Failed to acquire webcam stream:', error);
      throw new Error('Camera access denied or unavailable');
    }
  }

  attachTo(videoEl: HTMLVideoElement): void {
    if (!this.stream) {
      throw new Error('Stream not acquired. Call acquire() first.');
    }
    videoEl.srcObject = this.stream;
    videoEl.play().catch(err => 
      console.error('Failed to play video stream:', err)
    );
  }

  async publishToProctor(peerConnection: RTCPeerConnection): Promise<void> {
    if (!this.stream) {
      throw new Error('Stream not acquired. Call acquire() first.');
    }
    
    this.stream.getTracks().forEach(track => {
      peerConnection.addTrack(track, this.stream!);
    });
  }

  getStream(): MediaStream | null {
    return this.stream;
  }

  getVideoTracks(): MediaStreamTrack[] {
    return this.stream?.getVideoTracks() || [];
  }

  getAudioTracks(): MediaStreamTrack[] {
    return this.stream?.getAudioTracks() || [];
  }

  muteAudio(mute: boolean): void {
    this.getAudioTracks().forEach(track => {
      track.enabled = !mute;
    });
  }

  stopVideo(stop: boolean): void {
    this.getVideoTracks().forEach(track => {
      track.enabled = !stop;
    });
  }

  release(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        track.stop();
      });
      this.stream = null;
    }
  }

  isStreamActive(): boolean {
    return this.stream !== null && 
           this.stream.getTracks().some(track => track.readyState === 'live');
  }

  async captureFrame(): Promise<Blob> {
    if (!this.stream) {
      throw new Error('No active stream to capture from');
    }

    const videoTrack = this.stream.getVideoTracks()[0];
    if (!videoTrack) {
      throw new Error('No video track available');
    }

    const imageCapture = new ImageCapture(videoTrack);
    try {
      const bitmap = await imageCapture.grabFrame();
      
      // Convert to blob
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(bitmap, 0, 0);
      }
      
      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to capture frame'));
          }
        }, 'image/jpeg', 0.7);
      });
    } catch (error) {
      console.error('Failed to capture frame:', error);
      throw error;
    }
  }
}