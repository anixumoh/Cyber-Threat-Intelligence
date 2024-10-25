import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { HttpUtilsService, host, path } from 'app/services/http-utils.service';
import { ModuleSettingsService } from 'app/dashboard/module-sections/modulesettings/module-settings.service';
import { OrganizationService } from 'app/dashboard/organization/organization.service';

@Injectable()
export class ModuleSettingsDetailService {
  activeOrganization: any;
  activeModule: any;
  modules;
  statefeeds;
  searchTerm = null;

  constructor(
    private httpUtils: HttpUtilsService,
    private moduleSettings: ModuleSettingsService,
    private organizationService: OrganizationService,
    private toastrService: ToastrService
  ) {
    this.organizationService.getCurrentContext().subscribe((context) => {
      this.activeModule = context.currentModule;
      this.activeOrganization = context.currentOrganization;
    });
  }

  getParameterData(settingId): Observable<any> {
    let url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}`;
    url = url + `/${this.activeModule.moduleName}/settings/${settingId}`;
    return this.httpUtils.get(url);
  }

  getSettingsData(settingId, page, maxRows, advancedFilters?) {
    let data;
    let url;
    const moduleType = this.moduleSettings.settings[this.activeModule.moduleName];
    const pagination = `page=${page}&total=${maxRows}`;
    const params = this.searchTerm ? `&q=${this.searchTerm}` : '';
    url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}`;

    if (moduleType) {
      data = moduleType.find((o) => {
        return o.id === settingId;
      });
    }

    if (settingId === 'filters') {
      url = url + `/filter?${pagination}${params}`;
    } else if (settingId === 'classification') {
      url = url + `/${this.activeModule.moduleName}/${settingId}`;
    } else {
      if (settingId === 'typo_keyword_distance') {
        settingId = settingId.toUpperCase();
        url = url + `/${this.activeModule.moduleName}/settings/${settingId}?${pagination}`;
      } else if (settingId === 'terms') {
        url = advancedFilters
          ? url + `/settings/${settingId}?p=false`
          : url + `/settings/${settingId}?${pagination}${params}`;
      } else {
        url = url + `/${this.activeModule.moduleName}/settings/${settingId}?${pagination}`;
      }
    }

