<script lang="ts">
  import type { ExtradataKeyTemplate } from '$lib/client/services/modules';
  import type { LabelListItem, SettingsTerm, ValueLabelItem } from '$lib/client/services/settings';
  import BoxTitle from '$lib/components/FilterTemplate/BoxTitle.svelte';
  import ExtradataField from '$lib/components/FilterTemplate/ExtradataField/ExtradataField.svelte';
  import MultiSelectBox from '$lib/components/FilterTemplate/MultiSelectBox.svelte';
  import { Accordion, AccordionItem, InlineNotification, TextArea, TextInput, Toggle } from 'carbon-components-svelte';
  import type { createForm } from 'felte';
  import { getContext } from 'svelte';
  import type * as yup from 'yup';
  import { analysisResultArray, conditionsSchema, fileTypeArray } from './constants';
  import type { OriginType } from './types';

  type ConditionsForm = ReturnType<typeof createForm<yup.InferType<typeof conditionsSchema>>>;
  const { conditionsForm } = getContext<{ conditionsForm: ConditionsForm }>('forms');
  const { errors, data } = conditionsForm;

  export let terms: SettingsTerm[];
  export let labels: LabelListItem[];
  export let origins: OriginType[] = [];
  export let languages: ValueLabelItem[] = [];
  export let countries: ValueLabelItem[] = [];
  export let keyTemplates: ExtradataKeyTemplate[] = [];
  export let keyTemplateLoading = true;
  export let isEdit = false;

  $: isAnalysisStatusImportantSelected = $data?.analysisstatus?.includes(6);
  $: isAnalysisStatusOptions = isAnalysisStatusImportantSelected
    ? analysisResultArray
    : analysisResultArray.map((o) => ({ ...o, disabled: false }));

  let showMoreOpen = false;
  let extradataOpen = false;
</script>

<div class="flex items-center gap-10 py-2">
  <TextInput bind:value={$data.name} labelText="Filter Name*" required placeholder="Write here the name" />
  {#if isEdit}
    <Toggle class="pr-5 grow-0" labelText="Enabled" bind:toggled={$data.enabled} />
  {/if}
</div>

<div class="pt-4 text-base border-b-2 border-solid border-ctip-interactive">Filter Conditions</div>

<div class="p-3 bg-ctip-ui">
  <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
    <MultiSelectBox
      bind:inversed={$data.termsInversed}
      bind:selectedValues={$data.terms}
      title="Terms"
      canSearch
      tooltip="Terms Box operates using an 'OR' logic"
      canInverse
      items={terms}
      valueKey="id"
      displayKey="searchPhrase"
    />
    <MultiSelectBox
      bind:inversed={$data.labelsInversed}
      bind:selectedValues={$data.labels}
      title="Labels"
      canSearch
      canInverse
      tooltip="Labels Box operates using an 'AND' logic"
      items={labels}
      valueKey="id"
      displayKey="label"
    />
    <MultiSelectBox
      bind:selectedValues={$data.analysisstatus}
      title="Analysis Status"
      items={isAnalysisStatusOptions}
      tooltip="Analysis Status Box operates using an 'OR' logic"
      valueKey="key"
      displayKey="name"
      disabledKey="disabled"
    />
    <MultiSelectBox
      bind:inversed={$data.originsInversed}
      bind:selectedValues={$data.origins}
      title="Origin"
      canSearch
      canInverse
      tooltip="Origins Box operates using an 'OR' logic"
      items={origins}
      valueKey="value"
      displayKey="label"
      disabledKey="disabled"
    />
  </div>

  <div class="grid grid-cols-1 gap-8 pt-4 md:grid-cols-2">
    <div>
      <BoxTitle bind:inversed={$data.filterphraseInversed} title="Filter Phrase" canInverse />
      <TextArea
        on:change={() => ($data.filterPhrase = $data.filterPhrase.trim())}
        bind:value={$data.filterPhrase}
        light
        rows={2}
      />
    </div>
    <div>
      <BoxTitle bind:inversed={$data.domainInversed} title="Domain" canInverse />
      <TextInput
        bind:value={$data.domain}
        invalid={!!$errors?.domain}
        light
        placeholder="Write here the domain"
        invalidText={$errors?.domain?.[0]}
      />
    </div>
  </div>

  <div>
    <InlineNotification class="max-w-full" kind="info" lowContrast hideCloseButton>
      <div class="grid break-words">
        In order to setup your Filter Phrase, please note that Threat Compass uses Lucene syntax. You will find more
        information here:
        <a href="https://lucene.apache.org/core/2_9_4/queryparsersyntax.html" target="_blank" rel="noreferrer">
          https://lucene.apache.org/core/2_9_4/queryparsersyntax.html
        </a>
      </div>
    </InlineNotification>
  </div>
</div>

<Accordion class="mt-4 mb-24">
  <AccordionItem
    disabled={extradataOpen}
    class="[&>div]:p-0"
    bind:open={showMoreOpen}
    title={showMoreOpen ? 'Show less...' : 'Show more...'}
  >
    <div class="p-4 bg-ctip-ui">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ExtradataField
          direction="top"
          {keyTemplates}
          loading={keyTemplateLoading}
          bind:open={extradataOpen}
          bind:extradata={$data.extradata}
          bind:inversed={$data.extradataInversed}
        />
        <MultiSelectBox
          bind:selectedValues={$data.filetypes}
          title="File Type"
          items={fileTypeArray}
          valueKey="key"
          displayKey="name"
          tooltipKey="formats"
        />
        <MultiSelectBox
          bind:selectedValues={$data.languages}
          bind:inversed={$data.languagesInversed}
          title="Languages"
          canSearch
          canInverse
          items={languages}
          valueKey="value"
          displayKey="label"
        />
        <MultiSelectBox
          bind:selectedValues={$data.countries}
          bind:inversed={$data.countriesInversed}
          title="Countries"
          canSearch
          canInverse
          items={countries}
          valueKey="value"
          displayKey="label"
        />
      </div>
    </div>
  </AccordionItem>
</Accordion>
