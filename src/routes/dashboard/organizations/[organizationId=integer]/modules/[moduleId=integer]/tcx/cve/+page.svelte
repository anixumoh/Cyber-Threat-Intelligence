<script lang="ts">
  import Client from '$lib/client';
  import type { CVEData, TCXQuery } from '$lib/client/services/actors';
  import ExportableDataTable from '$lib/components/ExportableDataTable/ExportableDataTable.svelte';
  import ScoreCve from '$lib/components/ScoreCve.svelte';
  import AdvancedSearchModal from '$lib/components/TCX/AdvancedSearchModal/AdvancedSearchModal.svelte';
  import ManageSearches from '$lib/components/TCX/ManageSearches.svelte';
  import SaveSearchWrapper from '$lib/components/TCX/SaveSearchWrapper.svelte';
  import TcxSyntaxModal from '$lib/components/TCX/TCXSyntaxModal.svelte';
  import { TCXModel, type TCXOptions } from '$lib/types/tcx';
  import { capitalize } from '$lib/utils/functions';
  import { PaginationStatus } from '$stores/createPaginationStore';
  import { currentModuleId } from '$stores/module';
  import { currentOrganizationId } from '$stores/organization';
  import preferencesStore from '$stores/preferences';
  import { Button, Dropdown, InlineLoading, Tag, TextInput } from 'carbon-components-svelte';
  import type { DataTableHeader, DataTableProps } from 'carbon-components-svelte/types/DataTable/DataTable.svelte';
  import { Edit, Save, Search as SearchIcon, SettingsAdjust, Terminal } from 'carbon-icons-svelte';
  import dayjs from 'dayjs';
  import { onMount } from 'svelte';
  import breadcrumbs from '../breadcrumbs';
  import cvePagination from './cvePaginationStore';
  import getUrlCVE from './getUrlCve';

  let mounted = false;
  onMount(() => {
    mounted = true;
    breadcrumbs.add('CVE', '/cve');
  });

  const client = new Client();
  const headers: DataTableHeader[] = [
    { key: 'bl_score', value: 'SCORE', sort: () => 0, display: (row) => row.attributes.bl_score.toFixed(1) },
    { key: 'score', value: 'CVSS', sort: () => 0, display: (row) => row.attributes.score.toFixed(1) },
    { key: 'name', value: 'NAME', sort: () => 0, display: (row) => row.attributes.name },
    {
      key: 'vendors',
      value: 'VENDORS',
      sort: false,
      display: (row) => getVendors(row)
    },
    { key: 'exploits', value: 'EXPLOITS', sort: false, display: (row) => row.attributes.exploits.length },
    { key: 'malware', value: 'MALWARE', sort: false, display: (row) => row.attributes.num_malware },
    { key: 'mentions', value: 'MENTIONS', sort: false, display: (row) => row.relationships.mentions.meta.count },
    {
      key: 'ms_bulletins',
      value: 'MS BULLETINS',
      sort: false,
      display: (row) => row.attributes.microsoft_bulletins.length
    },
    {
      key: 'published_at,bl_score',
      value: 'PUBLICATION DATE',
      sort: () => 0,
      display: (row) => dayjs(row.attributes.published_at).format('D/M/YYYY')
    }
  ];

  const QUICK_FILTERS_PLATFORMS = [
    { text: 'Windows', dork: 'platform_name:~"Microsoft Windows"' },
    {
      text: 'Linux',
      dork: 'description:~"Linux" OR description:~"Unix" OR platform_name:~"Linux" OR platform_name:~"unix" OR platform_name:~"Redhat" OR platform_name:~"Debian"  OR platform_name:~"suse" OR platform_name:~"fedora"'
    },
    { text: 'Microsoft Office', dork: 'platform_name:~"Microsoft Office"' },
    { text: 'Microsoft Exchange', dork: 'platform_name:~"Microsoft Exchange"' },
    { text: 'VPN software', dork: 'platform_name:~"vpn" OR description:~"vpn"' },
    { text: 'RDP software', dork: 'platform_name:~"rdp" OR description:~"rdp"' },
    { text: 'Zoom', dork: 'platform_cpe:^"cpe:2.3:a:zoom:zoom:"' }
  ];

  const currentYear = new Date().getFullYear();
  const QUICK_RELEVANT_FILTERS = [
    { text: `Critical CVEs in ${currentYear}`, dork: `name:^"CVE-${currentYear}"` },
    { text: 'CVEs with exploits', dork: 'num_exploits:>0' },
    { text: 'CVEs with related malware', dork: 'num_malware:>0' },
    { text: 'CVEs with MS Bulletins', dork: 'num_bulletins:>0' },
    { text: 'CVEs used by Threat Actors', dork: 'actors:~""' },
    {
      text: 'CVEs used by Ransomware Groups',
      dork: 'actors:"Ako Group" OR actors:"APT41" OR actors:"Andariel" OR actors:"Avaddon" OR actors:"avos" OR actors:"Babuk Team" OR actors:"Black Kingdom" OR actors:"BlackMatter Gang" OR actors:"Cerber gang" OR actors:"Cring gang" OR actors:"crylock" OR actors:"DarkSide Group" OR actors:"DearCry gang" OR actors:"Dharma Group" OR actors:"DoppelPaymer Group" OR actors:"Dridex Group" OR actors:"eCh0raix" OR actors:"Egregor Gang" OR actors:"Ekans Group" OR actors:"Everest ransom team" OR actors:"FIN6" OR actors:"Grief" OR actors:"Haron Gang" OR actors:"HelloKitty" OR actors:"HimalayA" OR actors:"Hive Gang" OR actors:"Hotarus Corp" OR actors:"Jingo" OR actors:"jsworm" OR actors:"LockBit Group" OR actors:"LockFile" OR actors:"Lorenz Gang" OR actors:"Maze Team" OR actors:"Mespinoza Actor" OR actors:"MountLocker" OR actors:"Nefilim Group" OR actors:"Netwalker Group" OR actors:"Nosophoros" OR actors:"Orange" OR actors:"Prometheus" OR actors:"Ragnar Locker Actor" OR actors:"Ragnarok Gang" OR actors:"rushteam" OR actors:"SamSam Group" OR actors:"SocGholish" OR actors:"Sodinokibi" OR actors:"Sprite Spider" OR actors:"SunCrypt Group" OR actors:"TA505" OR actors:"Team Snatch" OR actors:"TimisoaraHackerTeam (THT)" OR actors:"Trickbot Group" OR actors:"UNC2447" OR actors:"Vice Society" OR actors:"WannaCry Group" OR actors:"Zeotic'
    },
    { text: 'CVEs used by Exploit Kits', dork: 'tools:~"Exploit Kit"' }
  ];

  let correctSearch = false;
  let saveSearchModalOpen = false;
  let syntaxModalOpen = false;
  let manageSearchOpen = false;
  let quickFiltersOpen = false;
  let advancedSearchModalOpen = false;
  let tcxOptions: TCXOptions;

  let pageSize = +$preferencesStore.defaultRows ?? 10;
  let sortKey: TCXQuery['sort'] = 'bl_score';
  let sortDirection: DataTableProps['sortDirection'] = 'descending';
  let dork =
    $preferencesStore?.modules?.[$currentOrganizationId]?.[$currentModuleId]?.tcxSearchSaved?.['cves']?.find(
      (search) => search?.markAsDefault
    )?.dork || '';
  let dorkTmp = dork;

  $: mounted && getOptions();

  $: mounted &&
    cvePagination.setForm({
      page: $paginationPage,
      pageSize,
      sortKey,
      sortDirection,
      dork
    });

  const { paginationPage, paginationResult, paginationStatus, paginationForm, paginationTotalPages } = cvePagination;

  async function getOptions() {
    tcxOptions = await client.tcx.getOptions(TCXModel.CVE);
  }

  function getVendors(_row: unknown) {
    const row = _row as CVEData;
    const platforms = row?.attributes?.platforms?.map((platform) => platform.id.split(':')?.[3]);
    return [...new Set(platforms)].filter(Boolean).map(capitalize);
  }

  function onClickQuickFilter(_dork: string) {
    dorkTmp = _dork;
    doSearch();
  }

  function doSearch() {
    if (!checkSearchCriteriaHasDorks(dorkTmp)) {
      dorkTmp = textToDork(dorkTmp);
    }
    if (dorkTmp === dork) {
      cvePagination.setForm(
        {
          page: $paginationPage,
          pageSize,
          sortKey,
          sortDirection,
          dork
        },
        true
      );
    } else {
      dork = dorkTmp;
    }
  }

  function setInitialSearch() {
    const defaultSearch = savedSearches?.find((s) => s.markAsDefault);
    if (defaultSearch) {
      dorkTmp = dork = defaultSearch.dork;
    }
  }

  function checkSearchCriteriaHasDorks(_dork: string) {
    if (!tcxOptions?.dork_fields) return true;

    const currentDorks = Object.keys(tcxOptions.dork_fields);
    return currentDorks.some((dork) => {
      const regex = new RegExp(`\\b(${dork})\\:[0-9"~\\^\\$\\+\\>\\<\\-\\=]+`);
      return regex.test(_dork);
    });
  }

  function textToDork(text: string): string {
    text = text.replace(/[\s|;,\n\r]+/g, ',');
    if (text) {
      const dorkLikeItems = [
        ...new Set(
          text
            .split(',')
            .filter(Boolean)
            .slice(0, 100)
            .map((item) => `name:"${item.trim().toLowerCase()}"`)
        )
      ];
      return dorkLikeItems.join(' OR ');
    }
    return text;
  }

  $: savedSearches =
    $preferencesStore?.modules?.[$currentOrganizationId]?.[$currentModuleId]?.tcxSearchSaved?.cves?.filter(Boolean) ||
    [];
  $: mounted && setInitialSearch();

  $: invalid = $paginationStatus === PaginationStatus.ERROR;
  $: loading = $paginationStatus === PaginationStatus.LOADING;
  $: correctSearch = dork && rows.length && $paginationStatus === PaginationStatus.SUCCESS;
  $: rows = $paginationResult?.data || [];
  $: totalItems = $paginationTotalPages;
