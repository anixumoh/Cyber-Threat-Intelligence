<script lang="ts">
  import type Module from '$lib/types/module';
  import type { ModuleType } from '$lib/types/module';
  import { modulesStore } from '$stores/module';
  import { Loading, TextArea, Toggle } from 'carbon-components-svelte';
  import Client from '$lib/client';
  import notifications from '$stores/notification';
  import GenericButton from '$lib/components/Buttons/GenericButton.svelte';
  import InfoCardForm from '../../Card/InfoCardForm.svelte';
  import Fields from '$lib/components/CRUD_Modules/Fields.svelte';
  import Sources from '$lib/components/CRUD_Modules/Sources.svelte';
  import ViewDetailsItem from '$lib/components/ThreatsCommons/ViewDetailsItem.svelte';
  import { Settings, Time } from 'carbon-icons-svelte';

  const client = new Client();

  type TransformadaType = {
    name: string;
    checked: boolean;
  };

  export let selectedModuleType: ModuleType;
  export let onFinishedEditionCallback = () => {};
  export let shortName: string;
  export let orgEnabled: boolean;
  export let prefix: string = '';
  export let orgId: number;
  export let moduleData: Module = null;
  export let key = '';
  export let strictTermText = '';

  let isLoading = false;
  let isLoadingSources = false;
  let isLoadingSearch = false;
  let sources: TransformadaType[] = [];
  let placeholder = '';
  let maxShortNameLengthPrefix: number;
  let maxShortNameLength = 8;
  let errors: any = {};

  $: shortName && checkShortName();
  $: moduleData && checkName();
  $: maxShortNameLengthPrefix = maxShortNameLength - prefix?.length;
  $: if (selectedModuleType && selectedModuleType.type === 'custom') {
    loadResources();
  }
  function checkName() {
    if (!moduleData.name) return;
    if (moduleData.name.length > 45) {
      errors.name = 'Max length is 45 characters.';
    } else if (moduleData.name.length < 6) {
      errors.name = 'Min length is 6 characters.';
    } else {
      errors.name = null;
    }
  }

  function checkShortName() {
    if (!moduleData.shortName) return;
    const otherModulesWithThisShortName = $modulesStore?.filter((e) => e.shortName === `${prefix}${shortName}`);
    const otherModulesWithDifferentId = otherModulesWithThisShortName?.filter((e) => e.id !== moduleData.id);

    if (otherModulesWithDifferentId.length > 0) {
      errors.shortName = 'Shortname already in use';
    } else if (shortName.length > maxShortNameLengthPrefix) {
      errors.shortName = `This shortname is too long: max ${maxShortNameLengthPrefix} characters allowed`;
    } else {
      errors.shortName = null;
    }
  }

  async function editClicked() {
    try {
      isLoading = true;
      moduleData.shortName = `${prefix}${shortName}`;
      if (selectedModuleType.type === 'custom') {
        moduleData.plugins = sources.filter((source) => source.checked).map((source) => source.name);
      }
      if (strictTermText) {
        const splitText = strictTermText.split(/[\n]+/);
        moduleData.moduleStrictTokens = splitText;
      }
      await client.modules.editModule(orgId, moduleData);
      notifications.notify({
        title: 'Success',
        kind: 'success',
        subtitle: 'Module edited successfully.'
      });
      onFinishedEditionCallback();
    } catch (error) {
      notifications.notify({ title: error, kind: 'error', subtitle: 'Something went wrong. Please try again.' });
    } finally {
      isLoading = false;
    }
  }
  async function runSearch() {
    const client = new Client();
    try {
      isLoadingSearch = true;
      await client.modules.runSearch(moduleData.id, orgId);
      notifications.notify({
        title: 'Success',
        kind: 'success',
        subtitle: 'You can check the jobs section to see the ones scheduled and in execution.'
      });
    } catch (error) {
      notifications.notify({ title: error, kind: 'error', subtitle: 'Something went wrong. Please try again.' });
    } finally {
      isLoadingSearch = false;
    }
  }
  async function loadResources() {
    try {
      isLoadingSources = true;
      const allSources = (await client.organization.getPlugins()).data;
      const enabledSourcesInModule = (await client.settings.getCustomModulePlugins(orgId, moduleData.id)).data;
      sources = allSources.map((source) => ({ name: source, checked: enabledSourcesInModule.includes(source) }));
      sources.sort((a, b) => (a.checked === b.checked ? 0 : a.checked ? -1 : 1));
    } catch (error) {
      notifications.notify({
        title: error,
        kind: 'error',
        subtitle: 'Unable to retrieve sources for this custom module. Please try again.'
      });
    } finally {
      isLoadingSources = false;
    }
  }
</script>

{#if isLoading}
  <div class=" flex items-center justify-center w-full h-full p-20">
    <Loading withOverlay={false} />
  </div>
{:else if selectedModuleType}
  <InfoCardForm title="Edit the fields">
    <div class="flex flex-col my-4 mx-4 w-full">
      <div class="pb-4">{selectedModuleType.description}</div>
      <ViewDetailsItem action={true} title="Created at" icon={Time} value="ye">
        <svelte:fragment slot="action">
          <div class="flex gap-2 justify-center items-center search">
            {new Date(moduleData.createdAt).toLocaleString()}
            <GenericButton
              disabled={isLoadingSearch || !moduleData.enabled || !orgEnabled}
              on:click={runSearch}
              icon={Settings}>Run search</GenericButton
            >
          </div>
        </svelte:fragment>
      </ViewDetailsItem>
      <div class="border-bottom w-full" />
      <div class="flex items-center gap-6">
        <div class="w-full">
          <Fields
            bind:name={moduleData.name}
            bind:shortName
            bind:key
            bind:prefix
            bind:placeholder
            bind:firstDataLoad={moduleData.firstDataLoad}
            bind:hidePasswordsForCredentials={moduleData.hidePasswords}
            bind:hideCVVForCreditCards={moduleData.hideCC}
            {errors}
          />
        </div>
        <Toggle
          bind:toggled={moduleData.enabled}
          labelText="Status"
          class="flex-grow-0 max-w-fit mr-2  ml-auto [&_label]:mb-4 [&_span]:mt-2 mb-auto mt-3"
          labelA=""
          labelB=""
          disabled={!orgEnabled}
        />
      </div>

      {#if selectedModuleType.type === 'custom'}
        {#if isLoadingSources}
          <div class=" flex items-center justify-center w-full h-full p-20">
            <Loading withOverlay={false} />
          </div>
        {:else}
          <div class="flex flex-col">
            <div>Sources:</div>
            <Sources bind:sources />
          </div>
        {/if}
      {/if}
      {#if key !== 'explorer' && key !== 'threat_context'}
        <TextArea labelText="Strict Term:" bind:value={strictTermText} />
      {/if}
    </div>
    <svelte:fragment slot="actions-form">
      <GenericButton on:click={editClicked} disabled={errors.name || errors.shortName} kind="primary"
        >Save</GenericButton
      >
    </svelte:fragment>
  </InfoCardForm>
{/if}
