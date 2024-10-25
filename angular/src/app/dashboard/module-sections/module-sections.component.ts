import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { OrganizationService } from '../organization/organization.service';
import { PaginationService } from 'app/dashboard/module-sections/shared/filters/pagination/pagination.service';

@Component({
  selector: 'app-module-sections',
  template: '<router-outlet></router-outlet>'
})
export class ModuleSectionsComponent implements OnInit, OnDestroy {
  activeModule: any;
  activeOrganization: any;
  selectedId: any;
  controller = false;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private organizationService: OrganizationService,
    private route: ActivatedRoute,
    private paginationService: PaginationService
  ) {
    this.paginationService.stopper = false;
  }

  ngOnInit() {
    this.organizationService
      .getCurrentContext()
      .pipe(takeUntil(this.destroy$))
      .subscribe((context) => {
        if (context.currentOrganization) {
          this.activeOrganization = context.currentOrganization;
          if (this.selectedId && context.currentModule && !context.currentModule.id && this.controller) {
            this.organizationService.setCurrentModuleId(this.selectedId);
            this.controller = false;
          }
        }
        if (context.currentModule) {
          this.activeModule = context.currentModule;
        }
      });

    this.route.params.subscribe((params: Params) => {
      this.selectedId = +params['id'];
      this.controller = true;
      if (this.activeOrganization && this.selectedId) {
        this.organizationService.setCurrentModuleId(this.selectedId);
        this.controller = false;
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
