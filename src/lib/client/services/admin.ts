import type {
  AccessLogQuery,
  AccessLogResponse,
  Band,
  BlacklistResponse,
  ChartDataGenParamResponse,
  ChartDataGenResponse,
  ChartItem,
  ChartsResponse,
  ConfigurationProperty,
  ConfigurationPropertyResponse,
  Customer,
  CustomerResponse,
  CustomerType,
  FilterTemplate,
  FilterTemplateResponse,
  Grant,
  InExecutionJobResponse,
  IncidentCatalogResponse,
  Label,
  LabelResponse,
  LabelType,
  Online,
  Plugin,
  PluginResponse,
  ScheduledJobResponse,
  SearchCatalogQuery,
  SearchCustomersQuery,
  SupportedTldResponse,
  SyncClientResult,
  SystemInfo,
  UserDetail,
  UserGroup,
  UserGroupDetail,
  UserPayload,
  UserResponse,
  Version
} from '$lib/types/admin';
import type { RssTypeResponse } from '$lib/types/settings';
import type customerSchema from '$src/routes/admin/customers/customerSchema';
import type { ChartFormType } from '$src/routes/admin/charts/constants';
import notifications from '$stores/notification';
import dayjs from 'dayjs';
import type * as yup from 'yup';
import Service from '.';
import type { FilterListsResponse } from './settings';
import type { GenericResponseType } from './types';

export default class AdminService extends Service {
  async getSystemInfo() {
    const response = await this.client.get<SystemInfo>('/api/v2/admin/system_info');
    return response.data;
  }

  async getVersion() {
    const response = await this.client.get<Version>('/api/v2/admin/version');
    return response.data;
  }

  async getOnline() {
    const response = await this.client.get<Online[]>('/api/v2/user/online');
    return response.data;
  }

  async getRssType(page: number, maxRows: number, q?: string, sortKey?: string, ascending?: boolean) {
    const params: Record<string, any> = {
      p: true,
      maxRows,
      page,
      extraFields: true
    };
    if (q) {
      params.q = q;
    }
    if (sortKey) {
      params.o = sortKey;
      params.s = ascending;
    }
    const url = '/api/v2/admin/rss_feed_type';
    const response = await this.client.get<RssTypeResponse>(url, { params });
    return response.data;
  }

  async getSupportedTld(page: number, maxRows: number, q?: string, sortKey?: string, ascending?: boolean) {
    const params: Record<string, any> = {
      p: true,
      maxRows,
      page
    };
    if (q) {
      params.q = q;
    }
    if (sortKey) {
      params.o = sortKey;
      params.sort = ascending;
    }
    const url = '/api/v2/admin/tlds';
    const response = await this.client.get<SupportedTldResponse>(url, { params });
    return response.data;
  }

  async syncOrg(orgId: number, customerId: number): Promise<SyncClientResult> {
    const response = await this.client.get<SyncClientResult>(
      `/api/v2/admin/customer/${customerId}/organization/${orgId}/sync`
    );
    return response.data;
  }

  async getFilterTemplates(
    page: number,
    maxRows: number,
    q?: string,
    sortKey?: string,
    ascending?: boolean,
    organizationId?: number
  ) {
    const url = '/api/v2/filter';
    const params: Record<string, any> = {
      p: true,
      page,
      maxRows
    };
    if (q) {
      params.q = q;
    }
    if (sortKey) {
      params.o = sortKey;
      params.sort = ascending;
    }
    if (organizationId) {
      params.ss = organizationId;
    }
    const response = await this.client.get<FilterTemplateResponse>(url, { params });
    return response.data;
  }

  async saveFilterTemplate(payload: Partial<FilterTemplate>) {
    const url = '/api/v2/filter';
    if (payload.id) {
      const response = await this.client.put<GenericResponseType>(url, payload);
      return response.data;
    }
    const response = await this.client.post<GenericResponseType>(url, payload);
    return response.data;
  }

  async getFilterTemplate(filterId: number) {
    const url = `/api/v2/filter/${filterId}`;
    const response = await this.client.get<FilterTemplate>(url);
    return response.data;
  }

