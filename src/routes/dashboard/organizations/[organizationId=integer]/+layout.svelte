<script lang="ts">
  import { afterNavigate, beforeNavigate, goto } from '$app/navigation';
  import { page } from '$app/stores';
  import languagesStore from '$stores/languages';
  import { moduleCacheStore } from '$stores/module';
  import { currentOrganizationId, organizationsStore } from '$stores/organization';
  import { InlineLoading } from 'carbon-components-svelte';
  import { onMount } from 'svelte';

  let switching = true;
  let loadingModulesPromises: Promise<void>[] = [];

  $: setOrganization(+$page.params?.organizationId);

  onMount(() => {
    loadLanguages();
    switching = false;
  });

  async function loadLanguages() {
    if (!$languagesStore.length) {
      await languagesStore.loadLanguages();
    }
  }

  beforeNavigate((navigation) => {
    const organizationId = +navigation?.to?.params?.organizationId;
    const sameUrl = navigation?.from?.url.href === navigation?.to?.url.href;
    if (organizationId && !sameUrl) {
      switching = true;
    }
  });

  afterNavigate(() => {
    switching = false;
  });

  async function setOrganization(organizationId: number) {
    if (!organizationId) return;
    switching = true;

    if (organizationId !== $currentOrganizationId || !$moduleCacheStore[organizationId]) {
      const newOrganization = $organizationsStore.find((org) => org.id === organizationId);

      if (newOrganization) {
        $currentOrganizationId = organizationId;

        if (!$moduleCacheStore[organizationId]) {
          loadingModulesPromises = loadingModulesPromises.concat(moduleCacheStore.fetchModules(organizationId));
        }
      } else {
        return goto('/notFound');
      }
    }
    switching = false;
  }
</script>

{#await Promise.all(loadingModulesPromises)}
  <InlineLoading class="flex items-center justify-center w-full h-full mt-40" />
{:then}
  {#if switching}
    <InlineLoading class="flex items-center justify-center w-full h-full mt-40" />
  {:else}
    <slot />
  {/if}
{/await}
