import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { HttpUtilsService, path } from 'app/services/http-utils.service';
import { OrganizationService } from 'app/dashboard/organization/organization.service';

@Injectable()
export class ModalAddIncidentService {
  activeOrganization: any;
  activeModule: any;
  currentContext$: Observable<any>;
  private currentContextSubject: BehaviorSubject<any>;
  private readonly destroy$ = new Subject<void>();

  constructor(private httpUtils: HttpUtilsService, private organizationService: OrganizationService) {
    this.currentContextSubject = new BehaviorSubject<any>(null);
    this.currentContext$ = this.currentContextSubject.asObservable();

    this.organizationService.getCurrentContext().subscribe((response) => {
      this.currentContextSubject.next(response);
      this.activeOrganization = this.currentContextValue.currentOrganization;
      this.activeModule = this.currentContextValue.currentModule;
    });
  }

  get currentContextValue(): any {
    return this.currentContextSubject.value;
  }

  assignIncident(resourcesId, issueId): Observable<any> {
    if (resourcesId.hasOwnProperty('id')) {
      const id = resourcesId.id;
      resourcesId = [];
      resourcesId.push(id);
    }
    const body = {
      resourcesId
    };
    const allPath = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/issue/${issueId}`;

    return this.httpUtils.post(allPath, body);
  }

  updateAssignIncident(issueId, username): Observable<any> {
    const body = {
      ...(username ? { ...username } : {})
    };
    const allPath = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/issue/${issueId}/assign`;
    return this.httpUtils.post(allPath, body);
  }

  createIncident(title, typeId, description, username): Observable<any> {
    const body = {
      title,
      typeId,
      description,
      username,
      remediationTips: ''
    };
    const allPath = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/issue`;

    return this.httpUtils.post(allPath, body);
  }

  removeIncident() {
    // TODO: To implement
  }
}
