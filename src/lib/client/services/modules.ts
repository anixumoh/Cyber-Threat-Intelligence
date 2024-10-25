import type { KEY_TYPES } from '$lib/components/FilterTemplate/ExtradataField/constants';
import type { labelColors } from '$lib/constants/colors';
import type { InformType } from '$lib/types';
import type Module from '$lib/types/module';
import type Organization from '$lib/types/organization';
import { modulesStore } from '$stores/module';
import axios, { type CancelTokenSource } from 'axios';
import { get } from 'svelte/store';
import Service from '.';
import type { GenericResponseType } from './types';

export type TermsType = {
  id: number;
  term: string;
  total: number;
  moduleId: number;
};

export type SourceType = {
  transform: string;
  total: number;
};

export type LabelType = {
  id: number;
  label: string;
  organizationId: null | number;
  organizationName: null;
  moduleId: number | null;
  moduleName: null;
  labelTypeId: number;
  labelTypeName: string;
  labelProtected: boolean;
  prioritized: boolean;
  bgColorHex: string;
  textColorHex: string;
  moduleTypeId: null;
};

export type LabelPayload = {
  bgColorHex: (typeof labelColors)[number];
  label: string;
  labelProtected: boolean;
  prioritized: boolean;
  textColorHex: string;
  moduleId?: number;
  organizationId?: number;
  labelTypeId?: number;
};

export type Alert = {
  id: number;
  firingDate: number;
  moduleId: number;
  status: string;
  filterName: string;
  moduleName: string;
  moduleType: string;
  read?: boolean;
};

export type AlertInfo = {
  id: number;
  firedAt: number;
  status: string;
  filterName: string;
  organizationId: number;
  moduleId: number;
  filterId: number;
  createdAt: number;
  resources: AlertResource[];
  totalResources: number;
};

export type AlertResource = {
  analysis_calc_result: string;
  analysis_result: string;
  changed_at: number;
  checked_at: number;
  content_type: string;
  created_at: number;
  fav: 'USER_STARRED' | 'NOT_STARRED';
  id: number;
  issued: boolean;
  labels: AlertResourceLabel[];
  language: string;
  module_id: number;
  organization_id: number;
  read: boolean;
  resource_type: string;
  source_type: string;
  title: string;
  url: string;
};

export type AlertResourceLabel = {
  id: number;
  background_color: number;
  label: string;
  module_id: number;
  organization_id: number;
  text_color: number;
};

export type ThumbnailItem = {
  image: string;
  search_words: string[];
  language_id: string;
  domain_type: string;
  total_retweets: number;
  retweet_info: any[];
  id: number;
  organization_id: number;
  module_id: number;
  module_name: string;
  module_short_name: string;
  module_type: string;
  url: string;
  title: string;
  content_type: string;
  analysis_user_result?: InformType;
  analysis_result: InformType;
  analysis_calc_result: InformType;
  created_at: string;
  checked_at: string;
  changed_at: string;
  user_rating: number;
  read: boolean;
  fav: 'USER_STARRED' | 'NOT_STARRED';
  issued: boolean;
  labels: ThumbnailLabel[];
  searchPhrase: string;
  followedUp: boolean;
  history: any[];
};

export type ThumbnailLabel = {
  id: number;
  name: string;
  organization_id: number;
  module_id: number;
  background_color: number;
  text_color: number;
  type: string;
};

export type DarkWebSearchDetail = {
  url: string;
  events: DarkWebSearchDetailEvent[];
  title: string;
  screenshot: string;
  markdown: string;
  tags: string[];
};

export type DarkWebSearchDetailEvent = {
  timestamp: DarkWebSearchDetailTimestamp;
  event_type: number;
};

export type DarkWebSearchDetailTimestamp = {
  $date: number;
};

export type SettingsResponse = {
  type: string;
  values: {
    id: string;
    value: string;
    title?: string;
    url?: string;
  }[];
};

