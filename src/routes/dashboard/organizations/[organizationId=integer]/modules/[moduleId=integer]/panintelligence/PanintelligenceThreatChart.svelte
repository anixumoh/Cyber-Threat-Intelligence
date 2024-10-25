<script lang="ts">
  import Client from '$lib/client';
  import type { PanintelligenceDashboardInfoResponse, ThreatSearchType } from '$lib/types/threat';
  import threatsFilterStore from '$stores/filters';
  import { currentModuleId } from '$stores/module';
  import { currentOrganizationId } from '$stores/organization';
  import userStore from '$stores/user';
  import { SkeletonPlaceholder } from 'carbon-components-svelte';
  import { cloneDeep, isEqual } from 'lodash';
  import { onMount } from 'svelte';

  const client = new Client();

  let mounted = false;
  let loading = true;
  let error = false;

  onMount(() => {
    mounted = true;
  });

  $: mounted && loadDashboard($currentOrganizationId, $currentModuleId, $threatsFilterStore);

  let info: PanintelligenceDashboardInfoResponse;

  let lastFilters: ThreatSearchType;

  async function loadDashboard(orgId: number, modId: number, filters: ThreatSearchType) {
    const currentFilters = cloneDeep(filters);
    delete currentFilters.q;
    delete currentFilters.page;
    delete currentFilters.o;
    if (isEqual(lastFilters, currentFilters)) return;
    lastFilters = currentFilters;

    try {
      info = await client.threats.getPanintelligenceDashboard(orgId, modId, filters, $userStore.timezone);
      await login(info);
    } catch (e) {
      error = true;
    } finally {
      loading = false;
    }
  }

  async function login(info: PanintelligenceDashboardInfoResponse) {
    const loginUrl = `${info.baseUrl}/${info.loginUri}`;
    const headers = {
      Authorization: `Bearer ${info.token}`
    };
    const response = await fetch(loginUrl, {
      headers,
      credentials: 'include'
    });
    await response.text();
  }
</script>

{#if loading}
  <SkeletonPlaceholder class="w-full h-[500px]" />
{:else if error}
  Error
{:else}
  <div class="flex flex-col">
    {#each info?.chartsUris || [] as chart}
      <object title="chart" class="w-full h-[500px]" data="{info.baseUrl}/{chart}" />
    {/each}
  </div>
{/if}
