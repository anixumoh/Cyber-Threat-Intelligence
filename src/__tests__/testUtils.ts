import { currentOrganizationId, organizationsStore } from '$stores/organization';
import { currentModuleId, moduleCacheStore } from '$stores/module';
import type Organization from '$lib/types/organization';
import type Module from '$lib/types/module';
import { MODULE_NAME } from '$lib/constants/modules';

export function initialize() {
  const organization: Organization = {
    id: 1,
    enabled: true,
    name: 'test-organization',
    createdAt: 0,
    industryId: 'Blueliv',
    trial: false,
    trialExpirationDate: 0,
    contact: {
      firstContact: {
        country: 'Spain',
        email: 'test@test.test',
        firstName: 'test',
        lastName: 'test'
      }
    },
    catalogId: 1,
    customerId: 1,
    enabledMfa: false,
    created_at: 0
  };

  organizationsStore.set([organization]);
  currentOrganizationId.set(1);

  const modules: Module[] = [
    {
      id: 1,
      name: MODULE_NAME.CREDENTIAL,
      shortName: MODULE_NAME.CREDENTIAL,
      type: MODULE_NAME.CREDENTIAL,
      createdAt: 0,
      demoMode: false,
      enabled: true,
      moduleName: MODULE_NAME.CREDENTIAL,
      moduleStrictTokens: []
    }
  ];

  moduleCacheStore.set({ 1: modules });
  currentModuleId.set(1);
}
