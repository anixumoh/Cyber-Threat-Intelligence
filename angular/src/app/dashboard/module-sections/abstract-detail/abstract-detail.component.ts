import { ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { OrganizationService } from 'app/dashboard/organization/organization.service';
import { ModuleModel, OrganizationModel } from 'app/dashboard/organization/models';
import { isEmpty } from 'app/utils/functions';

export class AbstractDetailComponent implements OnInit, OnDestroy {
  activeModule: ModuleModel;
  activeModuleObservable: Observable<ModuleModel>;
  activeOrganization: OrganizationModel;
  moduleName: any;
  moduleNameHeader: string;
  isTrial = false;
  protected readonly destroy$ = new Subject<void>();

  constructor(protected organizationService: OrganizationService, public cd: ChangeDetectorRef) {
    if (!this.cd.detectChanges['destroyed']) {
      this.cd.markForCheck();
    }
  }

  ngOnInit() {
    this.organizationService
      .getCurrentContext()
      .pipe(takeUntil(this.destroy$))
      .subscribe((context) => {
        this.isTrial = context.currentOrganization.trial;
        if (this.contextValidations(context)) {
          this.activeOrganization = context.currentOrganization;
          this.activeModule = context.currentModule;
          this.moduleNameHeader = context.currentModule.name;
          if (this.activeOrganization && !isEmpty(this.activeModule)) {
            this.loadData();
          }
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  contextValidations(context) {
    return this.noDefaultActiveSets() || (this.contextSets(context) && this.changeOfCurrentSets(context));
  }

  contextSets(context) {
    return context.currentOrganization && context.currentModule && context.currentModule.id;
  }

  noDefaultActiveSets() {
    return !this.activeOrganization || !this.activeModule;
  }

  changeOfCurrentSets(context) {
    return (
      (this.activeOrganization && this.activeOrganization.id != context.currentOrganization.id) ||
      (this.activeModule && this.activeModule.id != context.currentModule.id)
    );
  }

  protected loadData() {}
}
