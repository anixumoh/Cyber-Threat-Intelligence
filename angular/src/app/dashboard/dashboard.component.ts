import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';

import { OrganizationService } from 'app/dashboard/organization/organization.service';
import { UserAccountService } from 'app/dashboard/user/account.service';
import { AuthService } from 'app/services/auth.service';
import { OrganizationModel } from 'app/dashboard/organization/models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  organizationId: any;
  routes;
  sidebarOpened = true;
  userId;
  _context: any;
  landingPage;
  orgId;
  state: any;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    public organizationService: OrganizationService,
    private userAccountService: UserAccountService,
    private authService: AuthService,
    private toastrService: ToastrService
  ) {
    router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.routes = router.url.split('/').map((r) => ({
          name: r,
          src: `${router.url.split(r)[0]}${r}`
        }));
      }
    });
  }

  ngOnInit() {
    this.userAccountService
      .getState()
      .pipe(
        switchMap((state: any) => {
          this.state = JSON.parse(JSON.stringify(state));
          return this.organizationService.getOrganizationsFromApi();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((orgs: any[]) => {
        this.persistOrganizations(orgs);
      });

    this.organizationService
      .getCurrentContext()
      .pipe(
        switchMap((context) => {
          this._context = context;
          return this.userAccountService.getCurrentUser();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((user: any) => {
        this.userId = user.id;
        if (this._context.currentOrganization) {
          if (this._context.currentOrganization && this._context.currentModule && this.userId) {
            this.userAccountService.getValuesModuleAndOrganization(
              this._context.currentOrganization.id,
              this._context.currentModule.id,
              this._context.currentOrganization.name,
              this.userId
            );
          }
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  buttonSidebarEmitter(isOpen) {
    this.sidebarOpened = isOpen;
  }

  private persistOrganizations(organizations: OrganizationModel[]) {
    if (!organizations[0]) {
      this.router.navigate([`/admin/orgs`]);
    } else if (this.activeRoute.children.length === 0) {
      this.organizationService.persistOrganizations(organizations);

      const enabled = organizations.findIndex((e) => e.enabled);
      // Add a conditional whether a default ornagization exists. Not at the moment. We should be able to set an organization as default
      if (this._context.currentOrganization.trial) {
        if (enabled !== -1) {
          this.router.navigate([`/dashboard/organizations/${organizations[enabled].id}/indexed`]);
        } else {
          this.router.navigate([`/dashboard/organizations/${organizations[0].id}/indexed`]);
        }
      } else {
        if (enabled !== -1) {
          this.router.navigate([`/dashboard/organizations/${organizations[enabled].id}/summary`]);
        } else {
          this.router.navigate([`/dashboard/organizations/${organizations[0].id}/summary`]);
        }
      }
    }
  }
}
