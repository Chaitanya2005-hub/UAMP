import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRole = route.data['role'] as UserRole;
  const currentRole = authService.role();

  if (currentRole === requiredRole) {
    return true;
  }

  // Redirect to their own dashboard if authenticated but wrong role
  if (currentRole) {
    return router.createUrlTree([`/${currentRole}`]);
  }

  return router.createUrlTree(['/auth/login']);
};
