import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrganizationService } from 'app/dashboard/organization/organization.service';
import { Grants } from 'app/services/grants/grants';
import { Store } from 'app/services/store/store';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-base-admin',
  template: ` <p>base-admin works!</p> `,
  styles: []
})
export class BaseAdminComponent implements OnInit, OnDestroy {
  openSidebar = false;
  protected readonly destroy$ = new Subject<void>();

  constructor(
    protected organizationService: OrganizationService,
    protected router: Router,
    protected grants: Grants,
    protected store: Store
  ) {}

  ngOnInit(): void {
    this.changeResolution();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  changeResolution() {
    this.changeSidebar(window.innerWidth <= 768 ? false : true);
  }

  changeSidebar(show: boolean) {
    this.openSidebar = show;
    this.organizationService.setSidebarAdmin(this.openSidebar);
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.changeResolution();
  }
}