export type ClassificationItem = {
  id: number;
  value: string;
};
export type ClassificationKeys = 'UNCLASSIFIED' | 'EMPLOYEE' | 'CUSTOMER' | 'EXTERNAL';
type ClassificationResponse = Partial<Record<ClassificationKeys, ClassificationItem[]>>;

export type VendorCPE = {
  value: string;
  label: string;
};
export type ProductCPE = {
  value: string;
  label: string;
};
export type ProductVersionCPE = {
  cpeName: string;
  title: string;
  part: string;
  vendor: string;
  product: string;
  version: string;
  update: string;
  edition: string;
  language: string;
  deprecated: boolean;
};

export type AuthorizedUser = {
  id: number;
  name: string;
  firstSurname: string;
  secondSurname: string;
  email: string;
  username: string;
  address: string;
  job: string;
  value?: string;
};
export type MonitoredAssets = {
  [key: string]: number;
};

export type DownloadModuleResponse = {
  version: string;
  name: string;
  shortname: string;
  enabled: boolean;
  module: {
    name: string;
  };
  type: number;
  extra_config: {
    plugins: Array<string>;
    strictTokens: Array<any>;
  };
  configs: Array<{
    result: number;
    screenshotsDisabled: boolean;
  }>;
  terms: Array<{
    searchPhrase: string;
    strict: boolean;
    type: string;
    classification: string;
    searchEngines: boolean;
    searchTwitter: boolean;
    searchFacebook: boolean;
    crawler: boolean;
    hasImage: boolean;
    pluginConfigs: Array<{
      pluginId: string;
      visionSchedExpression: string;
    }>;
  }>;
  filters: Array<{
    name: string;
    isTemplate: boolean;
    generated: boolean;
    enabled: boolean;
    orden: number;
    status: number;
    conditions: Array<{
      type: number;
      value?: string;
      isLabelList: boolean;
      isTermList: boolean;
      inverse: boolean;
      origins?: Array<{
        type: number;
        value: string;
      }>;
    }>;
    actions: Array<{
      type: number;
      value?: string;
      isLabelList: boolean;
      sendAlert: boolean;
      labels?: Array<{
        name: string;
        bgColor: number;
        textColor: number;
        labelType: string;
        level: number;
      }>;
    }>;
  }>;
};

export type ModuleTypeSimple = { name: string; type: string; value: number };

export type ExtradataKeyTemplate = {
  keyPreset: {
    key: {
      path: string;
      type: KEY_TYPES;
    };
    name: string;
  };
  description: string;
  enabled: boolean;
};

export default class ModulesService extends Service {
  cancelTokengetDarkWebDetailTimestamp: CancelTokenSource;
  cancelTokengetVendorsCPE: CancelTokenSource;

  abort() {
    this.cancelTokengetDarkWebDetailTimestamp?.cancel();
    this.cancelTokengetVendorsCPE?.cancel();
  }
  async runSearch(organizationId: number, moduleId: number) {
    const url = `api/v2/organization/${moduleId}/module/${organizationId}/execute`;
    const response = await this.client.get<GenericResponseType>(url);
    return response.data;
  }
  async downloadModule(orgId: number, moduleId: number) {
    const url = `/api/v2/organization/${orgId}/module/${moduleId}/export`;
    const response = await this.client.get<DownloadModuleResponse>(url, { responseType: 'json' });
    return response.data;
  }
  async editModule(idOrg: number, module: Module) {
    const url = `/api/v2/organization/${idOrg}/module/${module.id}?extraFields=true`;
    const response = await this.client.put<GenericResponseType>(url, module);
    return response.data;
  }
  async deleteModule(idOrg: number, moduleId: string) {
    const url = `/api/v2/organization/${idOrg}/module/${moduleId}`;
    const response = await this.client.delete<GenericResponseType>(url);
    return response.data;
  }
  async getOrganizations() {
    const url = '/api/v2/organization';
    const response = await this.client.get<Organization[]>(url);
    return response.data;
  }
  async getOrganizationsFiltered(page: number, maxRows: number, orderByName: boolean) {
    const optionalParams = '&s=' + (orderByName ? 'true' : 'false');
    const url = `/api/v2/organization?p=true&maxRows=${maxRows}&o=name&page=${page}${optionalParams}`;
    const response = (await this.client.get(url)).data;
    return response;
  }
  async getModuleTypes() {
    const url = '/api/v2/moduletype';
    const response = await this.client.get<ModuleTypeSimple[]>(url);
    return response.data;
  }
  async getAllowedModules(id: number) {
    const url = `/api/v2/moduletype/organization/${id}`;
    const response = (await this.client.get<string[]>(url)).data;
    return response;
  }
  async exportOrganizations(organizationId: number) {
    const url = `/api/v2/organization/${organizationId}/module/export`;
    const response = await this.client.get<Blob>(url, { responseType: 'blob' });
    return response.data;
  }
  async importModule(id: number, data: FormData) {
    const url = `/api/v2/organization/${id}/module/import`;
    const response = await this.client.postForm(url, data);
    return response;
  }
  async getMonitoredAssets() {
    const url = `/api/v2/chart/default/settings-per-instance`;
    const response = await this.client.get<MonitoredAssets>(url);
    return response.data;
  }

