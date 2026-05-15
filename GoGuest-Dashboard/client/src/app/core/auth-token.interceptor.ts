import { HttpInterceptorFn } from '@angular/common/http';
import { AUTH_TOKEN_STORAGE_KEY } from './auth.service';

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

  if (!token) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    })
  );
};
