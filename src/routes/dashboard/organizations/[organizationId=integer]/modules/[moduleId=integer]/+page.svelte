<script lang="ts">
  import Client from '$lib/client';
  import GenericButton from '$lib/components/Buttons/GenericButton.svelte';
  import ModuleHeading from '$lib/components/module/ModuleHeading.svelte';
  import AddNewResource from '$lib/components/ThreatsCommons/AddNewResource/AddNewResource.svelte';
  import Uploader from '$lib/components/Uploader/index.svelte';
  import { MODULE_NAME } from '$lib/constants/modules';
  import threatsFilterStore from '$stores/filters';
  import { currentModule, currentModuleId, moduleNameUrl } from '$stores/module';
  import { currentOrganization, currentOrganizationId } from '$stores/organization';
  import preferencesStore from '$stores/preferences';
  import threatsStore from '$stores/threats';
  import userStore from '$stores/user';
  import { Add, ChartLine, ChevronDown, ChevronUp, Download } from 'carbon-icons-svelte';
  import { onMount } from 'svelte';
  import ThreatDashboard from './ThreatDashboard.svelte';
  import Threats from './Threats.svelte';

  const client = new Client();

  let chartStatus = $preferencesStore?.modules?.[$currentOrganizationId]?.[$currentModuleId]?.chartStatus ?? true;
  let chartStatusDisabled = false;
  let openAddResource = false;

  $: currentLandingPage = `${$currentOrganization.name},${$currentOrganization.id},${$currentModule.name},${$currentModule.id}`;
  $: isDefaultLanding = $userStore?.landingPage === currentLandingPage;
  $: threatsFilterStore.getInitialThreadFilter($currentOrganizationId, $currentModuleId, $preferencesStore);

  onMount(() => {
    return () => {
      client.abort();
    };
  });

  async function markAsDefault(landingPage: string) {
    await client.settings.setUserLanding(landingPage);
    $userStore.landingPage = landingPage;
  }

  function addedResource(event) {
    openAddResource = event.detail.openAddResource;
  }

  async function reloadList() {
    await threatsStore.loadThreats(
      $currentOrganizationId,
      $currentModuleId,
      $moduleNameUrl,
      $threatsFilterStore,
      true,
      true
    );
  }

  async function toggleChartStatus() {
    chartStatus = !chartStatus;
    chartStatusDisabled = true;
    await preferencesStore.setChartStatus($currentOrganizationId, $currentModuleId, chartStatus);
    chartStatusDisabled = false;
  }
</script>

<ModuleHeading title="THREATS">
  {#if $currentModule.type === 'CREDENTIALS'}
    <GenericButton
      kind="tertiary"
      href="/dashboard/organizations/{$currentOrganizationId}/reports?selected=credentials"
    >
      Credentials Report
      <Download />
    </GenericButton>
  {/if}

  <GenericButton
    kind={isDefaultLanding ? 'primary' : 'tertiary'}
    on:click={() => markAsDefault(isDefaultLanding ? '' : currentLandingPage)}>Mark as default</GenericButton
  >
  <GenericButton disabled={chartStatusDisabled} on:click={toggleChartStatus} size="small" kind="tertiary">
    <ChartLine />
    {#if chartStatus}
      <ChevronUp />
    {:else}
      <ChevronDown />
    {/if}
  </GenericButton>
</ModuleHeading>

<div class={!chartStatus && 'hidden'}>
  <ThreatDashboard filters={$threatsFilterStore} />
</div>
{#if $moduleNameUrl !== MODULE_NAME.CREDENTIAL && $moduleNameUrl !== MODULE_NAME.CREDIT_CARD && $moduleNameUrl !== MODULE_NAME.MALWARE}
  <GenericButton class="mb-2" kind="tertiary" on:click={() => (openAddResource = true)}>
    Add Resource <Add />
  </GenericButton>
{:else if $moduleNameUrl === MODULE_NAME.MALWARE}
  <Uploader on:uploadFile={reloadList} />
{/if}

<Threats />

<AddNewResource {openAddResource} on:addedResource={($event) => addedResource($event)} />
