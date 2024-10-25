import { HttpUtilsService, path } from 'app/services/http-utils.service';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { OrganizationService } from 'app/dashboard/organization/organization.service';

@Injectable()
export class SelectLanguageService {
  organizationId: any;
  organization: any;
  module: any;

  constructor(private httpUtils: HttpUtilsService, private organizationService: OrganizationService) {
    organizationService.getCurrentContext().subscribe(context => {
      if (context.currentModule.id) {
        this.module = context.currentModule;
        this.organization = context.currentOrganization;
      }
    });
  }

  getlanguagesList(): Observable<any> {
    let allPath = `${path}/language`;
    return this.httpUtils.get(allPath);
  }

  sendChangeLanguage(resourceId: any, general_language: any) {
    let allPath = `${path}/organization/${this.organization.id}/module/${this.module.id}/${this.module.moduleName}/resource/${resourceId}/language`;
    let newValues = {
      languageId: general_language,
    };
    return this.httpUtils.put(allPath, newValues);
  }
}
