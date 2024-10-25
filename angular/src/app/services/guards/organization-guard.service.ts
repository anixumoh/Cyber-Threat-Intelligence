import { map, filter } from 'rxjs/operators';
import { Injectable, OnDestroy } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { UserAccountService } from 'app/dashboard/user/account.service';
import { Grants } from 'app/services/grants/grants';

@Injectable()
export class OrganizationGuard implements CanActivate, OnDestroy {
  public subscriptionsList: Subscription[] = [];

  constructor(private router: Router, private userAccountService: UserAccountService, private grants: Grants) {
    const s = this.userAccountService.getCurrentUser().subscribe(() => {});
    this.subscriptionsList.push(s);
  }

  ngOnDestroy() {
    this.unsubscribe();
  }

  unsubscribe() {
    this.subscriptionsList.forEach((subscription) => {
      if (subscription.unsubscribe) {
        subscription.unsubscribe();
      }
    });
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
    return this.grants.getAllowedOrganizationsSubject().pipe(
      filter(Boolean),
      map(() => {
        if (
          this.grants.setOrganizationExists(parseInt(route.params.id)) &&
          this.grants.setAllowedOrganization(route.params.id)
        ) {
          return true;
        } else {
          // this.router.navigate(['/notFound']);
          return false;
        }
      })
    );
  }
}
