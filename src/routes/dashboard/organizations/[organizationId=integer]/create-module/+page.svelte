<script lang="ts">
  import InfoCard from '$lib/components/Card/InfoCard.svelte';
  import ModuleHeading from '$lib/components/module/ModuleHeading.svelte';
  import { modulesTypes, type ModuleType } from '$lib/types/module';
  import { onMount } from 'svelte';
  import { currentOrganizationId } from '$stores/organization';
  import { modulesStore } from '$stores/module';
  import { CaretRight } from 'carbon-icons-svelte';
  import { Loading } from 'carbon-components-svelte';
  import CreateModule from '$lib/components/CRUD_Modules/CreateModules/CreateModule.svelte';
  import axios from 'axios';
  import notifications from '$stores/notification';
  import EmptyData from '$lib/components/EmptyData/EmptyData.svelte';

  let typesList: ModuleType[] = [];
  let allowedModulesStore = [];
  let selectedModule: ModuleType;
  let isLoading = false;

  onMount(async () => {
    isLoading = true;
    try {
      await fetchAllowedModules();
      typesList = modulesTypes;
      if ($modulesStore) {
        checkUniqueModulesPresence();
      }
    } catch (error) {
      const message = error?.response?.data?.field || 'Something went wrong obtaining the allowed modules';
      notifications.notify({ title: 'Error', subtitle: message, kind: 'error' });
    } finally {
      isLoading = false;
    }
  });

  async function fetchAllowedModules() {
    const url = `/api/v2/moduletype/organization/${$currentOrganizationId}`;
    const { data } = await axios.get<string[]>(url);
    allowedModulesStore = data;
  }

  function checkUniqueModulesPresence() {
    const hasThreatContext = $modulesStore?.some?.((m) => m.moduleName === 'threat_context');
    typesList = typesList.filter(
      (mod) =>
        !(hasThreatContext && mod.type === 'threat_context') && allowedModulesStore?.includes?.(mod.key.toUpperCase())
    );
  }

  function selectType(i: ModuleType) {
    selectedModule = i;
  }
</script>

{#if isLoading}
  <Loading />
{:else if typesList.length <= 0}
  <EmptyData messageObj={{ msg: 'No modules available' }} />
{:else}
  <ModuleHeading title="Create Module" subTitle="Create" showModuleName={false} />
  <div class="grid gap-4 md:grid-cols-3">
    <div>
      <InfoCard title="Select Module Type">
        <ul class="w-full">
          {#each typesList as item}
            {@const active = item === selectedModule}
            <li
              class="flex justify-between items-center py-2 px-3 cursor-pointer w-full"
              class:active
              on:click={() => selectType(item)}
              on:keypress={() => selectType(item)}
            >
              <span class="flex items-center">
                <img class="mr-3 w-5 dark:invert" class:dark:invert-0={active} src={item.image} alt="" />
                <h6 class="mt-1">{item.name}</h6>
              </span>
              <CaretRight />
            </li>
          {/each}
        </ul>
      </InfoCard>
    </div>
    <div class="col-span-2">
      <CreateModule {selectedModule} />
    </div>
  </div>
{/if}

<style>
  .active {
    background-color: var(--ctip-light);
    color: var(--ctip-primary);
    font-weight: bold;
    border-color: var(--ctip-border);
  }
</style>
