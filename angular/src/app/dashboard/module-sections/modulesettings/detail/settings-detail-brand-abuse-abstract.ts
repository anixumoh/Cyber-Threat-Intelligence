import { Component, Injector, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { DragulaService } from 'ng2-dragula';

import { SettingDetailAbstract } from 'app/dashboard/module-sections/modulesettings/detail/settings-detail-abstract';
import { UsersService } from 'app/services/users.service';
import { ModuleSettingsDetailService } from 'app/dashboard/module-sections/modulesettings/detail/module-settings-detail.service';
import { TechProductService } from 'app/dashboard/module-sections/modulesettings/detail/tech-product/tech-product.service';
import { ClassifyService } from 'app/dashboard/module-sections/modulesettings/detail/classify/classify.service';
import { BankService } from 'app/dashboard/module-sections/modulesettings/detail/bank/bank.service';
import { FeedsService } from 'app/dashboard/module-sections/modulesettings/detail/feeds/feeds.service';
import { OrganizationService } from 'app/dashboard/organization/organization.service';
import { PaginationService } from 'app/dashboard/module-sections/shared/filters/pagination/pagination.service';
import { Store } from 'app/services/store/store';
import { Grants } from 'app/services/grants/grants';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'settings-detail-brand-abuse',
  template: '<div></div>'
})
export class SettingDetailBrandAbuseAbstract extends SettingDetailAbstract implements OnInit, OnDestroy {
  totalResources: number;
  tableHeader: any[];
  loading = false;

  availableStatus = {
    RED: true,
    GREEN: true
  };

  colorToBoolean = {
    RED: false,
    GREEN: true
  };

  numberToSearch = {};

  constructor(
    protected injector: Injector,
    protected usersService: UsersService,
    protected settings: ModuleSettingsDetailService,
    protected router: Router,
    protected techProductService: TechProductService,
    protected dragulaService: DragulaService,
    protected classifyService: ClassifyService,
    protected bankService: BankService,
    protected feedsService: FeedsService,
    protected cd: ChangeDetectorRef,
    protected organizationService: OrganizationService,
    protected paginationService: PaginationService,
    protected store: Store,
    public grants: Grants,
    protected toastrService: ToastrService
  ) {
    super(
      injector,
      usersService,
      settings,
      router,
      techProductService,
      dragulaService,
      classifyService,
      bankService,
      feedsService,
      cd,
      organizationService,
      paginationService,
      store,
      grants,
      toastrService
    );
  }

  ngOnInit() {
    super.ngOnInit();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  initContext() {
    this.data = this.injector.get('data');
    this.checks = this.data.values ? new Array(this.data.values.length) : [];
    this.settingId = this.injector.get('settingId');
    this.setValues();
  }

  deleteSetting(id, index) {
    this.loading = true;
    this.settings
      .deleteSettingsDataView(this.settingId, id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res) => {
          this.loading = false;
          this.deleteConfirmation = false;
          this.values.splice(index, 1);
        },
        (e) => {
          this.loading = false;
        }
      );
  }

  deleteTerm(name, index, type, extraField?) {
    let termType = type;

    if (termType === 'TWITTER_TWEETS_FROM_PROFILE') {
      termType = 'TWEETS_FROM_PROFILE';
    } else if (termType === 'USERNAME') {
      termType = 'EMAIL';
    } else if (termType === 'SUBDOMAIN') {
      termType = 'DOMAIN';
    } else if (termType === 'IP_RANGE') {
      termType = 'IP';
    } else if (termType === 'CPE_TECH_VENDOR' || termType === 'CPE_TECH_PRODUCT' || termType === 'CPE_TECH_VERSION') {
      termType = 'CPE_TECH';
    }

    this.loading = true;
    const values_to_delete = termType === 'CPE_TECH' ? [{ title: name, cpe: extraField }] : [{ value: name }];
    this.settings
      .deleteSettingDataParameter(termType, { values_to_delete })
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res) => {
          this.loading = false;
          this.deleteConfirmation = false;
          this.values.splice(index, 1);
        },
        (e) => {
          this.loading = false;
        }
      );
  }

  setStatus(status, index, searchPlace, type = '') {
    this.values[index].values[searchPlace].booleanAttr = status;
    const tempSettingObject = {};
    tempSettingObject[this.numberToSearch[searchPlace]] = this.values[index].values[searchPlace].booleanAttr;
    this.settings
      .saveSettingsPatchByModule(this.settingId, this.values[index].id, tempSettingObject, type)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  // Only one Callback allowed
  oneCallBackFunction(args) {
    if (args && args.length) {
      const temp = [...args];
      args.forEach((el, i) => {
        if (typeof el === 'function') {
          temp.splice(i, 1);
          if (temp && temp.length) {
            el.call(this, temp);
          } else {
            el.call(this);
          }
          return;
        }
      });
    }
  }

  createSetting(...args) {
    this.oneCallBackFunction(args);
  }

  defaultCreate(type = '') {
    if (type === '') {
      this.router.navigate([
        `/dashboard/organizations/${this.activeModule.organizationId}/modules/${this.activeModule.id}/settings/${this.settingId}/new`
      ]);
    } else {
      this.router.navigate(
        [
          `/dashboard/organizations/${this.activeModule.organizationId}/modules/${this.activeModule.id}/settings/${this.settingId}/new`
        ],
        { queryParams: { type } }
      );
    }
  }

  navigateTo(...args) {
    this.oneCallBackFunction(args);
  }

  actionNavigate(args) {
    this.defaultAction('', args);
  }

  actionEdit(args) {
    this.defaultAction('/edit', args);
  }

  defaultAction(action, args) {
    if (args && args.length) {
      const id = args[0];
      if (id) {
        this.paginationService.setPaginatedResources(this.values);
        this.router.navigate([
          `/dashboard/organizations/${this.activeModule.organizationId}/modules/${this.activeModule.id}/settings/${this.settingId}/${id}${action}`
        ]);
      }
    }
  }
}
