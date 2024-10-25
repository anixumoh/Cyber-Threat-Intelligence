<script lang="ts">
  import { beforeNavigate, goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { currentModuleId, modulesStore } from '$stores/module';
  import { currentOrganizationId } from '$stores/organization';
  import { InlineLoading } from 'carbon-components-svelte';

  let switching = true;
  $: $modulesStore?.length && setModule(+$page.params?.moduleId);

  beforeNavigate((navigation) => {
    const moduleId = +navigation?.to?.params?.moduleId;
    const sameUrl = navigation?.from?.url.href === navigation?.to?.url.href;
    if (moduleId && !sameUrl) {
      switching = true;
    }
  });

  function setModule(moduleId: number) {
    if (!moduleId) return;

    if ($currentModuleId !== moduleId) {
      const module = $modulesStore.find((module) => module.id === moduleId);

      if (module) {
        $currentModuleId = moduleId;
      } else {
        return goto(`/dashboard/organizations/${$currentOrganizationId}/summary`, { replaceState: true });
      }
    }

    switching = false;
  }
</script>

{#if switching}
  <InlineLoading class="flex items-center justify-center w-full h-full mt-40" />
{:else}
  <slot />
{/if}
