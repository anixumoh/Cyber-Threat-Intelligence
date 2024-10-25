<script lang="ts">
  import ThreatsListCommon from '$lib/components/ThreatsCommons/ThreatsListCommon/ThreatsListCommon.svelte';
  import threatsFilterStore from '$stores/filters';
  import threatsStore from '$stores/threats';
  import Client from '$lib/client';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { currentOrganizationId } from '$stores/organization';
  import roleStore from '$stores/role';
  import ButtonReport from '$lib/components/ButtonReport/index.svelte';
  import preferencesStore from '$stores/preferences';

  const client = new Client();

  onMount(() => {
    return () => {
      client.abort();
    };
  });

  $: threatsFilterStore.getInitialAllThreadFilter($preferencesStore);
  $: browser && $threatsFilterStore && onFilterChange();

  async function onFilterChange() {
    await threatsStore.loadAllThreats($currentOrganizationId, $threatsFilterStore);
  }

  const sortKeyMap = {
    title: 'T',
    moduleName: 'M',
    rating: 'RT',
    date: 'D',
    url: 'U',
    inform: 'AR'
  };

  function setSortFilter(e) {
    const { key, mode } = e.detail;
    const sortKey = sortKeyMap[key];
    let sort = '';
    if (sortKey && mode) {
      sort = `${sortKey},${mode}`;
    }
    $threatsFilterStore.o = sort;
  }
</script>

<div class="flex items-center justify-between mt-2">
  <h5>Threats</h5>

  {#if $roleStore.master || $roleStore.superadmin || $roleStore.admin || $roleStore.grants.isAnyModuleAnalyst}
    <div class="flex flex-col gap-2 sm:flex-row">
      <ButtonReport text="Terms Report" params="all-threats" />
    </div>
  {/if}
</div>
<hr />

<div class="overflow-x-auto">
  <div class="min-w-[900px]">
    <ThreatsListCommon on:sort={setSortFilter} isAllThreats />
  </div>
</div>
