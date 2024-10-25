import { AuthService } from './../auth.service';
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap, first } from 'rxjs/operators';

import { UserAccountService } from 'app/dashboard/user/account.service';
import { LocalStorageService } from '../store/local-store.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private authenticationService: AuthService,
    private userAccountService: UserAccountService,
    private localStorage: LocalStorageService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.authenticationService.isUserLoggedIn().pipe(
      switchMap((isLoggedIn) => {
        if (isLoggedIn) {
          if (this.authenticationService.isNotLicenseAccepted()) {
            this.router.navigate([`/privacityTerms`]);
            return of(false);
          }
          this.userAccountService.fetchCurrentUser();
          return this.userAccountService.getCurrentUser().pipe(
            switchMap(() => {
              return of(true);
            })
          );
        } else {
          this.localStorage
            .clear()
            .pipe(first())
            .subscribe(() => {});
          this.authenticationService.redirectUrl = state.url;
          this.router.navigate(['/login']);
          return of(false);
        }
      })
    );
  }
}
