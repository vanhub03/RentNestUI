import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { StorageService } from '../_services/storage.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(StorageService).getToken();
  if (token) {
    const cloneReq = req.clone({
      headers: req.headers.set('Authorization', 'Bearer ' + token),
    });
    return next(cloneReq);
  }
  return next(req);
};
