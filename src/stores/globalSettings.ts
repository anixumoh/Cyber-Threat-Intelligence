import { writable } from 'svelte/store';

type ErrorInfo = {
  moduleTye: string;
  terms: string[];
  modules: number[];
  tag: string;
};

type GlobalSetting = {
  errorInfo: ErrorInfo;
  action: 'edit' | 'cancel';
};

function createGlobalSettingsStore() {
  const { subscribe, update, set } = writable<GlobalSetting>(null);

  function reset() {
    set(null);
  }

  return {
    subscribe,
    update,
    set,
    reset
  };
}

const globalSettingsStore = createGlobalSettingsStore();

export default globalSettingsStore;
