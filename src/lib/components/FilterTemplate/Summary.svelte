<script lang="ts">
  import type { LabelListItem, SettingsTerm, ValueLabelItem } from '$lib/client/services/settings';
  import ContentAlert from '$lib/components/Filter/ContentAlert.svelte';
  import LabelItem from '$lib/components/LabelItem/LabelItem.svelte';
  import StarRating from '$lib/components/StarRating/index.svelte';
  import { currentModule } from '$stores/module';
  import { Accordion, AccordionItem, Tag } from 'carbon-components-svelte';
  import { Bullhorn, Code, DocumentBlank, Error, Screen, Star, TagGroup, Terminal, Wikis } from 'carbon-icons-svelte';
  import type { createForm } from 'felte';
  import { getContext } from 'svelte';
  import type * as yup from 'yup';
  import { queryToHTML } from './ExtradataField/utils';
  import SummaryItem from './SummaryItem.svelte';
  import {
    actionsSchema,
    analysisResultActionsArray,
    analysisResultArray,
    conditionsSchema,
    fileTypeArray
  } from './constants';
  import type { OriginType } from './types';

  type ConditionsForm = ReturnType<typeof createForm<yup.InferType<typeof conditionsSchema>>>;
  const { conditionsForm } = getContext<{ conditionsForm: ConditionsForm }>('forms');
  const { data: conditionsData } = conditionsForm;

  type ActionsForm = ReturnType<typeof createForm<yup.InferType<typeof actionsSchema>>>;
  const { actionsForm } = getContext<{ actionsForm: ActionsForm }>('forms');
  const { data: actionsData } = actionsForm;

  export let terms: SettingsTerm[];
  export let labels: LabelListItem[];
  export let origins: OriginType[] = [];
  export let languages: ValueLabelItem[] = [];
  export let countries: ValueLabelItem[] = [];

  let conditionsOpen = true;
  let actionsOpen = true;

  // Conditions
  $: analysisNames = $conditionsData?.analysisstatus?.map(
    (key) => analysisResultArray.find((a) => a.key === key)?.name
  );
  $: fileTypeNames = $conditionsData?.filetypes?.map((key) => fileTypeArray.find((a) => a.key === key)?.name);
  $: originNames = $conditionsData?.origins?.map((value) => origins.find((o) => o.value === value)?.label);
  $: languageNames = $conditionsData?.languages?.map((value) => languages.find((l) => l.value === value)?.label);
  $: termsNames = $conditionsData?.terms?.map((id) => terms.find((t) => t.id === id)?.searchPhrase);
  $: countryNames = $conditionsData?.countries?.map((value) => countries.find((c) => c.value === value)?.label);
  $: labelNames = $conditionsData?.labels?.map((id) => labels.find((l) => l.id === id)?.label);

  // Actions
  $: actionLabels = $actionsData?.labels?.map((id) => labels.find((l) => l.id === id)).filter(Boolean);
  $: analysisResultName = analysisResultActionsArray.find((a) => a.key === $actionsData?.analysisResult)?.name;
</script>

<div class="text-base border-b-2 border-solid border-ctip-interactive">Name</div>
<div class="p-2">{$conditionsData.name}</div>

