import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';

import { UserAccountService } from 'app/dashboard/user/account.service';
import { Grants } from '../grants/grants';
import { adminRoute } from 'app/admin/admin-routing.module';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private userAccountService: UserAccountService, protected grants: Grants, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    const adminRoutes = adminRoute[0].children;
    const authMap = {};
    let first = true;
    adminRoutes.forEach((item) => {
      if (item.path && item?.data?.roles?.length !== 0) {
        authMap[`/admin/${item.path}`] = item.data.roles;
        if (first) {
          authMap['/admin'] = item.data.roles;
          first = false;
        }
      }
    });

    return this.grants.organizationSetted$.pipe(
      switchMap(() => this.userAccountService.getCurrentUser()),
      switchMap(() => {
        const role = this.grants.getRole();
        const roles: string[] = authMap[state.url] ?? [];
        const hasRole = roles.includes(role);
        if (!hasRole) {
          this.router.navigate(['/dashboard']);
        }
        return of(hasRole);
      })
    );
  }
}
