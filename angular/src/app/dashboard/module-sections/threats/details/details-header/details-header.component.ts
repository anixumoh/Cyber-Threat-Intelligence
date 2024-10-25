import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import * as _ from 'lodash';

import { DetailHeaderService } from 'app/dashboard/module-sections/threats/details/details-header/details-header.service';
import { getHumanReadableDate, getLanguageFromId } from 'app/utils/functions';
import { HttpUtilsService } from 'app/services/http-utils.service';
import { OrganizationService } from '../../../../organization/organization.service';
import { TcxLinkeableService } from '../../../../../shared/components/tcx-linkeable/tcx-linkeable.service';

const DETAILS_DATES = {
  created_at: 'CREATED AT',
  updated_at: 'UPDATED AT',
  checked_at: 'CHECKED AT',
  changed_at: 'CHANGED AT',
  uploaded_at: 'UPLOADED AT',
  date: 'DATE'
};

@Component({
  selector: 'details-header',
  templateUrl: './details-header.component.html',
  styleUrls: ['./details-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetailsHeaderComponent implements OnInit, OnDestroy {
  @Input()
  set headerData(its) {
    if (its && its.length) {
      this._headerData = its;
      this.numColumns = `col-${12 / this._headerData.length}`;
    }
  }
  @Input()
  set moduleName(r) {
    this._moduleName = r;
  }
  @Input() labelProperty: string | any = null;
  @Input()
  set resource(val) {
    if (val) {
      this._resource = val;
      if (this._resource.search_words && this._resource.search_words.length === 0) {
        this._resource.search_words = '---';
      }
      if (this._resource.language_id) {
        this._resource.language_id =
          this._resource.languages.length && this._resource.language_id
            ? getLanguageFromId(this._resource.language_id, this._resource.languages) || ''
            : '';
      }
      if (this._resource.domain_type) {
        this._resource.domain_type = this._resource.domain_type.replace('_', ' ').replace(/\w\S*/g, (txt) => {
          return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
      }
      if (this._resource.retweet_info) {
        if (this._resource.retweet_info[0]) {
          this.retweet_info = this._resource.retweet_info[0];
          this.retweet_info.total_retweets = this._resource.total_retweets;
        }
      }
      if (!this.cd.detectChanges['destroyed']) {
        this.cd.detectChanges();
      }
    }
  }
  @Output() detailHeaderEmit = new EventEmitter();

  loadingDownload = false;
  canRiseTcxLinkeableModal = false;
  showModal = false;
  modalType = '';
  typesDictionary = {
    GENERIC: 'Botnet',
    BOTNET_CREDENTIALS: 'Botnet',
    HACKTIVISM_CREDENTIALS: 'Hacktivism',
    BOTIP: 'BotIp'
  };
  file: any;
  _HeaderSearch: any;
  fileSelected = false;
  isMenuChangeLanguageOpened = false;
  isMenuViewMoreOpened = false;
  isMenuReportOpened = false;
  isMenuReportLanguagesOpened = false;
  isMetadataOpened = false;
  isViewMorePhishingOpened = false;
  _createdAt;
  _moreInfoHacktivism;
  _moreInfoDataLeakage;
  _dateDataLeakage;
  _imageDataLeakage;
  _descriptionDataLeakage;
  _userDataLeakage;
  _moduleName;
  sources;
  sendMessage: string = null;
  _resource;
  retweet_info: any;
  _htmlContent: string;
  metadata;
  metadataKey;
  metadataValue;
  language_report;
  all_languages;
  _moreInfo;
  _headerData = [];
  numColumns = 'col-12';
  header_dates = DETAILS_DATES;
  notNormalItems = [
    'labels',
    'url',
    'credit_cards',
    'title',
    'file',
    'user_rating',
    'analysis_calc_result',
    'language_id',
    'severity',
    'resource_type',
    'sources'
  ];
  notNormalSpecialItems = ['isDate'];
  private id: string;
  private readonly destroy$ = new Subject<void>();

  get headerData() {
    return this._headerData;
  }

  get moduleName() {
    return this._moduleName;
  }

  get resource() {
    return this._resource;
  }

  constructor(
    private httpUtils: HttpUtilsService,
    private detailHeaderService: DetailHeaderService,
    private cd: ChangeDetectorRef,
    private route: ActivatedRoute,
    private organizationService: OrganizationService,
    public tcxLinkeableService: TcxLinkeableService
  ) {
    this.id = this.route.snapshot.paramMap.get('id');
  }

  ngOnInit() {
    this.detailHeaderService
      .getlanguagesList()
      .pipe(takeUntil(this.destroy$))
      .subscribe((languagesll) => {
        this.all_languages = languagesll;
      });
    // checking if exist more info
    if (
      this._moduleName === 'hacktivism' ||
      this._moduleName === 'data_leakage' ||
      this._moduleName === 'media_tracker' ||
      this._moduleName === 'dark_web' ||
      this._moduleName === 'mobile_apps'
    ) {
      this.detailHeaderService
        .getMoreInfo(this.resource.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe((res) => {
          if (res.map) {
            if (this.moduleName === 'hacktivism' && res.map.PublishedAt) {
              this._moreInfoHacktivism = res.map;
              this._createdAt = getHumanReadableDate(this._moreInfoHacktivism.PublishedAt[0].value);
              if (!this.cd.detectChanges['destroyed']) {
                this.cd.markForCheck();
              }
            }
            if (this.moduleName === 'data_leakage' && res.map.Excerpt) {
              this._moreInfoDataLeakage = res.map;
              this._dateDataLeakage = this._moreInfoDataLeakage.Date
                ? this._moreInfoDataLeakage.Date[0].value.toString()
                : null;
              this._imageDataLeakage = this._moreInfoDataLeakage.Image
                ? this._moreInfoDataLeakage.Image[0].value
                : null;
              this._descriptionDataLeakage = this._moreInfoDataLeakage.Excerpt
                ? this._moreInfoDataLeakage.Excerpt[0].value
                : null;
              if (!this.cd.detectChanges['destroyed']) {
                this.cd.markForCheck();
              }
            }
            if (this.moduleName === 'data_leakage' && res.map.Image) {
              this._moreInfoDataLeakage = res.map;
              this._dateDataLeakage = this._moreInfoDataLeakage.Date
                ? this._moreInfoDataLeakage.Date[0].value.toString()
                : null;
              this._imageDataLeakage = this._moreInfoDataLeakage.Image
                ? this._moreInfoDataLeakage.Image[0].value
                : null;
              this._userDataLeakage = this._moreInfoDataLeakage.Username
                ? this._moreInfoDataLeakage.Username[0].value.toString()
                : null;
              this._descriptionDataLeakage = this._moreInfoDataLeakage.Description
                ? this._moreInfoDataLeakage.Description[0].value.toString()
                : null;
              if (!this.cd.detectChanges['destroyed']) {
                this.cd.markForCheck();
              }
            }
            if (this.moduleName === 'domain_protection') {
              this._moreInfo = res.map;
              if (this._moreInfo.hasOwnProperty('Html Content')) {
                if (this._moreInfo['Html Content'][0].value) {
                  this._htmlContent = res.map['Html Content'][0].value;
                  if (!this.cd.detectChanges['destroyed']) {
                    this.cd.markForCheck();
                  }
                }
              }
            }
          }
        });
      if (this._resource.metadata) {
        this.metadata = this._resource.metadata;
        this.metadataKey = Object.keys(this.metadata);
        this.metadataValue = (Object as any).values(this.metadata);
      }
    }

    this.organizationService
      .getCurrentModules()
      .pipe(takeUntil(this.destroy$), take(1))
      .subscribe((modules) => {
        const threatContextModule = modules.find((item) => item.type === 'THREAT_CONTEXT');
        if (
          this.resource &&
          this.resource.module_type &&
          (this.resource.module_type.startsWith('CREDIT_CARDS') || this.resource.module_type === 'CREDENTIALS') &&
          !threatContextModule
        ) {
          this.canRiseTcxLinkeableModal = true;
          if (!this.cd.detectChanges['destroyed']) {
            this.cd.detectChanges();
          }
        }
      });

    this.tcxLinkeableService.showModal.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      this.showModal = value.show;
      this.modalType = value.type;
      if (!this.cd.detectChanges['destroyed']) {
        this.cd.detectChanges();
      }
    });
  }

  ngOnDestroy() {
    this.closeModal();
    this.destroy$.next();
    this.destroy$.complete();
  }

  closeModal() {
    this.tcxLinkeableService.showModal.next({ show: false, type: '' });
  }

  isResourceValue(value) {
    return this.resource[value] !== undefined;
  }

  toggleMenuViewMore() {
    this.isMenuReportOpened = false;
    if (this._moduleName === 'hacktivism') {
      this.isMenuViewMoreOpened = !this.isMenuViewMoreOpened;
      this.isViewMorePhishingOpened = false;
    } else if (this._moduleName === 'domain_protection') {
      this.isViewMorePhishingOpened = !this.isViewMorePhishingOpened;
      this.isMenuViewMoreOpened = false;
    }
    this.isMenuChangeLanguageOpened = false;
    this.isMetadataOpened = false;
  }

  toggleMenuReport() {
    this.isMenuReportOpened = !this.isMenuReportOpened;
    this.isMenuViewMoreOpened = false;
    this.isViewMorePhishingOpened = false;
    this.isMenuChangeLanguageOpened = false;
    this.isMetadataOpened = false;
  }

  toggleReportLanguages() {
    this.isMenuReportLanguagesOpened = !this.isMenuReportLanguagesOpened;
  }

  toggleChangeLanguage() {
    this.isMenuChangeLanguageOpened = !this.isMenuChangeLanguageOpened;
    this.isMenuReportOpened = false;
    this.isMenuViewMoreOpened = false;
    this.isMetadataOpened = false;
  }

  toggleMenuMetadata() {
    this.isMetadataOpened = !this.isMetadataOpened;
    this.isMenuReportOpened = false;
    this.isMenuViewMoreOpened = false;
    this.isMenuChangeLanguageOpened = false;
  }

  onChangeInform(res) {
    this.detailHeaderEmit.emit(res.loading);
    if (res.status) {
      this._resource.analysis_calc_result = res.status;
    }
  }

  onChangeRating(res) {
    this.detailHeaderEmit.emit(res.loading);
    if (res.value) {
      this._resource.user_rating = res.value;
    }
  }

  onChangeLanguage(res) {
    this.detailHeaderEmit.emit(res.loading);
    if (res.language) {
      this._resource.language_id = res.language.language;
    }
  }

  selectLanguage(generaLanguage) {
    this._resource.language_id = generaLanguage.language.toString();
    this.detailHeaderService.sendChangeLanguage(this._resource.id, generaLanguage.language_id);
  }

  selectReportLenguage(language: string) {
    this.language_report = language.toString();
  }

  sendReport(email: string) {
    const emailToSend = email.toString().replace(' ', '');
    this.detailHeaderService.sendReport(this._resource.id, emailToSend, this.language_report);
    this.sendMessage = 'Report Sent';
    setTimeout(() => {
      this.sendMessage = null;
      if (!this.cd.detectChanges['destroyed']) {
        this.cd.markForCheck();
      }
    }, 3000);
    this.language_report = '';
  }

  clickFile() {
    this.loadingDownload = true;
    this.detailHeaderService
      .downloadOriginal(this._resource.id, this._resource.content_type)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        if (this._resource.content_type.substr(0, 4) === 'text') {
          this._resource.content_type = 'text/html';
        }
        this.httpUtils.downloadFile(data, this._resource.content_type);
        this.loadingDownload = false;
      });
  }

  downloadPCAP() {
    const url = this.detailHeaderService.returnUrlPCAP(+this.id);
    this.httpUtils
      .get(url)
      .pipe(takeUntil(this.destroy$), take(1))
      .subscribe((data) => {
        if (data) {
          open(data.url, '_blank');
        }
      });
  }

  isNormalItem(headerData: any) {
    const headerDataValueIsNotInTempArray = this.notNormalItems.findIndex((value) => headerData.value === value) === -1;
    const headerDataValueIsNotInSpecial = this.notNormalSpecialItems.findIndex((value) => headerData[value]) === -1;

    return this.resource[headerData.value] && headerDataValueIsNotInTempArray && headerDataValueIsNotInSpecial;
  }

  getDate(value) {
    return getHumanReadableDate(value);
  }
}