<Accordion class="mt-4 [&>li>div]:p-0">
  <AccordionItem bind:open={conditionsOpen} class="shadow-md">
    <div class:border-b-2={conditionsOpen} class="p-1 m-1 border-solid border-ctip-interactive" slot="title">
      CONDITIONS
    </div>
    <div class="grid grid-cols-1 gap-8 p-4 text-xs bg-ctip-ui lg:grid-cols-2">
      {#if $conditionsData.filterPhrase}
        <SummaryItem title="FILTER PHRASE" inversed={$conditionsData.filterphraseInversed} icon={Code}>
          <div class="max-w-xs p-1 overflow-hidden border border-solid text-ellipsis">
            {$conditionsData.filterPhrase}
          </div>
        </SummaryItem>
      {/if}
      {#if $conditionsData.domain}
        <SummaryItem title="DOMAIN" inversed={$conditionsData.domainInversed} icon={Code}>
          <Tag type="outline">{$conditionsData.domain}</Tag>
        </SummaryItem>
      {/if}
      {#if $conditionsData.extradata}
        <SummaryItem title="EXTRADATA" inversed={$conditionsData.extradataInversed} icon={Terminal}>
          {@html queryToHTML($conditionsData.extradata)}
        </SummaryItem>
      {/if}
      {#if analysisNames?.length}
        <SummaryItem title="ANALYSIS STATUS" icon={Code}>
          {#each analysisNames as analysis}
            <Tag type="outline">{analysis}</Tag>
          {/each}
        </SummaryItem>
      {/if}
      {#if fileTypeNames?.length}
        <SummaryItem title="FILE TYPE" icon={DocumentBlank}>
          {#each fileTypeNames as fileType}
            <Tag type="outline">{fileType}</Tag>
          {/each}
        </SummaryItem>
      {/if}
      {#if originNames?.length}
        <SummaryItem title="ORIGIN" inversed={$conditionsData.originsInversed} icon={DocumentBlank}>
          {#each originNames as origin}
            <Tag type="outline">{origin}</Tag>
          {/each}
        </SummaryItem>
      {/if}
      {#if languageNames?.length}
        <SummaryItem title="LANGUAGE" inversed={$conditionsData.languagesInversed} icon={Wikis}>
          {#each languageNames as language}
            <Tag type="outline">{language}</Tag>
          {/each}
        </SummaryItem>
      {/if}
      {#if termsNames?.length}
        <SummaryItem title="TERMS" inversed={$conditionsData.termsInversed} icon={DocumentBlank}>
          {#each termsNames as term}
            <Tag type="outline">{term}</Tag>
          {/each}
        </SummaryItem>
      {/if}
      {#if countryNames?.length}
        <SummaryItem title="COUNTRIES" inversed={$conditionsData.countriesInversed} icon={Wikis}>
          {#each countryNames as country}
            <Tag type="outline">{country}</Tag>
          {/each}
        </SummaryItem>
      {/if}
      {#if labelNames?.length}
        <SummaryItem title="LABELS" inversed={$conditionsData.labelsInversed} icon={TagGroup}>
          {#each labelNames as label}
            <Tag type="outline">{label}</Tag>
          {/each}
        </SummaryItem>
      {/if}
    </div>
  </AccordionItem>

  <AccordionItem bind:open={actionsOpen} title="Natural Language Classifier" class="mt-4 mb-24 shadow-md">
    <div class:border-b-2={actionsOpen} class="p-1 m-1 border-solid border-ctip-interactive" slot="title">ACTIONS</div>
    <div class="grid grid-cols-1 gap-8 p-4 text-xs bg-ctip-ui lg:grid-cols-2">
      {#if actionLabels?.length}
        <SummaryItem title="LABELS" icon={TagGroup}>
          <div class="flex flex-wrap">
            {#each actionLabels as label}
              <LabelItem {label} />
            {/each}
          </div>
        </SummaryItem>
      {/if}
      {#if $actionsData.rating}
        <SummaryItem title="RATING" icon={Star}>
          <StarRating rating={$actionsData.rating} />
        </SummaryItem>
      {/if}
      {#if analysisResultName}
        <SummaryItem title="ASSIGN RESULT TYPE" icon={Screen}>
          <Tag type="outline">{analysisResultName}</Tag>
        </SummaryItem>
      {/if}
      <SummaryItem title="STOP FILTER EXECUTION" icon={Error}>
        {#if $actionsData.filterExecutionStop}
          <Tag type="outline">Activated</Tag>
        {:else}
          <Tag type="outline">Deactivated</Tag>
        {/if}
      </SummaryItem>
      <SummaryItem title="DELETE & STOP FILTER EXECUTION" icon={Screen}>
        {#if $actionsData.filterExecutioStopDelete}
          <Tag type="outline">Activated</Tag>
        {:else}
          <Tag type="outline">Deactivated</Tag>
        {/if}
      </SummaryItem>
      <SummaryItem title="LAUNCH ALERT" icon={Bullhorn}>
        {#if $actionsData.launchAlert}
          <Tag type="outline">Activated</Tag>
        {:else}
          <Tag type="outline">Deactivated</Tag>
        {/if}
      </SummaryItem>
    </div>
    {#if $actionsData.sendAlert}
      <div class="bg-ctip-ui">
        <ContentAlert disabled bind:alertContentFields={$actionsData.alertContentFields} module={$currentModule} />
      </div>
    {/if}
  </AccordionItem>
</Accordion>
