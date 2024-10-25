import { OnInit, OnDestroy, Component, Input } from '@angular/core';
import { Params, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { OrganizationService } from 'app/dashboard/organization/organization.service';
import { ModuleModel, OrganizationModel } from 'app/dashboard/organization/models';

@Component({
  selector: 'module-settings-detail-new-edit',
  templateUrl: './module-settings-detail-new-edit.component.html',
  styleUrls: ['./module-settings-detail-new-edit.component.scss']
})
export class ModuleSettingsDetailNewEditComponent implements OnInit, OnDestroy {
  activeModule: ModuleModel;
  isActiveModule: boolean;
  activeOrganization: OrganizationModel;
  settingId: string;
  resourceId: any;
  editMode = true;
  type: string;

  @Input() id: string;
  @Input() resource: string;

  private readonly destroy$ = new Subject<void>();

  constructor(private activatedRoute: ActivatedRoute, private organizationService: OrganizationService) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      // this.settingId = params['settingId'];
      // this.resourceId = params['id'];
      this.settingId = this.id;
      this.resourceId = this.resource;
      this.editMode = this.resourceId != null;
    });

    this.activatedRoute.queryParams.subscribe((queryParams) => {
      this.type = queryParams['type'];
    });

    this.organizationService
      .getCurrentContext()
      .pipe(takeUntil(this.destroy$))
      .subscribe((context) => {
        if (this.contextValidations(context)) {
          this.activeOrganization = context.currentOrganization;
          this.activeModule = context.currentModule;
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  contextValidations(context) {
    return this.noDefaultActiveSets() || (this.contextSets(context) && this.changeOfCurrentSets(context));
  }

  contextSets(context) {
    return context.currentOrganization && context.currentModule && context.currentModule.id;
  }

  noDefaultActiveSets() {
    return !this.activeOrganization || !this.activeModule;
  }

  changeOfCurrentSets(context) {
    return (
      (this.activeOrganization && this.activeOrganization.id !== context.currentOrganization.id) ||
      (this.activeModule && this.activeModule.id !== context.currentModule.id)
    );
  }
}
