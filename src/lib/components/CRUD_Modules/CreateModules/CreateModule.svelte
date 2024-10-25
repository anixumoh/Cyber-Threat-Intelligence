<script lang="ts">
  import type Module from '$lib/types/module';
  import type { ModuleModelType, ModuleType } from '$lib/types/module';
  import { currentOrganization } from '$stores/organization';
  import { modulesStore, moduleCacheStore } from '$stores/module';
  import { Loading, ProgressIndicator, ProgressStep, SkeletonPlaceholder, TextArea } from 'carbon-components-svelte';
  import Client from '$lib/client';
  import notifications from '$stores/notification';
  import GenericButton from '$lib/components/Buttons/GenericButton.svelte';
  import { goto } from '$app/navigation';
  import InfoCardForm from '../../Card/InfoCardForm.svelte';
  import { MODULE_NAME } from '$lib/constants/modules';
  import Fields from '../Fields.svelte';
  import Sources from '../Sources.svelte';

  const client = new Client();

  type TransformadaType = {
    name: string;
    checked: boolean;
  };

  export let selectedModule: ModuleType;
  export let redirectAfterCreation: boolean = true;
  export let onFinishedCreationCallback = () => {};

  let isLoading = false;
  let isLoadingSources = false;
  let showForm = false;
  let key: string;
  let sources: TransformadaType[] = [];
  let placeholder = '';
  let shortName: string;
  let firstDataLoad = false;
  let name: string;
  let prefix: string;
  let strictTermText: string;
  let maxShortNameLengthPrefix: number;
  let maxShortNameLength = 8;
  let errors: any = {};
  let shortNameToSend: string;
  let hideCCForCreditCards = false;
  let hidePasswordsForCredentials = false;
  let currentIndex = 0;

  $: shortName && checkShortName();
  $: name !== undefined && checkName();
  $: selectType(selectedModule);

  async function selectType(i: ModuleType) {
    sources = [];
    selectedModule = i;
    key = i?.key;
    showForm = false;
    if (i?.type === 'credit_card') {
      selectedModule = {
        ...selectedModule,
        key: 'credit_cards_full',
        prefix: 'CC-',
        name: 'Credit cards'
      };
      key = selectedModule.key;
      showForm = true;
    } else if (i?.type === 'custom') {
      isLoadingSources = true;
      const { data } = await client.organization.getPlugins();
      sources = data.map((source) => ({ name: source, checked: false }));
      isLoadingSources = false;
    } else {
      showForm = true;
    }
    autoComplete(i);
  }

  function autoComplete(selected: ModuleType) {
    const sname = selected?.name;
    const namePrefix = sname?.replace(/\([^\(]*?\)/g, '');
    placeholder = namePrefix;
    name = setDefaultName(sname);
    const match = namePrefix?.match(/\b(\w)/g);
    prefix = selected?.prefix;
    let i = $modulesStore.length;
    maxShortNameLengthPrefix = maxShortNameLength - prefix?.length;
    shortName = match ? match.join('').substr(0, 3) + i : '';
    while (checkShortName()) {
      i++;
      shortName = match ? match.join('').substr(0, 3) + i : '';
    }
  }

  function setDefaultName(name: string) {
    if ($modulesStore) {
      const repeated = $modulesStore.filter((e) => e.name?.toLowerCase() === name?.toLowerCase()).length;

      if (repeated === 1) {
        const number = name.replace(/[^0-9]/g, '') || '0';
        const count = parseInt(number, 10);
        if (count > 0) {
          name = name.replace(/[0-9]/g, '');
        }
        return setDefaultName(`${name}${count + 1}`);
      }
      return name;
    }
  }

  function checkName() {
    if ($modulesStore?.filter?.((e) => e.name === name).length) {
      errors.name = 'There is another module with this name.';
    } else if (name.length > 45) {
      errors.name = 'Max length is 45 characters.';
    } else if (name.length < 6) {
      errors.name = 'Min length is 6 characters.';
    } else {
      errors.name = null;
    }
  }

  function checkShortName() {
    if ($modulesStore?.filter?.((e) => e.shortName === `${prefix}${shortName}`).length) {
      errors.shortName = 'Shortname already in use';
      return true;
    } else if (shortName.length > maxShortNameLengthPrefix) {
      errors.shortName = `This shortname is too long: max ${maxShortNameLengthPrefix} characters allowed`;
      return false;
    } else {
      errors.shortName = null;
      return false;
    }
  }

  async function save() {
    if (!Object.keys(errors).filter((e) => !!errors[e]).length) {
      isLoading = true;
      shortNameToSend = `${prefix}${shortName}`;
      const data: ModuleModelType = {
        name,
        ...(key === 'credentials' ? { firstDataLoad } : {}),
        ...(key === 'credentials' ? { hidePasswords: hidePasswordsForCredentials } : {}),
        ...(key === 'credit_cards_full' ? { hideCC: hideCCForCreditCards } : {}),
        shortName: shortNameToSend,
        moduleStrictTokens: strictTermText?.split(/[\n]+/),
        organizationId: $currentOrganization.id,
        enabled: $currentOrganization.enabled,
        type: key.toUpperCase(),
        demoMode: false,
        plugins:
          key.toLowerCase() === 'custom' ? sources.filter((source) => source.checked).map((item) => item.name) : []
      };
      try {
        const newModule = await client.organization.createModule($currentOrganization.id, data);
        const url = getRedirectUrl(newModule);
        await moduleCacheStore.fetchModules($currentOrganization.id);
        isLoading = false;
        if (redirectAfterCreation) await goto(url);
        onFinishedCreationCallback();
      } catch (err) {
        isLoading = false;
        notifications.notify({
          kind: 'error',
          title:
            err.error.message === 'error.module_create_contract'
              ? 'To create the module you should review your product agreement with Customer Succes'
              : err.error.field
        });
      }
    }
  }

  function getRedirectUrl(module: Module) {
    const URL_PATH_MAP = {
      [MODULE_NAME.THREAT_CONTEXT]: 'threat_context/actors',
      [MODULE_NAME.SOCIAL_MEDIA]: 'settings/terms',
      [MODULE_NAME.CUSTOM]: 'settings/terms'
    };
    const URL_DEFAULT = 'settings/parameters';
    const url = URL_PATH_MAP[module.moduleName] || URL_DEFAULT;
    return `/dashboard/organizations/${$currentOrganization.id}/modules/${module.id}/${url}`;
  }
</script>

{#if isLoading}
  <Loading />
{:else if selectedModule}
  <InfoCardForm title="Fill the fields">
    <div class="flex flex-col my-4 mx-4 w-full">
      <div class="pb-4">{selectedModule.description}</div>
      <div class="border-bottom w-full" />
      {#if key === 'custom'}
        <ProgressIndicator bind:currentIndex spaceEqually preventChangeOnClick class="w-full">
          <ProgressStep complete label="Sources" description="Select a source at least" />
          <ProgressStep complete label="Module Name" description="Module name" />
          <ProgressStep complete label="Summary" description="The summary" />
        </ProgressIndicator>
        {#if currentIndex === 0}
          {#if isLoadingSources && !sources.length}
            <SkeletonPlaceholder class="h-80 w-full" />
          {:else}
            <Sources bind:sources />
          {/if}
        {:else if currentIndex === 1}
          <Fields bind:name bind:shortName bind:key bind:prefix bind:placeholder {errors} />
          <TextArea labelText="Strict Term:" bind:value={strictTermText} />
        {:else if currentIndex === 2}
          <TextArea disabled labelText="Strict Term:" bind:value={strictTermText} />
          <Fields bind:name bind:shortName bind:key bind:prefix bind:placeholder {errors} disabled />
          <Sources bind:sources disabled />
        {/if}
      {:else if showForm}
        <Fields
          bind:name
          bind:shortName
          bind:key
          bind:prefix
          bind:placeholder
          bind:hidePasswordsForCredentials
          bind:hideCVVForCreditCards={hideCCForCreditCards}
          bind:firstDataLoad
          {errors}
        />
        {#if key !== 'explorer' && key !== 'threat_context'}
          <TextArea labelText="Strict Term:" bind:value={strictTermText} />
        {/if}
      {/if}
    </div>
    <svelte:fragment slot="actions-form">
      {#if key !== 'custom'}
        <GenericButton kind="primary" on:click={save} disabled={errors.name || errors.shortName}>Create</GenericButton>
      {:else}
        {#if key === 'custom' && (currentIndex === 1 || currentIndex === 2)}
          <GenericButton
            on:click={() => !errors?.name && !errors?.shortName && currentIndex--}
            class={errors.name || errors.shortName ? 'cursor-not-allowed opacity-50' : ''}>Previous</GenericButton
          >
        {/if}
        {#if key === 'custom' && (currentIndex === 0 || currentIndex === 1)}
          <GenericButton
            on:click={() =>
              ((currentIndex === 0 && sources?.filter((s) => s.checked).length) ||
                (currentIndex === 1 && !errors.name && !errors.shortName)) &&
              currentIndex++}
            kind="primary"
            class={!sources?.filter((s) => s.checked).length ||
            (currentIndex === 1 && (errors.name || errors.shortName))
              ? `cursor-not-allowed opacity-50 bx--btn--icon-only bx--tooltip__trigger bx--tooltip--a11y bx--tooltip--align-start ${
                  currentIndex === 0 ? 'bx--btn--icon-only--left' : ''
                }`
              : ''}
          >
            {#if currentIndex === 0 && !sources.filter((s) => s.checked).length}
              <span class:bx--assistive-text={true}>You need to select at least one</span>
            {/if}
            Next
          </GenericButton>
        {/if}
        {#if key === 'custom' && currentIndex === 2}
          <GenericButton on:click={save} disabled={errors.name || errors.shortName} kind="primary">Create</GenericButton
          >
        {/if}
      {/if}
    </svelte:fragment>
  </InfoCardForm>
{/if}