  async getAllTerms(organizationId: number) {
    const url = `/api/v2/organization/${organizationId}/module/0/resource/terms?days=15`;
    const response = await this.client.get<TermsType[]>(url);
    return response.data;
  }

  async getTerms(organizationId: number, module: Module) {
    const url = `/api/v2/organization/${organizationId}/module/${module.id}/${module.moduleName}/resource/terms`;
    const response = await this.client.get<TermsType[]>(url);
    return response.data;
  }

  async getSources(organizationId: number, moduleId: number) {
    const url = `/api/v2/organization/${organizationId}/module/${moduleId}/resource/sources`;
    const response = await this.client.get<SourceType[]>(url);
    return response.data;
  }

  async getAllLabels(organizationId: number) {
    const url = `/api/v2/label/organization/${organizationId}?moduleLabels=false&days=15`;
    const response = await this.client.get<LabelType[]>(url);
    return response.data;
  }

  async getLabels(organizationId: number, module: Module, isFilter = false, isIncident = false) {
    const filter = isIncident ? '' : `?associated=${isFilter}`;
    const url = `/api/v2/organization/${organizationId}/module/${module.id}/${module.moduleName}/resource/label${filter}`;
    const response = await this.client.get<LabelType[]>(url);
    return response.data;
  }
  async getExplorerLabels(organizationId: number, moduleId: number) {
    const url = `/api/v2/organization/${organizationId}/module/${moduleId}/explorer/resource/label?associated=true`;
    const response = await this.client.get<LabelType[]>(url);
    return response.data;
  }
  async updateExplorerResourceWithLabels(organizationId: number, moduleId: number, resources: number[], label: number) {
    const url = `/api/v2/organization/${organizationId}/module/${moduleId}/explorer/resource/label/`;
    const params = {
      label,
      resources
    };
    const response = await this.client.put<GenericResponseType>(url, params);
    return response.data;
  }
  async createLabel(labelPayload: LabelPayload) {
    const url = `/api/v2/label`;
    const response = await this.client.post<LabelType>(url, labelPayload);
    return response.data;
  }

  async editLabel(labelId: number, labelPayload: LabelPayload) {
    const url = `/api/v2/label/${labelId}`;
    const response = await this.client.put<LabelType>(url, labelPayload);
    return response.data;
  }

  async deleteLabel(organizationId: number, labelId: number) {
    const url = `/api/v2/organization/${organizationId}/label/${labelId}`;
    const response = await this.client.delete<GenericResponseType>(url);
    return response.data;
  }

  async getAlerts(page: number, maxRows: number, organizationId: number, module?: Module) {
    const url = module
      ? `/api/v2/organization/${organizationId}/module/${module.id}/${module.moduleName}/alerts`
      : `/api/v2/organization/${organizationId}/module/0/resource/alerts`;
    const params = {
      page,
      maxRows,
      extraFields: true
    };
    const response = await this.client.get<{ total_resources: number; list: Alert[] }>(url, { params });
    return response.data;
  }

