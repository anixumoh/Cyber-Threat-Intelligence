<script lang="ts">
  import Client from '$lib/client';
  import CveDetailHeaderLite from '$lib/components/TCX/CveDetailHeaderLite.svelte';
  import TabRelationsTables from '$lib/components/TCX/TabRelationsTables.svelte';
  import { getPaginationInfo } from '$lib/functions/paginationUtils';
  import { TCXModel } from '$lib/types/tcx';
  import { currentModuleId } from '$stores/module';
  import { currentOrganizationId } from '$stores/organization';
  import { Button, Modal, SkeletonPlaceholder } from 'carbon-components-svelte';
  import { ArrowLeft, ArrowRight } from 'carbon-icons-svelte';
  import { createEventDispatcher } from 'svelte';
  import cvePagination from './cvePaginationStore';

  export let cveId: number;
  export let open = false;

  const dispatch = createEventDispatcher<{ cveIsRead: number }>();

  const client = new Client();

  let loading = false;
  let cve: Awaited<ReturnType<typeof client.malware.getCVE>>;

  $: open && getCve(cveId);

  function reload() {
    getCve(cveId, false);
  }

  async function getCve(cveId: number, dispatchRead = true) {
    loading = true;
    cve = await client.malware.getCVE($currentOrganizationId, $currentModuleId, cveId);
    loading = false;
    dispatch('cveIsRead', cveId);
  }

  const { paginationPage, paginationResult, paginationForm, paginationTotalPages, getPageResult, setForm } =
    cvePagination;

  $: currentIndex = $paginationResult?.list?.findIndex((cves) => cves.id === cveId);
  $: pageInfo = getPaginationInfo($paginationPage, $paginationTotalPages, currentIndex, $paginationForm?.maxRows || 10);

  async function handleClickPreviousNext(direction: 'previous' | 'next') {
    let targetPage: number;
    let targetIndex: number;
    if (direction === 'previous') {
      targetIndex = pageInfo.previousIndex;
      targetPage = pageInfo.previousPage;
    } else {
      targetIndex = pageInfo.nextIndex;
      targetPage = pageInfo.nextPage;
    }

    setForm({
      ...$paginationForm,
      page: targetPage
    });

    const result = getPageResult(targetPage);
    const cve = result?.list?.[targetIndex];
    if (cve) {
      cveId = cve.id;
      $paginationPage = targetPage;
    }
  }
</script>

<Modal
  bind:open
  on:click:button--primary={() => (open = false)}
  modalHeading="CVE details"
  primaryButtonText="Close"
  size="lg"
>
  {#if loading}
    <SkeletonPlaceholder class="w-full h-80" />
  {:else if cve}
    <div class="flex">
      <div class="flex items-center justify-end w-full">
        <Button
          kind="ghost"
          class="flex gap-2"
          on:click={() => handleClickPreviousNext('previous')}
          disabled={!pageInfo?.previous}
        >
          <ArrowLeft /> Previous CVE
        </Button>
        <Button
          kind="ghost"
          class="flex gap-2"
          on:click={() => handleClickPreviousNext('next')}
          disabled={!pageInfo?.next}
        >
          Next CVE <ArrowRight />
        </Button>
      </div>
    </div>
    <div class="flex flex-col gap-4">
      <CveDetailHeaderLite
        on:save
        on:save={reload}
        attributes={cve.data.attributes}
        relationships={cve.data.relationships}
        cve={cve.resourceData}
        labels={cve.resourceData.labels}
      />

      <TabRelationsTables
        readonly
        description={cve.data.attributes.description}
        id={cve?.resourceData?.cve}
        model={TCXModel.CVE}
        relationships={cve.data.relationships}
      />
    </div>
  {/if}
</Modal>
