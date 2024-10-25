<script lang="ts">
  import { currentModule } from '$stores/module';
  import { ComposedModal, InlineLoading, ModalHeader } from 'carbon-components-svelte';
  import './moduleInfo.scss';

  export let open = false;

  $: open && !infoModuleLoaded && showInfoModule();

  let loading = false;
  let infoModuleLoaded = false;
  let infoModules = {};
  $: infoModule = infoModules?.[$currentModule?.moduleName] || '';

  async function showInfoModule() {
    loading = true;
    const response = await fetch('/assets/module_info/info-module.json');
    infoModules = await response.json();
    loading = false;
    infoModuleLoaded = true;
  }
</script>

<ComposedModal bind:open size="lg" class="md:[&>div]:w-[800px]">
  <ModalHeader />
  <div class="min-h-[300px]">
    {#if loading}
      <InlineLoading class="flex items-center justify-center h-full" />
    {:else}
      <div>
        {@html infoModule.description}
      </div>
    {/if}
  </div>
</ComposedModal>