  async deleteAlert(alert: Alert, organizationId: number) {
    const modules = get(modulesStore);
    const module = modules.find((module) => module.id === alert.moduleId);
    if (!module) {
      throw new Error('Unknown alert module');
    }
    const url = `/api/v2/organization/${organizationId}/module/${module.id}/${module.moduleName}/alerts/${alert.id}`;
    const response = await this.client.delete<GenericResponseType>(url);
    return response.data;
  }

  async getAlert(organizationId: number, module: Module, alertId: number, page: number, maxRows: number) {
    const url = `/api/v2/organization/${organizationId}/module/${module.id}/${module.moduleName}/alerts/${alertId}`;
    const params = {
      page,
      maxRows
    };

    const response = await this.client.get<AlertInfo>(url, { params });
    return response.data;
  }

  async markAsRead(resources: number[], orgId: number, moduleId: number, moduleName: string, isRead = true) {
    const body = {
      read: isRead,
      resources
    };
    const url = `/api/v2/organization/${orgId}/module/${moduleId}/${moduleName}/alerts/markAs`;
    await this.client.put(url, body);
  }

  async toggleAlertResourceFav(
    organizationId: number,
    module: Module,
    resourceId: number,
    status: AlertResource['fav']
  ) {
    const url = `/api/v2/organization/${organizationId}/module/${module.id}/${module.moduleName}/resource/fav`;
    const data = {
      resource: resourceId,
      status
    };
    const response = await this.client.put<GenericResponseType>(url, data);
    return response.data;
  }

  async getThumbnails(organizationId: number, moduleId: number, page: number, maxRows: number) {
    const url = `/api/v2/organization/${organizationId}/module/${moduleId}/social_media/resource/thumbs`;
    const params = {
      page,
      maxRows
    };
    const response = await this.client.get<{ total_resources: number; list: ThumbnailItem[] }>(url, { params });
    return response.data;
  }

  async getDarkWebDetail(organizationId: number, moduleId: number, url_hash: string) {
    const params = {
      url_hash
    };
    const url = `/api/v2/organization/${organizationId}/module/${moduleId}/dark_web/detail`;
    const response = await this.client.get<DarkWebSearchDetail>(url, { params });
    return response.data;
  }

  async getDarkWebDetailTimestamp(organizationId: number, moduleId: number, url_hash: string, timestamp: number) {
    this.cancelTokengetDarkWebDetailTimestamp?.cancel();
    this.cancelTokengetDarkWebDetailTimestamp = axios.CancelToken.source();

    const params = {
      url_hash,
      timestamp
    };

    const url = `/api/v2/organization/${organizationId}/module/${moduleId}/dark_web/detail`;
    const response = await this.client.get<DarkWebSearchDetail>(url, {
      params,
      cancelToken: this.cancelTokengetDarkWebDetailTimestamp.token
    });
    return response.data;
  }

  async getDarkWebDiff(
    organizationId: number,
    moduleId: number,
    uri: string,
    timestamp_a: number,
    timestamp_b: number
  ) {
    const params = {
      url: uri,
      ts_a: timestamp_a,
      ts_b: timestamp_b
    };
    const url = `/api/v2/organization/${organizationId}/module/${moduleId}/dark_web/diff`;
    const response = await this.client.get<{ text_a: string; text_b: string }>(url, { params });
    return response.data;
  }

  async getCredentialDomains(organizationId: number, moduleId: number) {
    const url = `/api/v2/organization/${organizationId}/module/${moduleId}/credential/domains`;
    const response = await this.client.get<string[]>(url);
    return response.data;
  }

  async getDomainAssets(organizationId: number, module: Module) {
    const url = `/api/v2/organization/${organizationId}/module/${module.id}/${module.moduleName}/classification`;
    const response = await this.client.get<ClassificationResponse>(url);
    return response.data;
  }

