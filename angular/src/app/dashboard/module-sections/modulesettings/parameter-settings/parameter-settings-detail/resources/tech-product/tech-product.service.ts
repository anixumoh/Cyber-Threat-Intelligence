import { Injectable } from '@angular/core';
import { OrganizationService } from '../../../../../../organization/organization.service';
import { HttpUtilsService, path } from '../../../../../../../services/http-utils.service';
import { Observable } from 'rxjs';

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

  getCompanies(search): Observable<any> {
    let url = `${path}/cpe/vendors?vendor=${search}`;
    return this.httpUtils.get(url);
  }

  getProductsByCompany(partner: string = '', deprecated, search): Observable<any> {
    let url = `${path}/cpe/vendors/${partner}/products?product=${search}`;
    return this.httpUtils.get(url);
  }

  getProductVersions(product, company, search, deprecated): Observable<any> {
    const url = `${path}/cpe/vendors/${company}/products/${product}/versions?versions=${search}&includeDeprecateds=${deprecated}`;
    return this.httpUtils.get(url);
  }

  importCpes(data): Observable<any> {
    const url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/${this.activeModule.moduleName}/settings/cpes/import`;
    return this.httpUtils.multipartRequestNoXhr(url, data, "POST")
  }

  update(data): Observable<any> {
    let url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/${this.activeModule.moduleName}/settings`;
    return this.httpUtils.post(url, data);
  }

  delete(data): Observable<any> {
    let url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/${this.activeModule.moduleName}/settings`;
    return this.httpUtils.put(url, data);
  }
}
