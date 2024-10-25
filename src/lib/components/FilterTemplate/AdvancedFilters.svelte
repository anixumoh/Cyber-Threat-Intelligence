<script lang="ts">
  import { goto } from '$app/navigation';
  import Client from '$lib/client';
  import type { AuthorizedUser, ExtradataKeyTemplate } from '$lib/client/services/modules';
  import type {
    AdvancedFilter,
    CreateAdvancedFilterPayload,
    LabelListItem,
    SaveAsAdvancedFilterPayload,
    SettingsTerm,
    ValueLabelItem
  } from '$lib/client/services/settings';
  import GenericButton from '$lib/components/Buttons/GenericButton.svelte';
  import contentAlertStore from '$stores/contentAlert';
  import { currentModule, currentModuleId } from '$stores/module';
  import notifications from '$stores/notification';
  import { currentOrganizationId } from '$stores/organization';
  import roleStore from '$stores/role';
  import { validator } from '@felte/validator-yup';
  import axios from 'axios';
  import {
    InlineLoading,
    InlineNotification,
    Modal,
    ProgressIndicator,
    ProgressStep,
    TextInput,
    TooltipDefinition
  } from 'carbon-components-svelte';
  import { ChevronLeft, ChevronRight } from 'carbon-icons-svelte';
  import { createForm } from 'felte';
  import { onMount, setContext, tick } from 'svelte';
  import type * as yup from 'yup';
  import Actions from './Actions.svelte';
  import Conditions from './Conditions.svelte';
  import type { ConfigQuery } from './ExtradataField/constants';
  import { clearExtradata } from './ExtradataField/utils';
  import Summary from './Summary.svelte';
  import { actionsSchema, conditionsSchema } from './constants';
  import type { OriginType } from './types';

  export let filterId: number = undefined;

  const client = new Client();
  const conditionsForm = createForm<yup.InferType<typeof conditionsSchema>>({
    extend: validator({ schema: conditionsSchema })
  });
  const conditionsData = conditionsForm.data;
  const conditionsValid = conditionsForm.isValid;

  const actionsForm = createForm<yup.InferType<typeof actionsSchema>>({
    extend: validator({ schema: actionsSchema })
  });
  const actionsData = actionsForm.data;
  const actionsValid = actionsForm.isValid;
  setContext('forms', { conditionsForm, actionsForm });

  let step = 0;
  let loading = true;
  let terms: SettingsTerm[] = [];
  let labels: LabelListItem[] = [];
  let actionLabels: LabelListItem[] = [];
  let origins: OriginType[] = [];
  let languages: ValueLabelItem[] = [];
  let countries: ValueLabelItem[] = [];
  let users: AuthorizedUser[] = [];
  let advancedFilter: AdvancedFilter;
  let keyTemplateLoading = true;
  let keyTemplates: ExtradataKeyTemplate[] = [];

  let ready = false;
  let timesTouched = -1;
  $: if (ready && $conditionsData) timesTouched++;

  let saving = false;
  let saveAsModalOpen = false;
  let saveAsName = '';
  let savingAs = false;

  // Validate forms on change any data
  $: if ($conditionsData) conditionsForm.validate();
  $: if ($actionsData) actionsForm.validate();
  $: init($currentOrganizationId, $currentModuleId, filterId);
  $: filterId && ($contentAlertStore.editing = !!filterId);
  $: getExtradataKeys();

  $: validConditions =
    $conditionsValid &&
    (!!$conditionsData?.terms?.length ||
      !!$conditionsData?.labels?.length ||
      !!$conditionsData?.analysisstatus?.length ||
      !!$conditionsData?.origins?.length ||
      !!$conditionsData?.filterPhrase ||
      !!$conditionsData?.domain ||
      !!$conditionsData?.extradata ||
      !!$conditionsData?.filetypes?.length ||
      !!$conditionsData?.languages?.length ||
      !!$conditionsData?.countries?.length);

  $: validActions =
    $actionsValid &&
    (!!$actionsData?.labels?.length ||
      !!$actionsData?.analysisResult ||
      !!$actionsData?.tlp ||
      !!$actionsData?.rating ||
      $actionsData?.filterExecutionStop ||
      $actionsData?.filterExecutioStopDelete ||
      $actionsData?.launchAlert) &&
    ($actionsData?.sendAlert ? !!$actionsData?.destinations?.length : true);

  onMount(() => {
    return () => {
      contentAlertStore.updateFromNewContentAlerts($currentModule?.type);
    };
  });

  async function getExtradataKeys() {
    keyTemplateLoading = true;
    try {
      keyTemplates = await client.modules.getModuleExtradataFields($currentModule);
    } finally {
      keyTemplateLoading = false;
    }
  }

  async function getGeneratedFiltersPositions() {
    const { data } = await client.settings.getGeneratedFiltersPositions($currentOrganizationId, $currentModuleId);
    if (!$roleStore.master && data.max <= 0) {
      loading = false;
      notifications.notify({
        kind: 'warning',
        title: 'Cannot create new filters, please configure first'
      });
      await goto(`/dashboard/organizations/${$currentOrganizationId}/modules/${$currentModuleId}/settings/parameters`);
    }
  }

  async function getTerms(orgId: number, moduleId: number) {
    const response = await client.settings.getTerms(orgId, moduleId);
    terms = Object.values(response.values).flat();
  }

  async function getAuthorizedUsers(moduleId: number) {
    users = await client.modules.getAuthorizedUsers(moduleId);
  }

  async function getFilterLists(orgId: number, moduleId: number) {
    const response = await client.settings.getFilterLists(orgId, moduleId);
    labels = response.data.labels;
    // A copy, because will have different sort
    actionLabels = [...labels];

    origins = [
      { value: 'TWITTER', label: 'Twitter', type: 'TWITTER' },
      { value: 'NEWS', label: 'News', type: 'NEWS' },
      { value: 'MANUAL', label: 'Manual', type: 'MANUAL' },
      { value: '-transforms-', label: '--- Transforms ---', disabled: true },
      ...response.data.plugins.map((p) => ({ ...p, type: 'TRANSFORM' as const })),
      { value: '-rss-', label: '--- RSS ---', disabled: true },
      ...response.data.rssFeeds.map((r) => ({ ...r, type: 'RSS' as const }))
    ];

    languages = response.data.languages;
    countries = response.data.countries;
  }

  async function getAdvancedFilter(orgId: number, moduleId: number, filterId: number) {
    const { data: conditionsData } = conditionsForm;
    const { data: actionData } = actionsForm;

    // Initial data
    actionData.update((a) => ({
      ...a,
      threshold: 1,
      interval: 1,
      analysisResult: null
    }));

    if (!filterId) return;

    advancedFilter = await client.settings.getAdvancedFilter(orgId, moduleId, filterId);
    const conditions = getConditions(advancedFilter);
    conditionsData.update((c) => {
      c.name = advancedFilter.name;
      c.enabled = advancedFilter.enabled;
      return { ...c, ...conditions };
    });
    const actions = getActions(advancedFilter);
    actionsData.update((a) => {
      return { ...a, ...actions };
    });
  }

  function getConditions(advancedFilter: AdvancedFilter) {
    type Conditions = Partial<yup.InferType<typeof conditionsSchema>>;
    const conditions: Conditions = {};

    advancedFilter.conditions.forEach((condition) => {
      switch (condition.type) {
        case 'TERM':
          conditions.terms = condition.value.map((x) => +x);
          conditions.termsInversed = condition.inverse;
          break;
        case 'HAS_LABEL':
          conditions.labels = condition.value
            .map((x) => x.split(','))
            .flat()
            .map((x) => +x);
          conditions.labelsInversed = condition.inverse;
          break;
        case 'ANALYSIS_RESULT':
          conditions.analysisstatus = condition.value.map((x) => +x);
          break;
        case 'ORIGIN':
          conditions.origins = condition.origins.map((o) => {
            if (o.type === 'TRANSFORM' || o.type === 'RSS') return o.value;
            return o.type;
          });
          conditions.originsInversed = condition.inverse;
          break;
        case 'FILE_TYPE':
          conditions.filetypes = condition.value.map((x) => +x);
          break;
        case 'EXTRADATA_ENTRY':
          try {
            const extradata = JSON.parse(String(condition.value[0]));
            conditions.extradataInversed = condition.inverse;
            conditions.extradata = extradata;
          } catch (error) {
            console.error(error);
          }
          break;
        case 'LANGUAGE':
          conditions.languages = condition.value;
          conditions.languagesInversed = condition.inverse;
          break;
        case 'FILTER_PHRASE':
          conditions.filterPhrase = (condition.value?.[0] as string) ?? '';
          conditions.filterphraseInversed = condition.inverse;
          break;
        case 'DOMAIN':
          conditions.domain = (condition.value?.[0] as string) ?? '';
          conditions.domainInversed = condition.inverse;
          break;
        case 'COUNTRY':
          conditions.countries = condition.value;
          conditions.countriesInversed = condition.inverse;
          break;
      }
    });

    return conditions;
  }

  function getActions(advancedFilter: AdvancedFilter) {
    type Actions = Partial<yup.InferType<typeof actionsSchema>>;
    const actions: Actions = {};

    advancedFilter.actions.forEach((action) => {
      switch (action.type) {
        case 'MARK_TLP_LIGHT':
          actions.tlp = action.value as string;
          break;
        case 'CUT_EXECUTION':
          actions.filterExecutionStop = action.value === 'true';
          break;
        case 'DELETE':
          actions.filterExecutioStopDelete = action.value === 'true';
          break;
        case 'LABEL_ASSIGNATION':
          actions.labels = String(action.value)
            .split(',')
            .map((x) => +x);
          break;
        case 'ANALYSIS_RESULT_ASSIGNATION':
          actions.analysisResult = +action.value;
          break;
        case 'WEIGHT_ASSIGNATION':
          actions.rating = +action.value;
          break;
        case 'LAUNCH_ALERT':
          actions.launchAlert = true;
          actions.threshold = action.alertConfiguration.threshold;
          actions.interval = action.alertConfiguration.interval;
          actions.sendAlert = action.alertConfiguration.sendAlert;
          actions.destinations = action.alertConfiguration.destinations;
          actions.alertContentFields = action.alertConfiguration.alertContentFields;
          break;
      }
    });

    return actions;
  }

  async function init(orgId: number, moduleId: number, filterId: number) {
    loading = true;
    if (!filterId) await getGeneratedFiltersPositions();
    await Promise.all([
      getTerms(orgId, moduleId),
      getFilterLists(orgId, moduleId),
      getAuthorizedUsers(moduleId),
      getAdvancedFilter(orgId, moduleId, filterId)
    ]);
    sortAlreadySelected();
    $contentAlertStore.sendAlert = $actionsData.sendAlert;
    loading = false;
    await tick();
    ready = true;
  }

  function sortAlreadySelected() {
    if (!advancedFilter) return;
    advancedFilter.conditions.forEach((condition) => {
      switch (condition.type) {
        case 'TERM': {
          const ids = condition.value.map((id: string | number) => +id);
          terms = terms.sort((t) => (ids.includes(t.id) ? -1 : 0));
          break;
        }
        case 'HAS_LABEL': {
          const ids = (condition.value?.[0] as string)?.split(',').map((x) => +x);
          labels = labels.sort((l) => (ids.includes(l.id) ? -1 : 0));
          break;
        }
        case 'ORIGIN': {
          origins = origins.sort((o) => {
            if (o.type === 'FACEBOOK' || o.type === 'MANUAL' || o.type === 'NEWS' || o.type === 'TWITTER') {
              return condition.origins.some((r) => r.type === o.type) ? -1 : 0;
            }
            return condition.origins.some((r) => r.value === o.value) ? -1 : 0;
          });
        }
        case 'LANGUAGE': {
          languages = languages.sort((l) => ((condition.value as string[]).includes(l.value) ? -1 : 0));
        }
        case 'COUNTRY': {
          countries = countries.sort((l) => ((condition.value as string[]).includes(l.value) ? -1 : 0));
        }
      }
    });

    advancedFilter.actions.forEach((action) => {
      switch (action.type) {
        case 'LABEL_ASSIGNATION': {
          const ids = (action.value as string)?.split(',')?.map((x) => +x);
          actionLabels = actionLabels.sort((l) => (ids?.includes(l.id) ? -1 : 0));
          break;
        }
      }
    });
  }

  function setStep(n: number) {
    step = n;
  }

  function buildConditions(isEdit = false) {
    const conditions: AdvancedFilter['conditions'] = [];

    conditions.push({
      id: (isEdit && advancedFilter.conditions.find((c) => c.type === 'ANALYSIS_RESULT')?.id) || null,
      type: 'ANALYSIS_RESULT',
      value: $conditionsData.analysisstatus,
      inverse: false,
      origins: []
    });
    conditions.push({
      id: (isEdit && advancedFilter.conditions.find((c) => c.type === 'FILTER_PHRASE')?.id) || null,
      type: 'FILTER_PHRASE',
      value: [$conditionsData.filterPhrase],
      inverse: $conditionsData.filterphraseInversed,
      origins: []
    });
    conditions.push({
      id: (isEdit && advancedFilter.conditions.find((c) => c.type === 'FILE_TYPE')?.id) || null,
      type: 'FILE_TYPE',
      value: $conditionsData.filetypes,
      inverse: $conditionsData.filterphraseInversed,
      origins: []
    });
    if ($conditionsData.domain) {
      conditions.push({
        id: (isEdit && advancedFilter.conditions.find((c) => c.type === 'DOMAIN')?.id) || null,
        type: 'DOMAIN',
        value: [$conditionsData.domain],
        inverse: $conditionsData.domainInversed,
        origins: []
      });
    }
    conditions.push({
      id: (isEdit && advancedFilter.conditions.find((c) => c.type === 'TERM')?.id) || null,
      type: 'TERM',
      value: $conditionsData.terms,
      inverse: $conditionsData.termsInversed,
      origins: []
    });

    if ($conditionsData.extradata) {
      conditions.push({
        id: (isEdit && advancedFilter.conditions.find((c) => c.type === 'EXTRADATA_ENTRY')?.id) || null,
        type: 'EXTRADATA_ENTRY',
        value: [JSON.stringify(clearExtradata($conditionsData.extradata as ConfigQuery, keyTemplates))],
        inverse: $conditionsData.extradataInversed,
        origins: []
      });
    }

    conditions.push({
      id: (isEdit && advancedFilter.conditions.find((c) => c.type === 'LANGUAGE')?.id) || null,
      type: 'LANGUAGE',
      value: $conditionsData.languages,
      inverse: $conditionsData.languagesInversed,
      origins: []
    });
    conditions.push({
      id: (isEdit && advancedFilter.conditions.find((c) => c.type === 'HAS_LABEL')?.id) || null,
      type: 'HAS_LABEL',
      value: [$conditionsData.labels.join(',')],
      inverse: $conditionsData.labelsInversed,
      origins: []
    });

    let originsPayload = $conditionsData.origins
      .map((value) => {
        const or = origins.find((o) => o.value === value);
        switch (or?.type) {
          case 'FACEBOOK':
          case 'TWITTER':
          case 'NEWS':
          case 'MANUAL':
            return { type: or.type };
          case 'TRANSFORM':
          case 'RSS':
            return { type: or.type, value };
        }
      })
      .filter(Boolean);
    conditions.push({
      id: (isEdit && advancedFilter.conditions.find((c) => c.type === 'ORIGIN')?.id) || null,
      type: 'ORIGIN',
      value: [],
      inverse: $conditionsData.originsInversed,
      origins: originsPayload
    });
    conditions.push({
      id: (isEdit && advancedFilter.conditions.find((c) => c.type === 'COUNTRY')?.id) || null,
      type: 'COUNTRY',
      value: $conditionsData.countries,
      inverse: $conditionsData.countriesInversed,
      origins: []
    });
    return conditions;
  }

  function buildActions(isEdit = false) {
    const actions: AdvancedFilter['actions'] = [];
    actions.push({
      id: (isEdit && advancedFilter.actions.find((c) => c.type === 'ANALYSIS_RESULT_ASSIGNATION')?.id) || null,
      type: 'ANALYSIS_RESULT_ASSIGNATION',
      value: $actionsData?.analysisResult || ''
    });
    if ($actionsData.filterExecutionStop) {
      actions.push({
        id: (isEdit && advancedFilter.actions.find((c) => c.type === 'CUT_EXECUTION')?.id) || null,
        type: 'CUT_EXECUTION',
        value: $actionsData.filterExecutionStop
      });
    }
    if ($actionsData.filterExecutioStopDelete) {
      actions.push({
        id: (isEdit && advancedFilter.actions.find((c) => c.type === 'DELETE')?.id) || null,
        type: 'DELETE',
        value: $actionsData.filterExecutioStopDelete
      });
    }
    actions.push({
      id: (isEdit && advancedFilter.actions.find((c) => c.type === 'LABEL_ASSIGNATION')?.id) || null,
      type: 'LABEL_ASSIGNATION',
      value: $actionsData.labels.join(',')
    });

    if ($actionsData.launchAlert) {
      actions.push({
        id: (isEdit && advancedFilter.actions.find((c) => c.type === 'LAUNCH_ALERT')?.id) || null,
        type: 'LAUNCH_ALERT',
        alertConfiguration: {
          filterActionId:
            (isEdit &&
              advancedFilter.actions.find((c) => c.type === 'LAUNCH_ALERT')?.alertConfiguration?.filterActionId) ||
            null,
          threshold: $actionsData.threshold,
          interval: $actionsData.interval,
          sendAlert: $actionsData.sendAlert,
          ...($actionsData.sendAlert
            ? {
                alertContentFields: $actionsData.alertContentFields.map(({ name, enable }) => ({ name, enable })),
                destinations: $actionsData.destinations.map((destination) => ({
                  emailEnabled: destination.emailEnabled,
                  userEmail: destination.userEmail,
                  usersId: destination.usersId,
                  usersName: destination.usersName
                }))
              }
            : {})
        }
      });
    }
    actions.push({
      id: (isEdit && advancedFilter.actions.find((c) => c.type === 'MARK_TLP_LIGHT')?.id) || null,
      type: 'MARK_TLP_LIGHT',
      value: $actionsData.tlp
    });
    actions.push({
      id: (isEdit && advancedFilter.actions.find((c) => c.type === 'WEIGHT_ASSIGNATION')?.id) || null,
      type: 'WEIGHT_ASSIGNATION',
      value: $actionsData.rating
    });
    return actions;
  }

  async function create() {
    const conditions = buildConditions();
    const actions = buildActions();

    const payload: CreateAdvancedFilterPayload = {
      actions,
      conditions,
      enabled: true,
      generated: false,
      messages: [],
      name: $conditionsData.name,
      status: 'OK'
    };

    saving = true;
    try {
      const newAdvancedFilter = await client.settings.createAdvancedFilter(
        $currentOrganizationId,
        $currentModuleId,
        payload
      );
      await goto(
        `/dashboard/organizations/${$currentOrganizationId}/modules/${$currentModuleId}/settings/filters/${newAdvancedFilter.id}/edit`
      );
    } catch (error) {
      handleErrors(error);
    } finally {
      saving = false;
    }
  }

  async function save() {
    const conditions = buildConditions(true);
    const actions = buildActions(true);

    const payload: AdvancedFilter = {
      id: advancedFilter.id,
      orden: advancedFilter.orden,
      actions,
      conditions,
      enabled: $conditionsData.enabled,
      generated: advancedFilter.generated,
      messages: advancedFilter.messages,
      name: $conditionsData.name,
      status: advancedFilter.status
    };

    saving = true;
    try {
      await client.settings.editAdvancedFilter($currentOrganizationId, $currentModuleId, payload);
      notifications.notify({ kind: 'success', title: 'Success', subtitle: 'Filter was succesfully edited' });
    } catch (error) {
      handleErrors(error);
    } finally {
      saving = false;
    }
  }

  async function saveAs() {
    const conditions = buildConditions(true);
    const actions = buildActions(true);

    const payload: SaveAsAdvancedFilterPayload = {
      id: advancedFilter.id,
      actions,
      conditions,
      enabled: $conditionsData.enabled,
      generated: false,
      messages: [],
      name: saveAsName,
      status: 'OK'
    };

    savingAs = true;
    try {
      const newAdvancedFilter = await client.settings.saveAsAdvancedFilter(
        $currentOrganizationId,
        $currentModuleId,
        payload
      );
      await goto(
        `/dashboard/organizations/${$currentOrganizationId}/modules/${$currentModuleId}/settings/filters/${newAdvancedFilter.id}/edit`
      );
    } catch (error) {
      handleErrors(error);
    } finally {
      savingAs = false;
    }
  }

  function handleErrors(error: unknown) {
    let key: string;
    if (axios.isAxiosError(error)) {
      key = error?.response?.data?.message;
    }
    let subtitle: string;
    switch (key) {
      case 'error.exceededLength':
        subtitle = 'The name of the filter is too long';
        break;
      case 'error.bad_format':
        subtitle = 'Domain format is incorrect';
        break;
      case 'error.parse_error':
        subtitle = 'There was an error creating the filter due to an invalid character or regex in the filter phrase';
        break;
      case 'error.invalid_alert_parameters':
        subtitle = 'Alert parameters are invalid';
        break;
      case 'error.filter_already_exists':
        subtitle = 'There is already another filter with that name';
        break;
      case 'error.filter_invalid_extradata_condition':
        subtitle = 'There is an error in extradata filters';
        break;
      default:
        subtitle = 'Something went wrong while saving the filter. Please try again.';
        break;
    }
    notifications.notify({ kind: 'error', title: 'Error', subtitle });
  }
