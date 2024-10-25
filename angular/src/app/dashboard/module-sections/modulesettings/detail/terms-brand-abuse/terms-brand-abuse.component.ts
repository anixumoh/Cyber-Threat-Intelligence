import { Component, Injector, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
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
  selector: 'terms-brand-abuse',
  templateUrl: './terms-brand-abuse.component.html',
  styleUrls: ['./terms-brand-abuse.component.scss']
})
export class TermsBrandAbuseComponent extends SettingDetailBrandAbuseAbstract implements OnInit, OnDestroy {
  totalResources: number;
  tableHeader = [
    { value: 'Topic' },
    { value: 'Search Word' },
    { value: 'Edit', class: 'text-center th-70' },
    { value: 'Delete', class: 'text-center th-70' }
  ];

  tableHeaderCustomer = [
    { value: 'Topic' },
    { value: 'Search Word' },
    { value: '', class: 'text-center th-70' },
    { value: '', class: 'text-center th-70' }
  ];

  termToDeleteId;
  termToDeleteIndex;
  termToDeleteType;
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

  searchPhraseCreate(type = 'phrase') {
    this.defaultCreate(type);
  }

  imageCreate(type = 'image') {
    this.defaultCreate(type);
  }

  actionNavigate(args) {
    this.defaultAction('', args);
  }

  defaultAction(action, args) {
    if (args && args.length) {
      const id = args[0];
      if (id) {
        const isImage = args[1];
        if (isImage) {
          const values = this.values.filter((value) => {
            return value.isImage;
          });
          this.paginationService.setPaginatedResources(values);
          this.router.navigate(
            [
              `/dashboard/organizations/${this.activeModule.organizationId}/modules/${this.activeModule.id}/settings/${this.settingId}/${id}${action}`
            ],
            { queryParams: { type: 'image' } }
          );
        } else {
          this.router.navigate([
            `/dashboard/organizations/${this.activeModule.organizationId}/modules/${this.activeModule.id}/settings/${this.settingId}/${id}`
          ]);
        }
      }
    }
  }

  setValues() {
    this.totalResources = this.data.totalResources;
    this.values = [];
    if (this.data.values) {
      this.data.values.forEach((element) => {
        this.values.push({
          id: element.id,
          name: element.searchPhrase,
          termType: element.termType,
          isImage: element.crawler ? false : true,
          values: [
            {
              value: element.reputationalSearchTopicName ? element.reputationalSearchTopicName : 'Default',
              elementClass: 'mb-0'
            },
            {
              value: element.searchPhrase ? element.searchPhrase : '',
              elementClass: 'mb-0'
            },
            {
              edit: true,
              iconClass: element.searchImageContentType ? 'icon-pencil-square' : '',
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

  openConfirmationModal(id, index, type) {
    this.termToDeleteId = id;
    this.termToDeleteIndex = index;
    this.termToDeleteType = type;
    this.deleteConfirmation = true;
  }

  closeConfirmation() {
    this.termToDeleteId = null;
    this.termToDeleteIndex = null;
    this.deleteConfirmation = false;
  }
}
