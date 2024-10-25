import Service from '.';
import type { DataToEditItemType } from '$lib/types/assets';

export default class AssetsService extends Service {
  abort() {}

  async getTotalSettings(organizationId: number, enabled: boolean | null) {
    const params = enabled !== null ? `?enabled=${enabled}` : '';
    const url = `api/v2/organization/${organizationId}/settings/analytics${params}`;
    return await this.client.get(url);
  }

  async downloadTotalSettings(organizationId: number) {
    const url = `api/v2/organization/${organizationId}/settings/analytics/export`;
    return await this.client.get(url, { responseType: 'arraybuffer' });
  }

  async getTags(organizationId: number) {
    return await this.client.get(`api/v2/organization/${organizationId}/settings/tags`);
  }

  async getSettings(organizationId: number, params: { tags?: string; modulesTypes?: string; types?: string }) {
    return await this.client.get(`api/v2/organization/${organizationId}/settings`, { params });
  }

  async deleteSetting(organizationId: number, modules: number[], settingsId: string, valuesToDelete: any) {
    const deletedValues = {
      values: valuesToDelete,
      type: settingsId.toUpperCase(),
      modules
    };
    const url = `api/v2/organization/${organizationId}/settings`;
    return await this.client.put(url, deletedValues);
  }

  async editElement(organizationId: number, data: DataToEditItemType) {
    const { wordIds, ...obj } = data;

    return await this.client.post(`api/v2/organization/${organizationId}/settings/edit`, obj);
  }

  async editTags(organizationId: number, data: DataToEditItemType) {
    const object = { wordIds: data.wordIds, tag: data.tag };
    return await this.client.post(`api/v2/organization/${organizationId}/settings/tags`, object);
  }

  async saveSettingsData(organizationId: number, obj: any) {
    const url = `api/v2/organization/${organizationId}/settings`;
    const { data: values, modules, tag, settingType } = obj;
    const newValues = {
      values,
      modules,
      tag,
      type: settingType.toUpperCase()
    };
    return await this.client.post(url, newValues);
  }

  async saveSettingsImage(organizationId: number, obj: any) {
    const url = `api/v2/organization/${organizationId}/settings/image`;

    const formData = new FormData();
    const { image, modules, searchPhrase, tag, settingType: type } = obj;
    const value = {
      type,
      modules,
      tag,
      values: searchPhrase
    } as any;
    formData.append('value', JSON.stringify(value));
    if (image) {
      formData.append('image', image);
    }
    return await this.client.postForm(url, formData);
  }
}
