import type Module from '$lib/types/module';
import type { AlertConfiguration, RSSResponse, Rss, RssFields, RssType } from '$lib/types/settings';
import { settings } from '$lib/utils/settings';
import Service from '.';
import type { GenericResponseType } from './types';

export type Country = {
  fips: string;
  id: string;
  iso3: string;
  latitude: number;
  longitude: number;
  name: string;
};

type SettingsTermsResponse = {
  values: {
    [key: string]: SettingsTerm[];
  };
  type: any;
  total: number;
};

export type SettingsTerm = {
  id: number;
  reputationalSearchId: number;
  reputationalSearchName: string;
  searchPhrase: string;
  strict: boolean;
  searchEngines: boolean;
  searchTwitter: boolean;
  searchFacebook: boolean;
  crawler: boolean;
  reputationalSearchTopicName: any;
  createdAt: number;
  runAt: any;
  configured: any[];
  searchImageFilename: any;
  searchImageContentType: any;
  termType: string; // 'SUBDOMAIN'
  hasError: boolean;
  extraConfig: any;
};

export type FilterListsResponse = {
  languages: ValueLabelItem[];
  plugins: (ValueLabelItem & { type: string; value: string })[];
  countries: ValueLabelItem[];
  rssFeeds?: ValueLabelItem[]; // TODO, check if is correct
  labels: LabelListItem[];
};

export type ValueLabelItem = {
  value: string;
  label: string;
};

export type LabelListItem = {
  id: number;
  label: string;
  bgColorRGB: string;
  textColorRGB: string;
  // more fields...
};

export type AdvancedFilter = {
  id: number;
  enabled: boolean;
  generated: boolean;
  orden: number;
  status: string;
  messages: any[];
  name: string;
  conditions: AdvancedFilterCondition[];
  actions: AdvancedFilterAction[];
};
export type CreateAdvancedFilterPayload = Omit<AdvancedFilter, 'id' | 'orden'>;
export type SaveAsAdvancedFilterPayload = Omit<AdvancedFilter, 'orden'>;

export type AdvancedFilterAction = {
  id?: number;
  type:
    | 'MARK_TLP_LIGHT'
    | 'CUT_EXECUTION'
    | 'DELETE'
    | 'LABEL_ASSIGNATION'
    | 'ANALYSIS_RESULT_ASSIGNATION'
    | 'LAUNCH_ALERT'
    | 'WEIGHT_ASSIGNATION'
    | 'FACEBOOK'
    | 'TWITTER'
    | 'NEWS'
    | 'MANUAL'
    | 'TRANSFORM'
    | 'RSS';
  value?: string | number | boolean;
  alertConfiguration?: AlertConfiguration;
};

export type AdvancedFilterCondition = {
  id?: number;
  type:
    | 'TERM'
    | 'FILE_TYPE'
    | 'EXTRADATA_ENTRY'
    | 'LANGUAGE'
    | 'HAS_LABEL'
    | 'FILTER_PHRASE'
    | 'ANALYSIS_RESULT'
    | 'DOMAIN'
    | 'COUNTRY'
    | 'ORIGIN';
  value: string[] | number[];
  inverse: boolean;
  origins: { id?: number; type: string; value: string }[];
};

export type AllAlertResponse = {
  values: AllAlert[];
  total: number;
};

export type AllAlert = {
  id: number;
  name: string;
  reputationalSearchId: number;
  reputationalSearchName: string;
  generated: boolean;
  enabled: boolean;
  order: number;
  status: string;
  filterTemplateId: null;
  filterTemplateName: null;
  hasAlertAction: boolean;
  createdAt: number;
};

export default class SettingsService extends Service {
  async getCountries() {
    const url = '/api/v2/user/country';
    const response = await this.client.get<Country[]>(url);
    return response.data;
  }

  setUserLanding(landing: string) {
    const url = '/api/v2/user/landing';
    return this.client.put(url, { landing });
  }

