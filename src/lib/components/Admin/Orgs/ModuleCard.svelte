<script lang="ts">
  import type { ModuleNameType } from '$lib/constants/modules';
  import { MODULE_NAME } from '$lib/constants/modules';

  import { Button, Loading, Toggle } from 'carbon-components-svelte';
  import { Download, Edit, TrashCan, View, ViewOff } from 'carbon-icons-svelte';
  import { createEventDispatcher } from 'svelte';
  export let headerText: string = '';
  export let moduleId: number = null;
  export let imageUrl: string = 'assets/icons/sidebar/custom.svg';
  export let moduleType: ModuleNameType;
  export let subtitle: string = '';
  export let urlProperties: { url: string; text: string } = { text: '', url: '' };
  export let onlyIconAndText: boolean = false;
  export let enabled: boolean = false;
  export let toggleIsDisabled: boolean = false;
  export let belongsToOrgId: number = 0;
  export let showLoading: boolean = false;

  export let hidePasswords: boolean | undefined = undefined;
  export let hideCC: boolean | undefined = undefined;

  const dispatch = createEventDispatcher();
  function forwardAnEvent(eventName: string, extraParams?: any) {
    dispatch(eventName, { extraParams, moduleId, belongsToOrgId });
  }
</script>

{#if showLoading}
  <div class="m-2 flex flex-col items-center justify-center max-w-[16rem] w-60 h-[12.5rem] border border-solid">
    <Loading withOverlay={false} />
  </div>
{:else if !onlyIconAndText}
  <div class="m-2 flex flex-col items-center justify-center max-w-[16rem] w-60 h-[12.5rem] border border-solid">
    <div class="p-3 flex flex-col items-center justify-center">
      <img class="mb-2" src={imageUrl} alt="module" width="28" height="28" />
      <p>
        {headerText}
      </p>
      <a href={urlProperties.url}> {urlProperties.text}</a>
      <p class="mb-0 pr-0 text-center">
        {subtitle}
      </p>
    </div>

    <div class="flex gap-2 justify-end border-t border-solid border-gray-300 w-full">
      {#if moduleType === MODULE_NAME.CREDENTIALS}
        <Button
          kind="ghost"
          size="small"
          icon={hidePasswords ? ViewOff : View}
          iconDescription={hidePasswords ? 'Reveal passwords' : 'Hide Passwords'}
          on:click={() => forwardAnEvent('hidePasswords')}
        />{/if}
      {#if moduleType === MODULE_NAME.CREDIT_CARDS_FULL}
        <Button
          kind="ghost"
          size="small"
          icon={hideCC ? ViewOff : View}
          iconDescription={hideCC ? 'Reveal CVV and expiration dates' : 'Hide CVV and expiration dates'}
          on:click={() => forwardAnEvent('hideCVV')}
        />{/if}
      <Button
        kind="ghost"
        size="small"
        icon={Download}
        iconDescription="Download"
        on:click={() => forwardAnEvent('download')}
      />
      <Button kind="ghost" size="small" icon={Edit} iconDescription="Edit" on:click={() => forwardAnEvent('edit')} />
      <Button
        kind="ghost"
        size="small"
        icon={TrashCan}
        iconDescription="Delete"
        on:click={() => forwardAnEvent('delete')}
      />
      <Toggle
        bind:toggled={enabled}
        class="max-w-fit mr-2 mb-1"
        size="sm"
        labelA=""
        labelText=""
        labelB=""
        disabled={toggleIsDisabled}
        on:toggle={() => forwardAnEvent('toggle', enabled)}
      />
    </div>
  </div>
{:else}
  <Button kind="ghost" on:click class="p-3 flex flex-col items-center justify-center">
    <img class="mb-2 dark:invert" src={imageUrl} alt="module" width="28" height="28" />
    <p class="mb-0 pr-0 text-center">
      {headerText}
    </p>
  </Button>
{/if}
