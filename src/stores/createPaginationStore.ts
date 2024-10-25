import { isEqual } from 'lodash';
import { tick } from 'svelte';
import { derived, get, writable } from 'svelte/store';

export enum PaginationStatus {
  IDLE,
  LOADING,
  ERROR,
  SUCCESS
}

function createPaginationStore<TForm extends { page: number }, TResult>(
  getData: (form: TForm) => Promise<TResult>,
  getTotalPages: (results: TResult, filters: TForm) => number
) {
  type PageCache = Record<number, { result: TResult; status: PaginationStatus }>;

  const paginationPage = writable<number>(1);
  const paginationForm = writable<TForm>();
  const pageCacheStore = writable<PageCache>({});
  const paginationStatus = writable<PaginationStatus>(PaginationStatus.IDLE);

  const paginationResult = derived<[typeof paginationForm, typeof pageCacheStore], TResult>(
    [paginationForm, pageCacheStore],
    ([$paginationFormStore, $pageCacheStore], set) => {
      if (!$paginationFormStore) return;

      paginationStatus.set(PaginationStatus.LOADING);

      fetchPage($paginationFormStore, $paginationFormStore.page, $pageCacheStore)
        .then(async ({ result, status }) => {
          paginationStatus.set(status);
          if (status === PaginationStatus.SUCCESS) {
            set(result);
            const totalPages = getTotalPages(result, $paginationFormStore);
            if ($paginationFormStore.page < totalPages) {
              await fetchPage($paginationFormStore, $paginationFormStore.page + 1, $pageCacheStore);
            }
            if ($paginationFormStore.page > 1) {
              await fetchPage($paginationFormStore, $paginationFormStore.page - 1, $pageCacheStore);
            }
          }
        })
        .catch(() => paginationStatus.set(PaginationStatus.ERROR));
    }
  );

  async function fetchPage(form: TForm, page: number, cache: PageCache) {
    await tick();
    if (cache[page]) return cache[page];

    pageCacheStore.update((cache) => {
      cache[page] = { status: PaginationStatus.LOADING, result: null };
      return cache;
    });
    try {
      const result = await getData({ ...form, page });
      pageCacheStore.update((cache) => {
        cache[page] = { status: PaginationStatus.SUCCESS, result: result };
        return cache;
      });
      return cache[page];
    } catch (error) {
      pageCacheStore.update((cache) => {
        cache[page] = { status: PaginationStatus.ERROR, result: null };
        return cache;
      });
      return { status: PaginationStatus.ERROR, result: null };
    }
  }

  function setForm(form: TForm, force: boolean = false) {
    let formChanged = false;
    paginationForm.update(($form) => {
      const formBefore = { ...$form, page: 1 };
      const formAfter = { ...form, page: 1 };
      if (!isEqual(formBefore, formAfter)) {
        formChanged = true;
        return formAfter;
      }
      return form;
    });
    if (formChanged) {
      pageCacheStore.set({});
      paginationPage.set(1);
    } else if (force) {
      pageCacheStore.update((cache) => {
        delete cache[form.page];
        return cache;
      });
    }
  }

  function getPageResult(page: number) {
    return get(pageCacheStore)?.[page]?.result;
  }

  const paginationTotalPages = derived([paginationResult, paginationForm], ([$results, $paginationForm]) =>
    getTotalPages($results, $paginationForm)
  );

  function updatePageResult(page: number, updaterFn: (res: TResult) => TResult) {
    pageCacheStore.update((cache) => {
      cache[page].result = updaterFn(cache[page].result);
      return cache;
    });
  }

  return {
    setForm,
    getPageResult,
    paginationPage,
    paginationStatus,
    paginationForm,
    paginationTotalPages,
    paginationResult,
    updatePageResult
  };
}

export default createPaginationStore;
