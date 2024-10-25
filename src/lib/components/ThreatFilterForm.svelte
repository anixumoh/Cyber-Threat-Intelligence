<script lang="ts">
  import modalTeleport from '$lib/actions/modalTeleport';
  import Client from '$lib/client';
  import type { LabelType, SourceType, TermsType } from '$lib/client/services/modules';
  import { MODULE_NAME } from '$lib/constants/modules';
  import { defaultStatusOptions, isDefaultStatusOptions, statusOptions } from '$lib/constants/threat';
  import type Module from '$lib/types/module';
  import {
    AnalysisCalcResultType,
    ModifiedStatusOptions,
    ReadStatusOptions,
    ThreatDateFilterField
  } from '$lib/types/threat';
  import threatsFilterStore from '$stores/filters';
  import { currentModule } from '$stores/module';
  import { currentOrganizationId } from '$stores/organization';
  import {
    Button,
    ButtonSet,
    ContentSwitcher,
    DatePicker,
    DatePickerInput,
    FormGroup,
    Modal,
    MultiSelect,
    Search,
    SkeletonPlaceholder,
    Switch,
    TextInputSkeleton,
    Tile,
    Toggle,
    TooltipIcon
  } from 'carbon-components-svelte';
  import { Add, Checkmark, FilterRemove, Information } from 'carbon-icons-svelte';
  import dayjs from 'dayjs';
  import LabelItem from './LabelItem/LabelItem.svelte';

  export let open = false;
  export let isAllThreats = false;

  enum LabelFilterType {
    OR = 'OR',
    AND = 'AND',
    NOT = 'NOT'
  }

  const statusTextMap = {
    [ReadStatusOptions.READ]: 'READ',
    [ReadStatusOptions.NOT_READ]: 'NOT READ',
    [ModifiedStatusOptions.MODIFIED]: 'WORKED ON',
    [ModifiedStatusOptions.NON_MODIFIED]: 'NOT WORKED ON'
  };
  let readStatusOptions = [
    { id: ReadStatusOptions.READ, text: statusTextMap[ReadStatusOptions.READ] },
    { id: ReadStatusOptions.NOT_READ, text: statusTextMap[ReadStatusOptions.NOT_READ] },
    { id: ModifiedStatusOptions.MODIFIED, text: statusTextMap[ModifiedStatusOptions.MODIFIED] },
    { id: ModifiedStatusOptions.NON_MODIFIED, text: statusTextMap[ModifiedStatusOptions.NON_MODIFIED] }
  ];

  type ReadStatusType = ReadStatusOptions | ModifiedStatusOptions;

  const client = new Client();

  let formEl: HTMLFormElement;
  let resetDate = 0;
  let statusOpen = false;

  let readStatusOpen = false;
  let readStatus: ReadStatusType[] = [];

  // Data
  let loadingData = true;
  let filtersLoaded = false;
  let labelItems: LabelType[] = [];
  let sourceItems: SourceType[] = [];
  let termsItems: TermsType[] = [];

  let labelItemMap: Record<number, LabelType> = {};

  // Labels
  let labelModalOpen = false;
  let labelFilterType: LabelFilterType;
  let labelModalRef: HTMLDivElement;
  let searchLabel = '';
  let selectedLabels: number[] = [];

  // form
  let dateField: ThreatDateFilterField = ThreatDateFilterField.UPDATED_AT;
  let from: string;
  let to: string;
  let sinceDate: Date;
  let toDate: Date;

  let sources: string[] = [];
  let searchWords: number[] = [];
  let status: AnalysisCalcResultType[] = defaultStatusOptions;
  let favorite: boolean = false;
  let followed: boolean = false;
  let incidents: boolean = false;
  let userSubmitted: boolean = false;
  let targeted: boolean = false;
  let labels: number[] = [];
  let labelsAnd: number[] = [];
  let excludeLabels: number[] = [];

  $: open && onOpen();
  $: open && !filtersLoaded && loadFilters($currentOrganizationId, $currentModule);
  $: labelsFiltered = availiableLabels(labelItems, labelFilterType, searchLabel, labels, labelsAnd, excludeLabels);

  $: handleOpenStatus(statusOpen);
  $: handleReadStatus(readStatusOpen);

  function handleOpenStatus(isOpen: boolean) {
    if (isOpen) {
      if (!status.length) {
        status = defaultStatusOptions;
      }
    } else {
      if (isDefaultStatusOptions(status)) {
        status = [];
      }
    }
  }

  function handleReadStatus(isOpen: boolean) {
    if (isOpen) {
      readStatusOptions = readStatusOptions;
      if (!readStatus.length) {
        readStatus = [];
      }
    } else {
      const READ = readStatus.includes(ReadStatusOptions.READ);
      const NOT_READ = readStatus.includes(ReadStatusOptions.NOT_READ);
      const MODIFIED = readStatus.includes(ModifiedStatusOptions.MODIFIED);
      const NON_MODIFIED = readStatus.includes(ModifiedStatusOptions.NON_MODIFIED);
      const options = [];
      if (READ !== NOT_READ) {
        options.push(READ ? ReadStatusOptions.READ : ReadStatusOptions.NOT_READ);
      }
      if (MODIFIED !== NON_MODIFIED) {
        options.push(MODIFIED ? ModifiedStatusOptions.MODIFIED : ModifiedStatusOptions.NON_MODIFIED);
      }
      if (!options.length) {
        readStatus = [];
      }
    }
  }

  function availiableLabels(labelItems: LabelType[], filterType: LabelFilterType, search: string, ...watchingVars) {
    const otherLabelTypes = Object.values(LabelFilterType).filter((type) => type !== filterType);
    const notAviliableIds = otherLabelTypes.map((type) => getLabels(type)).flat();
    const labels = labelItems.filter(
      (label) => !notAviliableIds.includes(label.id) && label.label.toLowerCase().includes(search.toLowerCase())
    );
    const labelsSelected = labels.filter((label) => selectedLabels.includes(label.id));
    const labelsUnSelected = labels.filter((label) => !selectedLabels.includes(label.id));
    return [...labelsSelected, ...labelsUnSelected];
  }

  function filterLabels(filterType: LabelFilterType) {
    labelFilterType = filterType;
    selectedLabels = getLabels(labelFilterType);
    labelModalOpen = true;
  }

  function removeLabel(labelId: number, filterType: LabelFilterType) {
    switch (filterType) {
      case LabelFilterType.OR:
        labels = labels.filter((id) => id !== labelId);
        break;
      case LabelFilterType.AND:
        labelsAnd = labelsAnd.filter((id) => id !== labelId);
        break;
      case LabelFilterType.NOT:
        excludeLabels = excludeLabels.filter((id) => id !== labelId);
        break;
    }
  }

  function getLabels(filterType: LabelFilterType) {
    switch (filterType) {
      case LabelFilterType.OR:
        return labels;
      case LabelFilterType.AND:
        return labelsAnd;
      case LabelFilterType.NOT:
        return excludeLabels;
    }
  }

  function setLabels() {
    labelModalOpen = false;
    switch (labelFilterType) {
      case LabelFilterType.OR:
        labels = selectedLabels;
        break;
      case LabelFilterType.AND:
        labelsAnd = selectedLabels;
        break;
      case LabelFilterType.NOT:
        excludeLabels = selectedLabels;
        break;
    }
  }

  async function loadFilters(organizationId: number, module: Module) {
    filtersLoaded = true;
    loadingData = true;
    try {
      await Promise.all([
        loadLabels(organizationId, module),
        loadSources(organizationId, module),
        loadSearchWords(organizationId, module)
      ]);
    } finally {
      loadingData = false;
    }
  }

  async function loadLabels(orgId: number, module: Module) {
    const labels = isAllThreats
      ? await client.modules.getAllLabels(orgId)
      : await client.modules.getLabels(orgId, module, true, false);

    labelItems = labels;
    labelItems.forEach((label) => {
      labelItemMap[label.id] = label;
    });
  }

  async function loadSources(orgId: number, module: Module) {
    if (isAllThreats) return;
    sourceItems = await client.modules.getSources(orgId, module.id);
  }

  async function loadSearchWords(orgId: number, module: Module) {
    if (isAllThreats) {
      termsItems = await client.modules.getAllTerms(orgId);
    } else {
      termsItems = await client.modules.getTerms(orgId, module);
    }
  }

  function handleClickOutside(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!document.body.contains(target)) return;
    if (open && formEl && formEl.contains(target)) return;
    if (open && labelModalRef && labelModalRef.contains(target)) return;
    open = false;
  }

  function removeDates() {
    from = to = '';
    sinceDate = toDate = undefined;
    resetDate++;
  }

  function getStatusLabel(status: AnalysisCalcResultType[]) {
    if (!status.length || isDefaultStatusOptions(status)) return 'DEFAULT';
    if (status.length === 4) return 'ALL';
    return status.join(', ');
  }

  function getReadStatusLabel(readStatus: ReadStatusType[]) {
    const READ = readStatus.includes(ReadStatusOptions.READ);
    const NOT_READ = readStatus.includes(ReadStatusOptions.NOT_READ);
    const MODIFIED = readStatus.includes(ModifiedStatusOptions.MODIFIED);
    const NON_MODIFIED = readStatus.includes(ModifiedStatusOptions.NON_MODIFIED);
    const options: ReadStatusType[] = [];
    if (READ !== NOT_READ) {
      options.push(READ ? ReadStatusOptions.READ : ReadStatusOptions.NOT_READ);
    }
    if (MODIFIED !== NON_MODIFIED) {
      options.push(MODIFIED ? ModifiedStatusOptions.MODIFIED : ModifiedStatusOptions.NON_MODIFIED);
    }
    if (options.length) {
      return options.map((o) => statusTextMap[o]).join(', ');
    }
    return 'ALL';
  }

  function handleChangeDate(event) {
    if (event.detail.selectedDates?.length === 2) {
      sinceDate = event.detail.selectedDates[0];
      toDate = event.detail.selectedDates[1];
    } else {
      sinceDate = undefined;
      toDate = undefined;
    }
  }

  function onOpen() {
    if ($threatsFilterStore.since && $threatsFilterStore.to) {
      sinceDate = $threatsFilterStore.since;
      toDate = $threatsFilterStore.to;
      from = dayjs(sinceDate).format('DD/MM/YY');
      to = dayjs(toDate).format('DD/MM/YY');
    } else {
      from = to = '';
      sinceDate = toDate = undefined;
    }

    readStatus = [];

    dateField = $threatsFilterStore?.dateField ?? 0;
    status = $threatsFilterStore.filters.analysisCalcResult;
    followed = $threatsFilterStore.filters.followed;
    incidents = $threatsFilterStore.filters.incidents;
    labels = $threatsFilterStore.filters.labels;
    labelsAnd = $threatsFilterStore.filters.labelsAnd;
    excludeLabels = $threatsFilterStore.filters.excludeLabels;
    if ($threatsFilterStore.filters.read !== ReadStatusOptions.ALL) {
      readStatus = [...readStatus, $threatsFilterStore.filters.read];
    }
    if ($threatsFilterStore.filters.modified !== ModifiedStatusOptions.ALL) {
      readStatus = [...readStatus, $threatsFilterStore.filters.modified];
    }
    sources = $threatsFilterStore.filters.sources;
    favorite = $threatsFilterStore.filters.starred;
    targeted = $threatsFilterStore.filters.targeted;
    searchWords = $threatsFilterStore.filters.terms;
    userSubmitted = $threatsFilterStore.filters.userSubmitted;

    handleOpenStatus(false);
  }

  function onClose() {
    open = false;
  }

  function onApply() {
    open = false;
    if (!isAllThreats) {
      $threatsFilterStore.since = sinceDate;
      $threatsFilterStore.to = toDate;
      $threatsFilterStore.dateField = dateField;
    }

    $threatsFilterStore.filters.analysisCalcResult = status;
    $threatsFilterStore.filters.followed = followed;
    $threatsFilterStore.filters.incidents = incidents;
    $threatsFilterStore.filters.labels = labels;
    $threatsFilterStore.filters.labelsAnd = labelsAnd;
    $threatsFilterStore.filters.excludeLabels = excludeLabels;
    $threatsFilterStore.filters.read = getReadStatus();
    $threatsFilterStore.filters.modified = getModifyStatus();
    $threatsFilterStore.filters.sources = sources;
    $threatsFilterStore.filters.starred = favorite;
    $threatsFilterStore.filters.targeted = targeted;
    $threatsFilterStore.filters.terms = searchWords;
    $threatsFilterStore.filters.userSubmitted = userSubmitted;
  }

  function getReadStatus() {
    const READ = readStatus.includes(ReadStatusOptions.READ);
    const NOT_READ = readStatus.includes(ReadStatusOptions.NOT_READ);
    if (READ && NOT_READ) return ReadStatusOptions.ALL;
    if (READ) return ReadStatusOptions.READ;
    if (NOT_READ) return ReadStatusOptions.NOT_READ;
    return ReadStatusOptions.ALL;
  }

  function getModifyStatus() {
    const MODIFIED = readStatus.includes(ModifiedStatusOptions.MODIFIED);
    const NON_MODIFIED = readStatus.includes(ModifiedStatusOptions.NON_MODIFIED);
    if (MODIFIED && NON_MODIFIED) return ModifiedStatusOptions.ALL;
    if (MODIFIED) return ModifiedStatusOptions.MODIFIED;
    if (NON_MODIFIED) return ModifiedStatusOptions.NON_MODIFIED;
    return ModifiedStatusOptions.ALL;
  }

  function isFollowedVisible(module: Module) {
    switch (module.moduleName) {
      case MODULE_NAME.CUSTOM:
      case MODULE_NAME.MOBILE_APPS:
      case MODULE_NAME.DOMAIN_PROTECTION:
      case MODULE_NAME.DARK_WEB:
        return true;
      case MODULE_NAME.DATA_LEAKAGE:
      case MODULE_NAME.HACKTIVISM:
        return location.hostname === 'tcallzgroup.blueliv.com' || location.hostname === 'tcpre-production.blueliv.com';
      default:
        return false;
    }
  }
