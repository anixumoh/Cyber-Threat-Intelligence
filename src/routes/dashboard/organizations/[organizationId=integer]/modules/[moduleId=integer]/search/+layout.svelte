<script lang="ts">
  import { beforeNavigate, goto } from '$app/navigation';
  import { page } from '$app/stores';
  import GenericButton from '$lib/components/Buttons/GenericButton.svelte';
  import GenericSingleSelect from '$lib/components/Filter/GenericSingleSelect.svelte';
  import ModuleHeading from '$lib/components/module/ModuleHeading.svelte';
  import { currentModuleId } from '$stores/module';
  import { currentOrganizationId } from '$stores/organization';
  import { TextInput } from 'carbon-components-svelte';
  import { Search, CaretDown, CaretUp, ChevronLeft, Time } from 'carbon-icons-svelte';
  import { HASH_KEY, SEARCH_KEY, SORT_KEY } from './constants';
  import { detailResultStore, searchResults, searchWordStore } from './store';
  import SyntaxModal from './SyntaxModal.svelte';
  import { getSearchUrl, validateSortKey } from './utils';

  beforeNavigate((navigation) => {
    if (!navigation?.to?.route?.id?.includes('/search')) {
      // Delete cached search when going out of search
      searchResults.set({ loading: false, result: undefined });
      searchWordStore.update((current) => ({ ...current, searchWord: '' }));
      detailResultStore.set({});
    }
  });

  const sortOptions = [
    { text: 'Newer', value: 'desc' },
    { text: 'Older', value: 'asc' }
  ];

  let searchWord = $page.url.searchParams.get(SEARCH_KEY) ?? $searchWordStore.searchWord ?? '';
  let sort = validateSortKey($page.url.searchParams.get(SORT_KEY));
  let syntaxModalOpen = false;

  $: backUrl = $page.params[HASH_KEY]
    ? getSearchUrl(
        $page.url.searchParams.get(SEARCH_KEY),
        validateSortKey($page.url.searchParams.get(SORT_KEY)),
        $currentOrganizationId,
        $currentModuleId
      )
    : '';

  async function submitSearch() {
    const url = getSearchUrl(searchWord, sort, $currentOrganizationId, $currentModuleId);
    await goto(url);
    searchWordStore.search({ searchWord, sort, page: 1 });
  }

  async function onSortChange(e: CustomEvent) {
    sort = e.detail;
    await submitSearch();
  }
</script>

<ModuleHeading title="SEARCH">
  <svelte:fragment slot="center">
    <div class="flex">
      <form on:submit|preventDefault={submitSearch}>
        <div class="flex">
          <TextInput
            id="search-darkweb"
            class="w-80"
            size="sm"
            placeholder="Write here your search"
            bind:value={searchWord}
          />
          <GenericButton class="w-8" type="submit" kind="primary">
            <Search />
          </GenericButton>
        </div>
      </form>

      <GenericSingleSelect
        id="select-sort"
        selectedValue={sort}
        items={sortOptions}
        value="value"
        title=""
        display="text"
        customClass="text-ctip-btnLight border-ctip-border"
        on:changeSelected={onSortChange}
      >
        <svelte:fragment slot="btn">
          {#if sort === 'desc'}
            <CaretDown />
          {:else}
            <CaretUp />
          {/if}
        </svelte:fragment>

        <div slot="label" let:item class="flex items-center gap-2">
          <Time />
          {item.text}
        </div>
      </GenericSingleSelect>

      <GenericButton
        id="syntax-modal-open"
        on:click={() => (syntaxModalOpen = true)}
        class="text-ctip-text border-ctip-border"
        kind="ghost"
      >
        Syntax
      </GenericButton>
    </div>
  </svelte:fragment>

  {#if backUrl}
    <GenericButton kind="primary" href={backUrl}>
      <ChevronLeft class="mr-2" />
      Back to list
    </GenericButton>
  {/if}
</ModuleHeading>

<SyntaxModal bind:open={syntaxModalOpen} />

<slot />
