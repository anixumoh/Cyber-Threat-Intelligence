import { derived, writable } from 'svelte/store';
import preferencesStore from './preferences';

function createBannerOpenStore() {
  const localStore = writable(true);

  const store = derived([preferencesStore, localStore], ([$preferences, $localStore]) => {
    // // ENG2-895
    // if (dayjs().isAfter(dayjs('2023-10-15'), 'day')) {
    //   return false;
    // }
    return $localStore && $preferences.bannerOpen !== 'closed';
  });

  function dismiss() {
    preferencesStore.update(($preferences) => {
      $preferences.bannerOpen = 'closed';
      preferencesStore.setAndSave($preferences);
      return $preferences;
    });
  }

  function close() {
    localStore.set(false);
  }

  return {
    ...store,
    close,
    dismiss
  };
}

const bannerOpenStore = createBannerOpenStore();
export default bannerOpenStore;
