import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { map, switchMap } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';

import { Store } from 'app/services/store/store';
import { OrganizationService } from 'app/dashboard/organization/organization.service';

@Injectable()
export class ModuleGuard implements CanActivate {
  modulesRoles: any;
  roles: any;
  modules: any;
  isRoles: any;
  isModules: any;
  moduleRolesSubject = new BehaviorSubject<any>(null);

  constructor(private router: Router, private store: Store, private organizationService: OrganizationService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
    if (route && route.params && route.params.id && route.parent && route.parent.params && route.parent.params.id) {
      return this.organizationService.getModules(route.parent.params.id).pipe(
        switchMap((modules: any) => {
          this.modules = modules;
          return this.store.select('roleList');
        }),
        map((roles: any) => {
          this.roles = roles;
          this.modulesRoles = roles.grants.modules;
          if (
            this.isModule(route) &&
            (this.isAllowedModule(route) ||
              this.isMaster() ||
              this.isAdminSuperAdmin() ||
              this.isGlobalResearcher(route) ||
              this.isTrial())
          ) {
            return true;
          }
          this.router.navigate(['/notFound']);
          return false;
        })
      );
    } else {
      this.router.navigate(['/notFound']);
      return false;
    }
  }

  isGlobalResearcher(route) {
    const grs = this.roles.grants;
    const orgId = parseInt(route.parent.params.id);
    return (
      grs.globalAnalyst.indexOf(orgId) >= 0 ||
      grs.globalOperator.indexOf(orgId) >= 0 ||
      grs.globalCustomer.indexOf(orgId) >= 0
    );
  }

  isAdminSuperAdmin() {
    return this.roles.superadmin || this.roles.admin;
  }

  isMaster() {
    return this.roles.master;
  }

  isTrial() {
    return this.roles.trial;
  }

  isAllowedModule(route) {
    return this.modulesRoles.indexOf(parseInt(route.params.id, 10)) >= 0;
  }

  isModule(route) {
    return this.modules.find((module) => {
      return module.id === parseInt(route.params.id, 10);
    });
  }
}
