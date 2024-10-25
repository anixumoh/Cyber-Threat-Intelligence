import { HttpUtilsService, host, path } from 'app/services/http-utils.service';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { OrganizationService } from 'app/dashboard/organization/organization.service';

@Injectable()
export class FeedsService {
  organizationId: any;
  activeModule: any;
  activeOrganization: any;

  constructor(private organizationService: OrganizationService, private httpUtils: HttpUtilsService) {
    organizationService.getCurrentContext().subscribe(context => {
      this.activeModule = context.currentModule;
      this.activeOrganization = context.currentOrganization;
    });
  }

  getFeedBooleans() {
    let url;
    url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/${this.activeModule.moduleName}/settings/BOOLEANS`;
    return this.httpUtils.get(url).do(res => {});
  }

  getAlertFeeds() {
    let url;
    url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/${this.activeModule.moduleName}/settings/ALERT`;
    return this.httpUtils.get(url).do(res => {});
  }

  getBankFeeds() {
    let url;
    url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/${this.activeModule.moduleName}/settings/bank`;
    return this.httpUtils.get(url).do(res => {});
  }

  getCreditCardFeeds() {
    let url;
    url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/${this.activeModule.moduleName}/settings/credit_card`;
    return this.httpUtils.get(url).do(res => {});
  }
}