  async getSettingsData(
    organizationId: number,
    moduleId: number,
    moduleName: string,
    settingId: string,
    page: number,
    maxRows: number,
    searchTerm?: string,
    advancedFilters?: unknown
  ) {
    let data;
    let url;
    const moduleType = settings[moduleName];
    const pagination = `page=${page}&total=${maxRows}`;
    const params = searchTerm ? `&q=${searchTerm}` : '';
    url = `api/v2/organization/${organizationId}/module/${moduleId}`;

    if (moduleType) {
      data = moduleType.find((o) => o.id === settingId);
    }

    if (settingId === 'filters') {
      url = url + `/filter?${pagination}${params}`;
    } else if (settingId === 'classification') {
      url = url + `/${moduleName}/${settingId}`;
    } else {
      if (settingId === 'typo_keyword_distance') {
        settingId = settingId.toUpperCase();
        url = url + `/${moduleName}/settings/${settingId}?${pagination}`;
      } else if (settingId === 'terms') {
        url = advancedFilters
          ? url + `/settings/${settingId}?p=false`
          : url + `/settings/${settingId}?${pagination}${params}`;
      } else {
        url = url + `/${moduleName}/settings/${settingId}?${pagination}`;
      }
    }
    const { data: dataResp } = await this.client.get(url);
    if (settingId === 'classification' && data) {
      data.values = [dataResp];
    } else if (data) {
      data.values = Array.isArray(dataResp.values)
        ? dataResp.values
        : (() => {
            let tempArray = [];
            for (const p in dataResp.values) {
              if (Array.isArray(dataResp.values[p])) {
                tempArray = tempArray.concat(dataResp.values[p]);
              }
            }
            return tempArray;
          })();
      data.totalResources = dataResp.total ? dataResp.total : '';
    }
    return data;
  }

  async getAllAlerts(page: number, maxRows: number, organizationId: number) {
    const url = `/api/v2/alert_configs/organization/${organizationId}`;
    const params = {
      page,
      maxRows
    };
    const response = await this.client.get<AllAlertResponse>(url, { params });
    return response.data;
  }

  async changeOrder(organizationId: number, moduleId: number, id: number, position: number) {
    const url = `api/v2/organization/${organizationId}/module/${moduleId}/filter/${id}`;
    return await this.client.patch(url, { order: position });
  }

  async saveSettingsPatch(organizationId: number, moduleId: number, resourceId: number | string, settingObject) {
    const url = `api/v2/organization/${organizationId}/module/${moduleId}/filter/${resourceId}`;
    return await this.client.patch(url, settingObject);
  }

  async getGeneratedFiltersPositions(organizationId: number, moduleId: number) {
    const url = `api/v2/organization/${organizationId}/module/${moduleId}/filter/orders`;
    return await this.client.get(url);
  }

  async deleteSelectedFilters(organizationId: number, moduleId: number, id: number) {
    const url = `api/v2/organization/${organizationId}/module/${moduleId}/filter/${id}`;
    return await this.client.delete(url);
  }

  async getTemplateList(organizationId: number) {
    const params = { ss: organizationId };
    return await this.client.get(`api/v2/filter/global`, { params });
  }

  async createFilterFromTemplate(organizationId: number, moduleId: number, templateId: number) {
    const data = { filterTemplateId: templateId };

    const url = `api/v2/organization/${organizationId}/module/${moduleId}/filter/template/${templateId}`;
    return await this.client.post(url, data);
  }

  async getSettingsDataView(
    organizationId: number,
    moduleId: number,
    moduleName: string,
    settingsId: 'filters' | 'rss' | 'terms',
    resourceId: number
  ) {
    let url;
    switch (settingsId) {
      case 'filters':
        url = `api/v2/organization/${organizationId}/module/${moduleId}/filter/${resourceId}?extraFields=true`;
        break;
      case 'rss':
        url = `api/v2/organization/${organizationId}/module/${moduleId}/${moduleName}/settings/${settingsId}/${resourceId}`;
        break;
      default:
        url = `api/v2/organization/${organizationId}/module/${moduleId}/settings/${settingsId}/${resourceId}`;
    }

    return await this.client.get(url);
  }

  async getFilterLists(organizationId: number, moduleId: number) {
    const url = `/api/v2/organization/${organizationId}/module/${moduleId}/filter/lists`;
    return await this.client.get<FilterListsResponse>(url);
  }

