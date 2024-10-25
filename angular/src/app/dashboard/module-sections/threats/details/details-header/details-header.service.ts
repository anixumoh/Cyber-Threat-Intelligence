import { HttpUtilsService, path } from 'app/services/http-utils.service';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { OrganizationService } from 'app/dashboard/organization/organization.service';
import { map } from 'rxjs/operators';

@Injectable()
export class DetailHeaderService {
  activeOrganization: any;
  activeModule: any;

  constructor(private httpUtils: HttpUtilsService, private organizationService: OrganizationService) {
    this.organizationService.getCurrentContext().subscribe((context) => {
      if (context.currentModule && context.currentOrganization) {
        this.activeModule = context.currentModule;
        this.activeOrganization = context.currentOrganization;
      }
    });
  }

  getlanguagesList(): Observable<any> {
    const allPath = `${path}/language`;
    return this.httpUtils.get(allPath);
  }

  getMoreInfo(resourceId: any): Observable<any> {
    // const allPath = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/${this.activeModule.moduleName}/resource/13681749/extradata_info`;
    const allPath = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/${this.activeModule.moduleName}/resource/${resourceId}/extradata_info`;
    return this.httpUtils.get(allPath);
  }

  sendChangeLanguage(resourceId: any, general_language: any) {
    const allPath = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/${this.activeModule.moduleName}/resource/${resourceId}/language`;
    var newValues = {
      languageId: general_language,
    };
    this.httpUtils.put(allPath, newValues).subscribe((res) => {});
  }

  sendReport(resourceId: any, mails, language) {
    const allPath = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/${this.activeModule.moduleName}/resource/${resourceId}/docx?destinations=${mails}&?languageId=${language}`;
    this.httpUtils.get(allPath).subscribe((res) => {});
  }

  downloadOriginal(id, type) {
    const url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/${this.activeModule.moduleName}/resource/attach/${id}`;
    return this.httpUtils.getFileImage(url).pipe(
      map((res: any) => {
        return new Blob([res], { type: `${type};base64,` });
      })
    );
  }

  returnUrlPCAP(id: number) {
    return `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/malware/resource/${id}/downloadPcap`;
  }

  downloadPCAP(resource, type) {
    let url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/malware/resource/${resource}/downloadPcap`;
    return this.httpUtils.getFile(url)((res) => {
      return new Blob([res], { type: `${type}` });
    });
  }
}
