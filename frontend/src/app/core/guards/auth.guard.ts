import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    const user = authService.getCurrentUserValue();
    // Only allow users with is_admin=true (not just role='admin')
    // This ensures Auth0 customers cannot access admin routes
    if (user?.is_admin === true) {
      return true;
    }
  }

  router.navigate(['/admin/login']);
  return false;
};