  async getTerms(organizationId: number, moduleId: number) {
    const url = `/api/v2/organization/${organizationId}/module/${moduleId}/settings/terms`;
    const params = { p: false };
    const response = await this.client.get<SettingsTermsResponse>(url, { params });
    return response.data;
  }

  async getAdvancedFilter(organizationId: number, moduleId: number, filterId: number) {
    const url = `/api/v2/organization/${organizationId}/module/${moduleId}/filter/${filterId}?extraFields=true`;
    const response = await this.client.get<AdvancedFilter>(url);
    return response.data;
  }

  async createAdvancedFilter(organizationId: number, moduleId: number, payload: CreateAdvancedFilterPayload) {
    const url = `/api/v2/organization/${organizationId}/module/${moduleId}/filter`;
    const response = await this.client.post<AdvancedFilter>(url, payload);
    return response.data;
  }

  async editAdvancedFilter(organizationId: number, moduleId: number, payload: AdvancedFilter) {
    const url = `/api/v2/organization/${organizationId}/module/${moduleId}/filter/${payload.id}`;
    const response = await this.client.put(url, payload);
    return response.data;
  }

  async saveAsAdvancedFilter(organizationId: number, moduleId: number, payload: SaveAsAdvancedFilterPayload) {
    const url = `/api/v2/organization/${organizationId}/module/${moduleId}/filter`;
    const response = await this.client.post(url, payload);
    return response.data;
  }

  async saveSettingsPatchByModule(
    organizationId: number,
    moduleId: number,
    moduleName: string,
    resourceId: number | string,
    settingObject,
    type
  ) {
    const url =
      type === 'rss'
        ? `api/v2/organization/${organizationId}/module/${moduleId}/${moduleName}/settings/${type}/${resourceId}`
        : `api/v2/organization/${organizationId}/module/${moduleId}/settings/${type}/${resourceId}`;
    return await this.client.patch(url, settingObject);
  }

  async deleteSettingDataParameter(organizationId: number, moduleId: number, moduleName: string, settingsId, data) {
    const url = `api/v2/organization/${organizationId}/module/${moduleId}/${moduleName}/settings`;

    const newValues = {
      values: data.values_to_delete,
      type: settingsId.toUpperCase()
    };

    return await this.client.put<GenericResponseType>(url, newValues);
  }

  async getAvailableCrawlers(organizationId: number, moduleId: number, settingsId: string) {
    const url = `api/v2/organization/${organizationId}/module/${moduleId}/settings/${settingsId}/plugins`;
    return await this.client.get(url);
  }

  async getCustomModulePlugins(organizationId: number, moduleId: number) {
    const url = `api/v2/organization/${organizationId}/module/${moduleId}/custom/plugins`;
    return await this.client.get(url);
  }

  async getSettingsDataViewImage(organizationId: number, moduleId: number, resourceId) {
    const url = `api/v2/organization/${organizationId}/module/${moduleId}/settings/image/${resourceId}`;
    return await this.client.get(url, {
      responseType: 'blob'
    });
  }

  async saveSettingsDataMultipart(
    organizationId: number,
    moduleId: number,
    settingsId: string,
    settingObject,
    imageFile = null
  ) {
    const url = `api/v2/organization/${organizationId}/module/${moduleId}/settings/${settingsId}`;
    const formData = new FormData();
    formData.append('setting', JSON.stringify(settingObject));
    if (imageFile) {
      formData.append('image', imageFile);
    }
    return await this.client.postForm(url, formData);
  }

  async saveSettingsImageMultipartPut(
    organizationId: number,
    moduleId: number,
    resourceId: number,
    imageFile: Blob | string | undefined
  ) {
    const url = `api/v2/organization/${organizationId}/module/${moduleId}/settings/image/${resourceId}`;
    const formData = new FormData();
    if (imageFile) {
      formData.append('image', imageFile);
    }
    return await this.client.putForm(url, formData);
  }

