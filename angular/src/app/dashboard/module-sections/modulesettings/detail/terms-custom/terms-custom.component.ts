import { Component, Injector, OnInit, ChangeDetectorRef } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import * as _ from 'lodash';
import { SettingDetailBrandAbuseAbstract } from 'app/dashboard/module-sections/modulesettings/detail/settings-detail-brand-abuse-abstract';
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
  selector: 'terms-custom',
  templateUrl: './terms-custom.component.html',
  styleUrls: ['./terms-custom.component.scss']
})
export class TermsCustomComponent extends SettingDetailBrandAbuseAbstract implements OnInit {
  totalResources: number;
  tableHeader = [
    { value: 'Topic' },
    { value: 'Search Word' },
    { value: 'News', class: 'text-center th-70' },
    { value: 'Twitter', class: 'text-center th-70' },
    { value: 'Edit', class: 'text-center th-70' },
    { value: 'Delete', class: 'text-center th-70' }
  ];

  tableHeaderCustomer = [
    { value: 'Topic' },
    { value: 'Search Word' },
    { value: 'News', class: 'text-center th-70' },
    { value: 'Twitter', class: 'text-center th-70' }
  ];

  numberToSearch = {
    2: 'searchEngines',
    3: 'searchTwitter',
    4: 'searchFacebook'
  };
  termToDeleteId;
  termToDeleteIndex;
  termToDeleteType;
  termToDeleteExtraField;
  searchTerm;

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
    this.searchTerm = this.settings.searchTerm;
  }

  setValues() {
    this.totalResources = this.data.totalResources;
    this.values = [];
    if (this.data.values) {
      this.data.values.forEach((element, index) => {
        this.values.push({
          id: element.id,
          name: element.searchPhrase,
          termType: element.termType,
          extraField: element.extraConfig,
          values:
            this.grants && this.grants.isCustomerOrOperator()
              ? [
                  {
                    value: element.reputationalSearchTopicName ? element.reputationalSearchTopicName : 'Default',
                    elementClass: 'mb-0'
                  },
                  {
                    value: element.searchPhrase ? element.searchPhrase : '',
                    elementClass: 'mb-0'
                  },
                  {
                    isBoolean: true,
                    booleanAttr: element.searchEngines,
                    searchPlace: 2,
                    class: 'td-center',
                    elementClass: 'mb-0'
                  },
                  {
                    isBoolean: true,
                    booleanAttr: element.searchTwitter,
                    searchPlace: 3,
                    class: 'vertical-middle td-center',
                    elementClass: 'mb-0'
                  }
                ]
              : [
                  {
                    value: element.reputationalSearchTopicName ? element.reputationalSearchTopicName : 'Default',
                    elementClass: 'mb-0'
                  },
                  {
                    value: element.searchPhrase ? element.searchPhrase : '',
                    elementClass: 'mb-0'
                  },
                  {
                    isBoolean: true,
                    booleanAttr: element.searchEngines,
                    searchPlace: 2,
                    class: 'td-center',
                    elementClass: 'mb-0'
                  },
                  {
                    isBoolean: true,
                    booleanAttr: element.searchTwitter,
                    searchPlace: 3,
                    class: 'vertical-middle td-center',
                    elementClass: 'mb-0'
                  },
                  {
                    edit: true,
                    iconClass: 'icon-pencil-square',
                    class: 'vertical-middle td-center',
                    elementClass: 'mb-0'
                  },
                  {
                    delete: true,
                    iconClass: 'icon-delete',
                    class: 'vertical-middle td-center',
                    elementClass: 'mb-0'
                  }
                ]
        });
      });
    }
  }

  openConfirmationModal(term, index, type) {
    this.termToDeleteId = term.name;
    this.termToDeleteExtraField = term.extraField;
    this.termToDeleteIndex = index;
    this.termToDeleteType = type;
    this.deleteConfirmation = true;
  }

  closeConfirmation() {
    this.termToDeleteId = null;
    this.termToDeleteIndex = null;
    this.deleteConfirmation = false;
  }

  searchTerms(term) {
    this.settings.searchTerm = term;

    setTimeout(() => {
      this.settings
        .getSettingsData(this.settingId, 1, this.maxRows)
        .pipe(takeUntil(this.destroy$))
        .subscribe((res) => {
          this.data.values = res.values;
          this.setValues();
          this.totalResources = res.totalResources;
        });
    }, 1500);
  }
}