  async deleteFilterTemplate(filterId: number) {
    const url = `/api/v2/filter/${filterId}`;
    const response = await this.client.delete<GenericResponseType>(url);
    return response.data;
  }

  async getFilterLists() {
    const url = '/api/v2/filter/lists';
    const response = await this.client.get<FilterListsResponse>(url);
    return response.data;
  }

  // Charts

  async getCharts(
    page: number,
    maxRows: number,
    search: string,
    sortKey: string,
    ascending: boolean,
    organizationId: number,
    moduleId: number
  ) {
    const params: Record<string, any> = {
      p: true,
      page,
      maxRows
    };
    if (sortKey) {
      params.o = sortKey;
      params.s = ascending;
    }
    if (search) {
      params.q = search;
    }
    if (organizationId) {
      params.organizationId = organizationId;
    }
    if (moduleId) {
      params.moduleId = moduleId;
    }
    const url = '/api/v2/chart/admin/charts';
    const response = await this.client.get<ChartsResponse>(url, { params });
    return response.data;
  }

  async getChart(chartId: number) {
    const url = `/api/v2/chart/admin/charts/${chartId}`;
    const response = await this.client.get<ChartItem>(url);
    return response.data;
  }

  async getChartDatagen() {
    const url = '/api/v2/chart/admin/datagen';
    const response = await this.client.get<ChartDataGenResponse>(url);
    return response.data;
  }

  async getChartDatagenParams(dategenId: number) {
    const url = `/api/v2/chart/admin/datagen/${dategenId}/params`;
    const response = await this.client.get<ChartDataGenParamResponse[]>(url);
    return response.data;
  }

  async deleteChart(chartId: number) {
    const url = `/api/v2/chart/admin/charts/${chartId}`;
    const response = await this.client.delete(url);
    return response.data;
  }

  async saveChart(form: ChartFormType) {
    const data: Record<string, any> = { ...form };
    if (data.organizationId === -1) {
      delete data.organizationId;
      delete data.moduleId;
    } else {
      data.type = 0;
    }
    data.private = form.isPrivate;
    delete data.isPrivate;

    if (form.id) {
      const url = `/api/v2/chart/admin/charts/${form.id}`;
      const response = await this.client.put(url, data);
      return response.data;
    } else {
      const url = '/api/v2/chart/admin/charts';
      const response = await this.client.post(url, data);
      return response.data;
    }
  }

  async getUsers(page: number, maxRows: number, q?: string, sortKey?: string, ascending?: boolean) {
    const params: Record<string, any> = {
      p: true,
      maxRows,
      page,
      extraFields: true
    };
    if (q) {
      params.q = q;
    }
    if (sortKey) {
      params.o = sortKey;
      params.s = ascending;
    }
    const url = '/api/v2/user';
    const response = await this.client.get<UserResponse>(url, { params });
    return response.data;
  }

  async saveUser(userPayload: UserPayload) {
    if (userPayload.id) {
      const url = `/api/v2/user/${userPayload.id}`;
      const grantUrl = `/api/v2/user/${userPayload.id}/grant`;
      await this.client.put(url, userPayload);
      await this.client.put(grantUrl, userPayload.grants);
    } else {
      const url = '/api/v2/user';
      await this.client.post(url, userPayload);
    }
  }
  async saveUserGrantsForOrg(userId: number, grants: Grant) {
    const url = `/api/v2/user/${userId}/grant`;
    await this.client.put(url, grants);
  }
  async getUserGrants(id: number) {
    const url = `/api/v2/user/${id}/grant`;
    const response = await this.client.get<Grant>(url);
    return response.data;
  }

  async getGrantsByOrgId(orgId: number) {
    const url = `/api/v2/organization/${orgId}/grant`;
    const response = await this.client.get<Grant[]>(url);
    return response.data;
  }

  async changeUserStatus(userId: number, enabled: boolean) {
    const url = `/api/v2/user/${userId}/enable/${enabled}`;
    const response = await this.client.put<GenericResponseType>(url);
    return response.data;
  }