  async saveSettingsDataMultipartPut(
    organizationId: number,
    moduleId: number,
    resourceId: string | number,
    settingObject,
    imageFile = null
  ) {
    const url = `api/v2/organization/${organizationId}/module/${moduleId}/settings/image/${resourceId}`;
    const formData = new FormData();
    if (settingObject) {
      formData.append('setting', JSON.stringify(settingObject));
    }
    if (imageFile) {
      formData.append('image', imageFile);
    }
    return await this.client.putForm(url, formData);
  }

  async saveSettingsPut(
    organizationId: number,
    moduleId: number,
    moduleName: string,
    settingsId: string,
    settingObject,
    resourceId
  ) {
    const url =
      settingsId === 'rss'
        ? `api/v2/organization/${organizationId}/module/${moduleId}/${moduleName}/settings/${settingsId}/${resourceId}`
        : `api/v2/organization/${organizationId}/module/${moduleId}/settings/${settingsId}/${resourceId}`;
    return await this.client.put(url, settingObject);
  }

  async deleteSettingsImage(organizationId: number, moduleId: number, resourceId) {
    const url = `api/v2/organization/${organizationId}/module/${moduleId}/settings/image/${resourceId}`;
    return await this.client.delete(url);
  }

  async saveSettingsData(
    organizationId: number,
    moduleId: number,
    moduleName: string,
    settingsId: 'KEYWORD' | 'ALERT',
    data: unknown
  ) {
    const url = `api/v2/organization/${organizationId}/module/${moduleId}/${moduleName}/settings`;
    const newValues = {
      values: data,
      type: settingsId.toUpperCase()
    };
    return await this.client.post(url, newValues);
  }

  async saveSettingsImageMultipart(
    organizationId: number,
    moduleId: number,
    moduleName: string,
    settingObject: string,
    imageFile = null
  ) {
    const url = `api/v2/organization/${organizationId}/module/${moduleId}/${moduleName}/settings/image`;
    const formData = new FormData();
    formData.append('searchPhrase', settingObject);
    if (imageFile) {
      formData.append('image', imageFile);
    }
    return await this.client.postForm(url, formData);
  }

  async runSearch(organizationId: number, moduleId: number, id: number) {
    const url = `api/v2/organization/${organizationId}/module/${moduleId}/settings/terms/${id}/execute`;
    return this.client.get(url);
  }

  async getRss(organizationId: number, module: Module, page: number, total: number) {
    const url = `/api/v2/organization/${organizationId}/module/${module.id}/${module.moduleName}/settings/rss`;
    const params = {
      page,
      total
    };
    const response = await this.client.get<RSSResponse>(url, { params });
    return response.data;
  }

  async deleteRss(organizationId: number, module: Module, id: number) {
    const url = `/api/v2/organization/${organizationId}/module/${module.id}/${module.moduleName}/settings/rss/${id}`;
    const response = await this.client.delete<GenericResponseType>(url);
    return response.data;
  }

  async toggleRssEnable(organizationId: number, module: Module, id: number, enabled: boolean) {
    const url = `/api/v2/organization/${organizationId}/module/${module.id}/${module.moduleName}/settings/rss/${id}`;
    const data = { enabled };
    const response = await this.client.patch<GenericResponseType>(url, data);
    return response.data;
  }

  async getRssId(organizationId: number, module: Module, id: number) {
    const url = `/api/v2/organization/${organizationId}/module/${module.id}/${module.moduleName}/settings/rss/${id}`;
    const response = await this.client.get<Rss>(url);
    return response.data;
  }

  async getRssTypes(organizationId: number, module: Module) {
    const url = `/api/v2/organization/${organizationId}/module/${module.id}/${module.moduleName}/settings/rss/type`;
    const response = await this.client.get<RssType[]>(url);
    return response.data;
  }

  async createRss(organizationId: number, module: Module, payload: RssFields) {
    const url = `/api/v2/organization/${organizationId}/module/${module.id}/${module.moduleName}/settings/rss`;
    const response = await this.client.post<Rss | GenericResponseType>(url, payload);
    return response.data;
  }

  async editRss(organizationId: number, module: Module, payload: RssFields, id: number) {
    const url = `/api/v2/organization/${organizationId}/module/${module.id}/${module.moduleName}/settings/rss/${id}`;
    const response = await this.client.patch<GenericResponseType>(url, payload);
    return response.data;
  }
}
