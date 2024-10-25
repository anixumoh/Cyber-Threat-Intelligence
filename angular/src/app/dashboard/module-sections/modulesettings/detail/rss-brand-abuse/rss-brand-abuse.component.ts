import { Component, Injector, OnInit, ChangeDetectorRef } from '@angular/core';
import * as _ from 'lodash';
import { SettingDetailBrandAbuseAbstract } from 'app/dashboard/module-sections/modulesettings/detail/settings-detail-brand-abuse-abstract';
import { getHumanReadableDate, ellipseUrlNew } from 'app/utils/functions';
import { Grants } from 'app/services/grants/grants';
import { UsersService } from 'app/services/users.service';
import { ModuleSettingsDetailService } from 'app/dashboard/module-sections/modulesettings/detail/module-settings-detail.service';
import { Router } from '@angular/router';
import { TechProductService } from 'app/dashboard/module-sections/modulesettings/detail/tech-product/tech-product.service';
import { DragulaService } from 'ng2-dragula';
import { ClassifyService } from 'app/dashboard/module-sections/modulesettings/detail/classify/classify.service';
import { BankService } from 'app/dashboard/module-sections/modulesettings/detail/bank/bank.service';
import { FeedsService } from 'app/dashboard/module-sections/modulesettings/detail/feeds/feeds.service';
import { OrganizationService } from 'app/dashboard/organization/organization.service';
import { PaginationService } from 'app/dashboard/module-sections/shared/filters/pagination/pagination.service';
import { Store } from 'app/services/store/store';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'rss-brand-abuse',
  templateUrl: './rss-brand-abuse.component.html',
  styleUrls: ['./rss-brand-abuse.component.scss']
})
export class RssBrandAbuseComponent extends SettingDetailBrandAbuseAbstract implements OnInit {
  totalResources: number;
  public tableHeader = [
    { value: 'Name' },
    { value: 'Url' },
    { value: 'RSS type' },
    { value: 'Creation Date', class: 'text-center td-150' },
    { value: 'Processed', class: 'text-center th-70' },
    { value: 'Enabled', class: 'text-center th-70' },
    { value: 'Edit', class: 'text-center th-70' },
    { value: 'Delete', class: 'text-center th-70' }
  ];
  numberToSearch = {
    1: 'enabled'
  };

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

  setValues() {
    this.totalResources = this.data.totalResources;
    this.values = [];
    if (this.data.values) {
      this.data.values.forEach((element) => {
        this.values.push({
          id: element.id,
          values: [
            {
              value: element.name ? element.name : '',
              elementClass: 'mb-0'
            },
            {
              isUrl: true,
              urlShort: element.url ? ellipseUrlNew(element.url, 15) : '',
              url: element.url ? element.url : '',
              elementClass: 'mb-0'
            },
            {
              value: element.rssFeedTypeName ? element.rssFeedTypeName : '',
              elementClass: 'mb-0'
            },
            {
              value: getHumanReadableDate(element.createdAt),
              isDate: true,
              class: 'td-center',
              elementClass: 'mb-0'
            },
            {
              value: element.runAt ? element.runAt : '',
              class: 'td-center',
              elementClass: 'mb-0'
            },
            {
              isBoolean: true,
              booleanAttr: element.enabled,
              searchPlace: 1,
              class: 'td-center',
              elementClass: 'mb-0'
            },
            {
              edit: true,
              iconClass: 'icon-pencil-square',
              class: 'td-center',
              elementClass: 'mb-0'
            },
            {
              delete: true,
              iconClass: 'icon-delete',
              class: 'td-center',
              elementClass: 'mb-0'
            }
          ]
        });
      });
    }
  }
}
