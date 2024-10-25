<script lang="ts">
  import { page } from '$app/stores';
  import { getHumanReadableDate } from '$lib/utils/functions';
  import EmptyData from '$lib/components/EmptyData/EmptyData.svelte';
  import { currentModuleId } from '$stores/module';
  import { currentOrganizationId } from '$stores/organization';
  import { Button, InlineLoading, Modal, ProgressBar, SkeletonPlaceholder, Tag } from 'carbon-components-svelte';
  import { SEARCH_KEY, SORT_KEY } from './constants';
  import { detailResultStore, searchResults, searchWordStore } from './store';
  import ResponsivePageNavigation from '$lib/components/ResponsivePageNavigation.svelte';
  import { onMount } from 'svelte';
  import { Filter, Misuse, SubtractAlt, Time } from 'carbon-icons-svelte';
  import { getSearchUrl, validateSortKey } from './utils';

  const MAX_RANK_ITEMS = 15;
  const pageSize = 10;

  let p = 1;
  let screenshot: string;
  let screenshotModalOpen = false;

  onMount(() => {
    const initialSearch = $page.url.searchParams.get(SEARCH_KEY) ?? '';
    const initialSort = validateSortKey($page.url.searchParams.get(SORT_KEY));
    if (initialSearch) {
      searchWordStore.search({
        searchWord: initialSearch,
        page: 1,
        sort: initialSort
      });
    }
  });

  $: numPages = Math.ceil(($searchResults?.result?.numFound ?? 0) / pageSize);
  $: searchWord = $page.url.searchParams.get(SEARCH_KEY) ?? $searchWordStore.searchWord ?? '';
  $: onChangePage(p);

  function onChangePage(p: number) {
    searchWordStore.search({ ...$searchWordStore, page: p });
  }

  function getDetailUrl(hash: string, searchWord: string, orgId: number, moduleId: number) {
    const params = new URLSearchParams({
      [SEARCH_KEY]: searchWord,
      [SORT_KEY]: validateSortKey($searchWordStore.sort)
    });
    return `/dashboard/organizations/${orgId}/modules/${moduleId}/search/resource/${hash}?${params}`;
  }

  function getAddFilterUrl(direction: string) {
    const searchWord = `site_readable: ${direction} AND ${$searchWordStore.searchWord}`;
    const url = getSearchUrl(searchWord, $searchWordStore.sort, $currentOrganizationId, $currentModuleId);
    return url;
  }

  function getRemoveFilterUrl(direction: string) {
    const searchWord = `${$searchWordStore.searchWord} NOT site_readable: ${direction} AND `;
    const url = getSearchUrl(searchWord, $searchWordStore.sort, $currentOrganizationId, $currentModuleId);
    return url;
  }

  function setModalScreenshot(src: string) {
    screenshot = src;
    screenshotModalOpen = true;
  }
</script>

{#if $searchResults.loading}
  <InlineLoading class="flex justify-center" />
{:else if $searchResults.result?.numFound === 0}
  <EmptyData messageObj={{ msg: 'There are no results' }} />
{:else if $searchResults.result}
  <div>
    <span class="text-base"> Search results </span>
    <Tag type="high-contrast">
      {$searchResults.result.numFound}
    </Tag>
  </div>

  <hr />

  <div class="grid lg:grid-cols-[1fr_minmax(250px,350px)]">
    <div class="mb-2">
      {#each $searchResults.result.docs as doc}
        <article class="flex py-2 mx-2 my-2 border-b border-gray-300 border-solid">
          <div class="mr-2">
            <div class="w-52 h-52 p-2 border-[1px] border-solid border-gray-300">
              {#if $detailResultStore[doc.url_hash]?.error}
                <a
                  title="Could not load resource"
                  href={getDetailUrl(doc.url_hash, searchWord, $currentOrganizationId, $currentModuleId)}
                >
                  <div class="flex items-center justify-center w-full h-full text-center bg-gray-300">
                    <Misuse />
                  </div>
                </a>
              {:else if $detailResultStore[doc.url_hash]?.result?.screenshot}
                <Button
                  on:click={() => setModalScreenshot($detailResultStore[doc.url_hash].result.screenshot)}
                  title="Click to expand"
                  kind="ghost"
                  class="w-full h-full"
                >
                  <img
                    title="Click to expand"
                    alt={$detailResultStore[doc.url_hash].result.title}
                    class="object-cover w-full h-full"
                    src="data:image/png;base64,{$detailResultStore[doc.url_hash].result.screenshot}"
                  />
                </Button>
              {:else}
                <SkeletonPlaceholder class="w-full h-full" />
              {/if}
            </div>
          </div>
          <div class="grid">
            <div title={doc.title} class="overflow-hidden text-xl whitespace-nowrap text-ellipsis">
              <a href={getDetailUrl(doc.url_hash, searchWord, $currentOrganizationId, $currentModuleId)}>
                {doc.title ?? '-'}
              </a>
            </div>

            <span title={doc.url} class="overflow-hidden text-ctip-secondary whitespace-nowrap text-ellipsis">
              {doc.url}
            </span>

            <div class="overflow-x-auto whitespace-nowrap">
              {#if doc.tags && doc.tags.length > 0}
                {#each doc.tags as tag}
                  <Tag>{tag}</Tag>
                {/each}
              {/if}
            </div>

            <p class="search-item-description" title={doc.hl}>
              {@html doc.hl}
            </p>

            <div class="flex items-center gap-1 text-ctip-secondary">
              <Time />
              <div>
                {getHumanReadableDate(doc.last_update_timestamp || doc.updated_at)}
              </div>
            </div>
          </div>
        </article>
      {/each}
      <ResponsivePageNavigation bind:page={p} total={numPages} />
    </div>

    <div class="p-4 bg-ctip-ui h-fit">
      {#each $searchResults.result.rank.slice(0, MAX_RANK_ITEMS) as [_, name, num]}
        {@const progress = Math.round((num / $searchResults.result.numFound) * 100)}
        <div class="py-2 border-b border-gray-300 border-solid">
          <div class="flex justify-between">
            <div class="pr-4 overflow-hidden whitespace-nowrap text-ellipsis" title={name}>
              {name}
            </div>
            <div>
              ({num})
            </div>
          </div>
          <ProgressBar value={progress} />
          <div class="flex justify-between">
            <div>
              {progress}%
            </div>
            <div class="flex gap-4">
              {#if $searchResults.result.rank.length !== 1}
                <Button data-text="subtract" class="px-2" size="small" kind="ghost" href={getRemoveFilterUrl(name)}>
                  <SubtractAlt />
                </Button>
                <Button data-text="filter" class="px-2" size="small" kind="ghost" href={getAddFilterUrl(name)}>
                  <Filter />
                </Button>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}

<Modal
  on:click:button--primary={() => (screenshotModalOpen = false)}
  primaryButtonText="Close"
  bind:open={screenshotModalOpen}
  modalHeading="Screenshot"
  size="lg"
  hasScrollingContent
>
  {#if screenshot}
    <img class="w-full" alt="Screenshot" src="data:image/png;base64,{screenshot}" />
  {/if}
</Modal>

<style>
  .search-item-description {
    display: -webkit-box;
    line-height: 20px;
    height: 60px;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
