import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';

export interface ApiError {
  status: number;
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export const errorInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 — attempt token refresh once
      if (error.status === 401 && !req.url.includes('/auth/')) {
        return authService.refreshToken().pipe(
          switchMap(result => {
            if (result) {
              const retried = req.clone({
                setHeaders: { Authorization: `Bearer ${result.accessToken}` },
              });
              return next(retried);
            }
            return throwError(() => normalizeError(error));
          })
        );
      }

      // Handle 403 — insufficient permissions
      if (error.status === 403) {
        console.error('[UAMP] Access denied:', error.error);
      }

      return throwError(() => normalizeError(error));
    })
  );
};

function normalizeError(error: HttpErrorResponse): ApiError {
  return {
    status: error.status,
    code: error.error?.code ?? 'UNKNOWN_ERROR',
    message: error.error?.message ?? error.message ?? 'An unexpected error occurred',
    details: error.error?.details,
  };
}
