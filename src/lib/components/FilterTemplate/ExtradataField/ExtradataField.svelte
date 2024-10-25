<script lang="ts">
  import type { ExtradataKeyTemplate } from '$lib/client/services/modules';
  import { SkeletonPlaceholder } from 'carbon-components-svelte';
  import BoxTitle from '../BoxTitle.svelte';
  import Cql from './CQL.svelte';
  import { COMPARASION_OPERATORS } from './constants';

  export let extradata: any;
  export let inversed = false;
  export let open = false;
  export let direction: 'top' | 'bottom' = 'bottom';
  export let loading = false;
  export let keyTemplates: ExtradataKeyTemplate[] = [];

  // Extradata legacy - remove in ENG2-955
  $: extradata && switchToQuery();
  function switchToQuery() {
    const isOld = typeof extradata?.key === 'string' && typeof extradata?.value === 'string';
    if (!isOld) return;

    let operation = COMPARASION_OPERATORS.CONTAINS;
    let value = extradata.value.trim();

    const matches = value.match(/^"([^"]*)"$/g);
    if (matches) {
      const match = matches[0];
      value = match;
      operation = COMPARASION_OPERATORS.EQUALS;
    }
    value = value.replace(/"/g, '');

    if (inversed) {
      extradata = {
        operation: 'NOT',
        subnodes: [
          {
            key: {
              path: extradata.key,
              type: 'TEXT'
            },
            operation,
            value: value
          }
        ]
      };
      inversed = false;
    } else {
      extradata = {
        key: {
          path: extradata.key,
          type: 'TEXT'
        },
        operation,
        value: value
      };
    }
  }
</script>

<div>
  <BoxTitle title="Extradata query" />
  <div class="w-full border rounded bg-ctip-background h-52">
    <div class="grid gap-4 p-2.5">
      {#if loading}
        <SkeletonPlaceholder class="w-full" />
      {:else}
        <Cql bind:isEditting={open} bind:query={extradata} {direction} {keyTemplates} />
      {/if}
    </div>
  </div>
</div>
