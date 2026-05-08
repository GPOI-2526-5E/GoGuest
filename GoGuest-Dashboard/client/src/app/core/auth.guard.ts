import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  // Attende che Firebase abbia verificato lo stato di auth
  if (auth.isLoading()) {
    // Permetti temporaneamente — onAuthStateChanged aggiornerà
    return true;
  }

  if (auth.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
