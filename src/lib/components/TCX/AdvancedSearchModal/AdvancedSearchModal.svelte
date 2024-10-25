<script lang="ts">
  import type { TCXOptions } from '$lib/types/tcx';
  import { Button, Modal, Tag } from 'carbon-components-svelte';
  import { Add } from 'carbon-icons-svelte';
  import { createEventDispatcher, tick } from 'svelte';
  import DorkField from './DorkField.svelte';
  import { dorkFiltersToDork, dorkToDorkFilters, type Aggregator, type DorkFilter } from './utils';

  const dispatch = createEventDispatcher<{ search: string }>();

  export let open = false;
  export let tcxOptions: TCXOptions | undefined;
  export let dork: string;

  let dorks: DorkFilter[] = [{ field: undefined, operator: '=', value: '' }];
  let invalidDorks = [];
  let loading = true;

  $: open && init();

  async function init() {
    loading = true;
    await tick();
    dorks = dorkToDorkFilters(dork, tcxOptions);
    if (!dorks.length) {
      dorks = [{ field: undefined, operator: '=', value: '' }];
    }
    loading = false;
  }

  function search() {
    invalidDorks = dorks.map((dork) => !dork.field || !dork.value);
    if (invalidDorks.some((x) => x)) return;

    const dork = dorkFiltersToDork(dorks, tcxOptions);
    dispatch('search', dork);
    open = false;
  }

  function onAdd(aggregator: Aggregator) {
    dorks = [...dorks, { aggregator, field: undefined, operator: '=', value: '' }];
  }

  function removeDorkFilter(index: number) {
    dorks.splice(index, 1);
    if (dorks.length) {
      dorks[0].aggregator = undefined;
    }
    dorks = dorks;
  }
</script>

<Modal
  size="lg"
  bind:open
  modalHeading="Query builder"
  primaryButtonText="Search"
  secondaryButtonText="Close"
  on:click:button--primary={search}
  on:click:button--secondary={() => (open = false)}
>
  <div class="p-4 min-h-[500px]">
    <div class="grid gap-4 mb-4">
      {#if !loading}
        {#each dorks as dork, i}
          <DorkField
            on:remove={() => removeDorkFilter(i)}
            {tcxOptions}
            bind:field={dork.field}
            bind:operator={dork.operator}
            bind:value={dork.value}
            bind:aggregator={dork.aggregator}
            invalid={invalidDorks?.[i]}
          />
        {/each}
      {/if}
    </div>

    <div class="flex justify-end gap-2">
      {#if dorks.length === 0}
        <Button on:click={() => onAdd(undefined)} size="field" icon={Add}>Add filter</Button>
      {:else}
        <Button on:click={() => onAdd('AND')} size="field" icon={Add}>
          Add filter
          <Tag type="high-contrast" class="cursor-pointer">AND</Tag>
        </Button>
        <Button on:click={() => onAdd('OR')} size="field" icon={Add}>
          Add filter
          <Tag type="outline" class="cursor-pointer">OR</Tag>
        </Button>
      {/if}
    </div>
  </div>
</Modal>
