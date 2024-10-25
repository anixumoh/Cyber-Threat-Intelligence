<script lang="ts">
  import Client from '$lib/client';
  import { MENTIONS_CATEGORIES_KEYS, type MENTIONS_CATEGORIES_TYPE } from '$lib/constants/tcx';
  import {
    TCXModel,
    type TCXCVEMentionResponse,
    type TCXModelAttributes,
    type TCXModelData,
    type TCXModelRelationships,
    type TCXQuery
  } from '$lib/types/tcx';
  import externalLinkStore from '$stores/externalLink';
  import { currentModuleId } from '$stores/module';
  import notifications from '$stores/notification';
  import { currentOrganizationId } from '$stores/organization';
  import { Button, InlineNotification, Select, SelectItem, Tab, Tabs, Tag } from 'carbon-components-svelte';
  import type { DataTableHeader } from 'carbon-components-svelte/types/DataTable/DataTable.svelte';
  import { Launch } from 'carbon-icons-svelte';
  import ExportableDataTable from '../ExportableDataTable/ExportableDataTable.svelte';

  export let readonly = false;
  export let description = '';
  export let relationships: TCXModelRelationships;
  export let model: TCXModel;
  export let id: string;

  type TabItem = {
    title: string;
    fileName?: string;
    headers?: DataTableHeader[];
    model?: TCXModel;
    getRelatedItems?: (cveQuery: TCXQuery) => unknown;
  };

  const client = new Client();

  const TAB_ITEMS = {
    MALWARE: {
      title: `Malware (${relationships?.malware?.meta?.count ?? '-'})`,
      fileName: 'related-iocs',
      headers: [
        { key: 'attributes.risk', value: 'RISK', display: (row) => Math.ceil(row.attributes.risk) },
        { key: 'malware.type', value: 'TYPE', display: (row) => row.attributes.type },
        { key: 'attributes.ioc_types', value: 'SUBTYPES' },
        { key: 'attributes.value', value: 'VALUE' },
        { key: 'attributes.first_seen', value: 'FIRST SEEN' },
        { key: 'attributes.last_seen', value: 'LAST SEEN' }
      ],
      model: TCXModel.IOC
    },
    THREAT_ACTORS: {
      title: `Threat Actors (${relationships?.threat_actors?.meta?.count ?? '-'})`,
      fileName: 'actors',
      headers: [
        { key: 'attributes.name', value: 'NAME' },
        { key: 'attributes.tlp', value: 'TLP' },
        { key: 'attributes.first_seen', value: 'FIRST SEEN' },
        { key: 'attributes.last_seen', value: 'LAST SEEN' }
      ],
      model: TCXModel.THREAT_ACTOR
    },
    CAMPAIGNS: {
      title: `Campaigns (${relationships?.campaigns?.meta?.count ?? '-'})`,
      fileName: 'campaigns',
      headers: [
        { key: 'attributes.name', value: 'NAME' },
        { key: 'attributes.tlp', value: 'TLP' },
        { key: 'attributes.first_seen', value: 'FIRST SEEN' },
        { key: 'attributes.last_seen', value: 'LAST SEEN' }
      ],
      model: TCXModel.CAMPAIGN
    },
    TOOLS: {
      title: `Tools (${relationships?.tools?.meta?.count ?? '-'})`,
      fileName: 'tools',
      headers: [
        { key: 'attributes.name', value: 'NAME' },
        { key: 'attributes.tlp', value: 'TLP' },
        { key: 'attributes.first_seen', value: 'FIRST SEEN' },
        { key: 'attributes.last_seen', value: 'LAST SEEN' }
      ],
      model: TCXModel.TOOL
    },
    ATTACK_PATTERNS: {
      title: `Attack Patterns (${relationships?.attack_patterns?.meta?.count ?? '-'})`,
      fileName: 'attack-patterns',
      headers: [
        { key: 'attributes.name', value: 'NAME' },
        { key: 'attributes.tlp', value: 'TLP' },
        { key: 'attributes.severity', value: 'SEVERITY' }
      ],
      model: TCXModel.ATTACK_PATTERN
    },
    SIGNATURES: {
      title: `Signatures (${relationships?.signatures?.meta?.count ?? '-'})`,
      fileName: 'signatures',
      headers: [
        { key: 'attributes.name', value: 'NAME' },
        { key: 'attributes.version', value: 'VERSION' },
        { key: 'attributes.tlp', value: 'TLP' }
      ],
      model: TCXModel.SIGNATURE
    },
    MENTIONS: {
      title: `Mentions (${relationships?.mentions?.meta?.count ?? '-'})`,
      fileName: 'mentions',
      headers: [
        { key: 'attributes.title', value: 'TITLE' },
        { key: 'attributes.feed_source_category', value: 'TYPE' },
        { key: 'attributes.published_at', value: 'DATE' },
        { key: 'attributes.URL', value: 'LINK' }
      ],
      model: TCXModel.MENTION
    }
  } satisfies Record<string, TabItem>;

  const MODEL_TAB_MAP: Partial<Record<TCXModel, TabItem[]>> = {
    cve: [
      TAB_ITEMS.MALWARE,
      TAB_ITEMS.THREAT_ACTORS,
      TAB_ITEMS.CAMPAIGNS,
      TAB_ITEMS.TOOLS,
      TAB_ITEMS.ATTACK_PATTERNS,
      TAB_ITEMS.SIGNATURES,
      TAB_ITEMS.MENTIONS
    ]
  };

  let loading = false;
  let selected = 0;
  let rows: TCXModelData<TCXModelAttributes>[] = [];
  let page = 1;
  let pageSize = 10;
  let totalItems = 0;

  let filterByCategory = '';

  $: modelTabs = MODEL_TAB_MAP[model] || [];
  $: selectedTab = MODEL_TAB_MAP?.[model]?.[selected];
  $: getTabData(selectedTab, page, pageSize, filterByCategory);
  $: customCss = getMentionsTableColorCss(selectedTab, rows);

  async function getTabData(tab: TabItem, page: number, pageSize: number, filterByCategory: string) {
    if (readonly || !tab.model) return;
    loading = true;
    rows = [];
    try {
      const cveQuery: TCXQuery = {
        'page[limit]': pageSize
      };
      if (page > 1) {
        cveQuery['page[offset]'] = (page - 1) * pageSize;
      }

      if (tab.model === TCXModel.MENTION && filterByCategory) {
        cveQuery['filter[feed_source_category]'] = filterByCategory as MENTIONS_CATEGORIES_TYPE;
      }

      const response = await client.tcx.getRelatedItems(id, model, tab.model, cveQuery);
      rows = response.data;
      totalItems = response.meta.pagination.count;
    } catch (error) {
      notifications.notify({ title: 'Error', subtitle: 'Some error has ocurred' });
    }
    loading = false;
  }

  function getMentionsTableColorCss(tab: TabItem, rows: TCXModelData<TCXModelAttributes>[]) {
    if (readonly || tab.model !== TCXModel.MENTION || !rows.length) return '';
    const items = rows as TCXCVEMentionResponse['data'];
    const css = items.map((row) => {
      const color = getMentionColor(row.attributes.risk_score);
      return `table tbody tr[data-row="${row.id}"]{ border-left: 4px solid ${color}; }`;
    });
    return `<style>${css.join('')}</style>`;
  }

  function getMentionColor(risk: number) {
    if (risk > 80) return 'red';
    if (risk > 50) return 'orange';
    if (risk > 20) return 'yellow';
    return 'gray';
  }
