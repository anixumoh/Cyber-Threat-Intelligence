<script lang="ts">
  import Client from '$lib/client';
  import { queryToHTML } from '$lib/components/FilterTemplate/ExtradataField/utils';
  import LabelItem from '$lib/components/LabelItem/LabelItem.svelte';
  import StarRating from '$lib/components/StarRating/index.svelte';
  import TooltipWithIcon from '$lib/components/TooltipWithIcon/TooltipWithIcon.svelte';
  import { COLORS } from '$lib/constants/colors';
  import { defaultActions, defaultConditions } from '$lib/constants/filters';
  import type Module from '$lib/types/module';
  import type { FilterType } from '$lib/types/settings';
  import contentAlertStore from '$stores/contentAlert';
  import languagesStore from '$stores/languages';
  import { currentModule } from '$stores/module';
  import { currentOrganizationId } from '$stores/organization';
  import roleStore from '$stores/role';
  import { InlineNotification, SkeletonPlaceholder, Tag } from 'carbon-components-svelte';
  import {
    Bullhorn,
    ChevronLeft,
    Code,
    DocumentBlank,
    EarthFilled,
    Edit,
    Error,
    Filter,
    Screen,
    StarFilled,
    Tag as TagIcon
  } from 'carbon-icons-svelte';
  import { clone } from 'lodash';
  import { createEventDispatcher, onMount } from 'svelte';
  import GenericButton from '../Buttons/GenericButton.svelte';
  import InfoCard from '../Card/InfoCard.svelte';
  import Drawer from '../Drawer/Drawer.svelte';
  import GenericTag from '../GenericTag/GenericTag.svelte';
  import ViewDetailsItem from '../ThreatsCommons/ViewDetailsItem.svelte';
  import ContentAlert from './ContentAlert.svelte';

  const client = new Client();
  const dispatch = createEventDispatcher();

  type ConditionValueType = { value: any; inverse?: boolean };
  type ParsedType = {
    DOMAIN?: ConditionValueType;
    FILTER_PHRASE?: ConditionValueType;
    EXTRADATA_ENTRY?: ConditionValueType;
    ANALYSIS_RESULT?: ConditionValueType;
    FILE_TYPE?: ConditionValueType;
    ORIGIN?: ConditionValueType;
    LANGUAGE?: ConditionValueType;
    COUNTRY?: ConditionValueType;
    HAS_LABEL?: ConditionValueType;
    TERM?: ConditionValueType;
    LABEL_ASSIGNATION?: ConditionValueType;
    ANALYSIS_RESULT_ASSIGNATION?: ConditionValueType;
    WEIGHT_ASSIGNATION?: ConditionValueType;
    LAUNCH_ALERT?: any;
    DELETE?: ConditionValueType;
    CUT_EXECUTION?: ConditionValueType;
  };

  export let isOpen = false;
  export let filterId: number = undefined;
  export let module: Module = undefined;

  $: $contentAlertStore.editing = !!filterId;

  let isLoading = false;
  let filterListGeneral;
  let termListGeneral;
  let filter: FilterType = undefined;
  let parsedConditions: ParsedType = defaultConditions;
  let parsedActions: ParsedType = defaultActions;
  let pwdType = '';

  let pwdMessages = {
    NO_PASSWORD: 'At least one credential from the threat is missing the username and password',
    CLEAR_PASSWORD:
      'At least one credential from the threat has clear password (plain text) and the username is not empty',
    HASHED_PASSWORD: 'At least one credential from the threat has hashed password and a valid username',
    TAG: 'Tag filter adds to the threat a label with the term for which the threat was received'
  };

  let analysisResultArray = [
    { name: 'Not Available', key: 0, selected: false, disabled: false },
    { name: 'Important', key: 6, selected: false, disabled: false },
    { name: 'Positive', key: 3, selected: false, disabled: false },
    { name: 'Negative', key: 4, selected: false, disabled: false },
    { name: 'Informative', key: 5, selected: false, disabled: false },
    { name: 'Not Important', key: 1, selected: false, disabled: false },
    { name: 'Not Processable', key: 2, selected: false, disabled: false }
  ];

  let fileTypeArray = [
    { name: 'Html', key: 0, selected: false, formats: 'html, xhtml' },
    { name: 'Image', key: 1, selected: false, formats: 'Any content type that starts with image/' },
    { name: 'Document', key: 2, selected: false, formats: 'doc, rtf, xls, vsd, pps, ppt, pdf' },
    { name: 'Others', key: 3, selected: false, formats: 'Any extension not included previously' }
  ];

  let analysisResultActionsArray = [
    { name: 'Important', key: 6, selected: false },
    { name: 'Positive', key: 3, selected: false },
    { name: 'Negative', key: 4, selected: false },
    { name: 'Informative', key: 5, selected: false },
    { name: 'Not Important', key: 1, selected: false }
  ];

  $: !isOpen && reset();
  $: moduleId = module?.id ?? $currentModule?.id;
  $: moduleName = module?.moduleName ?? $currentModule?.moduleName;

  onMount(() => {
    return () => {
      contentAlertStore.updateFromNewContentAlerts($currentModule?.type);
      client.abort();
    };
  });

  $: filterId && isOpen && init(filterId);

  async function init(filterId: number) {
    filter = undefined;
    filterListGeneral = undefined;
    termListGeneral = undefined;
    isLoading = true;

    const [dataSettingsView, dataFilterList, dataSettings] = await Promise.all([
      client.settings.getSettingsDataView($currentOrganizationId, moduleId, moduleName, 'filters', filterId),
      client.settings.getFilterLists($currentOrganizationId, moduleId),
      client.settings.getSettingsData($currentOrganizationId, moduleId, moduleName, 'terms', 1, 1000, '', true)
    ]);
    filter = dataSettingsView.data;
    filterListGeneral = dataFilterList.data;
    termListGeneral = dataSettings.values;

    readConditionValues();
    readActionValues();
    isLoading = false;
  }

  function reset() {
    parsedConditions = clone(defaultConditions);
    parsedActions = clone(defaultActions);
  }

  function isUserUnableToEditFilter() {
    return $roleStore.customer || $roleStore.operator || ($roleStore.analyst && filter.generated);
  }

  function readConditionValues() {
    filter.conditions.forEach((condition) => {
      if (
        condition.type === 'NO_PASSWORD' ||
        condition.type === 'CLEAR_PASSWORD' ||
        condition.type === 'HASHED_PASSWORD' ||
        condition.type === 'TAG'
      ) {
        pwdType = condition.type;
      } else if (condition.type === 'DOMAIN') {
        parsedConditions.DOMAIN = {
          value: condition.value[0] ? condition.value[0] : undefined,
          inverse: condition.inverse
        };
      } else if (condition.type === 'FILTER_PHRASE') {
        parsedConditions.FILTER_PHRASE = {
          value: condition.value[0] === 'undefined' || !condition.value.length ? '' : condition.value.join(),
          inverse: condition.inverse
        };
      } else if (condition.type === 'EXTRADATA_ENTRY') {
        parsedConditions.EXTRADATA_ENTRY = {
          value: JSON.parse(condition?.value?.[0]) || null,
          inverse: condition.inverse
        };
      } else if (condition.type === 'ANALYSIS_RESULT') {
        parsedConditions.ANALYSIS_RESULT = {
          value: condition.value,
          inverse: condition.inverse
        };

        analysisResultArray.forEach((wt, index) => {
          if (condition.value.indexOf(wt.key.toString()) >= 0) {
            analysisResultArray[index].selected = true;
          }
        });
        if (analysisResultArray[1].selected) {
          analysisResultArray[2].disabled = true;
          analysisResultArray[3].disabled = true;
          analysisResultArray[4].disabled = true;
        }
      } else if (condition.type === 'FILE_TYPE') {
        parsedConditions.FILE_TYPE = {
          value: condition.value,
          inverse: condition.inverse
        };

        fileTypeArray.forEach((wt, index) => {
          if (condition.value.indexOf(wt.key.toString()) >= 0) {
            fileTypeArray[index].selected = true;
          }
        });
      } else if (condition.type === 'ORIGIN') {
        parsedConditions.ORIGIN = {
          value: condition.origins,
          inverse: condition.inverse
        };
      } else if (condition.type === 'LANGUAGE') {
        parsedConditions.LANGUAGE = {
          value: $languagesStore
            .filter((item) => condition.value.includes(item.language_id))
            .map((lang) => lang.language),
          inverse: condition.inverse
        };
      } else if (condition.type === 'COUNTRY') {
        parsedConditions.COUNTRY = {
          value: filterListGeneral?.countries
            ?.filter((item) => condition.value.includes(item.value))
            .map((lang) => lang.label),
          inverse: condition.inverse
        };
      } else if (condition.type === 'HAS_LABEL') {
        parsedConditions.HAS_LABEL = {
          value: filterListGeneral?.labels
            ?.filter((item) =>
              condition.value?.[0]?.replace('[', '').replace(']', '').split(',').includes(item.id.toString())
            )
            .map((label) => label),
          inverse: condition.inverse
        };
      } else if (condition.type === 'TERM') {
        parsedConditions.TERM = {
          value: termListGeneral.filter((item) => condition.value?.includes?.(item.id.toString())),

          inverse: condition.inverse
        };
      }
    });
  }

  function readActionValues() {
    filter.actions.forEach((action) => {
      if (action.type === 'LABEL_ASSIGNATION') {
        parsedActions.LABEL_ASSIGNATION = {
          value: filterListGeneral?.labels
            ?.filter((item) => action.value?.replace('[', '').replace(']', '').split(',').includes(item.id.toString()))
            .map((label) => label)
        };
      } else if (action.type === 'ANALYSIS_RESULT_ASSIGNATION') {
        if (action.value) {
          parsedActions.ANALYSIS_RESULT_ASSIGNATION = {
            value: action.value
          };
          analysisResultActionsArray.forEach((analysisResult, index) => {
            if (+action.value === analysisResult.key) {
              analysisResultActionsArray[index].selected = true;
            }
          });
        }
      } else if (action.type === 'WEIGHT_ASSIGNATION') {
        if (action.value) {
          parsedActions.WEIGHT_ASSIGNATION = {
            value: +action.value
          };
        }
      } else if (action.type === 'LAUNCH_ALERT') {
        if (!action.hasOwnProperty('value')) {
          parsedActions.LAUNCH_ALERT = {
            value: true,
            ...action
          };
          $contentAlertStore.sendAlert = action.alertConfiguration.sendAlert;
        }
      } else if (action.type === 'DELETE' || action.type === 'CUT_EXECUTION') {
        parsedActions[action.type] = {
          value: !action.hasOwnProperty('value') ? true : JSON.parse(action.value)
        };
      }
    });
  }

  function getFilterActionStatus(action): 'Activated' | 'Deactivated' {
    return parsedActions[action].value ? 'Activated' : 'Deactivated';
  }

  function onBackToList() {
    dispatch('backToList');
  }
