import { Injectable } from '@angular/core';
import { OrganizationService } from '../../../../../../organization/organization.service';
import { HttpUtilsService, path } from '../../../../../../../services/http-utils.service';

@Injectable()
export class FeedsService {
  organizationId: any;
  activeModule: any;
  activeOrganization: any;

  constructor(private organizationService: OrganizationService, private httpUtils: HttpUtilsService) {
    organizationService.getCurrentContext().subscribe((context) => {
      this.activeModule = context.currentModule;
      this.activeOrganization = context.currentOrganization;
    });
  }

  getFeedBooleans() {
    let url;
    url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/${this.activeModule.moduleName}/settings/BOOLEANS`;
    return this.httpUtils.get(url);
  }

  getAlertFeeds() {
    let url;
    url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/${this.activeModule.moduleName}/settings/ALERT`;
    return this.httpUtils.get(url);
  }

  getBankFeeds() {
    let url;
    url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/${this.activeModule.moduleName}/settings/bank`;
    return this.httpUtils.get(url);
  }

  getCreditCardFeeds() {
    let url;
    url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/${this.activeModule.moduleName}/settings/credit_card`;
    return this.httpUtils.get(url);
  }

  saveFeedSettingsDataCarding(modules, statefeeds) {
    let url: string, newValues;
    url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/${this.activeModule.moduleName}/settings`;
    newValues = {
      values: [{ value: statefeeds.toString() }],
      type: modules.toUpperCase(),
    };

    this.httpUtils.post(url, newValues).subscribe();
  }
}
