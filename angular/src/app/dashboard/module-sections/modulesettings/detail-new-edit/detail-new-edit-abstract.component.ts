import { Component, Input, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { Subject, Observable, of } from 'rxjs';
import { catchError, switchMap, takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { OrganizationService } from 'app/dashboard/organization/organization.service';
import { ModuleSettingsDetailService } from 'app/dashboard/module-sections/modulesettings/detail/module-settings-detail.service';
import { PaginationService } from 'app/dashboard/module-sections/shared/filters/pagination/pagination.service';
import { UsersService } from 'app/services/users.service';
import { Grants } from 'app/services/grants/grants';
import { AsideService } from '../../../../aside/aside.service';

@Component({
  selector: 'app-resource-detail',
  template: '<div></div>'
})
export class DetailNewEditAbstractComponent implements OnDestroy {
  @Input()
  set editMode(its) {
    this._editMode = its;
  }
  @Input()
  set settingId(its) {
    this._settingId = its;
  }
  @Input()
  set resourceId(its) {
    this._resourceId = its;
  }

  usersList: any;
  paginatedResourcesIds: any;
  currentFilterObservable: Observable<any>;
  resource: any;
  activeOrganization: any;
  activeModule: any;
  termsForm: UntypedFormGroup;
  _settingId: any;
  _resourceId: any;
  _editMode: boolean;
  submitData: any;
  isLoading = false;

  get settingId() {
    return this._settingId;
  }

  get resourceId() {
    return this._resourceId;
  }

  get editMode() {
    return this._editMode;
  }

  protected readonly destroy$ = new Subject<void>();

  constructor(
    protected organizationService: OrganizationService,
    protected settings: ModuleSettingsDetailService,
    protected router: Router,
    protected paginationService: PaginationService,
    protected sanitizer: DomSanitizer,
    protected usersService: UsersService,
    protected route: ActivatedRoute,
    protected cd: ChangeDetectorRef,
    public grants: Grants,
    private asideService: AsideService,
    protected toastrService: ToastrService,
    protected formBuilder: UntypedFormBuilder
  ) {
    if (!grants.isCustomerOrOperator()) {
      this.getUsersList();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  iterativeSwitchMap(obs, obsArray, cbArray, contextArray, index) {
    if (obsArray.length === 1) {
      return obs
        .call(contextArray[0])
        .pipe(takeUntil(this.destroy$))
        .subscribe((res) => {
          cbArray[0](res);
        });
    } else if (index === 0) {
      index++;
      this.iterativeSwitchMap(
        obs.call(contextArray[index - 1]).pipe(
          catchError((val) => of(`I caught: ${val}`)),
          switchMap((res) => {
            cbArray[index - 1](res);
            return obsArray[index].call(contextArray[index]);
          })
        ),
        obsArray,
        cbArray,
        contextArray,
        index
      );
    } else if (index < obsArray.length - 1) {
      index++;
      this.iterativeSwitchMap(
        obs.pipe(
          catchError((val) => of(`I caught: ${val}`)),
          switchMap((res) => {
            cbArray[index - 1](res);
            return obsArray[index].call(contextArray[index]);
          })
        ),
        obsArray,
        cbArray,
        contextArray,
        index
      );
    } else if (index < obsArray.length) {
      index++;
      return obs
        .pipe(
          catchError((val) => of(`I caught: ${val}`)),
          takeUntil(this.destroy$)
        )
        .subscribe((res) => {
          cbArray[index - 1](res);
        });
    }
  }

  setInitContext(obsArray, cbArray, contextArray) {
    this.iterativeSwitchMap(obsArray[0], obsArray, cbArray, contextArray, 0);

    this.paginationService.paginatedResources$.pipe(takeUntil(this.destroy$)).subscribe((items) => {
      this.paginatedResourcesIds = items.map((item) => item.id);
    });
  }

  buttonText() {
    return this.editMode ? 'Update' : 'Create';
  }

  navigateToList() {
    this.paginationService.stopper = true;
    this.router.navigate([
      `/dashboard/organizations/${this.activeModule.organizationId}/modules/${this.activeModule.id}/settings/${this.settingId}`
    ]);
  }

  openModalDetail() {
    this.asideService.setShowAsideSubject('advancedSettings', this.resourceId);

    this.router.navigate([
      `/dashboard/organizations/${this.activeModule.organizationId}/modules/${this.activeModule.id}/settings/filters/`
    ]);
  }

  navigateToDetail(type = '') {
    if (type === '') {
      this.router.navigate([
        `/dashboard/organizations/${this.activeModule.organizationId}/modules/${this.activeModule.id}/settings/${this.settingId}/${this.resourceId}`
      ]);
    } else {
      this.router.navigate(
        [
          `/dashboard/organizations/${this.activeModule.organizationId}/modules/${this.activeModule.id}/settings/${this.settingId}/${this.resourceId}`
        ],
        { queryParams: { type } }
      );
    }
  }

  isImage() {
    if (this.resource && this.resource.value) {
      return this.resource.value.searchImageContentType;
    }
    return false;
  }

  getUsersList() {
    this.usersService
      .getUsersList()
      .pipe(takeUntil(this.destroy$))
      .subscribe((users) => {
        this.usersList = users.list;
      });
  }

  closeMenu() {
    const { routerState } = this.router;
    const routeSplit = routerState.snapshot.url.split('/');
    if (!isNaN(+routeSplit[routeSplit.length - 1])) {
      this.router.navigate([
        `/dashboard/organizations/${this.activeModule.organizationId}/modules/${this.activeModule.id}/settings/${this.settingId}`
      ]);
    }
    this.asideService.setShowAsideSubject('advancedSettings', null);
  }
}