  async disable2FA(userId: number) {
    const url = `/api/v2/user/${userId}/disable2FA`;
    const response = await this.client.put(url);
    return response.data;
  }

  async getUser(userId: number) {
    const url = `/api/v2/user/${userId}`;
    const response = await this.client.get<UserDetail>(url);
    return response.data;
  }

  async deleteUser(userId: number) {
    const url = `/api/v2/user/${userId}`;
    const response = await this.client.delete(url);
    return response.data;
  }

  async changePassword(userId: number, password: string) {
    const url = `/api/v2/user/${userId}/changepwd`;
    const response = await this.client.put(url, { newPassword: password });
    return response.data;
  }

  // User group

  async getGroups() {
    const url = '/api/v2/user/groups';
    const response = await this.client.get<UserGroup[]>(url);
    return response.data;
  }

  async getGroup(groupId: number) {
    const url = `/api/v2/user/groups/${groupId}`;
    const response = await this.client.get<UserGroupDetail>(url);
    return response.data;
  }

  async createGroup(name: string, users: number[]) {
    const url = '/api/v2/user/groups';
    const payload = {
      id: '',
      name,
      users
    };
    const response = await this.client.post<UserGroupDetail>(url, payload);
    return response.data;
  }

  async editGroup(id: number, name: string, users: number[]) {
    const url = `/api/v2/user/groups/${id}`;
    const payload = {
      id,
      name,
      users
    };
    const response = await this.client.put<GenericResponseType>(url, payload);
    return response.data;
  }

  async deleteGroup(id: number) {
    const url = `/api/v2/user/groups/${id}`;
    const response = await this.client.delete<GenericResponseType>(url);
    return response.data;
  }

  // Configuration property

  async getConfigurationProperties(page: number, maxRows: number, q?: string, sortKey?: string, ascending?: boolean) {
    const params: Record<string, any> = {
      p: true,
      maxRows,
      page,
      extraFields: true
    };
    if (q) {
      params.q = q;
    }
    if (sortKey) {
      params.o = sortKey;
      params.sort = ascending;
    }
    const url = '/api/v2/configurationProperties';
    const response = await this.client.get<ConfigurationPropertyResponse>(url, { params });
    return response.data;
  }

  async getConfigurationKeys() {
    const url = '/api/v2/configurationProperties/keys';
    const response = await this.client.get<{ ok: string; keys: string[] }>(url);
    return response.data;
  }

  async editConfiguration(configurationId: number, key: string, value: string) {
    const url = `/api/v2/configurationProperties/${configurationId}`;
    const payload = {
      name: key,
      value
    };
    const response = await this.client.put<ConfigurationProperty | GenericResponseType>(url, payload);
    return response.data;
  }

  async saveConfiguration(key: string, value: string) {
    const url = '/api/v2/configurationProperties';
    const payload = {
      name: key,
      value
    };
    const response = await this.client.post<ConfigurationProperty | GenericResponseType>(url, payload);
    return response.data;
  }

  async deleteConfiguration(configurationId: number) {
    const url = `/api/v2/configurationProperties/${configurationId}`;
    const response = await this.client.delete(url);
    return response.data;
  }

  async deleteConfigurations(configurationId: number[]) {
    const url = '/api/v2/configurationProperties/multiple';
    const response = await this.client.put<{ errorsIds: number[]; deletedIds: number[] }>(url, configurationId);
    return response.data;
  }

  async getBlacklist(page: number, maxRows: number, sortKey: string, ascending: boolean, organizationId: number) {
    const params: Record<string, any> = {
      p: true,
      page,
      maxRows
    };
    if (sortKey) {
      params.o = sortKey;
      params.s = ascending;
    }
    const url = `/api/v2/organization/${organizationId}/blacklist`;
    const response = await this.client.get<BlacklistResponse>(url, { params });
    return response.data;
  }
  async editBlacklist(blacklistId: number, newUrl: string, orgId: number) {
    const url = `/api/v2/organization/${orgId}/blacklist/${blacklistId}`;
    const payload = {
      url: newUrl
    };
    const response = await this.client.put<GenericResponseType>(url, payload);
    return response.data;
  }
  async addBlacklist(newUrl: string, orgId: number) {
    const url = `/api/v2/organization/${orgId}/blacklist`;
    const payload = {
      url: newUrl
    };
    const response = await this.client.post<GenericResponseType>(url, payload);
    return response.data;
  }
  async deleteBlacklist(blacklistId: number, orgId: number) {
    const url = `/api/v2/organization/${orgId}/blacklist/${blacklistId}`;
    const response = await this.client.delete<GenericResponseType>(url);
    return response.data;
  }
  // Label