</script>

<svelte:head>
  {@html customCss}
</svelte:head>

<section class="grid gap-4">
  <Tabs bind:selected autoWidth type="container" on:change={() => (page = 1)}>
    {#if readonly}
      <Tab label="Description" />
    {/if}
    {#each modelTabs as modelTab}
      <Tab label={modelTab.title} />
    {/each}
  </Tabs>

  <div class="px-4 overflow-x-auto">
    {#if readonly}
      {#if selected === 0}
        <div class="bg-ctip-background p-4 border">
          {description}
        </div>
      {:else}
        <InlineNotification lowContrast hideCloseButton kind="info">
          To access the detailed information, please review your License and reach out to your Account Manager.
        </InlineNotification>
      {/if}
    {:else if selectedTab?.headers?.length}
      <ExportableDataTable
        bind:page
        bind:pageSize
        serverPagination
        {loading}
        {totalItems}
        headers={selectedTab.headers}
        {rows}
        fileName={selectedTab?.fileName || selectedTab?.title || 'report'}
        let:row
        let:cell
        let:displayed
        --cds-spacing-03="0.5rem"
        --cds-spacing-04="0.25rem"
        --cds-spacing-05="0.75rem"
      >
        <svelte:fragment slot="toolbar">
          {#if selectedTab.model === TCXModel.MENTION}
            <div class="flex items-center">
              <Select class="pl-2" labelText="Filter by category" inline bind:selected={filterByCategory}>
                <SelectItem text="ALL" value="" />
                {#each MENTIONS_CATEGORIES_KEYS as CATEGORY}
                  <SelectItem text={CATEGORY} value={CATEGORY} />
                {/each}
              </Select>
            </div>
          {/if}
        </svelte:fragment>
        {#if cell.key === 'malware.type'}
          <div class="flex flex-col items-center justify-center">
            <div>{displayed}</div>
            {#if displayed === 'Malware'}
              <Button
                kind="ghost"
                size="small"
                href="/dashboard/organizations/{$currentOrganizationId}/modules/{$currentModuleId}/threat_context/malwares/{row
                  .attributes.value}/summary"
              >
                See report
              </Button>
            {/if}
          </div>
        {:else if cell.key === 'attributes.title' && selectedTab.model === TCXModel.MENTION}
          <div class="grid">
            <div>{displayed}</div>
            <div>
              {#each row.attributes.labels as label}
                <Tag>{label}</Tag>
              {/each}
            </div>
          </div>
        {:else if cell.key === 'attributes.value'}
          <div class="max-w-xs text-ellipsis overflow-hidden whitespace-nowrap">{displayed}</div>
        {:else if cell.key === 'attributes.URL'}
          <Button
            kind="ghost"
            size="small"
            href={cell.value}
            icon={Launch}
            iconDescription={cell.value}
            tooltipPosition="top"
            tooltipAlignment="end"
            target="_blank"
            on:click={externalLinkStore.handleClick}
            rel="noreferrer noopener"
          />
        {:else}
          {displayed}
        {/if}
      </ExportableDataTable>
    {/if}
  </div>
</section>
