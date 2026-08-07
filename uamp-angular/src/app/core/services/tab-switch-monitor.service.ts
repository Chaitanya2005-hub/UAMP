import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface TabSwitchEvent {
  eventType: 'tab_switch';
  severity: 'warning' | 'critical';
  metadata: {
    strikeNumber: number;
    limit: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class TabSwitchMonitorService {
  private strikeCount = 0;
  private strikeLimit: number;
  private strikes$ = new BehaviorSubject<number>(0);
  private autoSubmit$ = new Subject<void>();
  private submissionId: string = '';
  private isRunning = false;

  readonly onStrike = this.strikes$.asObservable();
  readonly onAutoSubmit = this.autoSubmit$.asObservable();

  constructor(private http: HttpClient) {
    this.strikeLimit = 3; // Default limit
  }

  setStrikeLimit(limit: number): void {
    this.strikeLimit = limit;
  }

  start(submissionId: string): void {
    if (this.isRunning) return;
    
    this.submissionId = submissionId;
    this.strikeCount = 0;
    this.strikes$.next(0);
    this.isRunning = true;
    
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  stop(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }

  private handleVisibilityChange = (): void => {
    if (!this.isRunning) return;
    
    if (document.visibilityState !== 'hidden') return;

    this.strikeCount++;
    this.strikes$.next(this.strikeCount);

    // Report every strike to the server immediately
    const event: TabSwitchEvent = {
      eventType: 'tab_switch',
      severity: this.strikeCount >= this.strikeLimit ? 'critical' : 'warning',
      metadata: { 
        strikeNumber: this.strikeCount, 
        limit: this.strikeLimit 
      }
    };

    this.http.post(`/api/proctoring/submission/${this.submissionId}/events`, event).subscribe({
      error: (err) => console.error('Failed to report tab switch:', err)
    });

    if (this.strikeCount >= this.strikeLimit) {
      this.autoSubmit$.next();
    }
  };

  getCurrentStrikes(): number {
    return this.strikeCount;
  }

  getRemainingStrikes(): number {
    return Math.max(0, this.strikeLimit - this.strikeCount);
  }

  reset(): void {
    this.strikeCount = 0;
    this.strikes$.next(0);
  }
}