<script lang="ts">
  import Client from '$lib/client';
  import type { LabelType } from '$lib/client/services/modules';
  import type {
    AdvancedFilterAction,
    AdvancedFilterCondition,
    FilterListsResponse
  } from '$lib/client/services/settings';
  import CreateLabelModalStandalone from '$lib/components/CreateLabelModalStandalone.svelte';
  import BoxTitle from '$lib/components/FilterTemplate/BoxTitle.svelte';
  import ExtradataField from '$lib/components/FilterTemplate/ExtradataField/ExtradataField.svelte';
  import type { ConfigQuery } from '$lib/components/FilterTemplate/ExtradataField/constants';
  import { clearExtradata } from '$lib/components/FilterTemplate/ExtradataField/utils';
  import MultiSelectBox from '$lib/components/FilterTemplate/MultiSelectBox.svelte';
  import {
    analysisResultActionsArray,
    analysisResultArray,
    fileTypeArray
  } from '$lib/components/FilterTemplate/constants';
  import StarRating from '$lib/components/StarRating/index.svelte';
  import type { FilterTemplate } from '$lib/types/admin';
  import { domainRegex } from '$lib/utils/regexPatterns';
  import notifications from '$stores/notification';
  import { organizationsStore } from '$stores/organization';
  import { validator } from '@felte/validator-yup';
  import axios from 'axios';
  import {
    Accordion,
    AccordionItem,
    Button,
    ComboBox,
    InlineLoading,
    Modal,
    SkeletonPlaceholder,
    TextArea,
    TextInput,
    Toggle
  } from 'carbon-components-svelte';
  import { Add } from 'carbon-icons-svelte';
  import { createForm } from 'felte';
  import { createEventDispatcher } from 'svelte';
  import * as yup from 'yup';

  export let open = false;
  export let filterId: number | undefined;
  export let organizationId: number | null = null;

  const client = new Client();
  const dispatch = createEventDispatcher<{ save: void }>();

  const schema = yup.object({
    // Top
    name: yup.string().required(),
    organizationId: yup.number().nullable(),

    conditions: yup.object({
      filterPhrase: yup.string(),
      filterphraseInversed: yup.boolean(),
      domain: yup.string().test('is-domain', 'Please, provide a valid domain', (domain) => {
        if (!domain) return true;
        return !!domain.match(domainRegex);
      }),
      domainInversed: yup.boolean(),
      labels: yup.array(yup.number()),
      analysisstatus: yup.array().of(yup.number()),
      filetypes: yup.array().of(yup.number()),
      languages: yup.array(),
      languagesInversed: yup.boolean(),
      countries: yup.array(),
      countriesInversed: yup.boolean(),
      origins: yup.array(yup.string()),
      originsInversed: yup.boolean(),
      extradata: yup.object(),
      extradataInversed: yup.boolean()
    }),

    actions: yup.object({
      labels: yup.array(),
      analysisResult: yup.number().nullable(),
      rating: yup.number().nullable(),
      filterExecutionStop: yup.boolean(),
      filterExecutioStopDelete: yup.boolean()
    })
  });

  type FilterConditionsForm = yup.InferType<typeof schema>;

  const { form, errors, isSubmitting, reset, handleSubmit, data, setInitialValues } = createForm<FilterConditionsForm>({
    extend: validator({ schema }),
    onSubmit: async (values) => {
      const conditions = buildConditions($data.conditions);
      const actions = buildActions($data.actions);

      hasCondition = conditions.some((cond) => {
        if (cond.type === 'ORIGIN' && cond?.origins?.length > 0) return true;
        return Array.isArray(cond.value) ? cond.value.length > 0 : cond.value;
      });
      hasAction = actions.some((act) => (Array.isArray(act.value) ? act.value.length > 0 : act.value));

      if (!hasCondition || !hasAction) {
        notifications.notify({
          kind: 'error',
          title: 'Error',
          subtitle: 'You should select at least one condition and one action'
        });
        return;
      }
      const payload: Partial<FilterTemplate> = {
        name: values.name,
        superSearchId: values.organizationId,
        conditions,
        actions
      };
      if (filterId) {
        payload.id = filterId;
      }

      try {
        await client.admin.saveFilterTemplate(payload);
        notifications.notify({ kind: 'success', title: 'Filter template saved!' });
        open = false;
        dispatch('save');
      } catch (error) {
        let subtitle = 'Some error has ocurred saving filter template';
        if (axios.isAxiosError(error) && error?.response?.data?.message) {
          subtitle = error.response.data.message;
        }
        notifications.notify({ kind: 'error', title: 'Error', subtitle });
      }
    }
  });

  let filter: FilterTemplate | undefined;
  let labelModalOpen = false;
  let listsLoading = true;
  let filterLoading = true;
  let lists: FilterListsResponse;
  let opened = false;
  let extradataOpen = false;

  let hasCondition = true;
  let hasAction = true;

  $: open && getFilterLists();
  $: open && getFilterTemplate(filterId);

  $: isAnalysisStatusImportantSelected = $data?.conditions?.analysisstatus?.includes(6);
  $: isAnalysisStatusOptions = isAnalysisStatusImportantSelected
    ? analysisResultArray
    : analysisResultArray.map((o) => ({ ...o, disabled: false }));

  async function getFilterTemplate(filterId: number | undefined) {
    filterLoading = true;
    hasAction = true;
    hasCondition = true;
    if (filterId) {
      try {
        filter = await client.admin.getFilterTemplate(filterId);
        setInitialValues({
          name: filter.name || '',
          organizationId: filter.superSearchId || organizationId,
          conditions: getConditions(filter),
          actions: getActions(filter)
        });
      } catch (error) {
        notifications.notify({
          kind: 'error',
          title: 'Error',
          subtitle: 'Some error has ocurred loading the filter template'
        });
        open = false;
      }
    } else {
      filter = undefined;
      setInitialValues({
        name: '',
        organizationId: organizationId,
        conditions: {},
        actions: {}
      });
    }
    reset();
    filterLoading = false;
  }

  function getConditions(filter: FilterTemplate): FilterConditionsForm['conditions'] {
    const conditions: FilterConditionsForm['conditions'] = {};

    filter.conditions.forEach((condition) => {
      switch (condition.type) {
        case 'HAS_LABEL':
          conditions.labels = condition.value
            .map((x) => x.split(','))
            .flat()
            .map((x) => +x);
          break;
        case 'ANALYSIS_RESULT':
          conditions.analysisstatus = condition.value.map((x: string | number) => +x);
          break;
        case 'ORIGIN':
          conditions.origins = condition.origins.map((o) => o.value as string);
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

  function getActions(filter: FilterTemplate): FilterConditionsForm['actions'] {
    const actions: FilterConditionsForm['actions'] = {};

    filter.actions.forEach((action) => {
      switch (action.type) {
        case 'CUT_EXECUTION':
          actions.filterExecutionStop = action.value === 'true';
          break;
        case 'DELETE':
          actions.filterExecutioStopDelete = action.value === 'true';
          break;
        case 'LABEL_ASSIGNATION':
          actions.labels = (action.value as string)
            ?.replace('[', '')
            .replace(']', '')
            .split(',')
            .map((x) => +x);
          break;
        case 'ANALYSIS_RESULT_ASSIGNATION':
          actions.analysisResult = +action.value;
          break;
        case 'WEIGHT_ASSIGNATION':
          actions.rating = +action.value;
          break;
      }
    });
    return actions;
  }

  async function getFilterLists() {
    if (opened) return;
    opened = true;
    listsLoading = true;
    lists = await client.admin.getFilterLists();
    listsLoading = false;
  }

  function onSaveLabel(event: CustomEvent<LabelType>) {
    lists.labels = [
      {
        bgColorRGB: event.detail.bgColorHex,
        textColorRGB: event.detail.textColorHex,
        ...event.detail
      },
      ...lists.labels
    ];
    $data.actions.labels = [...$data.actions.labels, event.detail.id];
  }

  function getCondition(type: AdvancedFilterCondition['type'], value: string[] | number[], inverse?: boolean) {
    const filterCondition: Partial<AdvancedFilterCondition> = {
      type
    };
    const id = filter?.conditions?.find((c) => c.type === type)?.id;
    if (id) {
      filterCondition.id = id;
    }
    if (inverse !== undefined) {
      filterCondition.inverse = inverse;
    }
    if (value?.length) {
      filterCondition.value = value;
    }
    return filterCondition;
  }

  function buildConditions(formConditions: FilterConditionsForm['conditions']) {
    const conditions: Partial<AdvancedFilterCondition>[] = [];

    conditions.push(getCondition('ANALYSIS_RESULT', formConditions.analysisstatus));
    conditions.push(
      getCondition(
        'FILTER_PHRASE',
        formConditions.filterPhrase ? [formConditions.filterPhrase] : [],
        formConditions.filterphraseInversed
      )
    );
    conditions.push(getCondition('FILE_TYPE', formConditions.filetypes));
    conditions.push(
      getCondition('DOMAIN', formConditions.domain ? [formConditions.domain] : [], formConditions.domainInversed)
    );
    conditions.push(
      getCondition(
        'EXTRADATA_ENTRY',
        formConditions.extradata ? [JSON.stringify(clearExtradata(formConditions.extradata as ConfigQuery))] : [],
        formConditions.extradataInversed
      )
    );
    conditions.push(getCondition('LANGUAGE', formConditions.languages, formConditions.languagesInversed));
    conditions.push(getCondition('HAS_LABEL', formConditions.labels));
    conditions.push(getCondition('COUNTRY', formConditions.countries, formConditions.countriesInversed));

    const originCondition = getCondition('ORIGIN', null, formConditions.originsInversed);
    if (formConditions?.origins?.length) {
      const filterOriginItems = filter?.conditions?.find((c) => c.type === 'ORIGIN')?.origins;
      const origins = formConditions.origins.map((originValue) => {
        const id = filterOriginItems?.find((filterOriginItem) => filterOriginItem.value === originValue)?.id;
        const type = lists.plugins.find((p) => p.value === originValue)?.type || originValue;
        const origin: AdvancedFilterCondition['origins'][number] = {
          type,
          value: originValue
        };
        if (id) {
          origin.id = id;
        }
        return origin;
      });
      originCondition.origins = origins;
    }
    conditions.push(originCondition);
    return conditions;
  }

  function getAction(type: AdvancedFilterAction['type'], value: AdvancedFilterAction['value']) {
    const id = filter?.actions?.find((c) => c.type === type)?.id;
    const filterAction: AdvancedFilterAction = {
      type,
      value
    };
    if (id) {
      filterAction.id = id;
    }
    return filterAction;
  }

  function buildActions(formActions: FilterConditionsForm['actions']) {
    const actions: AdvancedFilterAction[] = [];
    const labelsValue = formActions.labels?.length ? JSON.stringify(formActions.labels) : null;
    actions.push(getAction('LABEL_ASSIGNATION', labelsValue));
    actions.push(getAction('ANALYSIS_RESULT_ASSIGNATION', formActions.analysisResult));
    actions.push(getAction('WEIGHT_ASSIGNATION', formActions.rating));
    actions.push(getAction('CUT_EXECUTION', formActions.filterExecutionStop));
    actions.push(getAction('DELETE', formActions.filterExecutioStopDelete));
    return actions;
  }
</script>

<Modal
  modalHeading={filterId ? 'Edit Filter' : 'Create Filter'}
  size="lg"
  preventCloseOnClickOutside
  bind:open
  on:click:button--primary={handleSubmit}
  on:close={() => (extradataOpen = false)}
  on:click:button--secondary={() => (open = false)}
  primaryButtonText={filterId ? 'Save' : 'Create'}
  primaryButtonIcon={$isSubmitting ? InlineLoading : undefined}
  primaryButtonDisabled={$isSubmitting}
  secondaryButtonText="Close"
>
  {#if listsLoading || filterLoading}
    <SkeletonPlaceholder class="w-full h-96" />
  {:else}
    <form use:form class="p-4 grid gap-4">
      <div class="grid lg:grid-cols-2 gap-4">
        <TextInput
          name="name"
          labelText="Template Name *"
          bind:value={$data.name}
          placeholder="Name"
          invalid={!!$errors?.name}
          invalidText={$errors?.name?.[0]}
        />

        <ComboBox
          bind:selectedId={$data.organizationId}
          disabled={!!filterId || !!organizationId}
          titleText="Organization"
          placeholder="Select organization (optional)"
          shouldFilterItem={(item, value) => item.text.toLocaleLowerCase().includes(value.toLowerCase())}
          items={$organizationsStore.map((org) => ({
            id: org.id,
            text: org.name
          }))}
        />
      </div>

      <Accordion>
        <AccordionItem
          open
          title="Filter Conditions"
          class="[&>button]:bg-ctip-hover-ui [&>div]:p-0
          border-solid border-[2px]
          {hasCondition ? 'border-ctip-border' : 'border-ctip-danger'}
          "
        >
          <div class="p-4 border grid gap-4">
            <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div>
                <BoxTitle bind:inversed={$data.conditions.filterphraseInversed} title="Filter Phrase" canInverse />
                <TextArea
                  on:change={() => ($data.conditions.filterPhrase = $data.conditions.filterPhrase.trim())}
                  bind:value={$data.conditions.filterPhrase}
                  light
                  rows={2}
                />
              </div>
              <div>
                <BoxTitle bind:inversed={$data.conditions.domainInversed} title="Domain" canInverse />
                <TextInput
                  bind:value={$data.conditions.domain}
                  light
                  name="conditions.domain"
                  placeholder="Write here the domain"
                  invalid={!!$errors?.conditions?.domain}
                  invalidText={$errors?.conditions?.domain?.[0]}
                />
              </div>
            </div>

            <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div class="row-span-2">
                <MultiSelectBox
                  large
                  initialSort
                  bind:selectedValues={$data.conditions.labels}
                  title="Labels"
                  canSearch
                  items={lists.labels}
                  valueKey="id"
                  displayKey="label"
                />
              </div>
              <MultiSelectBox
                bind:selectedValues={$data.conditions.analysisstatus}
                title="Analysis Status"
                items={isAnalysisStatusOptions}
                valueKey="key"
                displayKey="name"
                disabledKey="disabled"
              />
              <MultiSelectBox
                bind:selectedValues={$data.conditions.filetypes}
                initialSort
                title="File Type"
                items={fileTypeArray}
                valueKey="key"
                displayKey="name"
                tooltipKey="formats"
              />
              <MultiSelectBox
                bind:selectedValues={$data.conditions.languages}
                bind:inversed={$data.conditions.languagesInversed}
                initialSort
                title="Languages"
                canInverse
                canSearch
                items={lists.languages}
                valueKey="value"
                displayKey="label"
              />
              <MultiSelectBox
                bind:selectedValues={$data.conditions.countries}
                bind:inversed={$data.conditions.countriesInversed}
                initialSort
                title="Countries"
                canInverse
                canSearch
                items={lists.countries}
                valueKey="value"
                displayKey="label"
              />
              <MultiSelectBox
                bind:selectedValues={$data.conditions.origins}
                bind:inversed={$data.conditions.originsInversed}
                initialSort
                title="Origin"
                canSearch
                canInverse
                items={lists.plugins}
                valueKey="value"
                displayKey="value"
              />
              <div class="lg:col-span-2">
                <ExtradataField
                  direction="top"
                  bind:open={extradataOpen}
                  bind:extradata={$data.conditions.extradata}
                  bind:inversed={$data.conditions.extradataInversed}
                />
              </div>
            </div>
            {#if !hasCondition}
              <small class="text-ctip-danger">Select at least one condition</small>
            {/if}
          </div>
        </AccordionItem>
        <AccordionItem
          open
          title="Filter Actions"
          class="[&>button]:bg-ctip-hover-ui [&>div]:p-0
          border-solid border-[2px]
          {hasAction ? 'border-ctip-border' : 'border-ctip-danger'}
          "
        >
          <div class="p-4 border grid gap-4">
            <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <MultiSelectBox
                bind:selectedValues={$data.actions.labels}
                title="Labels"
                initialSort
                canSearch
                items={lists.labels}
                valueKey="id"
                displayKey="label"
              >
                <div slot="title" class="flex items-center justify-between w-full">
                  Labels
                  {#if $data.organizationId}
                    <Button size="small" kind="ghost" icon={Add} on:click={() => (labelModalOpen = true)}>
                      New Label
                    </Button>
                  {/if}
                </div>
              </MultiSelectBox>
              <MultiSelectBox
                bind:selectedValues={$data.actions.analysisResult}
                title="Assign result type"
                items={analysisResultActionsArray}
                valueKey="key"
                displayKey="name"
                type="radio"
              />

              <div class="grid gap-2">
                <div>
                  <span>Rating</span>
                  <div class="grid items-center justify-center px-2 py-2 border rounded">
                    <StarRating bind:rating={$data.actions.rating} resourceId={1} />
                  </div>
                </div>

                <div>
                  <span>Filter Execution</span>
                  <div class="flex items-center justify-between px-2 py-2 border rounded">
                    <div>Stop</div>
                    <div class="relative">
                      <Toggle
                        bind:toggled={$data.actions.filterExecutionStop}
                        class="absolute top-0 right-0 mr-2 -mt-2"
                        size="sm"
                        hideLabel
                        labelA=""
                        labelB=""
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <span>Filter Execution</span>
                  <div class="flex items-center justify-between px-2 py-2 border rounded">
                    <div>Stop & Delete</div>
                    <div class="relative">
                      <Toggle
                        bind:toggled={$data.actions.filterExecutioStopDelete}
                        class="absolute top-0 right-0 mr-2 -mt-2"
                        size="sm"
                        hideLabel
                        labelA=""
                        labelB=""
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {#if !hasAction}
              <small class="text-ctip-danger">Select at least one action</small>
            {/if}
          </div>
        </AccordionItem>
      </Accordion>
    </form>
  {/if}
</Modal>

<CreateLabelModalStandalone bind:open={labelModalOpen} on:save={onSaveLabel} />
