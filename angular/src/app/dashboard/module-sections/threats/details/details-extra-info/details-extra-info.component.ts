import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewChild,
  OnDestroy
} from '@angular/core';
import { take, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { ToastrService } from 'ngx-toastr';
import * as FileSaver from 'file-saver';

import { HttpUtilsService, path, RequestOptions } from 'app/services/http-utils.service';
import { DetailExtraInfoService } from 'app/dashboard/module-sections/threats/details/details-extra-info/details-extra-info.service';
import { Grants } from 'app/services/grants/grants';
import { uniq } from 'lodash';
import { emailRegexp } from 'app/utils/validators';

@Component({
  selector: 'app-details-extra-info',
  templateUrl: './details-extra-info.component.html',
  styleUrls: ['./details-extra-info.component.scss']
})
export class DetailsExtraInfoComponent implements OnInit, OnDestroy {
  @ViewChild('buttonDropDownLanguage') buttonDropDownLanguage: ElementRef;
  @ViewChild('dropDownLanguage') dropDownLanguage: ElementRef;

  @Input() headerData = [];
  @Input() moduleId;
  @Input() organizationId;
  @Input() history = [];
  @Input()
  set moduleName(r) {
    this._moduleName = r;
  }
  @Input()
  set resource(val) {
    this._resource = val;
    this.followUp = this._resource.follow_up;

    if (this._resource) {
      this.getMoreInfo();
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
    this.doResourceArray();
  }
  get resource() {
    return this._resource;
  }

  @Output() selectEmitter = new EventEmitter<string>();

  isMenuViewMoreOpened = true;
  isMenuReportOpened = false;
  emailError = false;
  isMenuHistoryOpened = false;
  isMenuReportLanguagesOpened = false;
  isMetadataOpened = false;
  followUp = false;
  sources;
  _resource;
  retweet_info: any;
  metadata;
  metadataKey;
  metadataValue;
  language_report;
  moreInfoData;
  moreInfoSubscription: any;
  private _moduleName;

  get moduleName() {
    return this._moduleName;
  }

  private readonly destroy$ = new Subject<void>();

  constructor(
    private detailExtraInfoService: DetailExtraInfoService,
    private http: HttpUtilsService,
    private cd: ChangeDetectorRef,
    public grants: Grants,
    private toastrService: ToastrService
  ) {}

  @HostListener('document:click', ['$event'])
  onClick(event) {
    this.checkLanguageClickOutside(event.target);
  }

  ngOnInit() {
    if (this._resource.metadata) {
      this.metadata = this._resource.metadata;
      this.metadataKey = Object.keys(this.metadata);
      this.metadataValue = (Object as any).values(this.metadata);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  checkLanguageClickOutside(target) {
    if (
      this.buttonDropDownLanguage &&
      this.buttonDropDownLanguage.nativeElement &&
      this.dropDownLanguage &&
      this.dropDownLanguage.nativeElement
    ) {
      if (
        !this.buttonDropDownLanguage.nativeElement.contains(target) &&
        !this.dropDownLanguage.nativeElement.contains(target)
      ) {
        this.isMenuReportLanguagesOpened = false;
      }
    }
  }

  openNewTab(resourceId, version) {
    const requestOptions = new RequestOptions({});
    requestOptions.responseType = 'text';

    const page: any = window.open('');
    page.document.write('<div id="loading-state">Loading...</div>');
    this.http
      .get(
        `${path}/organization/${this.organizationId}/module/${this.moduleId}/resource/${resourceId}/version/${version}`,
        requestOptions
      )
      .pipe(takeUntil(this.destroy$), take(1))
      .subscribe(
        (html) => {
          page.document.getElementById('loading-state').style.display = 'none';
          page.document.write(html);
          page.history.pushState(
            null,
            'Blueliv',
            `/organization/${this.organizationId}/module/${this.moduleId}/resource/${resourceId}/version/${version}`
          );
        },
        (error) => {
          page.document.getElementById('loading-state').style.display = 'none';
          page.document.write('Error loading the page.');
        }
      );
  }

  getMoreInfo() {
    if (this.moreInfoSubscription) {
      this.moreInfoSubscription.unsubscribe();
    }
    if (this._moduleName && this._moduleName !== 'credential' && this._moduleName !== 'credit_card') {
      this.moreInfoSubscription = this.detailExtraInfoService
        .getMoreInfo(this.resource.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe((res) => {
          this.moreInfoData = res.map ? res.map : null;
        });
    }
  }

  toggleMenuViewMore() {
    this.isMenuViewMoreOpened = !this.isMenuViewMoreOpened;
    this.isMenuReportOpened = false;
    this.isMetadataOpened = false;
  }

  toggleMenuReport() {
    this.isMenuReportOpened = !this.isMenuReportOpened;
    this.isMetadataOpened = false;
    this.isMenuViewMoreOpened = false;
  }

  toggleReportLanguages() {
    this.isMenuReportLanguagesOpened = !this.isMenuReportLanguagesOpened;
  }

  toggleMenuMetadata() {
    this.isMetadataOpened = !this.isMetadataOpened;
    this.isMenuViewMoreOpened = false;
    this.isMenuReportOpened = false;
  }

  selectReportLenguage(language: string) {
    this.language_report = language.toString();
  }

  sendReport(email: string) {
    const emailToSend = email.toString().replace(' ', '');
    if (emailToSend.match(emailRegexp)) {
      this.detailExtraInfoService
        .sendReport(this._resource.id, emailToSend, this.language_report)
        .pipe(takeUntil(this.destroy$))
        .subscribe((success) => {
          if (success) {
            this.toastrService.success('Report Sent');
          }
        });

      this.language_report = '';
    }
  }

  downloadReport() {
    const title = this._resource.id;
    this.detailExtraInfoService
      .downloadReport(this._resource.id, this.language_report)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res) => {
          const blob = new Blob([res], {
            type: 'application/octet-stream'
          });
          FileSaver.saveAs(blob, `${title}.docx`);
        },
        (e) => {
          console.error('error', e);
        }
      );
  }

  doResourceArray() {
    if (this.resource.credit_cards) {
      this.sources = this._resource.credit_cards.map((element) => {
        return element.source;
      });
      this.sources = uniq(this.sources);
    }
  }

  changeFollowUp() {
    this.detailExtraInfoService
      .changeFollowUp(this._resource.id, !this.followUp)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        () => {
          this.toastrService.success('Follow up for this resource has been updated', 'Success');
          this.followUp = !this.followUp;
        },
        (error) => {
          const message =
            error === 'error.max_followed_up_resources'
              ? 'You have reached the maximum followed up resources allowed.'
              : 'An error ocurred. Try again later or contact your administrator.';
          this.toastrService.error(message, 'Error');
        }
      );
  }

  checkValue(value) {
    this.emailError = !value.match(emailRegexp);
  }
}
