<script lang="ts">
  import { MODULE_NAME } from '$lib/constants/modules';
  import { currentModule } from '$stores/module';
  import { Button } from 'carbon-components-svelte';
  import { InformationFilled } from 'carbon-icons-svelte';
  import ModuleInfoModal from './ModuleInfoModal.svelte';

  export let title = '';
  export let subTitle = '';
  export let isMainView = true;
  export let showModuleName = true;
  let showInfoModal = false;
</script>

<h6 class="text-ctip-textMuted text-[90%] uppercase">{title}</h6>

<div class="flex items-center justify-between mt-2">
  <div class="flex">
    {#if isMainView && showModuleName}
      <Button
        on:click={() => (showInfoModal = true)}
        size="small"
        class="rounded mr-2"
        icon={InformationFilled}
        tooltipPosition="top"
        iconDescription="Module Info"
        kind="tertiary"
      />
    {/if}

    {#if !isMainView}
      <h6 class="text-ctip-textMuted text-[90%] uppercase font-bold">
        {showModuleName
          ? $currentModule?.moduleName === MODULE_NAME.MALWARE
            ? 'THREATS'
            : $currentModule.name
          : subTitle}
      </h6>
    {:else}
      <h5 class="text-[1.25rem]">{showModuleName ? $currentModule.name : subTitle}</h5>
    {/if}
  </div>
  <slot name="center" />

  <div class="flex flex-col sm:flex-row gap-2">
    <slot />
  </div>
</div>

<hr />

<ModuleInfoModal bind:open={showInfoModal} />
