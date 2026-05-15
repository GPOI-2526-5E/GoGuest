import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn() || auth.hasJwtSession()) {
    return true;
  }

  // Attende che Firebase abbia verificato lo stato di auth.
  if (auth.isLoading()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
