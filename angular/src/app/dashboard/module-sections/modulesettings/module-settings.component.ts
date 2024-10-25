import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ModuleSettingsService } from './module-settings.service';
import { OrganizationService } from 'app/dashboard/organization/organization.service';
import { ModuleModel, OrganizationModel } from 'app/dashboard/organization/models';
import { AsideService } from '../../../aside/aside.service';
import { Grants } from 'app/services/grants/grants';
import { PaginationService } from 'app/dashboard/module-sections/shared/filters/pagination/pagination.service';
import { ClassifyService } from './detail/classify/classify.service';
import { ModuleSettingsDetailService } from './detail/module-settings-detail.service';
import { MODULE_NAME, tabSetting } from './utils';

@Component({
  selector: 'app-module-settings',
  templateUrl: './module-settings.component.html',
  styleUrls: ['./module-settings.component.scss']
})
export class ModuleSettingsComponent implements OnInit, OnDestroy {
  activeModule: ModuleModel;
  activeOrganization: OrganizationModel;
  moduleNameHeader: any;
  tabs: any = { [tabSetting.parameters]: [], [tabSetting.otherSettings]: [] };
  tabSetting = tabSetting;
  moduleName = MODULE_NAME;
  unclassified = 0;
  activeTab = 'parameters';
  private readonly destroy$ = new Subject<void>();

  constructor(
    private organizationService: OrganizationService,
    private settings: ModuleSettingsService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private asideService: AsideService,
    public grants: Grants,
    private settingsDetail: ModuleSettingsDetailService,
    protected classifyService: ClassifyService,
    private paginationService: PaginationService
  ) {}

  ngOnInit() {
    this.organizationService
      .getCurrentContext()
      .pipe(takeUntil(this.destroy$))
      .subscribe((context) => {
        this.activeModule = context.currentModule;
        this.activeOrganization = context.currentOrganization;
        this.moduleNameHeader = context.currentModule.name;
        if (this.activeOrganization && this?.activeModule?.id) {
          this.loadSettings();
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openMenu(data) {
    this.asideService.setShowAsideSubject(data, null);
  }

  resetParams() {
    this.settingsDetail.searchTerm = '';
    this.paginationService.resetpaginationOutsideWithoutNext();
  }

  private loadSettings() {
    this.settings
      .getSettings(this.activeOrganization.id, this.activeModule.id, this.activeModule.moduleName)
      .pipe(takeUntil(this.destroy$))
      .subscribe((settings) => {
        this.tabs = settings.reduce(
          (acc, act) => {
            const typeParameters =
              act?.tab === tabSetting.parameters ? tabSetting.parameters : tabSetting.otherSettings;
            acc[typeParameters].push(act);
            return acc;
          },
          { [tabSetting.parameters]: [], [tabSetting.otherSettings]: [] }
        );

        if (!this.grants.isMaster() && !this.grants.isSuperAdmin()) {
          this.tabs.otherSettings.forEach((setting) => {
            if (setting.view_type === 'terms_custom' && this.activeModule.moduleName !== 'custom') {
              setting.hidden = true;
              if (this.router.url.includes('terms')) {
                this.router.navigate([tabSetting.parameters], {
                  relativeTo: this.activatedRoute
                });
              }
            }

            if (setting.view_type === 'classification' && this.grants.isCustomerOrOperator()) {
              setting.hidden = true;
              if (this.router.url.includes('classification')) {
                this.router.navigate([tabSetting.parameters], {
                  relativeTo: this.activatedRoute
                });
              }
            }
          });
        }
      });

    if (this?.activeModule?.moduleName === this.moduleName.CREDENTIAL && !this?.grants?.isCustomerOrOperator()) {
      this.classifyService
        .getDomainAssets()
        .pipe(takeUntil(this.destroy$))
        .subscribe((res) => {
          this.unclassified = res['UNCLASSIFIED'] ? res['UNCLASSIFIED'].length : 0;
        });
    }
  }
}