</script>

<Drawer {isOpen} hasDefaultHeader={false} on:clickAway maxScreenSize="max-w-xl">
  <svelte:fragment slot="custom-header">
    <div class="border bg-ctip-ui text-ctip-text flex justify-between items-center w-full h-14 px-3">
      <div class="flex items-center">
        <div class="w-9 h-9 flex justify-center items-center text-ctip-white bg-ctip-primary rounded-md">
          <Filter class="w-4 h-4" />
        </div>
        <div class="ml-2 text-sm">
          <span>Advanced Filters</span>
          <span class="mx-1">|</span>
          <small class="text-ctip-text">SHOW</small>
        </div>
      </div>
      <div>
        <GenericButton kind="primary" on:click={onBackToList}>
          <ChevronLeft class="mr-2" />
          Back to list
        </GenericButton>
        <GenericButton
          disabled={!filter || isUserUnableToEditFilter()}
          href={filter &&
            `/dashboard/organizations/${$currentOrganizationId}/modules/${moduleId}/settings/filters/${filter.id}/edit`}
        >
          <Edit class="mr-2" />
          Edit
        </GenericButton>
      </div>
    </div>
  </svelte:fragment>
  <div class="px-3" id="details-filter">
    <div
      class="mt-3 p-2 border bg-ctip-background text-ctip-text border-solid flex justify-between flex-col w-full rounded-md"
    >
      <h6 class="font-bold text-ctip-text uppercase mt-2 mb-1">Name</h6>
      {#if isLoading}
        <SkeletonPlaceholder class="h-6 w-full" />
      {:else}
        <p class="text-ctip-text mb-0">{filter?.name || '-'}</p>
        <hr class="w-100 mt-2 border-[2px] border-solid bg-ctip-primary" />
      {/if}
    </div>

    <InfoCard title="Filter Conditions" class="mt-3">
      {#if isLoading}
        <SkeletonPlaceholder class="w-full" />
      {/if}
      {#if filter?.conditions}
        <div class="flex flex-col w-full">
          {#if pwdType}
            <InlineNotification hideCloseButton kind="info" subtitle={pwdMessages[pwdType]}>
              <span class="italic">
                This is an auto-generated filter. This pre-existing condition cannot be edited.
              </span>
            </InlineNotification>
          {/if}
          {#if parsedConditions.FILTER_PHRASE.value}
            <div class="mx-2 py-2 border-b-[1px] border-solid border-ctip-border text-ctip-text">
              <ViewDetailsItem
                title="filter phrase"
                value={parsedConditions.FILTER_PHRASE.value}
                icon={Code}
                class="w-7 h-7"
                isInverse={parsedConditions?.FILTER_PHRASE.inverse}
              >
                <svelte:fragment slot="inverse">
                  <TooltipWithIcon
                    tooltipText="Inverse search"
                    icon={ChevronLeft}
                    color={COLORS.primary}
                    class="text-ctip-primary"
                    direction="right"
                  />
                </svelte:fragment>
              </ViewDetailsItem>
            </div>
          {/if}
          {#if parsedConditions.DOMAIN.value}
            <div class="mx-2 py-2 border-b-[1px] border-solid border-ctip-border">
              <ViewDetailsItem
                title="domain"
                value={parsedConditions?.DOMAIN.value}
                icon={Code}
                class="w-7 h-7"
                isInverse={parsedConditions?.DOMAIN.inverse}
              >
                <svelte:fragment slot="inverse">
                  <TooltipWithIcon
                    tooltipText="Inverse search"
                    icon={ChevronLeft}
                    color={COLORS.primary}
                    class="text-ctip-primary"
                    direction="right"
                  />
                </svelte:fragment>
              </ViewDetailsItem>
            </div>
          {/if}
          {#if parsedConditions.EXTRADATA_ENTRY?.value}
            <!-- Extradata legacy -->
            {@const isOld = typeof parsedConditions?.EXTRADATA_ENTRY?.value?.key === 'string'}
            <div class="mx-2 py-2 border-b-[1px] border-solid border-ctip-border">
              <ViewDetailsItem
                title="extradata"
                icon={Code}
                action
                class="w-7 h-7"
                isInverse={parsedConditions.EXTRADATA_ENTRY.inverse}
              >
                <svelte:fragment slot="action">
                  {#if isOld}
                    <div class="flex flex-col text-left">
                      <div>
                        <Tag>Key:</Tag><span>{parsedConditions.EXTRADATA_ENTRY.value.key}</span>
                      </div>
                      <div>
                        <Tag>Value:</Tag><span>{parsedConditions.EXTRADATA_ENTRY.value.value}</span>
                      </div>
                    </div>
                  {:else}
                    {@html queryToHTML(parsedConditions.EXTRADATA_ENTRY.value)}
                  {/if}
                </svelte:fragment>
                <svelte:fragment slot="inverse">
                  <TooltipWithIcon
                    tooltipText="Inverse search"
                    icon={ChevronLeft}
                    color={COLORS.primary}
                    class="text-ctip-primary"
                    direction="right"
                  />
                </svelte:fragment>
              </ViewDetailsItem>
            </div>
          {/if}
          {#if parsedConditions.ANALYSIS_RESULT?.value?.length}
            <div class="mx-2 py-2 border-b-[1px] border-solid border-ctip-border">
              <ViewDetailsItem title="analysis status" icon={Code} action class="w-7 h-7">
                <svelte:fragment slot="action">
                  <div class="flex flex-wrap justify-end">
                    {#each analysisResultArray as result}
                      {#if result.selected}
                        <GenericTag label={result.name} background={COLORS.gray} />
                      {/if}
                    {/each}
                  </div>
                </svelte:fragment>
              </ViewDetailsItem>
            </div>
          {/if}
          {#if parsedConditions.FILE_TYPE?.value?.length}
            <div class="mx-2 py-2 border-b-[1px] border-solid border-ctip-border">
              <ViewDetailsItem title="file type" icon={DocumentBlank} action class="w-7 h-7">
                <svelte:fragment slot="action">
                  <div class="flex flex-wrap justify-end">
                    {#each fileTypeArray as result}
                      {#if result.selected}
                        <GenericTag label={result.name} background={COLORS.gray} />
                      {/if}
                    {/each}
                  </div>
                </svelte:fragment>
              </ViewDetailsItem>
            </div>
          {/if}
          {#if parsedConditions.ORIGIN?.value?.length}
            <div class="mx-2 py-2 border-b-[1px] border-solid border-ctip-border">
              <ViewDetailsItem
                title="origin"
                icon={DocumentBlank}
                action
                class="w-7 h-7"
                isInverse={parsedConditions?.ORIGIN.inverse}
              >
                <svelte:fragment slot="action">
                  <div class="flex flex-wrap justify-end">
                    {#each parsedConditions.ORIGIN.value as result}
                      <GenericTag label={result.value || result.type} background={COLORS.gray} />
                    {/each}
                  </div>
                </svelte:fragment>
                <svelte:fragment slot="inverse">
                  <TooltipWithIcon
                    tooltipText="Inverse search"
                    icon={ChevronLeft}
                    color={COLORS.primary}
                    class="text-ctip-primary"
                    direction="right"
                  />
                </svelte:fragment>
              </ViewDetailsItem>
            </div>
          {/if}
          {#if parsedConditions.LANGUAGE?.value?.length}
            <div class="mx-2 py-2 border-b-[1px] border-solid border-ctip-border">
              <ViewDetailsItem
                title="language"
                icon={EarthFilled}
                action
                class="w-7 h-7"
                isInverse={parsedConditions?.LANGUAGE.inverse}
              >
                <svelte:fragment slot="action">
                  <div class="flex flex-wrap justify-end">
                    {#each parsedConditions.LANGUAGE.value as result}
                      <GenericTag label={result} background={COLORS.gray} />
                    {/each}
                  </div>
                </svelte:fragment>
                <svelte:fragment slot="inverse">
                  <TooltipWithIcon
                    tooltipText="Inverse search"
                    icon={ChevronLeft}
                    color={COLORS.primary}
                    class="text-ctip-primary"
                    direction="right"
                  />
                </svelte:fragment>
              </ViewDetailsItem>
            </div>
          {/if}
          {#if parsedConditions.TERM?.value?.length}
            <div class="mx-2 py-2 border-b-[1px] border-solid border-ctip-border">
              <ViewDetailsItem
                title="terms"
                icon={DocumentBlank}
                class="w-7 h-7"
                isInverse={parsedConditions?.TERM.inverse}
                value={parsedConditions?.TERM.value.map(({ searchPhrase }) => searchPhrase).join()}
              >
                <svelte:fragment slot="inverse">
                  <TooltipWithIcon
                    tooltipText="Inverse search"
                    icon={ChevronLeft}
                    color={COLORS.primary}
                    class="text-ctip-primary"
                    direction="right"
                  />
                </svelte:fragment>
              </ViewDetailsItem>
            </div>
          {/if}
          {#if parsedConditions.COUNTRY?.value?.length}
            <div class="mx-2 py-2 border-b-[1px] border-solid border-ctip-border">
              <ViewDetailsItem
                title="countries"
                icon={EarthFilled}
                action
                class="w-7 h-7"
                isInverse={parsedConditions?.COUNTRY.inverse}
              >
                <svelte:fragment slot="action">
                  <div class="flex flex-wrap justify-end">
                    {#each parsedConditions.COUNTRY.value as result}
                      <GenericTag label={result} background={COLORS.gray} />
                    {/each}
                  </div>
                </svelte:fragment>
                <svelte:fragment slot="inverse">
                  <TooltipWithIcon
                    tooltipText="Inverse search"
                    icon={ChevronLeft}
                    color={COLORS.primary}
                    class="text-ctip-primary"
                    direction="right"
                  />
                </svelte:fragment>
              </ViewDetailsItem>
            </div>
          {/if}
          {#if parsedConditions.HAS_LABEL?.value?.length}
            <div class="mx-2 py-2">
              <ViewDetailsItem
                title="labels"
                icon={TagIcon}
                action
                class="w-7 h-7"
                isInverse={parsedConditions?.HAS_LABEL.inverse}
              >
                <svelte:fragment slot="action">
                  <div class="flex flex-wrap justify-end">
                    {#each parsedConditions.HAS_LABEL.value as result}
                      <LabelItem label={result} customBg={COLORS.black} />
                    {/each}
                  </div>
                </svelte:fragment>
                <svelte:fragment slot="inverse">
                  <TooltipWithIcon
                    tooltipText="Inverse search"
                    icon={ChevronLeft}
                    color={COLORS.primary}
                    class="text-ctip-primary"
                    direction="right"
                  />
                </svelte:fragment>
              </ViewDetailsItem>
            </div>
          {/if}
        </div>
      {/if}
    </InfoCard>

    <InfoCard title="Filter Actions" class="mt-3">
      {#if isLoading}
        <SkeletonPlaceholder class="w-full" />
      {/if}
      {#if filter?.actions}
        <div class="flex flex-col w-full">
          {#if parsedActions.LABEL_ASSIGNATION?.value?.length}
            <div class="mx-2 py-2 border-b-[1px] border-solid border-ctip-border">
              <ViewDetailsItem title="labels" icon={TagIcon} action class="w-7 h-7">
                <svelte:fragment slot="action">
                  <div class="flex flex-wrap justify-end">
                    {#each parsedActions.LABEL_ASSIGNATION.value as result}
                      <LabelItem label={result} />
                    {/each}
                  </div>
                </svelte:fragment>
              </ViewDetailsItem>
            </div>
          {/if}
          {#if parsedActions.WEIGHT_ASSIGNATION?.value}
            <div class="mx-2 py-2 border-b-[1px] border-solid border-ctip-border">
              <ViewDetailsItem title="rating" icon={StarFilled} action class="w-7 h-7">
                <svelte:fragment slot="action">
                  <StarRating rating={parsedActions.WEIGHT_ASSIGNATION.value} />
                </svelte:fragment>
              </ViewDetailsItem>
            </div>
          {/if}
          {#if parsedActions.ANALYSIS_RESULT_ASSIGNATION?.value?.length}
            <div class="mx-2 py-2 border-b-[1px] border-solid border-ctip-border">
              <ViewDetailsItem title="assign result type" icon={Screen} action class="w-7 h-7">
                <svelte:fragment slot="action">
                  <div class="flex flex-wrap justify-end">
                    {#each analysisResultActionsArray as result}
                      {#if result.selected}
                        <span class="text-ctip-secundary">{result.name}</span>
                      {/if}
                    {/each}
                  </div>
                </svelte:fragment>
              </ViewDetailsItem>
            </div>
          {/if}
          <div class="mx-2 py-2 border-b-[1px] border-solid border-ctip-border">
            <ViewDetailsItem title="stop filter execution" icon={Error} action class="w-7 h-7">
              <svelte:fragment slot="action">
                <div class="flex flex-wrap justify-end">
                  <span class="text-ctip-secundary">{getFilterActionStatus('CUT_EXECUTION')}</span>
                </div>
              </svelte:fragment>
            </ViewDetailsItem>
          </div>
          <div class="mx-2 py-2 border-b-[1px] border-solid border-ctip-border">
            <ViewDetailsItem title="delete & stop filter execution" icon={Screen} action class="w-7 h-7">
              <svelte:fragment slot="action">
                <div class="flex flex-wrap justify-end">
                  <span class="text-ctip-secundary">{getFilterActionStatus('DELETE')}</span>
                </div>
              </svelte:fragment>
            </ViewDetailsItem>
          </div>
          <div class="mx-2 py-2">
            <ViewDetailsItem title="launch alert" icon={Bullhorn} action class="w-7 h-7">
              <svelte:fragment slot="action">
                <div class="flex flex-wrap justify-end">
                  <span class="text-ctip-secundary">{getFilterActionStatus('LAUNCH_ALERT')}</span>
                </div>
              </svelte:fragment>
            </ViewDetailsItem>
          </div>
          {#if parsedActions.LAUNCH_ALERT.value}
            <div class="mx-2 py-2">
              <ContentAlert
                disabled
                bind:alertContentFields={parsedActions.LAUNCH_ALERT.alertConfiguration.alertContentFields}
                module={module ?? $currentModule}
              />
            </div>
          {/if}
        </div>
      {/if}
    </InfoCard>
  </div>
</Drawer>
