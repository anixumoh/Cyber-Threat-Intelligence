import { HttpUtilsService, path } from 'app/services/http-utils.service';
import { Observable } from 'rxjs';
import { Injectable, OnInit } from '@angular/core';
import { ModuleModel, OrganizationModel } from 'app/dashboard/organization/models';
import { OrganizationService } from 'app/dashboard/organization/organization.service';

@Injectable()
export class CommentService {
  activeModule: ModuleModel;
  activeOrganization: OrganizationModel;

  constructor(private httpUtils: HttpUtilsService, private organizationService: OrganizationService) {
    this.organizationService.getCurrentContext().subscribe((context) => {
      this.activeModule = context.currentModule;
      this.activeOrganization = context.currentOrganization;
    });
  }

  getComments(url: string, resourceId: number, moduleName: string) {
    let targetUrl;
    let orgId = this.activeOrganization.id;
    let moduleId = this.activeModule.id;
    let splitted = url.split('/');
    if (splitted.indexOf('incidents') >= 0) {
      targetUrl = `${path}/organization/${orgId}/module/${moduleId}/issue/${resourceId}/comment`;
    } else {
      targetUrl = `${path}/organization/${orgId}/module/${moduleId}/${moduleName}/resource/${resourceId}/comment`;
    }
    return this.httpUtils.get(targetUrl);
  }

  saveComment(url: string, resourceId: number, moduleName: string, comment: string) {
    let orgId = this.activeOrganization.id;
    let moduleId = this.activeModule.id;
    let splitted = url.split('/');
    if (splitted.indexOf('incidents') >= 0) {
      let targetUrl = `${path}/organization/${orgId}/module/${moduleId}/issue/${resourceId}/comment`;
      return this.httpUtils.post(targetUrl, { comment: comment });
    } else {
      let targetUrl = `${path}/organization/${orgId}/module/${moduleId}/${moduleName}/resource/${resourceId}/comment`;
      return this.httpUtils.put(targetUrl, { comment: comment });
    }
  }

  saveIssueComment(issue: any, comment: string): Observable<any> {
    let orgId = this.activeOrganization.id;
    let moduleId = this.activeModule.id;
    let fullUrl = `${path}/organization/${orgId}/module/${moduleId}/issue/${issue}/comment`;

    return this.httpUtils.post(fullUrl, { comment: comment });
  }

  deleteComment(resourceId: number, commentId: number) {
    let orgId = this.activeOrganization.id;
    let moduleId = this.activeModule.id;
    let moduleName = this.activeModule.moduleName;
    let targetUrl = `${path}/organization/${orgId}/module/${moduleId}/${moduleName}/resource/${resourceId}/comment/${commentId}`;
    return this.httpUtils.delete(targetUrl);
  }
}
