import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const cameraPermissionGuard: CanActivateFn = async () => {
  const router = inject(Router);

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 320, height: 240, frameRate: { ideal: 5, max: 8 } },
      audio: true,
    });
    // Stop the test stream — actual capture starts in the proctor overlay component
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch {
    return router.createUrlTree(['/student/dashboard'], {
      queryParams: { reason: 'camera_denied' },
    });
  }
};
