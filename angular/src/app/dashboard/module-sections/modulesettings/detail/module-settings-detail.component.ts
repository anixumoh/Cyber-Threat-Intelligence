import { OnInit, Component, OnDestroy, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of as observableOf, Observable, Subject, Subscription } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import * as _ from 'lodash';

import { ModuleSettingsDetailService } from './module-settings-detail.service';
import { EmailComponent } from 'app/dashboard/module-sections/modulesettings/detail/email/email.component';
import { OrganizationService } from 'app/dashboard/organization/organization.service';
import { ModuleModel, OrganizationModel } from 'app/dashboard/organization/models';
import { DomainComponent } from 'app/dashboard/module-sections/modulesettings/detail/domain/domain.component';
import { IpComponent } from 'app/dashboard/module-sections/modulesettings/detail/ip/ip.component';
import { AlertComponent } from 'app/dashboard/module-sections/modulesettings/detail/alert/alert.component';
import { KeywordsComponent } from 'app/dashboard/module-sections/modulesettings/detail/keywords/keywords.component';
import { FilenameComponent } from 'app/dashboard/module-sections/modulesettings/detail/filename/filename.component';
import { ConfidentialComponent } from 'app/dashboard/module-sections/modulesettings/detail/confidential/confidential.component';
import { FileExtensionComponent } from 'app/dashboard/module-sections/modulesettings/detail/file_extension/file_extension.component';
import { TyposquattingComponent } from 'app/dashboard/module-sections/modulesettings/detail/typosquatting/typosquatting.component';
import { TyposquattingKeywordComponent } from 'app/dashboard/module-sections/modulesettings/detail/typosquatting-keyword/typosquatting-keyword.component';
import { TyposquattingDistanceComponent } from 'app/dashboard/module-sections/modulesettings/detail/typosquatting-distance/typosquatting-distance.component';
import { TermsComponent } from 'app/dashboard/module-sections/modulesettings/detail/terms/terms.component';
import { BankComponent } from 'app/dashboard/module-sections/modulesettings/detail/bank/bank.component';
import { CreditCardComponent } from 'app/dashboard/module-sections/modulesettings/detail/credit-card/credit-card.component';
import { FeedsComponent } from 'app/dashboard/module-sections/modulesettings/detail/feeds/feeds.component';
import { ClassifyComponent } from 'app/dashboard/module-sections/modulesettings/detail/classify/classify.component';
import { TwitterUsersComponent } from 'app/dashboard/module-sections/modulesettings/detail/twitter-users/twitter-users.component';
import { HacktivismRssComponent } from 'app/dashboard/module-sections/modulesettings/detail/hacktivism-rss/hacktivism-rss.component';
import { TechProductComponent } from 'app/dashboard/module-sections/modulesettings/detail/tech-product/tech-product.component';
import { PaginationService } from 'app/dashboard/module-sections/shared/filters/pagination/pagination.service';
import { TermsBrandAbuseComponent } from 'app/dashboard/module-sections/modulesettings/detail/terms-brand-abuse/terms-brand-abuse.component';
import { FiltersSettingsComponent } from 'app/dashboard/module-sections/modulesettings/detail/filters-settings/filters-settings.component';
import { RssBrandAbuseComponent } from 'app/dashboard/module-sections/modulesettings/detail/rss-brand-abuse/rss-brand-abuse.component';
import { ModuleSettingsService } from 'app/dashboard/module-sections/modulesettings/module-settings.service';
import { MarketplacesComponent } from 'app/dashboard/module-sections/modulesettings/detail/marketplaces/marketplaces.component';
import { isEmpty } from 'app/utils/functions';
import { TermsCustomComponent } from 'app/dashboard/module-sections/modulesettings/detail/terms-custom/terms-custom.component';
import { RssCategoriesComponent } from 'app/dashboard/module-sections/modulesettings/detail/rss-categories/rss-categories.component';
import { Store } from 'app/services/store/store';
const { clone } = _;

