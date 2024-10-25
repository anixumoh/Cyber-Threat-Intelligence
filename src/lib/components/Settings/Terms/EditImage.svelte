<script lang="ts">
  import GenericButton from '$lib/components/Buttons/GenericButton.svelte';
  import InfoCardForm from '$lib/components/Card/InfoCardForm.svelte';
  import { currentOrganizationId } from '$stores/organization';
  import { currentModule } from '$stores/module';
  import { ChevronLeft, FolderDetails, InformationFilled } from 'carbon-icons-svelte';
  import type { TermsListType } from '$lib/types/settings';
  import { SkeletonText, TextInput, TooltipDefinition } from 'carbon-components-svelte';
  import InfoCard from '$lib/components/Card/InfoCard.svelte';
  import UploaderFile from '$lib/components/Uploader/UploaderFile.svelte';
  import Client from '$lib/client';
  import notifications from '$stores/notification';
  import { goto } from '$app/navigation';

  const client = new Client();

  export let resourceToEdit: undefined | TermsListType = undefined;

  let isLoading = false;
  let imageFile = undefined;

  $: resourceToEdit && initData();

  function initData() {
    imageFile = resourceToEdit.image;
  }
  // code..
  async function submit() {
    isLoading = true;
    try {
      if (imageFile) {
        await client.settings.saveSettingsImageMultipartPut(
          $currentOrganizationId,
          $currentModule.id,
          resourceToEdit.id,
          imageFile
        );
      }
      isLoading = false;
      goto(`/dashboard/organizations/${$currentOrganizationId}/modules/${$currentModule.id}/settings/terms`);
      notifications.notify({
        kind: 'success',
        title: 'The image was updated successfully.'
      });
    } catch (error) {
      isLoading = false;
      const msg = error?.response?.data?.message || 'Something went wrong';
      notifications.notify({
        kind: 'error',
        title: msg
      });
    }
  }
</script>

<InfoCardForm title="Edit Image">
  <svelte:fragment slot="action">
    <GenericButton
      href="/dashboard/organizations/{$currentOrganizationId}/modules/{$currentModule.id}/settings/terms/{resourceToEdit?.id}"
    >
      <FolderDetails /><span class="ml-1">Details</span>
    </GenericButton>
    <GenericButton
      href={`/dashboard/organizations/${$currentOrganizationId}/modules/${$currentModule.id}/settings/terms`}
    >
      <ChevronLeft /><span class="ml-1">Back to list</span>
    </GenericButton>
  </svelte:fragment>
  <svelte:fragment slot="actions-form">
    <GenericButton on:click={submit} kind="primary" disabled={!imageFile}>Save</GenericButton>
  </svelte:fragment>
  {#if isLoading}
    <div class="block w-full mt-2">
      <SkeletonText paragraph lines={15} />
    </div>
  {:else}
    <div class="flex flex-col justify-between p-3" id="edit-image-terms">
      <TextInput
        name="searchPhrase"
        labelText="Search Phrase"
        placeholder="Write here the search phrase"
        value={resourceToEdit?.searchPhrase ?? ''}
        disabled
      />
      <div class="flex flex-col my-4">
        <InfoCard title="Uploaded Logo">
          <svelte:fragment slot="action">
            <TooltipDefinition
              direction="top"
              align="start"
              tooltipText="Upload a logo in order to detect the abuse of it"
              class="my-tooltip"
            >
              <InformationFilled class="text-ctip-primary cursor-pointer" />
            </TooltipDefinition>
          </svelte:fragment>
          <div class="flex flex-col flex-1">
            <div class="my-4 mx-4 flex justify-end">
              <UploaderFile titleButton="Choose logo" bind:imageFile enableDelete={false} />
            </div>
          </div>
        </InfoCard>
      </div>
    </div>
  {/if}
</InfoCardForm>

<style>
  :global(#edit-image-terms .my-tooltip svg) {
    fill: var(--ctip-primary);
  }
</style>