  async getLabels(
    page: number,
    maxRows: number,
    search: string,
    sortKey: string,
    ascending: boolean,
    organizationId: number,
    moduleId: number
  ) {
    const params: Record<string, any> = {
      p: true,
      page,
      maxRows
    };
    if (sortKey) {
      params.o = sortKey;
      params.s = ascending;
    }
    if (search) {
      params.q = search;
    }
    if (organizationId) {
      params.ss = organizationId;
    }
    if (moduleId) {
      params.rs = moduleId;
    }
    const url = '/api/v2/label';
    const response = await this.client.get<LabelResponse>(url, { params });
    return response.data;
  }

  async deleteLabel(labelId: number) {
    const url = `/api/v2/label/${labelId}`;
    const response = await this.client.delete<GenericResponseType>(url);
    return response.data;
  }

  async createLabel(label: Partial<Label>) {
    const url = '/api/v2/label';
    const response = await this.client.post<Label>(url, label);
    return response.data;
  }

  async editLabel(label: Partial<Label>) {
    const url = `/api/v2/label/${label.id}`;
    const response = await this.client.put<Label>(url, label);
    return response.data;
  }

  // Label type

  async getLabelTypes() {
    const url = '/api/v2/label/type';
    const response = await this.client.get<LabelType[]>(url);
    return response.data;
  }

  async createLabelType(name: string) {
    const url = '/api/v2/label/type';
    const response = await this.client.post<LabelType>(url, { name });
    return response.data;
  }

  async editLabelType(id: number, name: string) {
    const url = `/api/v2/label/type/${id}`;
    const response = await this.client.put<LabelType>(url, { id, name });
    return response.data;
  }

  async deleteLabelType(id: number) {
    const url = `/api/v2/label/type/${id}`;
    const response = await this.client.delete<GenericResponseType>(url);
    return response.data;
  }

  // Plugins

  async getPlugins(page: number, maxRows: number, search: string, sortKey: string, ascending: boolean) {
    const params: Record<string, any> = {
      p: true,
      page,
      maxRows
    };
    if (search) {
      params.q = search;
    }
    if (sortKey) {
      params.o = sortKey;
      params.sort = ascending;
    }
    const response = await this.client.get<PluginResponse>('/api/v2/plugin', { params });
    return response.data;
  }

  async getPluginTypes() {
    const response = await this.client.get<string[]>('/api/v2/plugin/type');
    return response.data;
  }

  async getPluginLanguages() {
    const response = await this.client.get<string[]>('/api/v2/plugin/language');
    return response.data;
  }

  async getPlugin(name: string) {
    const response = await this.client.get<Plugin>(`/api/v2/plugin/${name}`);
    return response.data;
  }

  async createPlugin(data: Partial<Plugin>) {
    const response = await this.client.post<GenericResponseType>('/api/v2/plugin', data);
    return response.data;
  }

  async editPlugin(data: Partial<Plugin>) {
    const response = await this.client.put<GenericResponseType>('/api/v2/plugin', data);
    return response.data;
  }

  async deletePlugin(name: string) {
    const response = await this.client.delete<GenericResponseType>(`/api/v2/plugin/${name}`);
    return response.data;
  }

  async toggleEnablePlugin(name: string) {
    const response = await this.client.patch<GenericResponseType>(`/api/v2/plugin/changeStatus/${name}`, {});
    return response.data;
  }

