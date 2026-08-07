import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject, timer, retry, share, takeUntil } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface WsMessage<T = unknown> {
  channel: string;
  event: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class WebsocketService implements OnDestroy {
  private socket$: WebSocketSubject<WsMessage> | null = null;
  private destroy$ = new Subject<void>();
  private messages$: Observable<WsMessage> | null = null;

  constructor(private authService: AuthService) {}

  connect(): Observable<WsMessage> {
    if (!this.socket$) {
      const token = this.authService.getToken();
      this.socket$ = webSocket<WsMessage>({
        url: `${environment.websocketUrl}?token=${token}`,
        openObserver: { next: () => console.log('[WS] Connected') },
        closeObserver: { next: () => console.log('[WS] Disconnected') },
      });

      this.messages$ = this.socket$.pipe(
        retry({ delay: 3000 }),
        share(),
        takeUntil(this.destroy$)
      );
    }
    return this.messages$!;
  }

  /** Subscribe to a specific channel (e.g., 'exam:abc123', 'proctoring:abc123', 'audit') */
  channel<T = unknown>(channelName: string): Observable<WsMessage<T>> {
    return new Observable<WsMessage<T>>(subscriber => {
      const sub = this.connect().subscribe({
        next: (msg) => {
          if (msg.channel === channelName) {
            subscriber.next(msg as WsMessage<T>);
          }
        },
        error: err => subscriber.error(err),
        complete: () => subscriber.complete(),
      });
      return () => sub.unsubscribe();
    });
  }

  send(message: WsMessage): void {
    if (this.socket$) {
      this.socket$.next(message);
    }
  }

  disconnect(): void {
    if (this.socket$) {
      this.socket$.complete();
      this.socket$ = null;
      this.messages$ = null;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.disconnect();
  }
}
