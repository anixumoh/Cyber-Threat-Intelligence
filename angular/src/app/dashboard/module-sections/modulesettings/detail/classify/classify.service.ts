import { HttpUtilsService, path } from 'app/services/http-utils.service';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { OrganizationService } from 'app/dashboard/organization/organization.service';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class ClassifyService {
  organizationId: any;
  module: any;

  constructor(
    private organizationService: OrganizationService,
    private httpUtils: HttpUtilsService,
    private toastrService: ToastrService
  ) {
    organizationService.getCurrentContext().subscribe((context) => {
      this.organizationId = context.currentOrganization.id;
      this.module = context.currentModule;
    });
  }

  getDomains(): Observable<any> {
    const url = `${path}/organization/${this.organizationId}/module/${this.module.id}/credential/domains`;
    return this.httpUtils.get(url);
  }

  postNewAsset(data): Observable<any> {
    const url = `${path}/organization/${this.organizationId}/module/${this.module.id}/${this.module.moduleName}/classification`;
    return this.httpUtils.post(url, data);
  }

  createNewUnclassified(data): Observable<any> {
    const moduleName = this.module.moduleName;
    const url = `${path}/organization/${this.organizationId}/module/${this.module.id}/${moduleName}/settings`;
    return this.httpUtils.post(url, data);
  }

  getDomainAssets(): Observable<any> {
    const moduleName = this.module.moduleName;
    const url = `${path}/organization/${this.organizationId}/module/${this.module.id}/${moduleName}/classification`;
    return this.httpUtils.get(url);
  }

  showDomainError(body) {
    this.toastrService.error(body, 'Invalid and not added', {
      closeButton: true,
      timeOut: 0,
      extendedTimeOut: 0,
    });
  }
}