</script>

<div class="grid grid-cols-[auto_1fr] gap-x-20 items-center justify-center pb-10">
  <h4 class="w-12 mb-auto">CVE</h4>

  <div class="flex flex-col justify-center items-center gap-2">
    <div class=" w-full flex">
      <form on:submit|preventDefault={doSearch} class="flex w-full">
        <TextInput
          type="search"
          on:input={() => (correctSearch = false)}
          on:click={async () => {
            // On click X to clear, do search
            const before = dorkTmp;
            setTimeout(() => {
              const after = dorkTmp;
              if (before !== after) {
                dork = after;
              }
            });
          }}
          {invalid}
          invalidText="Incorrect dork syntax. Please, check the Syntax help to guide you with this problem."
          bind:value={dorkTmp}
          placeholder="Write here your search"
        />

        <Button size="field" type="submit" disabled={loading} icon={loading ? InlineLoading : SearchIcon}>
          Search
        </Button>
      </form>
      <Button
        on:click={() => (advancedSearchModalOpen = true)}
        size="field"
        kind="tertiary"
        icon={SettingsAdjust}
        iconDescription="Query builder"
      />
      <Button on:click={() => (syntaxModalOpen = true)} size="field" kind="tertiary" icon={Terminal}>Syntax</Button>
      <SaveSearchWrapper bind:open={saveSearchModalOpen} key="cves" {dork} let:dorkAlreadyExists>
        {#if correctSearch && dork}
          <Button
            on:click={() => {
              if (!dorkAlreadyExists) saveSearchModalOpen = true;
            }}
            class={dorkAlreadyExists ? 'cursor-not-allowed' : ''}
            size="field"
            kind="tertiary"
            icon={Save}
            iconDescription={dorkAlreadyExists ? "There's already a search saved with this dork" : 'Save search'}
            tooltipAlignment="end"
          />
        {/if}
      </SaveSearchWrapper>
    </div>

    <div class="w-full relative">
      <Dropdown
        class="[&_*]:!shadow-none"
        items={[{ id: '', text: 'Quick filters' }]}
        selectedId=""
        placeholder="Quick filters"
        bind:open={quickFiltersOpen}
      />
      {#if quickFiltersOpen}
        <div class="absolute bg-ctip-ui w-full z-[100000] p-4 shadow-2xl">
          <h5 class="font-bold">CVEs by platform / software</h5>
          <div class="flex gap-2 flex-wrap">
            {#each QUICK_FILTERS_PLATFORMS as item}
              <Button on:click={() => onClickQuickFilter(item.dork)} class="px-2" size="small" kind="ghost">
                {item.text}
              </Button>
            {/each}
          </div>
          <h5 class="font-bold mt-3 pt-3 border-t border-solid border-ctip-border">Relevant filters</h5>
          <div class="flex gap-2 flex-wrap">
            {#each QUICK_RELEVANT_FILTERS as item}
              <Button on:click={() => onClickQuickFilter(item.dork)} class="px-2" size="small" kind="ghost">
                {item.text}
              </Button>
            {/each}
          </div>

          {#if savedSearches.length}
            <h5 class="font-bold mt-3 pt-3 border-t border-solid border-ctip-border">Saved searches</h5>
            <div class="flex gap-2 flex-wrap">
              {#each savedSearches as item}
                <Button on:click={() => onClickQuickFilter(item.dork)} class="px-2" size="small" kind="ghost">
                  {item.name}
                </Button>
              {/each}
            </div>
            <div class="flex justify-end w-full">
              <Button on:click={() => (manageSearchOpen = true)} size="small" kind="ghost" icon={Edit}>Edit</Button>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</div>

<ExportableDataTable
  serverPagination
  sortable
  {headers}
  {rows}
  {totalItems}
  {loading}
  fileName="cve"
  bind:sortKey
  bind:sortDirection
  bind:pageSize
  bind:page={$paginationPage}
  let:row
  let:cell
  let:displayed
  --cds-spacing-04="0.25rem"
  --cds-spacing-05="0.75rem"
>
  {#if cell.key === 'bl_score' || cell.key === 'score'}
    <div class="flex items-center justify-center" class:opacity-60={cell.key === 'score' && displayed}>
      {#if displayed}
        <ScoreCve score={displayed} />
      {:else}
        <span class="font-bold text-ctip-success">N/A</span>
      {/if}
    </div>
  {:else if cell.key === 'name'}
    <Button kind="ghost" size="small" href={getUrlCVE(displayed, $paginationForm)} class="whitespace-nowrap">
      {displayed}
    </Button>
  {:else if cell.key === 'exploits' || cell.key === 'malware' || cell.key === 'mentions' || cell.key === 'ms_bulletins'}
    <div class="flex items-center justify-center font-bold">
      {#if displayed}
        <span class="text-ctip-success">{displayed}</span>
      {:else}
        <span class="text-ctip-danger">X</span>
      {/if}
    </div>
  {:else if cell.key === 'vendors'}
    {#each getVendors(row) as vendor}
      <Tag class="whitespace-nowrap" size="sm">{vendor}</Tag>
    {/each}
  {:else}
    <div class="flex items-center justify-center">
      {cell.display ? cell.display(row) : cell.value}
    </div>
  {/if}
</ExportableDataTable>

<ManageSearches key="cves" bind:open={manageSearchOpen} />
<TcxSyntaxModal key="cve" {tcxOptions} bind:open={syntaxModalOpen} on:search={(e) => onClickQuickFilter(e.detail)} />
<AdvancedSearchModal
  bind:open={advancedSearchModalOpen}
  {tcxOptions}
  {dork}
  on:search={(e) => {
    dorkTmp = e.detail;
    doSearch();
  }}
/>
