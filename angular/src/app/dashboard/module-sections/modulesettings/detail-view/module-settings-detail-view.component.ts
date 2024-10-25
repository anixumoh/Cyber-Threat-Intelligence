import { OnInit, OnDestroy, Component, Input } from '@angular/core';
import { Params, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { OrganizationService } from 'app/dashboard/organization/organization.service';
import { ModuleModel, OrganizationModel } from 'app/dashboard/organization/models';

@Component({
  selector: 'module-settings-detail-view',
  templateUrl: './module-settings-detail-view.component.html',
  styleUrls: ['../detail-new-edit/module-settings-detail-new-edit.component.scss']
})
export class ModuleSettingsDetailViewComponent implements OnInit, OnDestroy {
  activeModule: ModuleModel;
  activeOrganization: OrganizationModel;
  editMode = true;
  settingId: string;
  resourceId: any;
  type: string;

  @Input() id: string;
  @Input() resource: string;
  @Input('module-id') moduleId: string;

  private readonly destroy$ = new Subject<void>();

  constructor(private activatedRoute: ActivatedRoute, private organizationService: OrganizationService) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      // this.settingId = params['settingId'];
      // this.resourceId = params['id'];
      this.settingId = this.id;
      this.resourceId = this.resource;

      const u = new URL(window.location.href);
      const type = u.searchParams.get('type');
      this.type = type;
    });

    // this.activatedRoute.queryParams.subscribe((queryParams) => {
    //   this.type = queryParams['type'];
    // });

    this.organizationService.setCurrentModuleId(+this.moduleId);
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
      (this.activeOrganization && this.activeOrganization.id != context.currentOrganization.id) ||
      (this.activeModule && this.activeModule.id != context.currentModule.id)
    );
  }
}
