import { Injectable } from '@angular/core';
import { OrganizationService } from 'app/dashboard/organization/organization.service';
import { HttpUtilsService, path } from 'app/services/http-utils.service';
import { ModuleSettingsDetailService } from 'app/dashboard/module-sections/modulesettings/detail/module-settings-detail.service';

@Injectable()
export class StarRatingBluelivService {
  private activeModule: any;
  private activeOrganization: any;

  constructor(
    private httpUtilsService: HttpUtilsService,
    private organizationService: OrganizationService,
    private filterSettingsService: ModuleSettingsDetailService
  ) {
    this.organizationService.getCurrentContext().subscribe((context) => {
      if (context) {
        this.activeModule = context.currentModule;
        this.activeOrganization = context.currentOrganization;
      }
    });
  }

  updateStar(id: number, starValue: number, orgId, modId, moduleType) {
    let organizationId: number = orgId || this.activeOrganization.id;
    let moduleId: number = modId || this.activeModule.id;
    let moduleName: string = moduleType || this.activeModule.moduleName;
    let url = `${path}/organization/${organizationId}/module/${moduleId}/${moduleName}/resource/rating`;
    let data = {
      rate: starValue,
      resource: id,
    };

    return this.httpUtilsService.put(url, data);
  }

  filterUpdate(id: number, starValue: number) {
    let organizationId: number = this.activeOrganization.id;
    let moduleId: number = this.activeModule.id;
    let moduleName: string = this.activeModule.moduleName;
    let url = `${path}/organization/${organizationId}/module/${moduleId}/${moduleName}/resource/rating`;
    let data = {
      rate: starValue,
      resource: id,
    };
    return this.httpUtilsService.put(url, data);
  }
}