  async getLogs(query: AccessLogQuery) {
    const url = '/api/v2/admin/logs';
    const response = await this.client.get<AccessLogResponse>(url, { params: query });
    return response.data;
  }

  async getJobsInExecution(page: number, maxRows: number, search: string, sortKey: string, ascending: boolean) {
    const url = '/api/v2/jobs/inexecution';
    const params: Record<string, any> = {
      p: true,
      page,
      maxRows
    };
    if (sortKey) {
      params.o = sortKey;
      params.sort = ascending;
    }
    if (search) {
      params.q = search;
    }
    const response = await this.client.get<InExecutionJobResponse>(url, { params });
    return response.data;
  }

  async getJobsScheduled(page: number, maxRows: number, search: string, sortKey: string, ascending: boolean) {
    const url = '/api/v2/jobs/scheduled';
    const params: Record<string, any> = {
      p: true,
      page,
      maxRows
    };
    if (sortKey) {
      params.o = sortKey;
      params.sort = ascending;
    }
    if (search) {
      params.q = search;
    }
    const response = await this.client.get<ScheduledJobResponse>(url, { params });
    return response.data;
  }

  async getAllIndicentCatalogs() {
    const payload = {
      apiId: 'CATALOG',
      url: '/api/catalogs/search?p=false',
      consume: 'APPLICATION_JSON',
      requestType: 'POST',
      entity: {
        customerId: null
      }
    };
    const response = await this.client.post<IncidentCatalogResponse>('/api/v2/gateway', payload);
    return response.data;
  }

  async getIncidentCatalogs(query: SearchCatalogQuery) {
    const params: Record<string, any> = {
      p: 'true',
      page: query.page,
      size: query.maxRows
    };
    if (query.sortKey && query.sortDirection) {
      params.sort = `${query.sortKey},${query.sortDirection === 'ascending' ? 'ASC' : 'DESC'}`;
    }
    const searchParams = new URLSearchParams(params);

    const payload: any = {
      apiId: 'CATALOG',
      url: `/api/catalogs/search?${searchParams}`,
      consume: 'APPLICATION_JSON',
      requestType: 'POST',
      entity: {
        customerId: query.customerId || null
      }
    };

    if (query.search) {
      payload.entity.name = query.search;
    }

    const response = await this.client.post<IncidentCatalogResponse>('/api/v2/gateway', payload);
    return response.data;
  }

  uploadCatalog(name: string, customerId: number, file: File) {
    const data = new FormData();
    const options = {
      apiId: 'CATALOG',
      url: '/api/catalogs/upload',
      requestType: 'POST',
      consume: 'MULTIPART_FORM_DATA',
      entity: {
        customerId,
        name
      }
    };
    data.append('file', file, name);
    data.append('api', JSON.stringify(options));
    return this.client.postForm('/api/v2/gateway/form', data);
  }

  async downloadCatalog(catalogId: number) {
    const payload = {
      apiId: 'CATALOG',
      url: `/api/catalogs/download/${catalogId}`,
      requestType: 'GET'
    };

    const response = await this.client.post<Blob>('/api/v2/gateway', payload, { responseType: 'blob' });
    return response.data;
  }

  async deleteCatalog(catalogId: number) {
    const payload = {
      apiId: 'CATALOG',
      url: `/api/catalogs/${catalogId}`,
      requestType: 'DELETE',
      entity: {}
    };

    const response = await this.client.post('/api/v2/gateway', payload);
    return response.data;
  }

  async updateOrganizationCatalog(organizationId: number, catalogId: number) {
    const url = `/api/v2/organization/${organizationId}/catalog?catalogId=${catalogId}`;
    const payload = {
      catalogId
    };
    const response = await this.client.put<GenericResponseType>(url, payload);
    return response.data;
  }
  async toggleOrganizationStatus(orgId: number, status: boolean) {
    const url = `/api/v2/organization/${orgId}`;
    const payload = {
      enabled: status
    };
    const response = await this.client.patch<GenericResponseType>(url, payload);
    return response.data;
  }

