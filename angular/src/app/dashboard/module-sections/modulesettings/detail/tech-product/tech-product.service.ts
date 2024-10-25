import { HttpUtilsService, host, path } from 'app/services/http-utils.service';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { OrganizationService } from 'app/dashboard/organization/organization.service';

@Injectable()
export class TechProductService {
  activeOrganization: any;
  activeModule: any;

  constructor(private organizationService: OrganizationService, private httpUtils: HttpUtilsService) {
    this.organizationService.getCurrentContext().subscribe((context) => {
      if (context.currentModule && context.currentOrganization) {
        this.activeOrganization = context.currentOrganization;
        this.activeModule = context.currentModule;
      }
    });
  }

  getInitialTechProducts(): Observable<any> {
    let url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/${this.activeModule.moduleName}/settings/CPE_TECH`;
    return this.httpUtils.get(url);
  }

  getCompanies(): Observable<any> {
    let url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/${this.activeModule.moduleName}/settings/vendor`;
    return this.httpUtils.get(url);
  }

  getProductsByCompany(partner = ''): Observable<any> {
    let url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/${this.activeModule.moduleName}/settings/vendor/${partner}`;
    return this.httpUtils.get(url);
  }

  postNewTechCompany(data): Observable<any> {
    let url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/${this.activeModule.moduleName}/settings`;
    return this.httpUtils.post(url, data);
  }
}
