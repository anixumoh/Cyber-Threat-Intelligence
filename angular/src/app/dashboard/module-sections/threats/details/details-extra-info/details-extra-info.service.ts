import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

import { HttpUtilsService, path } from 'app/services/http-utils.service';
import { OrganizationService } from 'app/dashboard/organization/organization.service';
import { Gateway } from 'app/core/models/gateway';

@Injectable()
export class DetailExtraInfoService {
  organizationId: any;
  organization: any;
  module: any;

  constructor(
    private httpUtils: HttpUtilsService,
    private organizationService: OrganizationService,
    private gateway: Gateway
  ) {
    organizationService.getCurrentContext().subscribe((context) => {
      if (context.currentModule.id) {
        this.module = context.currentModule;
        this.organization = context.currentOrganization;
      }
    });
  }

  getMoreInfo(resourceId: any): Observable<any> {
    let moduleName = this.module.moduleName;
    let orgId = this.organization.id;
    let allPath = `${path}/organization/${orgId}/module/${this.module.id}/${moduleName}/resource/${resourceId}/extradata_info`;
    return this.httpUtils.get(allPath);
  }

  getSafeImage(image) {
    const url = `/download_base64?url=${image}`;
    const apiId = 'IMAGES_DOWNLOADER';
    const data: any = {};

    return this.gateway.postImage({ url, apiId, data });
  }

  sendReport(resourceId: string, mails, language = 'en'): Observable<any> {
    let options = `?destinations=${mails}&languageId=${language}`;
    let moduleN = `${this.module.moduleName}`;
    let allPath = `${path}/organization/${this.organization.id}/module/${this.module.id}/${moduleN}/resource/${resourceId}/docx${options}`;
    return this.httpUtils.get(allPath);
  }

  downloadReport(resourceId: string, language = 'en'): Observable<any> {
    let moduleN = `${this.module.moduleName}`;
    let allPath = `${path}/organization/${this.organization.id}/module/${this.module.id}/${moduleN}/resource/${resourceId}/docx?languageId=${language}`;
    return this.httpUtils.getFileBinary(allPath);
  }

  sendIssueReport(issueId: number, mails, language = 'en') {
    let orgId = this.organization.id;
    let moduleId = this.module.id;
    let options = `?emails=${mails}&language=${language}`;
    let allPath = `${path}/organization/${orgId}/module/${moduleId}/issue/${issueId}/report${options}`;
    this.httpUtils
      .get(allPath)

      .subscribe((res) => {});
  }

  changeFollowUp(resourceId: any, body) {
    let moduleName = this.module.moduleName;
    let orgId = this.organization.id;
    let allPath = `${path}/organization/${orgId}/module/${this.module.id}/${moduleName}/resource/${resourceId}/changeFollowedUp`;
    let changeFollowUp = {
      newValue: body,
    };
    return this.httpUtils.put(allPath, changeFollowUp);
  }

  downloadShaFile(resourceId: any): Observable<any> {
    const allPath = `${path}/organization/${this.organization.id}/module/${this.module.id}/mobile_apps/resource/${resourceId}/binary_file`;
    return this.httpUtils.getFileBinary(allPath);
  }
}
