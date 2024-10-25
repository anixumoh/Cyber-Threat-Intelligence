import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { OrganizationService } from '../../dashboard/organization/organization.service';
import { Store } from '../../services/store/store';
import { Grants } from '../../services/grants/grants';
import { BaseAdminComponent } from '../base-admin/base-admin.component';
import { SidebarService } from 'app/services/sidebar.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent extends BaseAdminComponent implements OnInit, OnDestroy {
  role: string;
  sidebarStatus = false;
  sidebarSubscription: Subscription;

  constructor(
    protected organizationService: OrganizationService,
    protected router: Router,
    protected grants: Grants,
    protected store: Store,
    protected sidebarService: SidebarService
  ) {
    super(organizationService, router, grants, store);
    this.organizationService
      .getSidebarAdmin()
      .pipe(takeUntil(this.destroy$))
      .subscribe((status) => {
        this.openSidebar = status;
      });
  }

  ngOnInit() {
    super.ngOnInit();
    this.getRoles();
    this.sidebarSubscription = this.sidebarService.getSidebarStatus().subscribe((status) => {
      this.sidebarStatus = status;
    });
  }

  ngOnDestroy() {
    this.sidebarSubscription.unsubscribe();
  }

  getRoles() {
    this.store
      .select('roleList')
      .pipe(takeUntil(this.destroy$))
      .subscribe((roles) => {
        if (roles) {
          this.sendRoleToShow();
        }
      });
  }

  sendRoleToShow() {
    if (this.grants.roles) {
      if (this.grants.isMaster()) {
        this.role = 'Master';
      } else if (this.grants.isSuperAdmin()) {
        this.role = 'Superadmin';
      } else if (this.grants.isAdmin()) {
        this.role = 'Admin';
      } else {
        this.role = 'Analyst';
      }
    }
  }
}
