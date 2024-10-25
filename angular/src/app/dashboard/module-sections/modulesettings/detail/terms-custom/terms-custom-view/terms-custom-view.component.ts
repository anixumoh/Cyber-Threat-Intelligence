import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { of, Subscription, Observable, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';

import { OrganizationService } from 'app/dashboard/organization/organization.service';
import { ModuleSettingsDetailService } from 'app/dashboard/module-sections/modulesettings/detail/module-settings-detail.service';
import { PaginationService } from 'app/dashboard/module-sections/shared/filters/pagination/pagination.service';
import { getHumanReadableDate } from 'app/utils/functions';
import * as _ from 'lodash';
import { Grants } from 'app/services/grants/grants';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'terms-custom-view',
  templateUrl: './terms-custom-view.component.html',
  styleUrls: ['./terms-custom-view.component.scss'],
})
export class TermsCustomViewComponent implements OnInit, OnDestroy {
  @Input()
  set settingId(its) {
    this._settingId = its;
  }
  @Input()
  set resourceId(its) {
    this._resourceId = its;
  }

  currentPage: number;
  resource: any;
  activeOrganization: any;
  activeModule: any;
  _settingId: any;
  _resourceId: any;
  subscriptionList: Subscription[];
  paginatedResourcesIds: Array<any>;
  showNavigation = true;
  showNext = true;
  showPrev = true;
  downloadedImage: any;
  loadDataStream: any;
  plugins: any;
  headerData = [
    [{ name: 'Image', value: 'downloadedImage', isAvatar: true }],
    [
      { name: 'Search Phrase', value: 'searchPhrase' },
      { name: 'Created At', value: 'createdAt' },
      { name: 'News', value: 'searchEngines', isBoolean: true },
      { name: 'Real time Twitter feed', value: 'searchTwitter', isBoolean: true },
    ],
  ];
  private readonly destroy$ = new Subject<void>();

  get settingId() {
    return this._settingId;
  }

  get resourceId() {
    return this._resourceId;
  }

  constructor(
    private organizationService: OrganizationService,
    private settings: ModuleSettingsDetailService,
    private router: Router,
    private paginationService: PaginationService,
    private sanitizer: DomSanitizer,
    public grants: Grants,
    private toastrService: ToastrService
  ) {
    this.subscriptionList = [];
  }

