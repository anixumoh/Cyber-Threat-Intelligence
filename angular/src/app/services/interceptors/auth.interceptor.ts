import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { AuthService } from '../auth.service';

export interface Token {
  token: string;
}

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private AUTH_HEADER = 'Authorization';

  constructor(private router: Router, private authenticationService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.authenticationService.getAuthTokenFromStore().pipe(
      concatMap(authToken => {
        if (authToken) {
          req = req.clone({
            headers: req.headers.set(this.AUTH_HEADER, `Bearer ${authToken.token}`),
          });
          this.authenticationService.token = authToken.token;
        }

        return next.handle(req);
      })
    );
  }
}
