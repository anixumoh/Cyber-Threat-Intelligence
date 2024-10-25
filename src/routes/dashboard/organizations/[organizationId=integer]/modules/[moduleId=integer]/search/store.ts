import type { DarkWebSearchDetail } from '$lib/client/services/modules';
import type { DarkWebSearch } from './types';
import Client from '$lib/client';
import { isEqual } from 'lodash';
import { get, writable } from 'svelte/store';
import { currentOrganizationId } from '$stores/organization';
import { currentModuleId } from '$stores/module';
import axios, { type CancelTokenSource } from 'axios';

type SearchForm = {
  searchWord: string;
  sort: 'desc' | 'asc';
  page: number;
};

function createSearchWordStore() {
  const client = new Client();

  const store = writable<SearchForm>({ page: 1, searchWord: '', sort: 'desc' });

  let cancelTokenSource: CancelTokenSource;

  async function search(form: SearchForm) {
    if (!form.searchWord) return;

    const lastSearch = get(store);
    if (isEqual(form, lastSearch)) return;
    store.set(form);

    cancelTokenSource?.cancel();
    cancelTokenSource = axios.CancelToken.source();

    const data = { query: form.searchWord, pageSize: 10, page: form.page, sort: `updated_at ${form.sort}` };
    searchResults.set({ loading: true });
    const response = await client.gateway.post<DarkWebSearch>('GLADOS', '/api_priority/light_search_extra', data, {
      cancelToken: cancelTokenSource.token
    });
    for (const doc of response.data.docs) {
      await detailResultStore.getDetails(doc.url_hash);
    }
    searchResults.set({ result: response.data, loading: false });
  }

  return {
    ...store,
    search
  };
}

type DetailStoreType = {
  [url_hash: string]: {
    loading: boolean;
    result?: DarkWebSearchDetail;
    error?: boolean;
  };
};

function createDetailStore() {
  const client = new Client();

  const store = writable<DetailStoreType>({});

  async function getDetails(url_hash: string) {
    const currentDetails = get(store);
    if (currentDetails[url_hash]) return;

    store.update((obj) => ({ ...obj, [url_hash]: { loading: true } }));

    try {
      const organizationId = get(currentOrganizationId);
      const moduleId = get(currentModuleId);
      const detail = await client.modules.getDarkWebDetail(organizationId, moduleId, url_hash);
      store.update((s) => ({ ...s, [url_hash]: { loading: false, result: detail } }));
    } catch (error) {
      store.update((s) => ({ ...s, [url_hash]: { loading: false, error: true } }));
    }
  }

  return {
    ...store,
    getDetails
  };
}

export const searchResults = writable<{ loading: boolean; result?: DarkWebSearch }>({ loading: false });
export const searchWordStore = createSearchWordStore();
export const detailResultStore = createDetailStore();
