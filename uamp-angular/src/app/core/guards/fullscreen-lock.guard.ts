import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const fullscreenLockGuard: CanActivateFn = async () => {
  const router = inject(Router);

  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    }
    return true;
  } catch {
    // Browser denied fullscreen — redirect to remediation
    return router.createUrlTree(['/student/dashboard'], {
      queryParams: { reason: 'fullscreen_denied' },
    });
  }
};
