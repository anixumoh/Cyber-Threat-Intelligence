<script lang="ts">
  import Client from '$lib/client';
  import type { Actor, Campaign, Tool } from '$lib/client/services/actors';
  import ServerMultiSelect from '$lib/components/ServerMultiSelect.svelte';
  import INDUSTRIES from '$lib/constants/industries';
  import REGIONS from '$lib/constants/regions';
  import preferencesStore from '$stores/preferences';
  import { Button, InlineLoading, MultiSelect } from 'carbon-components-svelte';
  import { Filter } from 'carbon-icons-svelte';
  import { createEventDispatcher, onDestroy } from 'svelte';
  import type { TCXSimpleSearch } from './types';

  const client = new Client();
  const PLATFORMS = ['Windows', 'Linux', 'Unix', 'Android'];
  const dispatch = createEventDispatcher<{
    search: {
      actors: Actor[];
      campaigns: Campaign[];
      tools: Tool[];
    };
  }>();

  onDestroy(() => client.abort());

  let actorsByName: Actor[] = [];
  let regions: string[] = [];
  let industries: string[] = [];
  let campaignsByName: Campaign[] = [];
  let toolsByName: Tool[] = [];
  let platforms: string[] = [];
  let searching = false;

  $: actorRegionPlaceholder = regions.join(', ') || 'Actor region';
  $: actorIndustryPlaceholder = industries.join(', ') || 'Actor industry';
  $: toolPlatformPlaceholder = platforms.join(', ') || 'Tools by platform';

  export async function searchSimpleSearch(simpleSearch: TCXSimpleSearch) {
    actorsByName = simpleSearch.search.actorsByName;
    regions = simpleSearch.search.regions;
    industries = simpleSearch.search.industries;
    campaignsByName = simpleSearch.search.campaignsByName;
    toolsByName = simpleSearch.search.toolsByName;
    platforms = simpleSearch.search.platforms;
    await search(simpleSearch.name);
  }

  function saveSimpleSearch(name: string) {
    const simpleSearch: TCXSimpleSearch = {
      type: 'simple',
      name,
      search: {
        actorsByName: actorsByName,
        regions,
        industries,
        campaignsByName: campaignsByName,
        toolsByName: toolsByName,
        platforms
      }
    };
    $preferencesStore.tcx_recent_searches.push(simpleSearch);
    $preferencesStore.tcx_recent_searches = $preferencesStore.tcx_recent_searches.slice(-5);
    preferencesStore.setAndSave($preferencesStore);
  }

  async function searchActorByName(name: string) {
    const dork = `name:~"${name}"`;
    return await client.actors.getActors(100, '-last_seen', { dork });
  }

  async function searchCampaignByName(name: string) {
    const dork = `name:~"${name}"`;
    return await client.actors.getCampaigns({ dork });
  }

  async function searchToolsByName(name: string) {
    const dork = `name:~"${name}"`;
    return await client.actors.getTools({ dork });
  }

  async function search(name = '') {
    searching = true;

    const actorDork = getActorDork(actorsByName, regions, industries);
    const toolsDork = getToolsDork(toolsByName, platforms);

    const result = await Promise.all([
      searchActors(actorDork),
      searchCampaigns(campaignsByName),
      searchTools(toolsDork)
    ]);

    dispatch('search', { actors: result[0], campaigns: result[1], tools: result[2] });
    saveSimpleSearch(name);
    searching = false;
  }

  function getActorDork(actors: Actor[], regions: string[], industries: string[]) {
    const groups = [];
    if (actors.length) {
      groups.push(`(${actors.map((actor) => `name:"${actor.name}"`).join(' OR ')})`);
    }
    if (regions.length) {
      groups.push(`(${regions.map((region) => `targets:"${region}"`).join(' OR ')})`);
    }
    if (industries.length) {
      groups.push(`(${industries.map((industry) => `targets:"${industry}"`).join(' OR ')})`);
    }
    const dork = groups.join(' AND ');
    return dork;
  }

  function getToolsDork(toolsByName: Tool[], platforms: string[]) {
    const groups = [];
    if (toolsByName.length) {
      groups.push(`(${toolsByName.map((tool) => `name:"${tool.name}"`).join(' OR ')})`);
    }
    if (platforms.length) {
      groups.push(`(${platforms.map((platform) => `targeted_platforms:"${platform}"`).join(' OR ')})`);
    }
    const dork = groups.join(' AND ');
    return dork;
  }

  async function searchActors(dork: string) {
    if (!dork) return [];
    return await client.actors.getActors(100, '-last_seen', { dork });
  }

  async function searchCampaigns(campaignsByName: Campaign[]) {
    return campaignsByName;
  }

  async function searchTools(dork: string) {
    if (!dork) return [];
    return await client.actors.getTools({ 'page[limit]': 100, sort: '-first_seen', dork });
  }
</script>

<div class="grid gap-4">
  <div class="grid grid-cols-3 gap-4">
    <ServerMultiSelect
      placeholder="Actor by name"
      bind:selected={actorsByName}
      searchFunction={searchActorByName}
      key="id"
      display="name"
    />
    <MultiSelect
      filterable
      selectionFeedback="top"
      bind:selectedIds={regions}
      label="label"
      placeholder={actorRegionPlaceholder}
      items={REGIONS.map((region) => ({ id: region, text: region }))}
    />
    <MultiSelect
      filterable
      selectionFeedback="top"
      bind:selectedIds={industries}
      label="label"
      placeholder={actorIndustryPlaceholder}
      items={INDUSTRIES.map((industry) => ({ id: industry, text: industry }))}
    />
  </div>

  <div class="grid grid-cols-3 gap-4">
    <ServerMultiSelect
      placeholder="Campaigns"
      bind:selected={campaignsByName}
      searchFunction={searchCampaignByName}
      key="id"
      display="name"
    />
    <ServerMultiSelect
      placeholder="Tools by name"
      bind:selected={toolsByName}
      searchFunction={searchToolsByName}
      key="id"
      display="name"
    />
    <MultiSelect
      filterable
      bind:selectedIds={platforms}
      selectionFeedback="top"
      label="label"
      placeholder={toolPlatformPlaceholder}
      items={PLATFORMS.map((platform) => ({ id: platform, text: platform }))}
    />
  </div>

  <div class="grid grid-cols-3 gap-4">
    <!-- <TextInput placeholder="Contains the text" /> -->
    <div>
      <Button size="field" icon={searching ? InlineLoading : Filter} disabled={searching} on:click={() => search()}>
        Search
      </Button>
    </div>
  </div>
</div>
