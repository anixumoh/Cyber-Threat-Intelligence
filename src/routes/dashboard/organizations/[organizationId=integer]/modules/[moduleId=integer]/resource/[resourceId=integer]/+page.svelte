<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import threatsStore from '$stores/threats';
  import { currentOrganization, currentOrganizationId } from '$stores/organization';
  import { currentModule } from '$stores/module';
  import ModuleHeading from '$lib/components/module/ModuleHeading.svelte';
  import { Loading, Tag } from 'carbon-components-svelte';
  import roleStore from '$stores/role';
  import ActionButton from '$lib/components/ThreatsCommons/Details/ActionButton.svelte';
  import Client from '$lib/client';
  import { MODULE_NAME } from '$lib/constants/modules';
  import { headerDetailsThreats } from '$lib/utils/headersDetailsThreats';
  import DetailsHeader from '$lib/components/ThreatsCommons/Details/DetailsHeader.svelte';
  import InfoCard from '$lib/components/Card/InfoCard.svelte';
  import ReportEmailSection from '$lib/components/ThreatsCommons/Details/ReportEmailSection.svelte';
  import HistorySection from '$lib/components/ThreatsCommons/Details/HistorySection.svelte';
  import MetadataSection from '$lib/components/ThreatsCommons/Details/MetadataSection.svelte';
  import MoreInfoDetailsSection from '$lib/components/ThreatsCommons/Details/MoreInfoDetailsSection.svelte';
  import CustomersTable from '$lib/components/ThreatsCommons/Details/CustomersTable.svelte';
  import Header from '$lib/components/ThreatsCommons/Details/Header.svelte';
  import ButtonsSection from '$lib/components/ThreatsCommons/Details/ButtonsSection.svelte';
  import StolenDataMap from '$lib/components/ThreatsCommons/Details/StolenDataMap.svelte';
  import { goto } from '$app/navigation';
  import NotFound from '$lib/components/NotFound.svelte';

  let showFollowUpBtn = false;
  let headerData = [];

  let isMenuReportOpened = false;
  let isMenuHistoryOpened = false;
  let loading = true;
  let notFound = false;

  const client = new Client();

  onMount(() => {
    init();
    return () => {
      client.abort();
    };
  });

  function checkIfShowFollowUpBtn() {
    return (
      $currentModule.moduleName === MODULE_NAME.CUSTOM ||
      $currentModule.moduleName === MODULE_NAME.MOBILE_APPS ||
      $currentModule.moduleName === MODULE_NAME.DOMAIN_PROTECTION ||
      $currentModule.moduleName === MODULE_NAME.DARK_WEB ||
      (($currentModule.moduleName === MODULE_NAME.DATA_LEAKAGE ||
        $currentModule.moduleName === MODULE_NAME.HACKTIVISM) &&
        ($page.url.hostname === 'tcallzgroup.blueliv.com' || $page.url.hostname === 'tcpre-production.blueliv.com'))
    );
  }

  async function init() {
    const { resourceId } = $page.params;
    if ($currentModule.moduleName === MODULE_NAME.MALWARE) {
      return goto(
        `/dashboard/organizations/${$currentOrganizationId}/modules/${$currentModule.id}/resource/malware/${resourceId}`
      );
    }

    loading = true;
    $threatsStore.isLoadingDetails = true;

    try {
      await threatsStore.loadThreat(
        $currentOrganization.id,
        $currentModule.id,
        $currentModule?.moduleName,
        +resourceId,
        $page.url.pathname
      );
    } catch (error) {
      notFound = true;
      loading = false;
      return;
    }

    if (!$threatsStore.selectedForDetails.read) {
      $threatsStore.selectedForDetails.read = true;
      client.threats.markAsRead(
        [$threatsStore.selectedForDetails.resourceId],
        $currentOrganizationId,
        $currentModule.id,
        $currentModule.moduleName,
        true
      );
    }

    showFollowUpBtn = checkIfShowFollowUpBtn();
    headerData = headerDetailsThreats[$currentModule.moduleName];
    loading = false;
  }
</script>

{#if loading}
  <Loading />
{:else if notFound}
  <NotFound />
{:else}
  <ModuleHeading isMainView={false} />
  <Header />
  <ButtonsSection />
  <DetailsHeader {headerData} />
  {#if $currentModule?.moduleName === MODULE_NAME.HACKTIVISM}
    <InfoCard title="Retweets Information" class="mt-3">
      <p class="mx-2 my-3">
        <span class="mr-2">Total Retweets:</span>
        <Tag type="blue">{$threatsStore.selectedForDetails?.totalRetweets}</Tag>
      </p>
    </InfoCard>
  {/if}

  {#if !$roleStore.customer || $threatsStore.selectedForDetails?.history?.length}
    <div class="border-t-[1px] border-b-[1px] border-ctip-border bg-ctip-ui border-solid mt-3 p-2 flex justify-start">
      {#if !$roleStore.customer}
        <ActionButton
          isActive={isMenuReportOpened}
          on:click={() => (isMenuReportOpened = !isMenuReportOpened)}
          text="Report Email"
        />
      {/if}
      {#if showFollowUpBtn && !$roleStore.customer && $threatsStore.selectedForDetails?.history?.length}
        <div class="ml-2">
          <ActionButton
            isActive={isMenuHistoryOpened}
            on:click={() => (isMenuHistoryOpened = !isMenuHistoryOpened)}
            text="History"
          />
        </div>
      {/if}
    </div>
  {/if}
  {#if isMenuReportOpened}
    <ReportEmailSection />
  {/if}

  {#if isMenuHistoryOpened}
    <HistorySection />
  {/if}

  {#if $threatsStore.selectedForDetails?.metadata}
    <MetadataSection />
  {/if}

  {#if $currentModule?.moduleName !== MODULE_NAME.CREDENTIAL && $currentModule?.moduleName !== MODULE_NAME.CREDIT_CARD}
    <MoreInfoDetailsSection />
  {/if}

  {#if $currentModule.moduleName === MODULE_NAME.CREDENTIAL && ($threatsStore.selectedForDetails.resourceType === 'BotIp' || $threatsStore.selectedForDetails.resourceType === 'Botnet')}
    <StolenDataMap />
  {/if}

  <CustomersTable on:reload={init} />
{/if}
