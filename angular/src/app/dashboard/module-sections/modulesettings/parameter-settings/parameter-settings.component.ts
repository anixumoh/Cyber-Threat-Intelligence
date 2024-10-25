import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ModuleSettingsService } from '../module-settings.service';
import { ModuleModel, OrganizationModel } from '../../../organization/models';
import { OrganizationService } from '../../../organization/organization.service';
import { ClassifyService } from '../detail/classify/classify.service';
import { tabSetting } from '../utils';
import { Grants } from 'app/services/grants/grants';

@Component({
  selector: 'app-parameter-settings',
  templateUrl: './parameter-settings.component.html',
  styleUrls: ['./parameter-settings.component.scss']
})
export class ParameterSettingsComponent implements OnInit, OnDestroy {
  activeModule: ModuleModel;
  activeOrganization: OrganizationModel;
  parameters = [];
  unclassified = 0;
  isShowInfo = false;
  isShowForm = false;
  isShowSearch = false;
  isShowDropdown = false;

  @Input('module-id') moduleId;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private moduleSettingsService: ModuleSettingsService,
    private organizationService: OrganizationService,
    protected classifyService: ClassifyService,
    protected router: Router,
    protected grants: Grants
  ) {}

  ngOnInit() {
    this.organizationService.setCurrentModuleId(+this.moduleId);
    this.organizationService
      .getCurrentContext()
      .pipe(takeUntil(this.destroy$))
      .subscribe((context) => {
        this.activeModule = context.currentModule;
        this.activeOrganization = context.currentOrganization;
        this.loadParameters();
      });

    if (this.activeModule && this.activeModule.moduleName === 'credential' && !this.grants.isCustomerOrOperator()) {
      this.classifyService
        .getDomainAssets()
        .pipe(takeUntil(this.destroy$))
        .subscribe((res) => {
          this.unclassified = res['UNCLASSIFIED'] ? res['UNCLASSIFIED'].length : 0;
        });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadParameters() {
    this.moduleSettingsService
      .getSettings(this.activeOrganization.id, this.activeModule.id, this.activeModule.moduleName)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.parameters = res
          .filter((parameter) => {
            return parameter?.tab === tabSetting.parameters;
          })
          .map((parameter) => {
            return { ...parameter, moduleId: this.activeModule.id, orgId: this.activeOrganization.id };
          });
      });
  }

  toggleShowInfo() {
    this.isShowInfo = !this.isShowInfo;
  }

  toggleShowForm() {
    this.isShowForm = !this.isShowForm;
  }

  toggleShowSearch() {
    this.isShowSearch = !this.isShowSearch;
  }

  toggleShowDropdown() {
    this.isShowDropdown = !this.isShowDropdown;
  }

  navigateToClassify() {
    this.router.navigate([
      `dashboard/organizations/${this.activeOrganization.id}/modules/${this.activeModule.id}/settings/classification`
    ]);
  }
}
