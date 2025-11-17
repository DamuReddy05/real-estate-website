import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    const user = authService.getCurrentUserValue();
    if (user?.is_admin || user?.role === 'admin') {
      return true;
    }
  }

  router.navigate(['/admin/login']);
  return false;
};
