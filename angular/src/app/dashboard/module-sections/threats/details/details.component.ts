import { Component, ChangeDetectorRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, filter, take, takeUntil } from 'rxjs/operators';

import * as _ from 'lodash';
import { ToastrService } from 'ngx-toastr';

import { ResourcesService } from 'app/services/resources.service';
import { OrganizationService } from 'app/dashboard/organization/organization.service';
import { AbstractDetailComponent } from '../../abstract-detail/abstract-detail.component';
import { DetailsService } from './details.service';
import { headerData } from './details-data';

import { PaginationService } from 'app/dashboard/module-sections/shared/filters/pagination/pagination.service';
import { Store } from 'app/services/store/store';
import { Grants } from 'app/services/grants/grants';
import { ModalService } from 'app/dashboard/module-sections/shared/modal/modal.service';
import { ModalTakedownService } from '../../shared/table/table-tools/modal-takedown/modal-takedown.service';
import { CommentComponent } from '../../shared/table/table-tools/comments/comment.component';
import { ThreatDetailService } from 'app/services/threat-detail.service';
const { set } = _;

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'] // TODO: onPush
})
export class DetailsComponent extends AbstractDetailComponent implements OnInit, OnDestroy {
  markdown: any;
  screenshot: string = 'assets/default_images/noimageavailable.svg';
  resourceDarkWeb: any;
  resourceUrl_hash: any;
  resource: any;
  resourceId: any;
  markedAsUnread = false;
  isPreviewOpened = false;
  isAddIncidentModalOpen = false;
  labels;
  allLabels;
  headerData;
  commentsNum: number;
  eraseComments = false;
  getComments = true;
  showTakedown = false;
  comments = [];
  currentPage: number;
  textSearched: string;
  focused: number;
  paginatedResourcesIds: any[];
  showNavigation = true;
  showNext: boolean;
  showPrev: boolean;
  isLoading = true;
  screenShotSelected = false;
  isDeleteConfirmationOpened = false;
  isBlockConfirmationOpened = false;
  isBlockAllConfirmationOpened = false;
  resources: any;
  error: string;
  isViewIncidentModalOpen = false;
  isTakeDownAvailable = false;
  showFollowUpBtn = false;
  languages = [];
  deleteOptionsModal = false;

  @ViewChild('detailComments') detailComments: CommentComponent;

