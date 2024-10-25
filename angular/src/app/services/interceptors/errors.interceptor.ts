import { Injectable } from '@angular/core';
import { HttpEvent, HttpRequest, HttpHandler, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, retryWhen, mergeMap } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class ErrorsInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private toastrService: ToastrService) {}
  handled: boolean;
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.handled = false;

    return next.handle(req).pipe(
      retryWhen(
        this.genericRetryStrategy({
          maxRetryAttempts: 2,
          scalingDuration: 2000,
          excludedStatusCodes: [400, 401, 403, 404, 405, 415, 412, 409]
        })
      ),
      catchError((error: HttpErrorResponse) => {
        return this.handleServerSideError(error);
      })
    );
  }

  private handleServerSideError(error: HttpErrorResponse) {
    if (error.status === 401) {
      this.authService.logout();
    }

    if (error.status === 429) {
      this.toastrService.error(
        'This happens when you exceed the number of allowed requests to our API for a certain period of time.',
        'Too Many Requests'
      );
    }

    const errorMessage = error.status && error.message ? `Error Status ${error.status}: ${error.message}` : error;
    console.log(errorMessage);

    return throwError(error);
  }

  private genericRetryStrategy =
    ({
      maxRetryAttempts = 2,
      scalingDuration = 1000,
      excludedStatusCodes = []
    }: {
      maxRetryAttempts?: number;
      scalingDuration?: number;
      excludedStatusCodes?: number[];
    } = {}) =>
    (attempts: Observable<any>) => {
      return attempts.pipe(
        mergeMap((error: Response | any, i) => {
          const retryAttempt = i + 1;
          if (
            retryAttempt > maxRetryAttempts ||
            excludedStatusCodes.find((e) => e === (error.status || error.httpCode))
          ) {
            return throwError(error);
          }
          return timer(retryAttempt * scalingDuration);
        })
      );
    };
}
