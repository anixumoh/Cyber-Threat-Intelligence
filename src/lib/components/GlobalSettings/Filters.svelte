<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { MODULES_TYPES_DICTIONARY, SETTINGS_DICTIONARY } from '$lib/constants/assets';
  import { Button, ButtonSet, MultiSelect } from 'carbon-components-svelte';

  export let openFilters = false; // show up or show down the total settings modal
  export let provisionalSettingsType = [];
  export let provisionalModuleType = [];
  export let provisionalTags = [];
  export let allowedSettingTypes = [];
  export let modulesTypesMulti = [];
  export let tagsList = [];

  const dispatch = createEventDispatcher();

  function onApply() {
    dispatch('applyFilter');
    openFilters = false;
  }
</script>

<div class="absolute top-0 mt-11 z-50 grid right-0 w-[500px] lg:w-[725px] bg-[var(--cds-layer)] shadow border h-40">
  <div class="grid grid-cols-1 px-4 pt-4 overflow-y-auto lg:overflow-y-visible lg:grid-cols-2">
    <div class="pr-4 mb-4 border-r border-gray-200 border-solid">
      <MultiSelect
        label="Settings Type"
        items={allowedSettingTypes?.map((tag) => ({ id: tag, text: SETTINGS_DICTIONARY?.[tag] }))}
        selectedIds={provisionalSettingsType}
        class="w-full"
        on:select={(items) => (provisionalSettingsType = items.detail.selectedIds)}
      />
      <MultiSelect
        label="Module Type"
        items={modulesTypesMulti?.map((tag) => ({ id: tag, text: MODULES_TYPES_DICTIONARY?.[tag] }))}
        selectedIds={provisionalModuleType}
        class="w-full"
        on:select={(items) => (provisionalModuleType = items.detail.selectedIds)}
      />
    </div>
    <div class="pl-0 lg:!pl-4">
      <MultiSelect
        label="Tags"
        items={tagsList?.map((tag) => ({ id: tag, text: tag }))}
        selectedIds={provisionalTags}
        class="w-full"
        on:select={(items) => (provisionalTags = items.detail.selectedIds)}
      />
    </div>
  </div>
  <ButtonSet class="flex w-full">
    <Button class="w-1/2 h-12 max-w-none" on:click={() => (openFilters = false)} kind="secondary">Cancel</Button>
    <Button class="w-1/2 h-12 max-w-none" on:click={onApply}>Apply</Button>
  </ButtonSet>
</div>
