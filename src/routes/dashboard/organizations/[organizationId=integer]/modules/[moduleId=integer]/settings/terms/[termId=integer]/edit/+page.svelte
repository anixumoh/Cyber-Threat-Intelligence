<script lang="ts">
  import { page } from '$app/stores';
  import Client from '$lib/client';
  import { currentOrganizationId } from '$stores/organization';
  import { currentModule } from '$stores/module';
  import TermsNewEdit from '$lib/components/Settings/Terms/TermsNewEdit.svelte';
  import type { TermsListType } from '$lib/types/settings';
  import { onMount } from 'svelte';
  import { Loading } from 'carbon-components-svelte';
  import EditImage from '$lib/components/Settings/Terms/EditImage.svelte';

  const client = new Client();
  const { termId } = $page.params;

  const urlParams = new URLSearchParams(window.location.search);
  const hasType = urlParams.has('type');
  $: formType = urlParams.get('type');

  let resourceToEdit: undefined | TermsListType = undefined;
  let isLoadingForm = false;

  async function init() {
    isLoadingForm = true;
    const { data } = await client.settings.getSettingsDataView(
      $currentOrganizationId,
      $currentModule.id,
      $currentModule.moduleName,
      'terms',
      +termId
    );
    resourceToEdit = data;
    if (data.searchImageFilename) {
      const { data: image } = await client.settings.getSettingsDataViewImage(
        $currentOrganizationId,
        $currentModule.id,
        +termId
      );
      resourceToEdit.image = image;
    }
    isLoadingForm = false;
  }

  onMount(() => {
    init();
    return () => {
      client.abort();
    };
  });
</script>

{#if isLoadingForm}
  <Loading />
{:else if hasType}
  {#if formType === 'image'}
    <EditImage {resourceToEdit} />
  {/if}
{:else}
  <TermsNewEdit action="Edit" {resourceToEdit} />
{/if}
