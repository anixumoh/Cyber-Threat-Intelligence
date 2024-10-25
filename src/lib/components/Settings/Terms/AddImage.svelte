<script lang="ts">
  import { goto } from '$app/navigation';
  import Client from '$lib/client';
  import GenericButton from '$lib/components/Buttons/GenericButton.svelte';
  import InfoCard from '$lib/components/Card/InfoCard.svelte';
  import InfoCardForm from '$lib/components/Card/InfoCardForm.svelte';
  import UploaderFile from '$lib/components/Uploader/UploaderFile.svelte';
  import { handleServerError } from '$src/routes/dashboard/organizations/[organizationId=integer]/modules/[moduleId=integer]/settings/parameters/types/common';
  import { currentModule } from '$stores/module';
  import notifications from '$stores/notification';
  import { currentOrganizationId } from '$stores/organization';
  import { validator } from '@felte/validator-yup';
  import { SkeletonText, TextInput, TooltipDefinition } from 'carbon-components-svelte';
  import { ChevronLeft, CloseFilled, InformationFilled, TrashCan } from 'carbon-icons-svelte';
  import { createForm } from 'felte';
  import { object, string, type InferType } from 'yup';

  const client = new Client();

  export let action: 'Search Phrase' | 'Image' = 'Image';

  type ImagesType = {
    searchPhrase: string;
    image: unknown;
  };

  let isLoading = false;
  let imageFile = undefined;
  let imagesToAdd: ImagesType[] = [];

  const schema = object({
    searchPhrase: string()
      .required('This field is required')
      .test('is-searchPhrase', 'Must be at least 3 characters long', (searchPhrase) => {
        if (!searchPhrase) return true;
        return !!searchPhrase.match('[^]{3,80}');
      })
  });

  const { data, errors, isValid, form, createSubmitHandler, isSubmitting, reset } = createForm<
    InferType<typeof schema>
  >({
    extend: validator({ schema: schema }),
    onSubmit: async (values) => {
      const { searchPhrase, ...rest } = values;
      if (imagesToAdd.length + 1 <= 4) {
        imagesToAdd = [...imagesToAdd, { searchPhrase: searchPhrase.trim(), image: imageFile }];
        reset();
        imageFile = undefined;
      } else {
        notifications.notify({
          kind: 'error',
          title: 'No more images can be added'
        });
      }
    }
  });

  const submit = createSubmitHandler();

  async function onSaveImages() {
    isLoading = true;
    try {
      const requests = [];
      imagesToAdd.forEach(({ searchPhrase, image }) => {
        requests.push(
          client.settings.saveSettingsImageMultipart(
            $currentOrganizationId,
            $currentModule.id,
            $currentModule.moduleName,
            searchPhrase,
            image
          )
        );
      });
      await Promise.all(requests);
      isLoading = false;
      goto(`/dashboard/organizations/${$currentOrganizationId}/modules/${$currentModule.id}/settings/terms`);

      notifications.notify({
        kind: 'success',
        title: `The term${imagesToAdd.length > 1 ? 's' : ''} ${imagesToAdd.length > 1 ? 'were' : 'was'} successfully!`
      });
    } catch (error) {
      isLoading = false;
      handleServerError(error.response?.data);
    }
  }
</script>

<InfoCardForm title={`Add ${action}`}>
  <svelte:fragment slot="action">
    <GenericButton
      href={`/dashboard/organizations/${$currentOrganizationId}/modules/${$currentModule.id}/settings/terms`}
    >
      <ChevronLeft /><span class="ml-1">Back to list</span>
    </GenericButton>
  </svelte:fragment>
  <svelte:fragment slot="actions-form">
    <GenericButton on:click={onSaveImages} kind="primary" disabled={!imagesToAdd.length}>Create</GenericButton>
  </svelte:fragment>
  {#if isLoading}
    <div class="block w-full mt-2">
      <SkeletonText paragraph lines={15} />
    </div>
  {:else}
    <div class="grid w-full grid-cols-1 p-3 md:grid-cols-2" id="raw-terms">
      <form use:form id="search-phrase">
        <div class="relative">
          <span class="absolute top-0 right-2">
            <TooltipDefinition
              direction="top"
              align="start"
              tooltipText="Insert the search phrase (e.g. mycompany.co.uk)"
              class="my-tooltip"
            >
              <InformationFilled class="cursor-pointer text-ctip-interactive" />
            </TooltipDefinition>
          </span>
          <TextInput
            name="searchPhrase"
            labelText="Search Phrase"
            placeholder="Write here the search phrase"
            bind:value={$data.searchPhrase}
            on:change={() => ($data.searchPhrase = $data.searchPhrase.trim())}
            invalid={!!$errors.searchPhrase}
            invalidText={$errors?.searchPhrase?.[0]}
          />
        </div>
        <div class="flex flex-col flex-1 my-4">
          <InfoCardForm title="Uploaded Logo">
            <svelte:fragment slot="action">
              <TooltipDefinition
                direction="top"
                align="start"
                tooltipText="Upload a logo in order to detect the abuse of it"
                class="my-tooltip"
              >
                <InformationFilled class="cursor-pointer text-ctip-interactive" />
              </TooltipDefinition>
            </svelte:fragment>
            <svelte:fragment slot="actions-form">
              <GenericButton on:click={submit} kind="primary" disabled={!$isValid || $isSubmitting || !imageFile}>
                Add image to create
              </GenericButton>
            </svelte:fragment>
            <div class="flex flex-col flex-1">
              <div class="flex justify-end mx-4 my-4">
                <UploaderFile titleButton="Choose logo" bind:imageFile />
              </div>
            </div>
          </InfoCardForm>
        </div>
      </form>
      <div class="ml-3">
        <InfoCard title="Images to add">
          <svelte:fragment slot="action">
            <TooltipDefinition
              direction="top"
              align="end"
              tooltipText="Add images to the list in order to be able to create terms (up to 4)"
              class="my-tooltip"
            >
              <InformationFilled class="cursor-pointer text-ctip-interactive" />
            </TooltipDefinition>
          </svelte:fragment>
          <ul class="w-full">
            {#if imagesToAdd.length}
              <li class="flex items-center justify-between p-2 bg-ctip-ui text-ctip-text">
                <span>SEARCH PHRASE</span>
                <span>DELETE</span>
              </li>
            {/if}
            {#each imagesToAdd as imageToAdd}
              <li class="flex items-center justify-between p-2">
                <div class="mb-0">
                  <TextInput class="form-control form-control-sm" bind:value={imageToAdd.searchPhrase} />
                </div>
                <GenericButton class="text-ctip-danger">
                  <TrashCan />
                </GenericButton>
              </li>
            {:else}
              <li class="flex items-center m-3">
                <CloseFilled class="mr-2" />
                There aren't images in the list
              </li>
            {/each}
          </ul>
        </InfoCard>
      </div>
    </div>
  {/if}
</InfoCardForm>

<style>
  :global(#search-phrase .my-tooltip svg) {
    fill: var(--ctip-primary);
  }
</style>
