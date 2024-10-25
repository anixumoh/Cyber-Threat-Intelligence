<script lang="ts">
  import type { AlignPopoverType, InformType } from '$lib/types';
  import { currentOrganization } from '$stores/organization';
  import TooltipWithIcon from '$lib/components/TooltipWithIcon/TooltipWithIcon.svelte';
  import { COLORS } from '$lib/constants/colors';
  import clickOutside from '$lib/actions/clickOutside';
  import { Button, Popover } from 'carbon-components-svelte';
  import { currentModule } from '$stores/module';
  import axios from 'axios';
  import { WarningFilled } from 'carbon-icons-svelte';
  import roleStore from '$stores/role';
  import ItemStatus from './ItemStatus.svelte';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
  const { gray, primary, darkThreat, successThreat, dangerThreat } = COLORS;
  let statusSelected = '';
  let informVisible = false;

  export let resource = undefined;
  export let showIcons = true;
  export let isButton = false;
  export let status;
  export let multipleTreatment = false;
  export let align: AlignPopoverType = 'right';

  $: if (status) {
    statusSelected = status;
  }

  function informColor(inform: InformType) {
    switch (inform) {
      case 'NOT_PROCESSABLE':
        return gray;
      case 'NOT_IMPORTANT':
        return darkThreat;
      case 'POSITIVE':
        return successThreat;
      case 'INFORMATIVE':
        return primary;
      case 'NEGATIVE':
        return dangerThreat;
    }
  }

  function informLabel(inform: InformType) {
    switch (inform) {
      case 'NOT_PROCESSABLE':
        return 'NOT PROCESSABLE';
      case 'NOT_IMPORTANT':
        return 'NOT IMPORTANT';
      case 'POSITIVE':
        return 'POSITIVE';
      case 'INFORMATIVE':
        return 'INFORMATIVE';
      case 'NEGATIVE':
        return 'NEGATIVE';
    }
  }

  function showInform(event) {
    event.stopImmediatePropagation();
    if (!$roleStore.customer) {
      informVisible = !informVisible;
    }
  }

  function onClickOutside() {
    informVisible = false;
  }

  function updateStatus(event, status: InformType) {
    // TODO Pending this logic
    // if (this.multipleTreatment) {
    //   this.updateMultipleStatus(event, status);
    // } else {
    updateSingle(event, status);
    // }
  }

  async function updateSingle(event, stat: InformType) {
    event.stopPropagation();
    if (!$roleStore.customer) {
      informVisible = false;
      status = stat;
      if ($currentModule && $currentOrganization) {
        const { id: moduleId, moduleName } = $currentModule;
        const url = `/api/v2/organization/${$currentOrganization.id}/module/${resource.moduleId || moduleId}/${
          resource.moduleType || moduleName.toLowerCase()
        }/resource/${resource.resourceId}/userResult/${status.toLowerCase()}`;
        await axios.put(url);
        dispatch('setStatus', { status, resourceId: resource.resourceId });
      }
    }
  }
</script>

{#if !$currentOrganization.trial}
  <div class="btn-group" data-outline use:clickOutside on:clickOutside={onClickOutside}>
    {#if !multipleTreatment && isButton}
      <Button
        size="small"
        kind="ghost"
        class="dark:bg-white"
        style="color: {informColor(status)}"
        disabled={$roleStore.customer}
        on:click={(event) => showInform(event)}
        data-test="inform-button"
      >
        {informLabel(status)}
      </Button>
    {/if}
    {#if !multipleTreatment && !isButton && !showIcons}
      <a
        href={undefined}
        class="inform-no-icon float-left mr-1"
        style="color: {informColor(status)}"
        class:cursor-not-allowed={$roleStore.customer}
        on:click={showInform}
        data-test="inform-button"
      >
        {informLabel(status)}
      </a>
    {/if}
    {#if !multipleTreatment && !isButton && showIcons}
      <TooltipWithIcon
        data-test="inform-button"
        tooltipText={informLabel(status)}
        icon={WarningFilled}
        on:click={showInform}
        color={informColor(status)}
      />
    {/if}
    {#if multipleTreatment}
      <Button data-test="inform-button" kind="ghost" style="color: {informColor(status)}" on:click={showInform}>
        Mark Status
      </Button>
    {/if}
    <Popover open={informVisible} {align}>
      <ul class="inform dark:bg-white">
        {#if statusSelected !== 'NOT_IMPORTANT'}
          <ItemStatus
            text="not important"
            status="NOT_IMPORTANT"
            on:click={($event) => updateStatus($event, 'NOT_IMPORTANT')}
          />
        {/if}
        {#if statusSelected !== 'POSITIVE'}
          <ItemStatus text="positive" status="POSITIVE" on:click={($event) => updateStatus($event, 'POSITIVE')} />
        {/if}
        {#if statusSelected !== 'INFORMATIVE'}
          <ItemStatus
            text="informative"
            status="INFORMATIVE"
            on:click={($event) => updateStatus($event, 'INFORMATIVE')}
          />
        {/if}
        {#if statusSelected !== 'NEGATIVE'}
          <ItemStatus text="negative" status="NEGATIVE" on:click={($event) => updateStatus($event, 'NEGATIVE')} />
        {/if}
      </ul>
    </Popover>
  </div>
{/if}
