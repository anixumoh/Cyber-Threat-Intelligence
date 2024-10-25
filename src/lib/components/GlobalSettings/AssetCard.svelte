<script lang="ts">
  import type { SettingsType } from '$lib/types/assets';
  import AssetData from './AssetData.svelte';
  import DetailSettings from './DetailSettings.svelte';

  export let setting: SettingsType;
  export let allowedModules = [];
  export let noItemsMessage = '';
  export let addText = '';

  let open = false;
</script>

<AssetData
  isDetails={false}
  bind:setting
  bind:allowedModules
  bind:addText
  bind:noItemsMessage
  bind:openDetailSettings={open}
  on:delete
  on:deleteSingle
  on:editElement
  on:addNewSetting
  on:filter
/>

<DetailSettings
  bind:setting
  bind:allowedModules
  bind:addText
  bind:noItemsMessage
  bind:open
  on:delete
  on:deleteSingle
  on:editElement
/>
