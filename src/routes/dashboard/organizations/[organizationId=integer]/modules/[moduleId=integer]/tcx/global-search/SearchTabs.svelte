<script lang="ts">
  import WarningModal from '$lib/components/CommonModal/WarningModal/WarningModal.svelte';
  import globalSearchParser from '$lib/tcx-global-search/globalSearchParser';
  import { queryToHTML } from '$lib/tcx-global-search/utils';
  import notifications from '$stores/notification';
  import preferencesStore from '$stores/preferences';
  import { Button, Modal, Tab, TabContent, Tabs, TextInput } from 'carbon-components-svelte';
  import { Filter, Save, Terminal } from 'carbon-icons-svelte';
  import AdvancedSearch from './AdvancedSearch.svelte';
  import DisplaySimpleSearchFilters from './DisplaySimpleSearchFilters.svelte';
  import SavedSearchDisplay from './SavedSearchDisplay.svelte';
  import SimpleSearch from './SimpleSearch.svelte';
  import type { TCXSearch } from './types';

  let selected = 0;
  let simpleSearch = true;
  let simpleSearchComponent: SimpleSearch;
  let advancedSearchComponent: AdvancedSearch;
  let saveSearchModalOpen = false;
  let deleteSavedSearchModalOpen = false;
  let deleteIndex: number;
  let name = '';
  let interacted = false;

  $: lastSearch = interacted && $preferencesStore.tcx_recent_searches.at(-1);

  function toggleSearch() {
    simpleSearch = !simpleSearch;
  }

  function doSearch(search: TCXSearch) {
    if (search.type === 'simple') {
      selected = 0;
      simpleSearch = true;
      simpleSearchComponent.searchSimpleSearch(search);
    } else if (search.type === 'advanced') {
      selected = 0;
      simpleSearch = false;
      advancedSearchComponent.searchAdvancedSearch(search);
    }
  }

  function openSaveSearchModal() {
    saveSearchModalOpen = true;
  }

  function saveRecentSearch() {
    if (!lastSearch) return;
    if ($preferencesStore.tcx_saved_searches.length >= 10) {
      return notifications.notify({
        kind: 'error',
        title: 'Error',
        subtitle: 'You cannot save more than 10 searches'
      });
    }

    $preferencesStore.tcx_saved_searches.push({ ...lastSearch, name });
    preferencesStore.setAndSave($preferencesStore);
    saveSearchModalOpen = false;
    selected = 2;
    name = '';
  }

  function openDeleteSavedSearch(idx: number) {
    deleteIndex = idx;
    deleteSavedSearchModalOpen = true;
  }

  function deleteSavedSearch() {
    $preferencesStore.tcx_saved_searches.splice(deleteIndex, 1);
    preferencesStore.setAndSave($preferencesStore);
    deleteSavedSearchModalOpen = false;
  }
</script>

<Tabs bind:selected>
  <Tab>New search</Tab>
  <Tab disabled={!$preferencesStore.tcx_recent_searches.length}>Recent searches</Tab>
  <Tab disabled={!$preferencesStore.tcx_saved_searches.length}>Saved searches</Tab>

  <svelte:fragment slot="content">
    <TabContent>
      <div class:hidden={!simpleSearch}>
        <SimpleSearch bind:this={simpleSearchComponent} on:search on:search={() => (interacted = true)} />
      </div>

      <div class:hidden={simpleSearch}>
        <AdvancedSearch bind:this={advancedSearchComponent} on:search on:search={() => (interacted = true)} />
      </div>

      <div class="mt-2">
        <Button on:click={toggleSearch} kind="ghost" icon={simpleSearch ? Terminal : Filter}>
          {#if simpleSearch}
            Go to advanced search
          {:else}
            Go to simple search
          {/if}
        </Button>

        <Button disabled={!lastSearch} on:click={openSaveSearchModal} icon={Save} kind="ghost">Save search</Button>
      </div>
    </TabContent>
    <TabContent class="p-0">
      <div class="grid gap-1 bg-ctip-ui p-2">
        {#each $preferencesStore.tcx_recent_searches as search}
          <SavedSearchDisplay {search} on:click={() => doSearch(search)} />
        {:else}
          <div class="p-2">No recent searches</div>
        {/each}
      </div>
    </TabContent>
    <TabContent>
      <div class="grid gap-1 bg-ctip-ui p-2">
        {#each $preferencesStore.tcx_saved_searches as search, idx}
          <SavedSearchDisplay
            isSaved
            {search}
            on:click={() => doSearch(search)}
            on:delete={() => openDeleteSavedSearch(idx)}
          />
        {:else}
          <div class="p-2">No saved searches</div>
        {/each}
      </div>
    </TabContent>
  </svelte:fragment>
</Tabs>

<Modal
  bind:open={saveSearchModalOpen}
  on:click:button--primary={saveRecentSearch}
  on:click:button--secondary={() => (saveSearchModalOpen = false)}
  modalHeading="Save recent search"
  primaryButtonText="Save"
  primaryButtonIcon={Save}
  secondaryButtonText="Close"
  primaryButtonDisabled={!name}
>
  <div class="p-4">
    <TextInput labelText="Recent search name" bind:value={name} required />

    <div class="py-4 grid gap-4">
      <h5>Search details</h5>
      {#if lastSearch.type === 'advanced'}
        <div class="flex gap-2 items-center">
          <Terminal />
          {@html queryToHTML(globalSearchParser(lastSearch.value))}
        </div>
      {:else if lastSearch.type === 'simple'}
        <DisplaySimpleSearchFilters search={lastSearch} />
      {/if}
    </div>
  </div>
</Modal>

<WarningModal
  bind:open={deleteSavedSearchModalOpen}
  modalHeading="Remove saved search"
  question="Are you sure you want to delete the selected saved search?"
  secondMessage="This action cannot be undone."
  on:submit={deleteSavedSearch}
  on:closeModal={() => (deleteSavedSearchModalOpen = false)}
/>
