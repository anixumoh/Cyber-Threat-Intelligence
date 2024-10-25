import { of, Observable } from 'rxjs';

import { catchError } from 'rxjs/operators';
import { HttpUtilsService, path } from 'app/services/http-utils.service';
import { Injectable } from '@angular/core';
import { OrganizationService } from 'app/dashboard/organization/organization.service';

@Injectable()
export class InformService {
  organizationId: any;
  activeModule: any;
  activeOrganization: any;

  constructor(private httpUtils: HttpUtilsService, private organizationService: OrganizationService) {
    this.organizationService.getCurrentContext().subscribe((context) => {
      if (context.currentOrganization && context.currentModule.id) {
        this.activeOrganization = context.currentOrganization;
        this.activeModule = context.currentModule;
      }
    });
  }

  sendStatus(status: string, id: number, orgId, modId, modType): Observable<any> {
    let organizationId: number = orgId || this.activeOrganization.id;
    let module: any = this.activeModule;
    const moduleId = modId || module.id;
    const moduleName = modType || module.moduleName;
    return this.httpUtils
      .put(
        `${path}/organization/${organizationId}/module/${moduleId}/${moduleName}/resource/${id}/userResult/${status}`,
        {}
      )
      .pipe(
        catchError((err) => {
          let data = {
            code: 0,
            error: true,
            field: '',
            httpCode: 200,
            message: 'ok.user_result'
          };
          return of(data);
        })
      );
  }
}