</script>

<svelte:window on:click={handleClickOutside} />

{#if open}
  <form bind:this={formEl} class="absolute top-full mt-11 z-50 grid right-0 w-[500px] lg:w-[725px] shadow border">
    <Tile class="grid grid-cols-1 px-4 pt-4 overflow-y-auto lg:overflow-y-visible lg:grid-cols-2">
      <div class="pr-4 mb-4 border-r border-ctip-border border-solid">
        <FormGroup class="mb-14">
          {#if !isAllThreats && $currentModule.moduleName === MODULE_NAME.CREDENTIAL}
            <ContentSwitcher
              size="sm"
              bind:selectedIndex={dateField}
              class="[&_button]:p-2 [&_button]:text-center [&_button]:rounded-none mb-2"
            >
              <!-- Same order as ThreatDateFilterField -->
              <Switch text="Updated at" />
              <Switch text="Breached at" />
              <!-- <Switch text="Reported at" /> -->
            </ContentSwitcher>
          {/if}

          <div class="flex gap-2 relative">
            {#key resetDate}
              <DatePicker
                on:change={handleChangeDate}
                bind:valueFrom={from}
                bind:valueTo={to}
                dateFormat="d/m/y"
                datePickerType="range"
                flatpickrProps={{ maxDate: new Date() }}
              >
                <DatePickerInput labelText="Date from" placeholder="dd/mm/yy" />
                <DatePickerInput labelText="Date to" placeholder="dd/mm/yy" />
              </DatePicker>
            {/key}
            <Button
              class="rounded h-8 mt-auto mr-24 lg:mr-0"
              tooltipAlignment="center"
              tooltipPosition="top"
              iconDescription="Remove dates"
              kind="tertiary"
              size="small"
              icon={FilterRemove}
              on:click={removeDates}
            />
          </div>
        </FormGroup>

        {#if !isAllThreats}
          <FormGroup class="w-full multiselect-fit">
            {#if loadingData}
              <TextInputSkeleton />
            {:else}
              <div class="relative">
                <MultiSelect
                  bind:selectedIds={sources}
                  filterable
                  class="w-full"
                  titleText="Sources"
                  data-test="Sources"
                  label="Select sources to filter..."
                  disabled={!sourceItems.length}
                  placeholder={sourceItems.length ? sources.join(', ') : 'No sources available'}
                  items={sourceItems.map((source) => ({
                    id: source.transform,
                    text: `${source.transform} (${source.total})`
                  }))}
                />
                <TooltipIcon
                  class="absolute left-16 top-0.5"
                  direction="right"
                  tooltipText="The counter displays the total data retrieved while date filtering allows searches within a one-year interval"
                  icon={Information}
                />
              </div>
            {/if}
          </FormGroup>
        {/if}

        <FormGroup class="w-full multiselect-fit">
          {#if loadingData}
            <TextInputSkeleton />
          {:else}
            <div class="relative">
              <MultiSelect
                bind:selectedIds={searchWords}
                filterable
                class="w-full"
                titleText="Search Words"
                label="Select search words to filter..."
                disabled={!termsItems.length}
                placeholder={termsItems.length
                  ? searchWords.map((id) => termsItems.find((t) => t.id === id)?.term).join(', ')
                  : 'No search words available'}
                items={termsItems.map((term) => ({
                  id: term.id,
                  text: `${term.term} (${term.total})`
                }))}
              />
              <TooltipIcon
                class="absolute left-28 top-0.5"
                direction="right"
                tooltipText="The counter displays the total data retrieved while date filtering allows searches within a one-year interval"
                icon={Information}
              />
            </div>
          {/if}
        </FormGroup>

        {#if isAllThreats || $currentModule.moduleName !== MODULE_NAME.CREDENTIAL}
          <FormGroup class="[&_span]:max-w-[220px] multiselect-fit">
            <MultiSelect
              bind:selectedIds={status}
              bind:open={statusOpen}
              selectionFeedback="fixed"
              size="sm"
              titleText="Relevance"
              label={getStatusLabel(status)}
              items={statusOptions}
              sortItem={() => {}}
            />
          </FormGroup>
        {/if}
      </div>

      <div class="pl-0 lg:!pl-4">
        <FormGroup class="mb-4 grid [&_span]:max-w-[220px] multiselect-fit" data-test="Threat_status">
          <MultiSelect
            id="read-status"
            selectionFeedback="fixed"
            bind:selectedIds={readStatus}
            bind:open={readStatusOpen}
            size="sm"
            titleText="Threat status"
            label={getReadStatusLabel(readStatus)}
            items={readStatusOptions}
            sortItem={() => {}}
          />
        </FormGroup>

        <FormGroup class="flex mb-4 gap-2 [&_label_span]:mt-1 [&_label_span]:text-sm">
          <Toggle bind:toggled={favorite} labelText="Favorite" labelA="" labelB="" />
          {#if !isAllThreats && isFollowedVisible($currentModule)}
            <Toggle bind:toggled={followed} labelText="Followed" labelA="" labelB="" />
          {/if}
          <Toggle bind:toggled={incidents} labelText="Incidents" labelA="" labelB="" />
          {#if !isAllThreats && $currentModule.moduleName === MODULE_NAME.MALWARE}
            <Toggle bind:toggled={userSubmitted} labelText="Submitted" labelA="" labelB="" />
            <Toggle bind:toggled={targeted} labelText="Targeted" labelA="" labelB="" />
          {/if}
        </FormGroup>

        <FormGroup>
          <div>
            <div class="flex justify-between w-full mb-2 border-b border-gray-200 border-solid">
              <span>Labels</span>
            </div>

            <div>
              {#if loadingData}
                <SkeletonPlaceholder class="w-full h-36" />
              {:else}
                {#each Object.values(LabelFilterType) as labelFilterType}
                  <!-- overflow-y-auto max-h-40 -->
                  <!-- care with tooltip overflow -->
                  <div class="flex gap-2 border-b border-gray-200 border-solid">
                    <div class="flex items-start mt-2.5 text-xs">{labelFilterType}</div>
                    <div class="flex flex-wrap items-center w-full gap-1 p-2">
                      {#if labelFilterType === LabelFilterType.OR}
                        {#each labels as labelId}
                          <LabelItem
                            filter
                            on:close={() => removeLabel(labelId, labelFilterType)}
                            label={labelItemMap[labelId]}
                          />
                        {/each}
                      {:else if labelFilterType === LabelFilterType.AND}
                        {#each labelsAnd as labelId}
                          <LabelItem
                            filter
                            on:close={() => removeLabel(labelId, labelFilterType)}
                            label={labelItemMap[labelId]}
                          />
                        {/each}
                      {:else if labelFilterType === LabelFilterType.NOT}
                        {#each excludeLabels as labelId}
                          <LabelItem
                            filter
                            on:close={() => removeLabel(labelId, labelFilterType)}
                            label={labelItemMap[labelId]}
                          />
                        {/each}
                      {/if}
                      <Button
                        class="rounded"
                        data-test="group_label"
                        tooltipAlignment="end"
                        tooltipPosition="top"
                        iconDescription="Add label filter ({labelFilterType})"
                        kind="tertiary"
                        size="small"
                        icon={Add}
                        on:click={() => filterLabels(labelFilterType)}
                      />
                    </div>
                  </div>
                {/each}
              {/if}
            </div>
          </div>
        </FormGroup>
      </div>
    </Tile>

    <ButtonSet class="flex w-full">
      <Button class="w-1/2 h-12 max-w-none" on:click={onClose} kind="secondary">Cancel</Button>
      <Button class="w-1/2 h-12 max-w-none" data-test="Apply" on:click={onApply}>Apply</Button>
    </ButtonSet>
  </form>
{/if}

<div use:modalTeleport>
  <Modal
    size="sm"
    bind:ref={labelModalRef}
    bind:open={labelModalOpen}
    modalHeading="Label"
    primaryButtonText="Set filters"
    secondaryButtonText="Cancel"
    on:click:button--secondary={() => (labelModalOpen = false)}
    on:submit={setLabels}
    on:open={() => (searchLabel = '')}
  >
    <Search bind:value={searchLabel} />

    <div class="mt-4">
      {#each labelsFiltered as label}
        {@const checked = selectedLabels.includes(label.id)}
        <label
          class="flex justify-between items-center w-full transition-colors hover:bg-ctip-hover-ui hover:cursor-pointer m-1 p-1.5"
          class:bg-ctip-hover-ui={checked}
          data-test="labels"
        >
          <div>
            <LabelItem {label} />
          </div>
          {#if checked}
            <Checkmark />
          {/if}
          <input hidden type="checkbox" bind:group={selectedLabels} value={label.id} />
        </label>
      {/each}
    </div>
  </Modal>
</div>

<style>
  :global(#menu-read-status .bx--list-box__menu-item:nth-child(2) .bx--list-box__menu-item__option) {
    @apply border-b-gray-400;
  }
</style>
