import type Module from '$lib/types/module';
import type { ModuleModelType } from '$lib/types/module';
import { getModuleTypeName } from '$lib/utils';
import Service from '.';

export default class OrganizationService extends Service {
  async getPlugins() {
    return await this.client.get<string[]>(`api/v2/plugin/available`);
  }

  async createModule(organization: number, data: ModuleModelType): Promise<Module> {
    const response = await this.client.post<Omit<Module, 'moduleName'>>(
      `api/v2/organization/${organization}/module`,
      data
    );
    return {
      ...response.data,
      moduleName: getModuleTypeName(response.data)
    };
  }
}
