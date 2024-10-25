<script lang="ts">
  import { Tag } from 'carbon-components-svelte';
  import type { TCXSimpleSearch } from './types';

  export let search: TCXSimpleSearch;
</script>

{#if search?.search?.actorsByName?.length}
  <div class="flex items-center gap-2 flex-wrap">
    Actors
    {#each search.search.actorsByName as actor}
      <Tag size="sm">{actor.name}</Tag>
    {/each}
  </div>
{/if}
{#if search?.search?.campaignsByName?.length}
  <div class="flex items-center gap-2 flex-wrap">
    Campaign
    {#each search.search.campaignsByName as campaign}
      <Tag size="sm">{campaign.name}</Tag>
    {/each}
  </div>
{/if}
{#if search?.search?.industries?.length}
  <div class="flex items-center gap-2 flex-wrap">
    Industry
    {#each search.search.industries as industry}
      <Tag size="sm">{industry}</Tag>
    {/each}
  </div>
{/if}
{#if search?.search?.platforms?.length}
  <div class="flex items-center gap-2 flex-wrap">
    Platforms
    {#each search.search.platforms as platform}
      <Tag size="sm">{platform}</Tag>
    {/each}
  </div>
{/if}
{#if search?.search?.regions?.length}
  <div class="flex items-center gap-2 flex-wrap">
    Region
    {#each search.search.regions as region}
      <Tag size="sm">{region}</Tag>
    {/each}
  </div>
{/if}
{#if search?.search?.toolsByName?.length}
  <div class="flex items-center gap-2 flex-wrap">
    Tool
    {#each search.search.toolsByName as tool}
      <Tag size="sm">{tool.name}</Tag>
    {/each}
  </div>
{/if}
