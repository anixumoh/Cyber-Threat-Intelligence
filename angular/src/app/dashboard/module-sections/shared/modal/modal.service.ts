import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { OrganizationService } from 'app/dashboard/organization/organization.service';
import { path, HttpUtilsService } from 'app/services/http-utils.service';

@Injectable()
export class ModalService {
  contextOservable: any;
  activeOrganization: any;
  activeModule: any;
  closeIncidentModal = new BehaviorSubject({ value: false, selectedIssues: null });

  constructor(private organizationService: OrganizationService, private httpUtils: HttpUtilsService) {
    this.contextOservable = this.organizationService.getCurrentContext().subscribe(context => {
      if (context.currentOrganization && context.currentModule && context.currentModule.id) {
        this.activeOrganization = context.currentOrganization;
        this.activeModule = context.currentModule;
      }
    });
  }

  setCloseTheModal(value: boolean, selectedIssues: any) {
    const data = { value: value, selectedIssues: selectedIssues };
    this.closeIncidentModal.next(data);
  }

  getCloseTheModal() {
    return this.closeIncidentModal;
  }

  IssueIncidentDeletion(issueId: number, resourceId: number): Observable<any> {
    const organizationId = this.activeOrganization.id;
    const moduleName = this.activeModule.moduleName;
    const fullPath = `${path}/organization/${organizationId}/module/${this.activeModule.id}/${moduleName}/resource/${resourceId}/issue/${issueId}`;

    return this.httpUtils.delete(fullPath);
  }

  markAs(type: string, resourceId: number, issueId: number): Observable<any> {
    const organizationId = this.activeOrganization.id;
    const moduleName = this.activeModule.moduleName;
    const body = {
      type,
    };
    const fullPath = `${path}/organization/${organizationId}/module/${this.activeModule.id}/${moduleName}/resource/${resourceId}/issue/${issueId}/markAs`;

    return this.httpUtils.post(fullPath, body);
  }
}