  async getCustomers(query: SearchCustomersQuery) {
    const params: Record<string, any> = {
      p: 'true',
      page: query.page,
      size: query.maxRows
    };
    if (query.sortKey && query.sortDirection) {
      params.sort = `${query.sortKey},${query.sortDirection === 'ascending' ? 'ASC' : 'DESC'}`;
    }
    if (query.search) {
      params.q = query.search;
    }
    const searchParams = new URLSearchParams(params);

    const payload: any = {
      apiId: 'CUSTOMER',
      url: `/api/customers/search?${searchParams}`,
      consume: 'APPLICATION_JSON',
      requestType: 'POST',
      entity: {
        customerId: null
      }
    };

    if (query.search) {
      payload.entity.name = query.search;
    }

    const response = await this.client.post<CustomerResponse>('/api/v2/gateway', payload);
    return response.data;
  }

  async getCustomer(customerId: number) {
    const payload = {
      apiId: 'CUSTOMER',
      url: `/api/customers/${customerId}`,
      requestType: 'GET'
    };
    const response = await this.client.post<Customer>('/api/v2/gateway', payload);
    return response.data;
  }

  deleteCustomer(customerId: number) {
    const payload = {
      apiId: 'CUSTOMER',
      url: `/api/customers/${customerId}`,
      requestType: 'DELETE',
      entity: {}
    };
    return this.client.post('/api/v2/gateway', payload);
  }

  async getCustomerTypes() {
    const payload = {
      apiId: 'CUSTOMER',
      url: '/api/customers/type',
      requestType: 'GET'
    };

    const response = await this.client.post<CustomerType[]>('/api/v2/gateway', payload);
    return response.data;
  }

  async getCustomerBands() {
    const payload = {
      apiId: 'CUSTOMER',
      url: '/api/bands/',
      requestType: 'GET'
    };

    const response = await this.client.post<Band[]>('/api/v2/gateway', payload);
    return response.data;
  }

  async saveCustomer(
    customerId: number,
    form: yup.InferType<typeof customerSchema>,
    customBand: Band,
    changedInvoices: Record<number, boolean>
  ) {
    // SAVE CUSTOMER
    const url = customerId ? `/api/customers/${customerId}` : '/api/customers';
    const requestType = customerId ? 'PUT' : 'POST';

    const payload = {
      apiId: 'CUSTOMER',
      url,
      consume: 'APPLICATION_JSON',
      requestType,
      entity: {
        active: form.active,
        enforcing: form.enforcing,
        customerTypeId: form.customerTypeId,
        name: form.name
      }
    };
    const response = await this.client.post<Customer>('/api/v2/gateway', payload);
    customerId = response.data.id;

    // SAVE INVOICE CHANGES
    const promises = Object.entries(changedInvoices).map(([moduleId, invoicing]) => {
      const payloadInvoice = {
        apiId: 'CUSTOMER',
        url: `/api/customer/${customerId}/modules/${moduleId}/invoicing`,
        consume: 'APPLICATION_JSON',
        requestType: 'PATCH',
        entity: {
          invoicing
        }
      };
      return this.client.post('/api/v2/gateway', payloadInvoice);
    });

    const results = await Promise.allSettled(promises);
    const someError = results.some((result) => result.status === 'rejected');
    if (someError) {
      notifications.notify({
        kind: 'error',
        title: 'Error',
        subtitle: 'There was a problem while editing the invoicing for some of the modules, please try again later'
      });
    }

    // SAVE CONTRACT
    const contractUrl = `/api/customers/${customerId}/contract`;

    const payloadContract = {
      apiId: 'CUSTOMER',
      url: contractUrl,
      consume: 'APPLICATION_JSON',
      requestType,
      entity: {
        bandId: form.bandId,
        bandValues: customBand?.bandValues ?? null,
        contractsModules: form.moduleTypes.map((moduleType) => ({ moduleType })),
        startAt: dayjs(form.startAt).format('YYYY-MM-DD'),
        endAt: dayjs(form.endAt).format('YYYY-MM-DD'),
        isBincodes: form.isBincodes
      }
    };
    await this.client.post('/api/v2/gateway', payloadContract);
  }
}
