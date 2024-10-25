<script lang="ts">
  import type { SettingsType } from '$lib/types/assets';
  import { Modal } from 'carbon-components-svelte';
  import AssetData from './AssetData.svelte';

  export let open = false;
  export let setting: SettingsType;
  export let allowedModules = [];
  export let addText = '';
  export let noItemsMessage = '';
</script>

<Modal
  bind:open
  modalHeading="Setting Details"
  passiveModal={false}
  size="lg"
  primaryButtonText="Cancel"
  on:click:button--primary={() => (open = false)}
  hasScrollingContent
>
  <AssetData
    bind:setting
    bind:allowedModules
    bind:addText
    bind:noItemsMessage
    bind:openDetailSettings={open}
    on:delete
    on:deleteSingle
    on:editElement
  />
</Modal>
