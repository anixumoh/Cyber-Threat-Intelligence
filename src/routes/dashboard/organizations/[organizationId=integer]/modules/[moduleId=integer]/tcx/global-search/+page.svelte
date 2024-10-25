<script lang="ts">
  import { page } from '$app/stores';
  import { Button } from 'carbon-components-svelte';
  import { Download, HeatMap_03, NotificationNew } from 'carbon-icons-svelte';
  import { onMount } from 'svelte';
  import breadcrumbs from '../breadcrumbs';
  import GlobalSearchGraphs from './GlobalSearchGraphs.svelte';
  import GlobalSearchTable from './GlobalSearchTable.svelte';
  import type { Actor, Campaign, Tool } from '$lib/client/services/actors';
  import SearchTabs from './SearchTabs.svelte';

  let display: string;

  let actors: Actor[] = [];
  let campaigns: Campaign[] = [];
  let tools: Tool[] = [];

  onMount(() => {
    display = $page.url.searchParams.get('display') || '';
    breadcrumbs.add('Global search', '/global-search');
  });
</script>

<h4>Global Search</h4>

<div class="grid gap-4">
  <SearchTabs
    on:search={(e) => {
      actors = e.detail.actors;
      campaigns = e.detail.campaigns;
      tools = e.detail.tools;
    }}
  />

  <div class="grid grid-cols-3 gap-4">
    <Button kind="primary" class="rounded w-full max-w-none">
      <div class="flex flex-col">
        <h4 class="flex items-center gap-4">
          <HeatMap_03 size={32} />
          <span>MITRE | ATT&CK</span>
        </h4>
        <div>See Mitre's Att&ck matrix with information related to your search.</div>
      </div>
    </Button>
    <Button kind="primary" class="rounded w-full max-w-none">
      <div class="flex flex-col">
        <h4 class="flex items-center gap-4">
          <Download size={32} />
          <span>Report</span>
        </h4>
        <div>Create a report with the information from your search.</div>
      </div>
    </Button>
    <Button kind="primary" class="rounded w-full max-w-none">
      <div class="flex flex-col">
        <h4 class="flex items-center gap-4">
          <NotificationNew size={32} />
          <span>Alerts</span>
        </h4>
        <div>Recieve an alert everytime a new finding that matches your search is found.</div>
      </div>
    </Button>
  </div>

  <GlobalSearchGraphs {actors} {campaigns} {tools} />

  <GlobalSearchTable {actors} {campaigns} {tools} />
</div>
