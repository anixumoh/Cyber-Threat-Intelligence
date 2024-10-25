import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';

import { Grants } from 'app/services/grants/grants';

@Injectable()
export class GrantsGuard implements CanActivate {
  constructor(private router: Router, public grants: Grants) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
    return this.grants.getGrantsSubject().pipe(
      filter(Boolean),
      map((bol) => {
        return this.switchRoutes(route);
      })
    );
  }

  switchRoutes(route) {
    let path = route._routerState.url;
    if (path.indexOf('alerts') >= 0 || path.indexOf('incidents') >= 0) {
      return this.getRedirection(!this.grants.isCustomerPartial(parseInt(route.parent.params.id)));
    } else if (
      path.indexOf('new') >= 0 ||
      path.indexOf('edit') >= 0 ||
      path.indexOf('create-module') >= 0 ||
      path.indexOf('grants') >= 0
    ) {
      return this.getRedirection(!this.grants.isCustomerOrOperatorPartial(parseInt(route.parent.params.id)));
    } else {
      return true;
    }
  }

  getRedirection(grant) {
    if (grant) {
      return true;
    } else {
      this.router.navigate(['/notFound']);
      return false;
    }
  }
}