</script>

<div class="flex items-center justify-between px-2 py-2 border-solid bg-ctip-ui border-y border-ctip-border">
  <div class="text-base">
    {#if filterId}
      Edit Mode
    {:else}
      Create Mode
    {/if}
  </div>
  <GenericButton href="/dashboard/organizations/{$currentOrganizationId}/modules/{$currentModuleId}/settings/filters">
    <ChevronLeft /><span class="ml-1">Back to list</span>
  </GenericButton>
</div>

<div class="w-full px-4 py-4">
  <ProgressIndicator bind:currentIndex={step} spaceEqually>
    <ProgressStep
      on:click={() => setStep(0)}
      complete={validConditions}
      label="Conditions"
      secondaryLabel={!validConditions && 'Select at least one'}
      description="The progress indicator will listen for clicks on the steps"
    />
    <ProgressStep
      on:click={() => {
        if (validConditions) setStep(1);
      }}
      complete={validActions}
      label="Actions"
      disabled={!validConditions}
      secondaryLabel={!validActions && step == 1 && 'Select at least one'}
      description="The progress indicator will listen for clicks on the steps"
    />
    <ProgressStep
      on:click={() => {
        if (validConditions && validActions) setStep(2);
      }}
      disabled={!validConditions || !validActions}
      label="Summary"
      description="The progress indicator will listen for clicks on the steps"
    />
  </ProgressIndicator>
</div>

{#if loading}
  <InlineLoading class="flex items-center justify-center" />
{:else}
  <div class="px-4">
    <div class:hidden={step !== 0}>
      <Conditions
        isEdit={!!filterId}
        {terms}
        {labels}
        {origins}
        {languages}
        {countries}
        {keyTemplates}
        {keyTemplateLoading}
      />
    </div>
    <div class:hidden={step !== 1}>
      <Actions labels={actionLabels} {users} />
    </div>
    <div class:hidden={step !== 2}>
      <Summary {terms} {labels} {origins} {languages} {countries} />
    </div>
  </div>
{/if}

<div class="fixed bottom-0 left-0 flex justify-between w-full p-4 border-t border-solid bg-ctip-ui border-ctip-border">
  <div />
  <div class="flex items-center gap-4">
    {#if step === 0}
      <div class="relative">
        <GenericButton on:click={() => setStep(1)} disabled={!validConditions} kind="primary">
          <span class="pr-2">Next to actions</span>
          <ChevronRight />
        </GenericButton>
        {#if !validConditions}
          <TooltipDefinition
            class="absolute inset-0 w-full h-full [&_button]:left-1/2"
            tooltipText="You need to select at least one condition to be able to move to the next step"
            direction="top"
            align="end"
          />
        {/if}
      </div>
    {:else if step === 1}
      <GenericButton on:click={() => setStep(0)} kind="tertiary">
        <ChevronLeft />
        <span class="pl-2">Back to conditions</span>
      </GenericButton>

      <div class="relative">
        <GenericButton on:click={() => setStep(2)} disabled={!validConditions || !validActions} kind="primary">
          <span class="pr-2">Next to resume</span>
          <ChevronRight />
        </GenericButton>
        {#if !validActions}
          <TooltipDefinition
            class="absolute inset-0 w-full h-full [&_button]:left-1/2"
            tooltipText="You need to select at least one action to be able to move to the next step"
            direction="top"
            align="end"
          />
        {/if}
      </div>
    {:else if step === 2}
      <GenericButton on:click={() => setStep(1)} kind="tertiary">
        <ChevronLeft />
        <span class="pl-2">Back to actions</span>
      </GenericButton>

      {#if filterId}
        <GenericButton disabled={saving} kind="primary" on:click={save}>Save filter</GenericButton>
        <GenericButton kind="primary" on:click={() => (saveAsModalOpen = true)}>Save as...</GenericButton>
      {:else}
        <GenericButton on:click={create} kind="primary">Create filter</GenericButton>
      {/if}
    {/if}
  </div>
</div>

<Modal
  bind:open={saveAsModalOpen}
  size="sm"
  modalHeading="Save as filter"
  primaryButtonText="Save"
  primaryButtonIcon={savingAs && InlineLoading}
  primaryButtonDisabled={savingAs || !saveAsName}
  secondaryButtonText="Cancel"
  on:click:button--primary={saveAs}
  on:click:button--secondary={() => (saveAsModalOpen = false)}
>
  {#if timesTouched === 0}
    <InlineNotification class="max-w-full" kind="warning" lowContrast hideCloseButton>
      <div class="grid break-words">
        You have not made any changes. Are you sure you want to keep this filter as new?
      </div>
    </InlineNotification>
  {/if}
  <TextInput bind:value={saveAsName} labelText="Filter Name" placeholder="Write the name for the new filter" />
</Modal>
