import axios from 'axios';
import { writable } from 'svelte/store';

export type LanguageType = {
  language_id: string;
  language: string;
};

function createLanguagesStore() {
  const store = writable<LanguageType[]>([]);

  async function loadLanguages() {
    const url = '/api/v2/language';
    const res = await axios.get<LanguageType[]>(url);
    if (res.status === 200) {
      store.set(res.data);
    }
  }

  return {
    ...store,
    loadLanguages
  };
}

const languagesStore = createLanguagesStore();

export default languagesStore;
