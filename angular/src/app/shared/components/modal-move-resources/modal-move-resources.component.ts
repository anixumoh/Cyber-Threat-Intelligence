import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { take, finalize, takeUntil } from 'rxjs/operators';
import { OrganizationService } from '../../../dashboard/organization/organization.service';
import { ResourcesService } from '../../../services/resources.service';
import { ToastrService } from 'ngx-toastr';
import { Grants } from '../../../services/grants/grants';

@Component({
  selector: 'app-modal-move-resources',
  templateUrl: './modal-move-resources.component.html',
  styleUrls: ['./modal-move-resources.component.scss']
})
export class ModalMoveResourcesComponent implements OnDestroy {
  @Input() open;
  @Input() ids;
  @Input() currentModuleId;
  @Input() currentOrgId;
  @Output() success = new EventEmitter();
  @Output() cancel = new EventEmitter();
  modules = [];
  moduleId;
  orgs = [];
  orgId;
  loading = false;
  copy = '0';
  private readonly destroy$ = new Subject<void>();

  constructor(
    private organizationService: OrganizationService,
    private resourceService: ResourcesService,
    private toastrService: ToastrService,
    private grants: Grants
  ) {
    this.getOrganizations();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onAccept() {
    if (this.grants.isMaster() || this.grants.isAdminSuperAdmin() || this.grants.isAnalyst()) {
      const orgId = this.orgId;
      const moduleId = this.moduleId;

      if (orgId && moduleId) {
        if (this.ids && this.ids.length > 0) {
          const originModule = this.currentModuleId;
          const originOrg = this.currentOrgId;
          const ids = this.ids.map((id) => `${originOrg}_${originModule}_${id}`);
          const copy = this.copy === '1';
          const data = {
            copy,
            destinationOrgId: +orgId,
            destinationModuleId: +moduleId,
            ids
          };
          this.loading = true;
          this.resourceService
            .moveResource(originOrg, originModule, data)
            .pipe(
              takeUntil(this.destroy$),
              take(1),
              finalize(() => (this.loading = false))
            )
            .subscribe(
              (res: any) => {
                this.setResponseCodes(res);
                this.success.emit({ orgId, moduleId });
              },
              () => this.toastrService.error(`The resources could not be ${copy ? 'copied' : 'moved'}`, 'Error')
            );
        } else {
          this.toastrService.error('You must select at least one resource.', 'Error');
        }
      } else {
        this.toastrService.error('You must select an Organization and a Module to continue.', 'Error');
      }
    }
  }

  setResponseCodes(data: any) {
    if (data.itemResults instanceof Array && data.itemResults.length > 0) {
      for (const i of data.itemResults) {
        switch (i['resultCode']) {
          case -1:
            this.toastrService.error('Unexpected error', 'Error');
            break;
          case -2:
            this.toastrService.warning('One or more items already exist in destination', 'Warning');
            break;
          case -3:
            this.toastrService.error('Error while copying', 'Error');
            break;
          case -4:
            this.toastrService.warning('One or more items cannot be moved, they are part of an incident', 'Warning');
            break;
          case -5:
            this.toastrService.warning('One or more items cannot be moved, the destination is not suitable', 'Warning');
            break;
          case -6:
            this.toastrService.warning('One or more items cannot be moved, insufficient permissions', 'Warning');
            break;
          default:
            break;
        }
      }
    }
  }

  onCancel() {
    this.cancel.emit();
  }

  setModule(event) {
    this.moduleId = event.target.value;
  }

  onOrgSelectChange(event) {
    const orgId = event.target.value;
    this.setOrg(orgId);
  }

  setOrg(orgId) {
    if (orgId && orgId != this.orgId) {
      this.moduleId = '';
      this.orgId = orgId;
      this.getModules(orgId);
    }
  }

  getOrganizations() {
    this.loading = true;
    this.organizationService
      .getOrganizationsFromApi()
      .pipe(
        takeUntil(this.destroy$),
        take(1),
        finalize(() => (this.loading = false))
      )
      .subscribe((res) => {
        this.orgs = res;
        if (res && res.length > 0) {
          setTimeout(() => this.setOrg(res[0].id));
        }
      });
  }

  getModules(orgId) {
    if (orgId) {
      this.loading = true;
      this.organizationService
        .getModulesStandalone(orgId)
        .pipe(
          takeUntil(this.destroy$),
          take(1),
          finalize(() => (this.loading = false))
        )
        .subscribe((res) => {
          this.modules = res;
        });
    }
  }
}
