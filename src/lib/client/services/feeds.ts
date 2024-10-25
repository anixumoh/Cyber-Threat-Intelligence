import type { AlertModulesType, AlertResponse, FeedsType } from '$lib/types/alerts';
import Service from '.';
import type { GenericResponseType } from './types';

export default class FeedsService extends Service {
  abort() {}

  async getFeedBooleans(orgId: number, moduleId: number, moduleName: string) {
    const url = `api/v2/organization/${orgId}/module/${moduleId}/${moduleName}/settings/BOOLEANS`;
    return (await this.client.get<FeedsType>(url)).data;
  }

  async getAlertFeeds(orgId: number, moduleId: number, moduleName: string) {
    const url = `api/v2/organization/${orgId}/module/${moduleId}/${moduleName}/settings/ALERT`;
    return (await this.client.get<AlertResponse>(url)).data;
  }

  async getBankFeeds(orgId: number, moduleId: number, moduleName: string) {
    const url = `api/v2/organization/${orgId}/module/${moduleId}/${moduleName}/settings/bank`;
    return (await this.client.get<AlertResponse>(url)).data;
  }

  async getCreditCardFeeds(orgId: number, moduleId: number, moduleName: string) {
    const url = `api/v2/organization/${orgId}/module/${moduleId}/${moduleName}/settings/credit_card`;
    return (await this.client.get<AlertResponse>(url)).data;
  }

  async saveFeedSettingsDataCarding(
    orgId: number,
    moduleId: number,
    moduleName: string,
    modules: AlertModulesType,
    statefeeds: boolean
  ) {
    const url = `api/v2/organization/${orgId}/module/${moduleId}/${moduleName}/settings`;
    const newValues = {
      values: [{ value: statefeeds.toString() }],
      type: modules.toUpperCase()
    };

    await this.client.post<GenericResponseType>(url, newValues);
  }
}
