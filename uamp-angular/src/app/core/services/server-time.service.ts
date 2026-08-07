import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ServerTimeService {
  constructor(private http: HttpClient) {}

  /** Fetches trusted server time — never trust client Date.now() for exam timing */
  now(): Observable<Date> {
    return this.http.get<{ serverTime: string }>(`${environment.apiBaseUrl}/server-time`).pipe(
      map(res => new Date(res.serverTime))
    );
  }
}