@Component({
  selector: 'app-module-settings-detail',
  templateUrl: './module-settings-detail.component.html',
  styleUrls: ['./module-settings-detail.component.scss']
})
export class ModuleSettingsDetailComponent implements OnInit, OnDestroy {
  currentPage: number;
  maxRows: number;
  componentData: any;
  activeModule: ModuleModel;
  activeOrganization: OrganizationModel;
  currentSubscription: Subscription;
  isOpen = false;
  modalMessage = 'Module Created';
  modalTitle = 'Welcome to this new module';

  @Input() id: string;

  private details;
  private settingId;
  private original_values;
  private types_to_components;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private settings: ModuleSettingsDetailService,
    private organizationService: OrganizationService,
    private paginationService: PaginationService,
    protected store: Store,
    private moduleSettings: ModuleSettingsService
  ) {
    this.types_to_components = {
      email: EmailComponent,
      domain: DomainComponent,
      ip: IpComponent,
      alert: AlertComponent,
      keyword: KeywordsComponent,
      filename: FilenameComponent,
      confidential: ConfidentialComponent,
      file_extension: FileExtensionComponent,
      extra_categories: RssCategoriesComponent,
      typosquatting: TyposquattingComponent,
      typo_keyword_regex: TyposquattingKeywordComponent,
      typo_keyword_distance: TyposquattingDistanceComponent,
      terms: TermsComponent,
      bank: BankComponent,
      credit_card: CreditCardComponent,
      booleans: FeedsComponent,
      classification: ClassifyComponent,
      twitter_profile: TwitterUsersComponent,
      RSS: HacktivismRssComponent,
      tech_product: TechProductComponent,
      terms_brand_abuse: TermsBrandAbuseComponent,
      terms_custom: TermsCustomComponent,
      filters_settings: FiltersSettingsComponent,
      rss_brand_abuse: RssBrandAbuseComponent,
      marketplaces: MarketplacesComponent
    };

    this.settings.searchTerm = '';
    this.activatedRoute.params.subscribe((params) => {
      this.moduleSettings.setActualSetting(params);
    });
  }

  ngOnInit() {
    this.activatedRoute.params
      .pipe(
        switchMap((params) => {
          // this.settingId = params['id'];
          this.settingId = this.id;

          this.paginationService.stopper = false;

          return this.organizationService.getCurrentContext();
        }),
        switchMap((context: any) => {
          if (context.currentModule && context.currentOrganization) {
            this.activeModule = context.currentModule;
            this.activeOrganization = context.currentOrganization;
          }
          return this.store.select('userStateList');
        }),
        switchMap((state: any) => {
          const defaultRows = state?.defaultRows ?? 10;
          this.paginationService.setDefaultRows(defaultRows);
          return this.paginationService.pagination$;
        }),
        switchMap((paginationObject: any) => {
          this.maxRows = paginationObject.selectedItem.value;
          this.currentPage = paginationObject.pageState.currentPage;
          if (!isEmpty(this.activeModule) && this.activeOrganization && this.settingId) {
            return this.initContext();
          } else {
            return observableOf(null);
          }
        })
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.setValues(data);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initContext(): Observable<any> {
    if (typeof this.settingId === 'undefined') {
      return observableOf(null);
    }
    return this.settings.getSettingsData(this.settingId, this.currentPage, this.maxRows);
  }

  setValues(data) {
    if (typeof data === 'undefined') {
      return;
    }

    this.details = data;
    this.original_values = clone(data.values);
    this.componentData = {
      component: this.types_to_components[data.view_type],
      inputs: {
        data,
        activeModule: this.activeModule,
        settingId: this.settingId
      }
    };

    if (
      data.view_type === 'terms' &&
      this.activeModule.moduleName !== 'social_media' &&
      this.activeModule.moduleName !== 'custom'
    ) {
      this.componentData.hidden = true;
    }
  }

  update() {
    this.settings
      .saveSettingsData(this.settingId, this.details)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {});
  }

  cancel() {
    this.details.values = clone(this.original_values);
  }

  closeModal() {
    this.isOpen = false;
    this.organizationService.resetCreateModuleMessageSubjectToFalse();
  }
}
