<script lang="ts">
  import GenericButton from '$lib/components/Buttons/GenericButton.svelte';
  import InfoCardForm from '$lib/components/Card/InfoCardForm.svelte';
  import { currentOrganizationId } from '$stores/organization';
  import { currentModule } from '$stores/module';
  import { ChevronLeft, FolderDetails, InformationFilled } from 'carbon-icons-svelte';
  import { boolean, type InferType, object, string } from 'yup';
  import { createForm } from 'felte';
  import { validator } from '@felte/validator-yup';
  import { onMount } from 'svelte';
  import Client from '$lib/client';
  import { Checkbox, SkeletonText, TextArea, TooltipDefinition } from 'carbon-components-svelte';
  import InfoCard from '$lib/components/Card/InfoCard.svelte';
  import UploaderFile from '$lib/components/Uploader/UploaderFile.svelte';
  import type { ConfiguredType, TermsListType } from '$lib/types/settings';
  import notifications from '$stores/notification';
  import { goto } from '$app/navigation';
  import Crawlers from './Crawlers.svelte';
  import { handleServerError } from '$src/routes/dashboard/organizations/[organizationId=integer]/modules/[moduleId=integer]/settings/parameters/types/common';

  const client = new Client();

  export let action: 'Add' | 'Edit' = 'Add';
  export let resourceToEdit: undefined | TermsListType = undefined;

  let isLoading = false;
  let sheet: HTMLStyleElement;

  let imageFile = undefined;
  let crawlers: ConfiguredType[] = [];
  let setDataFirstTime = true;

  const termsSchema = object({
    searchPhrase: string()
      .required('This field is required')
      .test('is-searchPhrase', 'Must be at least 3 characters long', (searchPhrase) => {
        if (!searchPhrase) return true;
        searchPhrase = searchPhrase.replace(/['"]+/g, '');
        return !!searchPhrase.match('[^]{3,80}');
      })
      .test('has-double-quotes', 'Double quotes must be opened and closed', (searchPhrase) => {
        if (!searchPhrase) return true;
        return !searchPhrase.match(/"/g) || searchPhrase.match(/"/g).length % 2 === 0;
      }),
    searchEngines: boolean(),
    searchTwitter: boolean()
  });

  function searchPhraseData(searchPhrase: string) {
    const finishArray = [];
    searchPhrase?.split?.('\n').forEach((item) => {
      item = item.trim();
      item.length && finishArray.push(item);
    });

    return finishArray;
  }

  const { data, errors, isValid, form, createSubmitHandler, isSubmitting, setData } = createForm<
    InferType<typeof termsSchema>
  >({
    extend: validator({ schema: termsSchema }),
    onSubmit: async (values) => {
      isLoading = true;
      try {
        let someTermIsIncorrect = false;
        const { searchPhrase, ...rest } = values;
        const sendValues = {
          ...rest,
          searchFacebook: false,
          crawler: true,
          strict: false,
          ...(!resourceToEdit && {
            searchPhrase: searchPhraseData(searchPhrase),
            type: 'KEYWORD'
          }),
          configured: crawlers
            ?.filter((config: ConfiguredType) => config.enabled)
            .map?.(({ name, visionSchedExpression }: ConfiguredType) => {
              return {
                pluginId: name,
                visionSchedExpression: visionSchedExpression,
                enabled: true
              };
            })
        };

        if (resourceToEdit) {
          await client.settings.saveSettingsPut(
            $currentOrganizationId,
            $currentModule.id,
            $currentModule.moduleName,
            'terms',
            sendValues,
            resourceToEdit.id
          );

          if (!resourceToEdit.searchImageFilename && imageFile) {
            await client.settings.saveSettingsDataMultipartPut(
              $currentOrganizationId,
              $currentModule.id,
              resourceToEdit.id,
              sendValues,
              imageFile
            );
          }
          if (resourceToEdit.searchImageFilename && !imageFile) {
            await client.settings.deleteSettingsImage($currentOrganizationId, $currentModule.id, resourceToEdit.id);
          }
        } else {
          const { data } = await client.settings.saveSettingsDataMultipart(
            $currentOrganizationId,
            $currentModule.id,
            'terms',
            sendValues,
            imageFile
          );
          if ('error' in data && data.error.length > 0) {
            someTermIsIncorrect = true;
            handleIncorrectTerms(data);
          }
        }

        isLoading = false;
        goto(`/dashboard/organizations/${$currentOrganizationId}/modules/${$currentModule.id}/settings/terms`);
        if (!someTermIsIncorrect) {
          notifications.notify({
            kind: 'success',
            title: `The term was ${resourceToEdit ? 'updated' : 'created'} successfully!`
          });
        }
      } catch (error) {
        isLoading = false;
        handleServerError(error.response?.data);
      }
    }
  });
  const submit = createSubmitHandler();

  $: resourceToEdit && initData();
  $: !resourceToEdit && initData(false);

  onMount(() => {
    sheet = document.createElement('style');
    document.body.appendChild(sheet);

    return () => {
      document.body.removeChild(sheet);
      client.abort();
    };
  });

  function handleIncorrectTerms(data) {
    let notAddedItems = [];
    if (Array.isArray(data.error)) {
      notAddedItems = data.error as string[];
    }
    if (notAddedItems.length > 0) {
      notifications.notify({
        kind: 'error',
        title: 'Incorrect terms: ' + notAddedItems.map((item) => `${item.field}`).join(', ')
      });
    }
  }
  function initData(isEdit = true) {
    if (isEdit) {
      imageFile = resourceToEdit.image;
    }

    if (setDataFirstTime) {
      $data = {
        ...$data,
        ...(isEdit && {
          searchPhrase: resourceToEdit.searchPhrase,
          searchEngines: resourceToEdit.searchEngines,
          searchTwitter: resourceToEdit.searchTwitter
        })
      };
      setDataFirstTime = false;
    }
  }
</script>

<InfoCardForm title={`${action} Term`}>
  <svelte:fragment slot="action">
    {#if resourceToEdit}
      <GenericButton
        href="/dashboard/organizations/{$currentOrganizationId}/modules/{$currentModule.id}/settings/terms/{resourceToEdit.id}"
      >
        <FolderDetails /><span class="ml-1">Details</span>
      </GenericButton>
    {/if}
    <GenericButton
      href={`/dashboard/organizations/${$currentOrganizationId}/modules/${$currentModule.id}/settings/terms`}
    >
      <ChevronLeft class="fill-ctip-interactive" /><span class="ml-1">Back to list</span>
    </GenericButton>
  </svelte:fragment>
  <svelte:fragment slot="actions-form">
    <GenericButton on:click={submit} kind="primary" disabled={!$isValid || $isSubmitting}>
      {action === 'Add' ? 'Create' : 'Save'}
    </GenericButton>
  </svelte:fragment>
  {#if isLoading}
    <div class="block w-full mt-2">
      <SkeletonText paragraph lines={15} />
    </div>
  {:else}
    <div class="grid w-full grid-cols-1 p-3 md:grid-cols-2" id="raw-terms">
      <form use:form>
        <div class="relative">
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
            disabled={!!resourceToEdit}
          />
        </div>
        <div class="flex justify-between">
          <ul class="mt-4">
            <li>
              <Checkbox labelText="News" name="searchEngines" bind:checked={$data.searchEngines} />
            </li>
            <li>
              <Checkbox labelText="Real time Twitter feed" name="searchTwitter" bind:checked={$data.searchTwitter} />
            </li>
          </ul>
          <div class="flex flex-col flex-1 my-4 ml-4">
            <InfoCard title="Uploaded Logo">
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
              <div class="flex flex-col flex-1">
                <div class="flex justify-end mx-4 my-4">
                  <UploaderFile titleButton="Choose logo" bind:imageFile />
                </div>
              </div>
            </InfoCard>
          </div>
        </div>
      </form>
      <div class="ml-3">
        <Crawlers bind:crawlers resource={resourceToEdit} />
      </div>
    </div>
  {/if}
</InfoCardForm>

<style>
  :global(#raw-terms .my-tooltip svg) {
    fill: var(--ctip-interactive);
  }
</style>
