<script lang="ts">
  import Client from '$lib/client';
  import ThreatsListCommon from '$lib/components/ThreatsCommons/ThreatsListCommon/ThreatsListCommon.svelte';
  import { currentModuleId, moduleNameUrl } from '$stores/module';
  import { currentOrganizationId } from '$stores/organization';
  import threatsStore from '$stores/threats';
  import { onMount } from 'svelte';
  import threatsFilterStore from '$stores/filters';
  import { cloneDeep } from 'lodash';
  import { AnalysisCalcResultType } from '$lib/types/threat';

  const client = new Client();

  onMount(() => {
    threatsStore.clearLast();
    mounted = true;
    return () => {
      $threatsStore.isOpenDetails = false;
      client.abort();
    };
  });

  let mounted = false;
  let page = 0;
  let firstLoad = true;

  $: page = $threatsFilterStore.page - 1;
  $: mounted && $threatsFilterStore && onFilterChange($currentOrganizationId, $currentModuleId, $moduleNameUrl);

  async function onFilterChange(organizationId: number, moduleId: number, moduleNameUrl: string) {
    threatsStore.clearLast();
    const loaded = await threatsStore.loadThreats(organizationId, moduleId, moduleNameUrl, $threatsFilterStore);
    if (!loaded) return;
    if ($threatsStore.isLoading) return;
    const requestNotImportant =
      $threatsFilterStore.page === 1 &&
      !$threatsStore.resources.length &&
      $threatsFilterStore.filters.analysisCalcResult
        .slice(0, 3)
        .every((calc) => ['POSITIVE', 'NEGATIVE', 'INFORMATIVE'].includes(calc)) &&
      !$threatsFilterStore.filters.analysisCalcResult.includes(AnalysisCalcResultType.NOT_IMPORTANT);

    if (requestNotImportant) {
      const filters = cloneDeep($threatsFilterStore);
      filters.filters.analysisCalcResult = [AnalysisCalcResultType.NOT_IMPORTANT];
      await threatsStore.loadThreats(organizationId, moduleId, moduleNameUrl, filters, false);
    }

    if (firstLoad) {
      firstLoad = false;
      scrollToFocusedElement();
    }
  }

  function scrollToFocusedElement() {
    const focused = new URL(window.location.href).searchParams.get('focused');
    if (focused) {
      const focusedElement = document.querySelector(`tr[data-row="${focused}-${$currentModuleId}"]`);
      if (focusedElement) {
        focusedElement.scrollIntoView();
        window.scrollBy(0, -50);
      }
    }
  }

  const sortKeyMap = {
    title: 'T',
    rating: 'RT',
    changedAt: 'D',
    date: 'D',
    url: 'U',
    relevance: 'AR'
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

<div class:flex={$threatsStore.isOpenDetails}>
  <div class="overflow-x-auto">
    <div class="min-w-[900px]">
      <ThreatsListCommon on:sort={setSortFilter} />
    </div>
  </div>
</div>