  ngOnInit() {
    this.organizationService
      .getCurrentContext()
      .pipe(takeUntil(this.destroy$))
      .subscribe((context) => {
        if (context.currentModule && context.currentOrganization) {
          this.activeModule = context.currentModule;
          this.activeOrganization = context.currentOrganization;
        }
      });

    this.paginationService.paginatedResources$.pipe(takeUntil(this.destroy$)).subscribe((items) => {
      this.paginatedResourcesIds = items.map((item) => item.id);
    });

    this.settings
      .getAvailableCrawlers(this.settingId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.plugins = res;
        this.localContext(false, false);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscriptionList.forEach((s) => {
      if (s) {
        s.unsubscribe();
      }
    });
  }

  loadData(): Observable<any> {
    if (this.settingId && this.resourceId && this.activeModule && this.activeOrganization) {
      return this.settings.getSettingsDataView(this.settingId, this.resourceId);
    } else {
      return of(null);
    }
  }

  loadImage(): Observable<any> {
    if (
      this.settingId &&
      this.resourceId &&
      this.activeModule &&
      this.activeOrganization &&
      this.resource.searchImageFilename
    ) {
      return this.settings.getSettingsDataViewImage(this.resourceId);
    } else {
      return of(null);
    }
  }

  setData(resource) {
    this.resource = resource;
    this.setHeader(resource);
    this.setContent();
  }

  setHeader(resource) {
    this.resource.header = {
      searchPhrase: resource.searchPhrase ? resource.searchPhrase : '',
      searchEngines: resource.searchEngines,
      searchTwitter: resource.searchTwitter,
      searchFacebook: resource.searchFacebook,
      createdAt: getHumanReadableDate(resource.createdAt),
      downloadedImage: '',
    };
  }

  setHeaderImage() {
    this.resource.header.downloadedImage = this.downloadedImage;
  }

  setContent() {
    this.resource.content = {};
    this.resource['content'].value = this.plugins.map((element) => {
      const elementToReturn = this.resource.configured.find((activeElement, index) => {
        return activeElement.pluginId === element.name && activeElement.enabled;
      });
      return elementToReturn
        ? { name: elementToReturn.pluginId, enabled: true, analysis: elementToReturn.visionSchedExpression }
        : { name: element.name, enabled: false, analysis: element.visionSchedExpression };
    });
    this.resource['content'].title = 'Crawlers';
    this.resource['content'].tableHeader = this.grants.isSuperAdmin
      ? ['Crawler', 'Enabled', 'Analysis Scheduling Expression']
      : ['Crawler', 'Enabled'];
  }

  navigateToList() {
    this.paginationService.stopper = true;
    this.router.navigate([
      `/dashboard/organizations/${this.activeModule.organizationId}/modules/${this.activeModule.id}/settings/${this.settingId}`,
    ]);
  }

  navigateToEdit() {
    this.router.navigate([
      `/dashboard/organizations/${this.activeModule.organizationId}/modules/${this.activeModule.id}/settings/${this.settingId}/${this.resourceId}/edit`,
    ]);
  }

  navigateDetails(direction) {
    this.showNavigation = false;
    const ids = this.paginatedResourcesIds;
    const index = _.indexOf(ids, +this.resourceId);
    this.showNext = true;
    this.showPrev = true;
    if (direction === 'previous') {
      this.resourceId = ids[index - 1];
      if (index <= 1) {
        this.showPrev = false;
      }
    } else if (direction === 'next') {
      this.resourceId = ids[index + 1];
      if (ids.length - 2 <= index) {
        this.showNext = false;
      }
    }

    if (this.resourceId === undefined) {
      this.router.navigate([
        `/dashboard/organizations/${this.activeModule.organizationId}/modules/${this.activeModule.id}/settings/${this.settingId}`,
      ]);
    } else {
      const sub = this.localContext(true, true);
      this.subscriptionList.push(sub);
    }
  }

  localContext(navigate, ret) {
    if (this.loadDataStream) {
      this.loadDataStream.unsubscribe();
    }
    this.loadDataStream = this.loadData()
      .pipe(
        switchMap((resource) => {
          this.setPrevNextOnLoad();
          this.setData(resource);
          if (navigate) {
            this.router.navigate([
              `/dashboard/organizations/${this.activeModule.organizationId}/modules/${this.activeModule.id}/settings/${this.settingId}/${this.resourceId}`,
            ]);
            this.showNavigation = true;
          }
          return this.loadImage();
        })
      )
      .subscribe((imageFile) => {
        if (imageFile) {
          const imageType = imageFile.type;
          const reader = new FileReader();
          reader.readAsBinaryString(imageFile);
          reader.onload = () => {
            this.downloadedImage = this.sanitizer.bypassSecurityTrustResourceUrl(
              `data:${imageType};base64,${btoa(reader.result as string)}`
            );
            this.setHeaderImage();
          };
        }
      });
    if (ret) {
      return this.loadDataStream;
    }
  }

  runSearch() {
    this.settings
      .runSearch(this.resourceId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        () => {
          this.toastrService.success('You can now check the Jobs section in Admin to see the progress.', 'Success');
        },
        () => {
          this.toastrService.error(
            'Something went wrong. Please try again and make sure both the organization and the module are enabled.',
            'Error'
          );
        }
      );
  }

  protected setPrevNextOnLoad() {
    const ids = this.paginatedResourcesIds;
    if (ids.length > 0 && ids[0] !== undefined) {
      const index = _.indexOf(ids, +this.resourceId);
      if (ids.length - 1 === index) {
        this.showNext = false;
        this.showPrev = true;
      } else if (index <= 0) {
        this.showPrev = false;
        this.showNext = true;
      } else {
        this.showNext = true;
        this.showPrev = true;
      }
    }
  }
}
