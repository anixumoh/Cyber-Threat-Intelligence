import type Module from '$lib/types/module';
import { derived, writable } from 'svelte/store';
import axios from 'axios';
import { getModuleTypeName } from '$lib/utils/index';
import { currentOrganizationId } from './organization';

export type ModuleCache = {
  [organizationId: number]: Module[];
};

function createModuleCacheStore() {
  const store = writable<ModuleCache>({});

  async function reset(event: CustomEvent) {
    const orgId: number = event.detail;
    await fetchModules(orgId);
  }

  async function fetchModules(orgId: number) {
    try {
      store.update((dict) => {
        dict[orgId] = [];
        return dict;
      });
      const url = `/api/v2/organization/${orgId}/module`;
      const res = await axios.get<Module[]>(url);
      store.update((dict) => {
        dict[orgId] = res.data.map((mod) => {
          return {
            ...mod,
            moduleName: getModuleTypeName(mod)
          };
        });
        return dict;
      });
    } catch (error) {
      store.update((dict) => {
        dict[orgId] = [];
        return dict;
      });
    }
  }

  return {
    ...store,
    fetchModules,
    reset
  };
}

export const moduleCacheStore = createModuleCacheStore();
export const currentModuleId = writable<number>();

export const modulesStore = derived(
  [moduleCacheStore, currentOrganizationId],
  ([$moduleCacheStore, $currentOrganizationId]) => $moduleCacheStore[$currentOrganizationId]
);
export const currentModule = derived(
  [modulesStore, currentModuleId],
  ([$modulesStore, $currentModuleId]) => $modulesStore?.find((mod) => mod.id === $currentModuleId)
);
export const moduleNameUrl = derived(currentModule, ($currentModule) => $currentModule?.moduleName);
