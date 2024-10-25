<script lang="ts">
  import { Tag, TooltipIcon } from 'carbon-components-svelte';
  import LabelItem from '$lib/components/LabelItem/LabelItem.svelte';
  import { Checkmark, Touch_1 } from 'carbon-icons-svelte';
  import { currentOrganization } from '$stores/organization';
  import { THREAT_USER_MODIFIED_TOOLTIP } from '$lib/constants/text';

  export let href: string;
  export let title = '';
  export let labels = [];
  export let showHand = false;
  export let isAllThreats = false;
  export let moduleShortName = 'Name';
  export let moduleId = 0;
  export let userModified = false;
  export let isManual = false;
</script>

<div>
  <p class="flex items-center mb-0 cursor-pointer hover:text-ctip-primary">
    {#if showHand}
      <Touch_1 class="mr-2" />
    {/if}
    <a class="text-ctip-secondary hover:text-ctip-primary w-full" on:click {href}>
      <div class="flex justify-between">
        <div class="whitespace-nowrap overflow-hidden text-ellipsis" {title}>
          {title}
        </div>
        <div class="flex">
          {#if isManual}
            <div data-test="is-manual">
              <TooltipIcon direction="top" tooltipText="Manually Added" icon={Touch_1} />
            </div>
          {/if}
          {#if userModified}
            <div data-test="user-modified">
              <TooltipIcon direction="top" tooltipText={THREAT_USER_MODIFIED_TOOLTIP} icon={Checkmark} />
            </div>
          {/if}
        </div>
      </div>
    </a>
  </p>
  {#if isAllThreats}
    <a class="no-underline" href="/dashboard/organizations/{$currentOrganization.id}/modules/{moduleId}">
      <Tag class="cursor-pointer bg-ctip-amberThreat">{moduleShortName}</Tag>
    </a>
  {/if}
  {#if labels.length}
    <div class="mt-3 mb-2 flex max-w-[800px] w-max flex-wrap gap-1">
      {#each labels as label}
        <LabelItem {label} />
      {/each}
    </div>
  {/if}
</div>