  createDomainAsset(organizationId: number, module: Module, value: string) {
    const url = `/api/v2/organization/${organizationId}/module/${module.id}/${module.moduleName}/classification`;
    const payload = {
      UNCLASSIFIED: [
        {
          id: '',
          value
        }
      ]
    };
    return this.client.post(url, payload);
  }
  async deleteClassification(organizationId: number, module: Module, item: string) {
    const url = `/api/v2/organization/${organizationId}/module/${module.id}/${module.moduleName}/classification`;
    const payload = [item];
    return await this.client.put(url, payload);
  }
  createNewUnclassified(organizationId: number, module: Module, value: string) {
    const url = `/api/v2/organization/${organizationId}/module/${module.id}/${module.moduleName}/settings`;
    const payload = {
      values: [
        {
          id: '',
          value
        }
      ],
      type: 'DOMAIN'
    };
    return this.client.post<GenericResponseType>(url, payload);
  }

  async classify(organizationId: number, module: Module, key: ClassificationKeys, item: ClassificationItem) {
    const url = `/api/v2/organization/${organizationId}/module/${module.id}/${module.moduleName}/classification`;
    const payload = { [key]: [item] };
    const response = await this.client.post<GenericResponseType>(url, payload);
    return response.data;
  }

  async getModuleSettings<T = SettingsResponse>(organizationId: number, module: Module, key: string) {
    const url = `/api/v2/organization/${organizationId}/module/${module.id}/${module.moduleName}/settings/${key}`;
    const response = await this.client.get<T>(url);
    return response.data;
  }

  async setModuleSettings<T = SettingsResponse>(organizationId: number, module: Module, payload: T) {
    const url = `/api/v2/organization/${organizationId}/module/${module.id}/${module.moduleName}/settings`;
    const response = await this.client.post<GenericResponseType>(url, payload);
    return response.data;
  }

  deleteModuleSettings<T = SettingsResponse>(organizationId: number, module: Module, payload: T) {
    const url = `/api/v2/organization/${organizationId}/module/${module.id}/${module.moduleName}/settings`;
    return this.client.put<GenericResponseType>(url, payload);
  }

  async getVendorsCPE(vendor: string) {
    this.cancelTokengetVendorsCPE?.cancel();
    this.cancelTokengetVendorsCPE = axios.CancelToken.source();

    const url = '/api/v2/cpe/vendors';
    const params = { vendor };
    const response = await this.client.get<VendorCPE[]>(url, {
      params,
      cancelToken: this.cancelTokengetVendorsCPE.token
    });
    return response.data;
  }

  async getProductsCPE(vendor: string, product: string) {
    const url = `/api/v2/cpe/vendors/${vendor}/products`;
    const params = { product };
    const response = await this.client.get<ProductCPE[]>(url, { params });
    return response.data;
  }

  async getProductVersionsCPE(vendor: string, product: string, versions: string, includeDeprecateds: boolean) {
    const url = `/api/v2/cpe/vendors/${vendor}/products/${product}/versions`;
    const params = {
      versions,
      includeDeprecateds
    };
    const response = await this.client.get<ProductVersionCPE[]>(url, { params });
    return response.data;
  }

  async importCpes(organizationId: number, module: Module, data: FormData) {
    const url = `/api/v2/organization/${organizationId}/module/${module.id}/${module.moduleName}/settings/cpes/import`;
    const response = await this.client.postForm<GenericResponseType>(url, data);
    return response.data;
  }

  async getAuthorizedUsers(moduleId: number) {
    const url = `/api/v2/user/authorized/module/${moduleId}`;
    const response = await this.client.get<AuthorizedUser[]>(url);
    return response.data;
  }

  async getModuleExtradataFields(module: Module | undefined) {
    const url = '/api/v2/key_presets/extradata';
    const params = {
      moduleType: module.type,
      includeDisabled: true
    };
    const response = await this.client.get<ExtradataKeyTemplate[]>(url, { params });
    return response.data;
  }
}
