<script lang="ts">
  import type { Resource } from '$lib/types/resource';
  import { ArrowLeft, ArrowRight } from 'carbon-icons-svelte';
  import { page } from '$app/stores';
  import { indexOf } from 'lodash';
  import GenericButton from '$lib/components/Buttons/GenericButton.svelte';
  import threatsStore from '$stores/threats';
  import threatsFilterStore from '$stores/filters';
  import { currentOrganization } from '$stores/organization';
  import { currentModule } from '$stores/module';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { MODULE_NAME } from '$lib/constants/modules';
  import Client from '$lib/client';

  const client = new Client();

  let showNext: boolean;
  let showPrev: boolean;

  onMount(() => {
    setPrevNextOnLoad();
  });

  async function backToList() {
    const params = `?page=${$threatsFilterStore.page}&focused=${$threatsStore.selectedForDetails.resourceId}${
      $threatsFilterStore.q ? `&q=${$threatsFilterStore.q}` : ''
    }`;

    if ($page.url.searchParams.get('from') === 'allThreats') {
      return goto(`/dashboard/organizations/${$currentOrganization.id}/indexed/${params}`);
    }

    await goto(`/dashboard/organizations/${$currentOrganization.id}/modules/${$currentModule.id}${params}`);
  }

  async function navigateDetails(direction: 'previous' | 'next') {
    $threatsStore.isLoading = true;
    const items = $threatsStore.resources.map((resource) => resource);
    const itemsId = $threatsStore.resources.map((resource) => resource.resourceId);
    if (!itemsId?.length) return;

    const { resourceId } = $page.params;
    const index = indexOf(itemsId, +resourceId);
    const isTheLastItem = index === itemsId.length - 1;
    const isTheFirstItem = index === 0;

    const nextPage = direction === 'next' && isTheLastItem;
    const previousPage = direction === 'previous' && isTheFirstItem;

    if (nextPage || previousPage) {
      $threatsFilterStore.page += nextPage ? 1 : -1;
      await threatsStore.loadThreats(
        $currentOrganization.id,
        $currentModule.id,
        $currentModule?.moduleName,
        $threatsFilterStore
      );
      if ($threatsStore.resources.length) {
        const idx = nextPage ? 0 : $threatsStore.resources.length - 1;
        const targetResource = $threatsStore.resources[idx];
        await goToDetailsPage(targetResource);
        setPrevNextOnLoad();
      }
    } else {
      const changeIndex = direction === 'next' ? 1 : -1;
      const targetIndex = index + changeIndex;
      const targetResource = items[targetIndex];
      await goToDetailsPage(targetResource);
      setPrevNextOnLoad();
    }
    $threatsStore.isLoading = false;
  }

  function setPrevNextOnLoad() {
    const itemsId = $threatsStore.resources.map((resource) => resource.resourceId);
    if (itemsId?.length) {
      const { resourceId } = $page.params;
      const index = indexOf(itemsId, +resourceId);
      const isTheLastItem = index === itemsId.length - 1;
      const isTheFirstItem = index === 0;
      const isTheFirstPage = $threatsFilterStore.page === 1;
      const lastPage = Math.ceil($threatsStore.totalResources / $threatsFilterStore.maxRows);
      const isTheLastPage = $threatsFilterStore.page === lastPage || lastPage < $threatsFilterStore.page;

      if (isTheFirstPage && isTheFirstItem) {
        if (itemsId.length === 1) {
          showPrev = false;
          showNext = false;
        } else {
          showPrev = false;
          showNext = true;
        }
      } else if (isTheLastPage && isTheLastItem) {
        showNext = false;
        showPrev = true;
      } else {
        showNext = true;
        showPrev = true;
      }
    }
  }

  async function goToDetailsPage(resource: Resource) {
    const params = {}
    if ($page.url.searchParams.get('from') === 'allThreats') {
      params['from'] = 'allThreats';
    }
    const queryParams = new URLSearchParams(params).toString();

    if (resource.resourceId === undefined) {
      await goto(`/dashboard/organizations/${$currentOrganization.id}/modules/${$currentModule.id}`);
    } else {
      await goto(
        `/dashboard/organizations/${$currentOrganization.id}/modules/${resource.moduleId}/resource/${resource.resourceId}?${queryParams}`
      );
    }
  }
</script>

<div class="flex flex-wrap items-center justify-between">
  <h4 class="basis-8/12">
    {$currentModule?.moduleName === MODULE_NAME.MALWARE ? 'Malware' : $threatsStore.selectedForDetails?.title}
  </h4>
  <div class="min-w-[166px]">
    <GenericButton id="previous-button" disabled={!showPrev} on:click={() => navigateDetails('previous')}>
      <ArrowLeft />
    </GenericButton>
    <GenericButton id="back-to-list-button" on:click={backToList}>Back to list</GenericButton>
    <GenericButton id="next-button" disabled={!showNext} on:click={() => navigateDetails('next')}>
      <ArrowRight />
    </GenericButton>
  </div>
</div>
