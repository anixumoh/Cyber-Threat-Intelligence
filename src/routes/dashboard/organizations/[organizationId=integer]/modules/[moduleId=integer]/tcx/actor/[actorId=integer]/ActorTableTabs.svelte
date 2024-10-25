<script lang="ts">
  import Client from '$lib/client';
  import type { ActorData } from '$lib/client/services/actors';
  import EmptyData from '$lib/components/EmptyData/EmptyData.svelte';
  import ExportableDataTable from '$lib/components/ExportableDataTable/ExportableDataTable.svelte';
  import tokenStore from '$stores/token';
  import { DataTableSkeleton, InlineLoading, Tab, Tabs } from 'carbon-components-svelte';
  import type { DataTableHeader } from 'carbon-components-svelte/types/DataTable/DataTable.svelte';

  export let actor: ActorData;

  const client = new Client();

  enum TABS {
    INDICATORS,
    CAMPAIGNS,
    TOOLS,
    CVES,
    ATTACK_PATTERNS,
    SIGNATURES
  }

  const HEADERS: Partial<Record<TABS, DataTableHeader[]>> = {
    [TABS.INDICATORS]: [
      { key: 'attributes.risk', value: 'RISK', display: (row) => row.attributes.risk },
      { key: 'attributes.type', value: 'TYPE', display: (row) => row.attributes.type },
      { key: 'attributes.ioc_types', value: 'SUBTYPES', display: (row) => row.attributes.ioc_types },
      { key: 'attributes.value', value: 'VALUE', display: (row) => row.attributes.value },

      { key: 'attributes.first_seen', value: 'FIRST SEEN', display: (row) => row.attributes.first_seen },
      { key: 'attributes.last_seen', value: 'LAST SEEN', display: (row) => row.attributes.last_seen }
    ],
    [TABS.CAMPAIGNS]: [
      { key: 'attributes.name', value: 'NAME', display: (row) => row.attributes.name },
      { key: 'attributes.tlp', value: 'TLP', display: (row) => row.attributes.tlp },
      { key: 'attributes.first_seen', value: 'FIRST SEEN', display: (row) => row.attributes.first_seen },
      { key: 'attributes.last_seen', value: 'LAST SEEN', display: (row) => row.attributes.last_seen }
    ],
    [TABS.TOOLS]: [
      { key: 'attributes.name', value: 'NAME', display: (row) => row.attributes.name },
      { key: 'attributes.tlp', value: 'TLP', display: (row) => row.attributes.tlp },
      { key: 'attributes.first_seen', value: 'FIRST SEEN', display: (row) => row.attributes.first_seen },
      { key: 'attributes.last_seen', value: 'LAST SEEN', display: (row) => row.attributes.last_seen }
    ],
    [TABS.CVES]: [
      { key: 'attributes.score', value: 'SCORE', display: (row) => row.attributes.score },
      { key: 'attributes.name', value: 'NAME', display: (row) => row.attributes.name },
      { key: 'attributes.exploits', value: 'EXPLOITS', display: (row) => row.attributes.exploits.length },
      { key: 'attributes.num_malware', value: 'MALWARE', display: (row) => row.attributes.num_malware },
      {
        key: 'relationships.mentions.meta.count',
        value: 'MENTIONS',
        display: (row) => row.relationships?.mentions?.meta?.count
      },
      { key: 'attributes.platforms', value: 'PLATFORMS', display: (row) => row.attributes.platforms.length },
      {
        key: 'attributes.microsoft_bulletins',
        value: 'MS BULLETINS',
        display: (row) => row.attributes.microsoft_bulletins.length
      },
      { key: 'attributes.published_at', value: 'PUBLICATION DATE', display: (row) => row.attributes.published_at }
    ],
    [TABS.SIGNATURES]: [
      { key: 'attributes.name', value: 'NAME', display: (row) => row.attributes.name },
      { key: 'attributes.version', value: 'VERSION', display: (row) => row.attributes.version },
      { key: 'attributes.tlp', value: 'TLP', display: (row) => row.attributes.tlp }
    ]
  };

  const DATA_SOURCE: Partial<Record<TABS, () => Promise<any>>> = {
    [TABS.INDICATORS]: () => client.actors.getActorIndicators(actor.id),
    [TABS.CAMPAIGNS]: () => client.actors.getActorCampaigns(actor.id),
    [TABS.TOOLS]: () => client.actors.getActorTools(actor.id),
    [TABS.CVES]: () => client.actors.getActorCVE(actor.id),
    [TABS.SIGNATURES]: () => client.actors.getActorSignature(actor.id)
  };

  let data: Partial<Record<TABS, null | any[]>> = {
    [TABS.INDICATORS]: null,
    [TABS.CAMPAIGNS]: null,
    [TABS.TOOLS]: null,
    [TABS.CVES]: null,
    [TABS.SIGNATURES]: null
  };

  let selected = 0;
  let loading = false;
  let attackOpened = false;
  let attackLoading = null;

  $: iframeUrl = getIframeUrl(actor);
  $: handleTabSelect(selected);

  async function handleTabSelect(selected: number) {
    if (selected === TABS.ATTACK_PATTERNS) {
      attackOpened = true;
      if (attackLoading === null) {
        attackLoading = true;
      }
      return;
    }

    if (data[selected] === null) {
      loading = true;
      data[selected] = [];
      data[selected] = await DATA_SOURCE[selected]();
      loading = false;
    }
  }

  function getIframeUrl(actor: ActorData) {
    const origin = window.location.origin;
    const apiUrl = `/api/v1/attck/threat-actor/?dork=name:"${encodeURIComponent(actor.attributes.name)}"`;
    const layerUrl = `${origin}/api/v2/gateway?notcache=${new Date()}&token=${$tokenStore}&apiId=THIAPP&requestType=GET&url=${apiUrl}`;
    return `${origin}/attack/index.html#layerURL=${layerUrl}`;
  }
</script>

<Tabs bind:selected autoWidth type="container">
  <Tab label="Indicators ({data[TABS.INDICATORS]?.length || 0})" />
  <Tab label="Campaigns ({data[TABS.CAMPAIGNS]?.length || actor?.relationships?.campaigns?.meta?.count || 0})" />
  <Tab label="Tools ({data[TABS.TOOLS]?.length || actor?.relationships?.tools?.meta?.count || 0})" />
  <Tab label="CVEs ({data[TABS.CVES]?.length || actor?.relationships?.cves?.meta?.count || 0})" />
  <Tab label="Attack Patterns ({actor?.relationships?.attack_patterns?.meta?.count || 0})" />
  <Tab label="Signatures ({data[TABS.SIGNATURES]?.length || actor?.relationships?.signatures?.meta?.count || 0})" />
</Tabs>

{#if attackOpened}
  <div class:hidden={selected !== TABS.ATTACK_PATTERNS} class="relative w-full h-full py-2">
    {#if attackLoading}
      <InlineLoading class="absolute flex items-center justify-center top-20" />
    {/if}
    <iframe
      class="w-full h-full min-h-[800px]"
      title="ATT&CK Navigator"
      src={iframeUrl}
      on:load={() => (attackLoading = false)}
    />
  </div>
{/if}

{#if loading}
  <DataTableSkeleton showToolbar={false} showHeader={false} />
{:else if data[selected]}
  {#if data[selected]?.length}
    <div class="py-2">
      <ExportableDataTable headers={HEADERS[selected]} rows={data[selected]} fileName="zz" />
    </div>
  {:else}
    <EmptyData messageObj={{ msg: 'No data found' }} />
  {/if}
{/if}
