<script lang="ts">
  import { currentOrganizationId } from '$stores/organization';
  import axios from 'axios';
  import { SkeletonPlaceholder } from 'carbon-components-svelte';
  import { onMount } from 'svelte';

  type DashboardInfoResponse = {
    token: string;
    baseUrl: string;
    loginUri: string;
    chartsUris: string[];
  };

  let mounted = false;
  let loading = true;
  let error = false;

  onMount(() => {
    mounted = true;
  });
  $: mounted && loadDashboard($currentOrganizationId);

  let info: DashboardInfoResponse;

  async function loadDashboard(orgId: number) {
    try {
      info = await getDashboardInfo(orgId);
      await login(info);
    } catch (e) {
      error = true;
    } finally {
      loading = false;
    }
  }

  async function getDashboardInfo(orgId: number) {
    const response = await axios.get<DashboardInfoResponse>(`/api/v2/charts/organization/${orgId}/dashboard`);
    return response.data;
  }

  async function login(info: DashboardInfoResponse) {
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
    {#each info.chartsUris as chart}
      <object title="chart" class="w-full h-[500px]" data="{info.baseUrl}/{chart}" />
    {/each}
  </div>
{/if}
