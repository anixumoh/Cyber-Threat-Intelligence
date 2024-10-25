<script lang="ts">
  import GenericButton from '$lib/components/Buttons/GenericButton.svelte';
  import globalSearchParser from '$lib/tcx-global-search/globalSearchParser';
  import { queryToHTML } from '$lib/tcx-global-search/utils';
  import { Button } from 'carbon-components-svelte';
  import { Filter, Search, Terminal, TrashCan } from 'carbon-icons-svelte';
  import { createEventDispatcher } from 'svelte';
  import DisplaySimpleSearchFilters from './DisplaySimpleSearchFilters.svelte';
  import type { TCXSearch } from './types';

  const dispatch = createEventDispatcher<{ delete: void }>();

  export let search: TCXSearch;
  export let isSaved = false;
</script>

<Button on:click icon={Search} class="max-w-full" kind="tertiary">
  <div class="flex gap-4 justify-between items-center w-full">
    <div class="flex gap-2 items-center w-full">
      {#if search.type === 'simple'}
        <div><Filter /></div>
      {:else if search.type === 'advanced'}
        <div><Terminal /></div>
      {/if}

      <div class="grid items-center">
        {#if search.name}
          <div class="font-bold text-lg">
            {search.name}
          </div>
        {/if}

        {#if search.type === 'simple'}
          <DisplaySimpleSearchFilters {search} />
        {:else if search.type === 'advanced'}
          <div>{@html queryToHTML(globalSearchParser(search.value))}</div>
        {/if}
      </div>

      {#if isSaved}
        <div class="ml-auto">
          <GenericButton
            on:click={(e) => {
              e.stopImmediatePropagation();
              dispatch('delete');
            }}
            kind="danger-ghost"
            iconDescription="Delete"
            class="mr-1"
          >
            <TrashCan />
          </GenericButton>
        </div>
      {/if}
    </div>
  </div>
</Button>
