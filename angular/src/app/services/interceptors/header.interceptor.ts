import { Injectable } from '@angular/core';
import { HttpEvent, HttpRequest, HttpHandler, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { concatMap } from 'rxjs/operators';

import { AuthService } from '../auth.service';

@Injectable()
export class HeaderInterceptor implements HttpInterceptor {
  constructor(private authenticationService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const skipIntercept = req.headers.has('skip');

    if (!skipIntercept) {
      if (req.headers && !req.headers.has('Content-Type')) {
        req = req.clone({
          headers: req.headers.set('Content-Type', 'application/json'),
        });
      }
    } else {
      req = req.clone({
        headers: req.headers.delete('skip'),
      });
    }

    return this.authenticationService.getAuthTokenFromStore().pipe(
      concatMap((authToken) => {
        if (authToken) {
          req.headers.delete('x-cookie');
          req = req.clone({
            headers: req.headers.set('x-cookie', authToken.token).set('uirequest', 'true'),
            withCredentials: true,
          });
        }

        return next.handle(req);
      })
    );
  }
}
