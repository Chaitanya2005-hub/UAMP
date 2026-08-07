import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, JwtClaims, LoginRequest, LoginResponse, RegisterRequest, UserRole } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'uamp_access_token';
  private readonly REFRESH_KEY = 'uamp_refresh_token';
  private readonly USER_KEY = 'uamp_user';

  private currentUser = signal<User | null>(this.loadUserFromStorage());
  private isAuthenticated = signal<boolean>(this.hasValidToken());

  readonly user = this.currentUser.asReadonly();
  readonly authenticated = this.isAuthenticated.asReadonly();
  readonly role = computed<UserRole | null>(() => this.currentUser()?.role ?? null);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiBaseUrl}/auth/login`, credentials).pipe(
      tap(response => {
        this.storeTokens(response.accessToken, response.refreshToken);
        this.storeUser(response.user);
        this.currentUser.set(response.user);
        this.isAuthenticated.set(true);
      })
    );
  }

  register(data: RegisterRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiBaseUrl}/auth/register`, data);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/auth/login']);
  }

  refreshToken(): Observable<{ accessToken: string } | null> {
    const refreshToken = localStorage.getItem(this.REFRESH_KEY);
    if (!refreshToken) {
      this.logout();
      return of(null);
    }
    return this.http.post<{ accessToken: string }>(`${environment.apiBaseUrl}/auth/refresh`, { refreshToken }).pipe(
      tap(response => {
        if (response) {
          localStorage.setItem(this.TOKEN_KEY, response.accessToken);
        }
      }),
      catchError(() => {
        this.logout();
        return of(null);
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getDecodedToken(): JwtClaims | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }

  hasPermission(permission: string): boolean {
    const claims = this.getDecodedToken();
    return claims?.permissions?.includes(permission) ?? false;
  }

  private hasValidToken(): boolean {
    const claims = this.getDecodedToken();
    if (!claims) return false;
    return claims.exp * 1000 > Date.now();
  }

  private storeTokens(access: string, refresh: string): void {
    localStorage.setItem(this.TOKEN_KEY, access);
    localStorage.setItem(this.REFRESH_KEY, refresh);
  }

  private storeUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private loadUserFromStorage(): User | null {
    const stored = localStorage.getItem(this.USER_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
}