  constructor(
    protected resourcesService: ResourcesService,
    protected route: ActivatedRoute,
    organizationService: OrganizationService,
    protected router: Router,
    protected detailsService: DetailsService,
    protected paginationService: PaginationService,
    cd: ChangeDetectorRef,
    protected store: Store,
    public grants: Grants,
    protected modalService: ModalService,
    protected modalTakedownService: ModalTakedownService,
    private toastrService: ToastrService,
    private threatDetailService: ThreatDetailService
  ) {
    super(organizationService, cd);
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  ngOnInit() {
    super.ngOnInit();

    this.showFollowUpBtn = this.checkIfShowFollowUpBtn();
    this.closeModalSubject();
    this.updateResourceSubject();
    this.setLabels();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.cd.detach();
    this.isResources(() => {
      this.store.update('resourcesList', 'resetResources', []);
    });
  }

  checkIfShowFollowUpBtn() {
    switch (this.activeModule.moduleName) {
      case 'custom':
        return true;
      case 'mobile_apps':
        return true;
      case 'domain_protection':
        return true;
      case 'dark_web':
        return true;
      case 'data_leakage':
        return location.hostname === 'tcallzgroup.blueliv.com' || location.hostname === 'tcpre-production.blueliv.com';
      case 'hacktivism':
        return location.hostname === 'tcallzgroup.blueliv.com' || location.hostname === 'tcpre-production.blueliv.com';
      default:
        return false;
    }
  }

  closeModalSubject() {
    this.modalService
      .getCloseTheModal()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        if (data.value === true) {
          this.isViewIncidentModalOpen = false;
          this.isAddIncidentModalOpen = true;
          this.modalService.setCloseTheModal(false, null);
        }
      });
  }

  updateResourceSubject() {
    this.detailsService
      .getUpdateResourceSubject()
      .pipe(filter(Boolean), takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (this.resource) {
          this.resource.issued = res.delete && res.length === 0 ? false : true;
        }
      });
  }

  isResources(cb, cbelse = null) {
    if (this.resources && this.resource.length > 0) {
      cb();
    } else if (cbelse) {
      cbelse();
    }
  }

  isResource(cb, cbelse = null) {
    if (this.resource) {
      cb();
    } else if (cbelse) {
      cbelse();
    }
  }

  setStoreListener(cb) {
    this.store
      .select('resourcesList')
      .pipe(takeUntil(this.destroy$))
      .subscribe((resources: any) => {
        if (resources && resources.list && resources.list.length > 0 && this.resource) {
          cb(resources);
        }
      });
  }

  setLabels() {
    this.setStoreListener((resources) => {
      this.resources = resources;
      const resource = resources.list.find((r) => {
        return r.checkbox;
      });
      if (resource) {
        this.setLabelsResource(resource);
      }
    });
  }

  setLabelsResource(resource) {
    this.resource.labels = resource.labels;
    this.resource = JSON.parse(JSON.stringify(this.resource));
    if (!this.cd.detectChanges['destroyed']) {
      this.cd.detectChanges();
    }
  }

  handleFollowUp() {
    if (this.checkIfShowFollowUpBtn()) {
      const data = {
        orgId: this.activeOrganization.id,
        moduleId: this.activeModule.id,
        resourceId: this.resource.id
      };
      this.resourcesService
        .handleFollowUp(data)
        .pipe(take(1), takeUntil(this.destroy$))
        .subscribe(
          () => {
            this.resource.followedUp = !this.resource.followedUp;
            this.toastrService.success('Follow up for this resource has been updated', 'Success');
          },
          (e) => {
            if (e.type === 'warning') {
              this.toastrService.warning(e.message, 'Warning');
            } else if (e.type === 'error') {
              this.toastrService.error(e.message, 'Error');
            }
          }
        );
    }
  }

  navigateDetails(direction: 'previous' | 'next') {
    const itemsId = this.threatDetailService.details?.resources;

    if (!itemsId?.length) return;

    const index = _.indexOf(itemsId, this.resource.id);
    const isTheLastItem = index === itemsId.length - 1;
    const isTheFirstItem = index === 0;

    const nextPage = direction === 'next' && isTheLastItem;
    const previousPage = direction === 'previous' && isTheFirstItem;

    if (nextPage || previousPage) {
      this.isLoading = true;
      this.threatDetailService.details.page += nextPage ? 1 : -1;
      this.resourcesService
        .getResourceForDetails(this.threatDetailService.details)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data) => {
          this.isLoading = false;
          let targetResourceId: number;
          if (data?.list?.length) {
            const idx = nextPage ? 0 : data.list.length - 1;
            targetResourceId = data.list[idx].id;
            this.threatDetailService.details.lastPage = Math.ceil(
              data.total_resources / this.threatDetailService.details.maxRows
            );
            this.threatDetailService.details.resources = data.list.map((r: any) => r.id);
            this.threatDetailService.details.resourceId = targetResourceId;
          }
          this.goToDetailsPage();
          this.setPrevNextOnLoad();
        });
    } else {
      const targetIndex = index + (direction === 'next' ? 1 : -1);
      const targetResourceId = itemsId[targetIndex];
      this.threatDetailService.details.resourceId = targetResourceId;
      this.goToDetailsPage();
      this.setPrevNextOnLoad();
    }
  }

  goToDetailsPage() {
    if (this.threatDetailService.details.resourceId === undefined) {
      this.router.navigate([
        `/dashboard/organizations/${this.activeModule.organizationId}/modules/${this.activeModule.id}`
      ]);
    } else {
      this.router.navigate([
        `/dashboard/organizations/${this.activeModule.organizationId}/modules/${this.activeModule.id}/resource/${this.threatDetailService.details.resourceId}`
      ]);
    }
  }

  resetTakeDownAvailable() {
    this.isTakeDownAvailable = false;
  }

  createbotIpPortalUrl() {
    if (this.resource.credentials) {
      let counterbotIp = 0;
      let counterPortal = 0;
      this.resource.credentials.forEach((element) => {
        if (element.hasOwnProperty('botIp')) {
          counterbotIp++;
        }
        if (element.hasOwnProperty('portalUrl')) {
          counterPortal++;
        }
      });
      this.resource.portalUrl = counterPortal.toString();
      this.resource.botIp = counterbotIp.toString();
      this.resource = { ...this.resource };
    }
  }

  loadResources(resourceId) {
    this.store.update('resourcesList', 'checkResources', [resourceId]);
  }

  onSwiperightPreview() {
    this.isPreviewOpened = false;
  }

  onClickOpenTakedown() {
    this.showTakedown = !this.showTakedown;
    if (!this.cd.detectChanges['destroyed']) {
      this.cd.markForCheck();
    }
  }

  updateComments(num) {
    this.commentsNum = num;
  }

  isFav() {
    return this.resource.fav === 'USER_STARRED';
  }

  isIssued() {
    return this.resource.issued;
  }

  onChangeDetailHeader(loading) {
    this.showNavigation = !loading;
  }

  onChangeMarkAsFavorite() {
    const value = this.resource.fav === 'NOT_STARRED' ? 'USER_STARRED' : 'NOT_STARRED';
    const { id } = this.resource;

    this.resourcesService
      .markAsFav(this.activeModule.id, this.activeModule.moduleName, id, value)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.resource.fav = this.isFav() ? 'NOT_STARRED' : 'USER_STARRED';
      });
  }

  onChangeMarkAsRead(isRead, resourceId = null) {
    const idResource = [resourceId ? resourceId : this.resource.id];
    this.markedAsUnread = !isRead;
    this.showNavigation = false;
    this.resourcesService
      .markAsRead(this.activeModule.id, this.activeModule.moduleName, idResource, !this.markedAsUnread)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.showNavigation = true;
      });
    this.isResource(() => {
      this.resource = set(this.resource, 'read', !this.markedAsUnread);
    });
  }

  setCommentsNumber(num: number) {
    this.commentsNum = num;
  }

  deleteModal() {
    if (
      this.resource &&
      this.resource.module_type &&
      (this.resource.module_type.startsWith('CREDIT_CARDS') || this.resource.module_type === 'CREDENTIALS')
    ) {
      this.isDeleteConfirmationOpened = true;
    } else if (this.resource && this.resource.moduleTypev && this.resource.moduleType === 'MALWARE') {
      this.isDeleteConfirmationOpened = true;
    } else {
      this.deleteOptionsModal = true;
    }
  }

  deleteThreat() {
    this.detailsService
      .deleteThreats([this.resource.id])
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.router.navigate(['../../'], { relativeTo: this.route });
      });
  }

  onBlockDomain() {
    const data = {
      url: this.resource.url,
      fullDomain: true
    };
    const id = this.resource.id;
    this.resourcesService
      .blockDomain(this.activeOrganization.id, this.activeModule.id, id, data)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.router.navigate(['../../'], { relativeTo: this.route });
      });
  }

  onBlockUrls() {
    const items = [{ url: this.resource.url, resourcesId: this.resource.id }];

    this.resourcesService
      .blockUrls(this.activeOrganization.id, this.activeModule.id, items)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.router.navigate(['../../'], { relativeTo: this.route });
      });
  }

  selectImport(event) {
    this.resource.laguage_id = event;
    this.resource = { ...this.resource };
  }

  navigateToThreats() {
    const queryParams = {};
    if (this.threatDetailService.details?.page) {
      queryParams['page'] = this.threatDetailService.details.page;
    }
    if (this.threatDetailService.details?.resourceId) {
      queryParams['focused'] = this.threatDetailService.details.resourceId;
    }
    if (this.threatDetailService.details?.q) {
      queryParams['q'] = this.threatDetailService.details.q;
    }
    this.router.navigate(
      [`/dashboard/organizations/${this.activeModule.organizationId}/modules/${this.activeModule.id}`],
      { queryParams }
    );
  }

  OpenModalScreenShot() {
    this.screenShotSelected = !this.screenShotSelected;
  }

  onClickIssue() {
    if (!this.grants.isCustomer()) {
      if (!this.resource.issued) {
        this.isAddIncidentModalOpen = true;
      } else {
        this.resourcesService.setResourceIssueSubject(this.resource);
        this.isViewIncidentModalOpen = true;
      }
    }
  }

  copyToClipboard(text) {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = text;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }

  protected loadData() {
    if (this.router.url.indexOf('resource') >= 0) {
      const resourceId = this.route.snapshot.params['id'];
      this.loadResource();
      this.onChangeMarkAsRead(true, resourceId);
      this.headerData = headerData[this.activeModule.moduleName];
    }
  }

  protected loadResource() {
    this.isLoading = true;
    this.resourcesService
      .getlanguagesList()
      .pipe(
        takeUntil(this.destroy$),
        switchMap((res) => {
          this.languages = res;
          return this.resourcesService.getResource(
            this.activeModule.id,
            this.activeModule.moduleName,
            this.route.snapshot.params['id']
          );
        })
      )
      .subscribe((resource) => {
        resource.checked = true;
        resource.languages = this.languages;
        resource.checkbox = true;
        this.resource = resource;
        this.resourceId = [resource.id];
        this.store.set('resourcesList', { list: [resource], numPages: 1, total_resources: 1 });
        this.setPrevNextOnLoad();
        this.loadLabels(resource.id);
        this.isLoading = false;
      });
  }

  protected setPrevNextOnLoad() {
    const itemsId = this.threatDetailService.details?.resources;

    if (itemsId && itemsId.length > 0) {
      const index = _.indexOf(itemsId, this.threatDetailService.details.resourceId);
      const isTheLastItem = index === itemsId.length - 1;
      const isTheFirstItem = index === 0;
      const isTheFirstPage = this.threatDetailService.details.page === 1;
      const isTheLastPage = this.threatDetailService.details.page === this.threatDetailService.details.lastPage;

      if (isTheFirstPage && isTheFirstItem) {
        if (itemsId.length === 1) {
          this.showPrev = false;
          this.showNext = false;
        } else {
          this.showPrev = false;
          this.showNext = true;
        }
      } else if (isTheLastPage && isTheLastItem) {
        this.showNext = false;
        this.showPrev = true;
      } else {
        this.showNext = true;
        this.showPrev = true;
      }
    }
  }

  protected loadLabels(resourceId) {
    this.resourcesService
      .getLabels(this.activeModule.id, this.activeModule.moduleName, false)
      .pipe(takeUntil(this.destroy$))
      .subscribe((l) => {
        this.labels = l;
        this.allLabels = l;
        this.isResources(
          () => {
            this.store.update('resourcesList', 'checkResources', [resourceId]);
          },
          () => {
            this.loadResources(resourceId);
          }
        );
      });
  }
}
