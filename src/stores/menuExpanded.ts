import { safeSendEvent } from '$lib/utils/angularCommunication';
import { get, derived } from 'svelte/store';
import preferencesStore from './preferences';

function createMenuExpandedStore() {
  const store = derived(preferencesStore, ($preferences) => {
    return $preferences.default.sidebarStatus;
  });

  async function toggle(): Promise<void> {
    preferencesStore.update(($preferences) => {
      $preferences.default.sidebarStatus = !$preferences.default.sidebarStatus;
      return $preferences;
    });
    const expanded = get(store);
    await safeSendEvent('svelte-sidebar-expand', { expanded });
  }

  return {
    ...store,
    toggle
  };
}

const menuExpandedStore = createMenuExpandedStore();
export default menuExpandedStore;
