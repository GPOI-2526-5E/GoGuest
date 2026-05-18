import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  console.log('[authGuard] Checking access:', {
    isLoggedIn: auth.isLoggedIn(),
    hasJwtSession: auth.hasJwtSession(),
    isLoading: auth.isLoading()
  });

  if (auth.isLoggedIn() || auth.hasJwtSession()) {
    console.log('[authGuard] Access granted.');
    return true;
  }

  // Attende che Firebase abbia verificato lo stato di auth.
  if (auth.isLoading()) {
    console.log('[authGuard] Loading auth state, allowing temporarily.');
    return true;
  }

  console.warn('[authGuard] Access denied. Redirecting to /login.');
  return router.createUrlTree(['/login']);
};