    return this.httpUtils.get(url).pipe(
      map((res: any) => {
        if (settingId === 'classification' && data) {
          data.values = [res];
        } else if (data) {
          data.values = Array.isArray(res.values)
            ? res.values
            : (() => {
                let tempArray = [];
                for (const p in res.values) {
                  if (Array.isArray(res.values[p])) {
                    tempArray = tempArray.concat(res.values[p]);
                  }
                }
                return tempArray;
              })();
          data.totalResources = res.total ? res.total : '';
        }
        return data;
      })
    );
  }

  saveSettingsData(settingsId, data): Observable<any> {
    const url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/${this.activeModule.moduleName}/settings`;
    const newValues = {
      values: data.values_to_add,
      type: settingsId.toUpperCase()
    };
    return this.httpUtils.post(url, newValues);
  }

  saveSettingsDataParameter(settingsId, data) {
    const url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/${this.activeModule.moduleName}/settings`;
    const newValues = {
      values: data.values_to_add,
      type: settingsId.toUpperCase()
    };
    return this.httpUtils.post(url, newValues);
  }

  saveRssCategoriesSetting(settingsId, data): Observable<any> {
    const url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/${this.activeModule.moduleName}/settings`;
    return this.httpUtils.post(url, data);
  }

  saveSettingsDataObs(settingsId, data) {
    const url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/${this.activeModule.moduleName}/settings`;
    const newValues = {
      values: data.values_to_add,
      type: settingsId.toUpperCase()
    };
    return this.httpUtils.post(url, newValues);
  }

  saveFiltersData(data) {
    const url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/filter/${data.id}`;
    return this.httpUtils.put(url, data);
  }

  createFiltersData(data) {
    const url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/filter`;
    return this.httpUtils.post(url, data);
  }

  createFilterFromTemplate(templateId) {
    const data = { filterTemplateId: templateId };

    const url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/filter/template/${templateId}`;
    return this.httpUtils.post(url, data);
  }

  saveSettingsDataRssObs(settingId, data) {
    const url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/${this.activeModule.moduleName}/settings/${settingId}`;
    return this.httpUtils.post(url, data);
  }

  saveFeedSettingsDataCarding(modules, statefeeds): Observable<any> {
    const url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/${this.activeModule.moduleName}/settings`;
    const newValues = {
      values: [{ value: statefeeds.toString() }],
      type: modules.toUpperCase()
    };

    return this.httpUtils.post(url, newValues);
  }

  deleteSettingData(settingsId, data): Observable<any> {
    const url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/${this.activeModule.moduleName}/settings`;

    const newValues = {
      values: data.values_to_delete,
      type: settingsId.toUpperCase()
    };

    return this.httpUtils.put(url, newValues);
  }

  deleteSettingDataParameter(settingsId, data) {
    const url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/${this.activeModule.moduleName}/settings`;

    const newValues = {
      values: data.values_to_delete,
      type: settingsId.toUpperCase()
    };

    return this.httpUtils.put(url, newValues);
  }

  phishingDistanceDelete(settingsId, data) {
    const url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/${this.activeModule.moduleName}/settings`;

    const newValues = {
      values: data.values_to_delete,
      type: settingsId.toUpperCase()
    };

    return this.httpUtils.put(url, newValues);
  }

  phishingDistanceCreate(settingsId, data) {
    const url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/${this.activeModule.moduleName}/settings`;

    const newValues = {
      values: data.values_to_add,
      type: settingsId.toUpperCase()
    };

    return this.httpUtils.post(url, newValues);
  }

  getSettingsDataView(settingsId, resourceId) {
    let url;
    switch (settingsId) {
      case 'filters':
        url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/filter/${resourceId}`;
        break;
      case 'rss':
        url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/${this.activeModule.moduleName}/settings/${settingsId}/${resourceId}`;
        break;
      default:
        url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/settings/${settingsId}/${resourceId}`;
    }

    return this.httpUtils.get(url);
  }

  getSettingsDataViewImage(resourceId) {
    const url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/settings/image/${resourceId}`;
    return this.httpUtils.getFileImage(url);
  }

  runSearch(id) {
    const url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/settings/terms/${id}/execute`;
    return this.httpUtils.get(url);
  }

  getFilterLists() {
    const url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/filter/lists`;
    return this.httpUtils.get(url);
  }

  getTemplateList() {
    const params = new HttpParams().set('ss', this.activeOrganization.id);
    return this.httpUtils.get(`${path}/filter/global`, { params });
  }

  getTemplateDetail(id) {
    return this.httpUtils.get(`${path}/filter/${id}`);
  }

  getCountriesList() {
    const url = `${host}/v2/user/country`;
    return this.httpUtils.get(url);
  }

  sendMarketplace(data: any): Observable<any> {
    const dataToSend = {
      type: 'MARKETPLACE',
      values: data
    };
    const url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/${this.activeModule.moduleName}/settings`;

    return this.httpUtils.post(url, dataToSend);
  }

  getAvailableCrawlers(settingsId) {
    const url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/settings/${settingsId}/plugins`;
    return this.httpUtils.get(url);
  }

  getAvailableRssType(settingsId) {
    const url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/${this.activeModule.moduleName}/settings/${settingsId}/type`;
    return this.httpUtils.get(url);
  }

  getCustomModulePlugins() {
    const url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/custom/plugins`
    return this.httpUtils.get(url)
  }

  deleteSettingsDataView(settingsId, resourceId) {
    const url =
      settingsId === 'rss'
        ? `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/${this.activeModule.moduleName}/settings/${settingsId}/${resourceId}`
        : `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/settings/${settingsId}/${resourceId}`;
    return this.httpUtils.delete(url);
  }

  saveSettingsDataMultipart(settingsId, settingObject, imageFile = null) {
    const url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/settings/${settingsId}`;
    const formData = new FormData();
    formData.append('setting', JSON.stringify(settingObject));
    if (imageFile) {
      formData.append('image', imageFile);
    }
    return this.httpUtils.postMultipart(url, formData);
  }

  saveSettingsDataMultipartPut(resourceId, settingObject, imageFile) {
    const url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/settings/image/${resourceId}`;
    const formData = new FormData();
    if (settingObject) {
      formData.append('setting', JSON.stringify(settingObject));
    }
    if (imageFile) {
      formData.append('image', imageFile);
    }
    return this.httpUtils.putMultipart(url, formData);
  }

  saveSettingsPut(settingsId, resourceId, settingObject) {
    const url =
      settingsId === 'rss'
        ? `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/${this.activeModule.moduleName}/settings/${settingsId}/${resourceId}`
        : `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/settings/${settingsId}/${resourceId}`;
    return this.httpUtils.put(url, settingObject);
  }

  saveSettingsImageMultipart(resourceId, settingObject, imageFile = null) {
    const url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/${this.activeModule.moduleName}/settings/image`;
    const formData = new FormData();
    formData.append('searchPhrase', settingObject);
    if (imageFile) {
      formData.append('image', imageFile);
    }
    return this.httpUtils.postMultipart(url, formData);
  }

  saveSettingsImageMultipartPut(resourceId, imageFile) {
    const url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/settings/image/${resourceId}`;
    const formData = new FormData();
    if (imageFile) {
      formData.append('image', imageFile);
    }
    return this.httpUtils.putMultipart(url, formData);
  }

  saveSettingsPatch(settingsId, resourceId, settingObject) {
    const url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/filter/${resourceId}`;
    return this.httpUtils.patch(url, settingObject);
  }

  saveSettingsPatchByModule(settingsId, resourceId, settingObject, type) {
    const url =
      type === 'rss'
        ? `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/${this.activeModule.moduleName}/settings/${type}/${resourceId}`
        : `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/settings/${type}/${resourceId}`;
    return this.httpUtils.patch(url, settingObject);
  }

  deleteSettingsImage(resourceId) {
    const url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/settings/image/${resourceId}`;
    return this.httpUtils.delete(url);
  }

  deleteSelectedFilters(id) {
    const url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/filter/${id}`;

    return this.httpUtils.delete(url);
  }

  changeOrder(id, position) {
    const url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/filter/${id}`;
    return this.httpUtils.patch(url, { order: position });
  }

  getGeneratedFiltersPositions() {
    const url = `${path}/organization/${this.activeOrganization.id}/module/${this.activeModule.id}/filter/orders`;
    return this.httpUtils.get(url);
  }

  showError(title, body, type) {
    this.toastrService[type](body, title, {
      closeButton: true,
      timeOut: 0,
      extendedTimeOut: 0,
      enableHtml: true
    });
  }
}
