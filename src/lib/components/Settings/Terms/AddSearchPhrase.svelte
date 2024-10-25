<script lang="ts">
  import GenericButton from '$lib/components/Buttons/GenericButton.svelte';
  import InfoCardForm from '$lib/components/Card/InfoCardForm.svelte';
  import { currentOrganizationId } from '$stores/organization';
  import { currentModule } from '$stores/module';
  import { ChevronLeft, InformationFilled } from 'carbon-icons-svelte';
  import { type InferType, object, string } from 'yup';
  import { createForm } from 'felte';
  import { validator } from '@felte/validator-yup';
  import notifications from '$stores/notification';
  import { SkeletonText, TextArea, TooltipDefinition } from 'carbon-components-svelte';
  import Client from '$lib/client';
  import { goto } from '$app/navigation';
  import { handleServerError } from '$src/routes/dashboard/organizations/[organizationId=integer]/modules/[moduleId=integer]/settings/parameters/types/common';

  const client = new Client();

  export let action: 'Search Phrase' | 'Image' = 'Search Phrase';

  let isLoading = false;

  const schema = object({
    searchPhrase: string()
      .required('This field is required')
      .test('is-searchPhrase', 'Must be at least 3 characters long', (searchPhrase) => {
        if (!searchPhrase) return true;
        return !!searchPhrase.match('[^]{3,80}');
      })
  });

  const { data, errors, isValid, form, createSubmitHandler, isSubmitting, setData } = createForm<
    InferType<typeof schema>
  >({
    extend: validator({ schema: schema }),
    onSubmit: async (values) => {
      try {
        const { searchPhrase, ...rest } = values;
        const valuesToSend = [];
        searchPhrase.split('\n').forEach((searchPhrase: string) => {
          searchPhrase = searchPhrase.trim();
          valuesToSend.push({ value: searchPhrase });
        });

        await client.settings.saveSettingsData(
          $currentOrganizationId,
          $currentModule.id,
          $currentModule.moduleName,
          'KEYWORD',
          valuesToSend
        );
        goto(`/dashboard/organizations/${$currentOrganizationId}/modules/${$currentModule.id}/settings/terms`);

        notifications.notify({
          kind: 'success',
          title: `The term${valuesToSend.length > 1 ? 's' : ''} ${
            valuesToSend.length > 1 ? 'were' : 'was'
          } successfully!`
        });
      } catch (error) {
        handleServerError(error.response?.data);
      }
    }
  });

  const submit = createSubmitHandler();
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
    <GenericButton on:click={submit} kind="primary" disabled={!$isValid || $isSubmitting}>Create</GenericButton>
  </svelte:fragment>
  {#if isLoading}
    <div class="block w-full mt-2">
      <SkeletonText paragraph lines={15} />
    </div>
  {:else}
    <form use:form id="search-phrase">
      <div class="relative m-3">
        <span class="absolute top-0 right-11">
          <TooltipDefinition
            direction="top"
            align="start"
            tooltipText="Insert the search phrase (e.g. mycompany.co.uk). You can also add multiple search phrases (one per line)."
            class="my-tooltip"
          >
            <InformationFilled class="cursor-pointer text-ctip-interactive" />
          </TooltipDefinition>
        </span>

        <TextArea
          name="searchPhrase"
          bind:value={$data.searchPhrase}
          on:change={() => ($data.searchPhrase = $data.searchPhrase.trim())}
          invalid={!!$errors.searchPhrase}
          invalidText={$errors?.searchPhrase?.[0]}
          labelText="Search Phrase"
          placeholder="Write here the search phrases, separated by a line break"
          maxCount={80}
        />
      </div>
    </form>
  {/if}
</InfoCardForm>

<style>
  :global(#search-phrase .my-tooltip svg) {
    fill: var(--ctip-interactive);
  }
</style>
