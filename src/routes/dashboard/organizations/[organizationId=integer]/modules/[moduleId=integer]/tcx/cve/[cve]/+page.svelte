<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Client from '$lib/client';
  import CveDetailHeader from '$lib/components/TCX/CveDetailHeader.svelte';
  import TabRelationsTables from '$lib/components/TCX/TabRelationsTables.svelte';
  import { getPaginationInfo } from '$lib/functions/paginationUtils';
  import { TCXModel, type TCXCVESingleResponse } from '$lib/types/tcx';
  import { dataToCsv, downloadFile, formatDate } from '$lib/utils/functions';
  import { currentModuleId } from '$stores/module';
  import { currentOrganizationId } from '$stores/organization';
  import {
    Accordion,
    AccordionItem,
    Button,
    OverflowMenu,
    OverflowMenuItem,
    SkeletonPlaceholder,
    Tag
  } from 'carbon-components-svelte';
  import { ArrowLeft, ArrowRight, ChevronDown } from 'carbon-icons-svelte';
  import { onMount } from 'svelte';
  import breadcrumbs from '../../breadcrumbs';
  import type { CVESearchParams } from '../cvePaginationStore';
  import cvePagination from '../cvePaginationStore';
  import getUrlCVE from '../getUrlCve';
  import AffectedPlatformsTable from './AffectedPlatformsTable.svelte';
  import ExploitsTable from './ExploitsTable.svelte';

  onMount(() => {
    breadcrumbs.add('CVE', '/cve');
    breadcrumbs.add($page.params.cve, `/cve/${$page.params.cve}`);
  });

  const client = new Client();

  let cveResponse: TCXCVESingleResponse;

  $: getCVE($page.params.cve);
  $: $page && handleCveList();

  const { paginationPage, paginationResult, paginationForm, paginationTotalPages, getPageResult } = cvePagination;

  async function getCVE(cve: string) {
    cveResponse = await client.tcx.getCVE(cve);
  }

  function handleCveList() {
    const searchParams: CVESearchParams = {
      page: +$page.url.searchParams.get('page') || 1,
      pageSize: +$page.url.searchParams.get('pageSize') || 10,
      sortKey: $page.url.searchParams.get('sortKey') as CVESearchParams['sortKey'],
      sortDirection: $page.url.searchParams.get('sortDirection') as CVESearchParams['sortDirection'],
      dork: $page.url.searchParams.get('dork') || ''
    };
    cvePagination.setForm(searchParams);
  }

  $: currentIndex = $paginationResult?.data?.findIndex((cves) => cves.attributes.name === $page.params.cve);
  $: pageInfo = getPaginationInfo($paginationPage, $paginationTotalPages, currentIndex, $paginationForm.pageSize);

  async function handleClickPreviousNext(direction: 'previous' | 'next') {
    let targetPage: number;
    let targetIndex: number;
    if (direction === 'previous') {
      targetIndex = pageInfo.previousIndex;
      targetPage = pageInfo.previousPage;
    } else {
      targetIndex = pageInfo.nextIndex;
      targetPage = pageInfo.nextPage;
    }

    const form = { ...$paginationForm, page: targetPage };
    const result = getPageResult(targetPage);
    const cve = result?.data?.[targetIndex];
    if (cve) {
      $paginationPage = targetPage;
      await goto(getUrlCVE(cve.attributes.name, form));
    }
  }

  function reportCSV() {
    const { attributes, relationships } = cveResponse.data;
    const references = [...new Set(attributes.references.map((ref) => ref?.url).filter(Boolean))].join(', ');
    const csvData = [
      {
        TYPE: cveResponse.data.type || ' ',
        NAME: attributes.name,
        PUBLICATION_DATE: formatDate(attributes.published_at),
        UPDATED_AT: formatDate(attributes.updated_at),
        BLUELIV_SCORE: attributes.bl_score || 'N/A',
        CVSS_V2_SCORE: attributes.cvss?.v2?.baseScore || 0,
        CVSS_V3_SCORE: attributes.cvss?.v3?.baseScore || 0,
        DESCRIPTION: attributes.description || ' ',
        REFERENCES: references,
        EXPLOITS: attributes.exploits?.length || 0,
        PLATFORMS: attributes.platforms?.length || 0,
        MALWARE: relationships.malware?.meta?.count || 0,
        THREAT_ACTORS: relationships.threat_actors?.meta?.count || 0,
        CAMPAIGNS: relationships.campaigns?.meta?.count || 0,
        TOOLS: relationships.tools?.meta?.count || 0,
        ATTACK_PATTERNS: relationships.attack_patterns?.meta?.count || 0,
        SIGNATURES: relationships.signatures?.meta?.count || 0,
        MENTIONS: relationships.mentions?.meta?.count || 0
      }
    ];

    const csv = dataToCsv(csvData);
    downloadFile('cve-details.csv', csv, 'text/csv');
  }

  function reportJSON() {
    const json = JSON.stringify(cveResponse.data);
    downloadFile('cve-details.json', json, 'text/json');
  }
</script>

<div class="flex justify-between items-center pb-2">
  <h4>CVE</h4>

  <div class="flex items-center justify-center">
    <OverflowMenu size="xl" style="width: auto;">
      <div slot="menu" class="text-ctip-primary px-4">Export <ChevronDown /></div>
      <OverflowMenuItem on:click={reportCSV} text="CSV" />
      <OverflowMenuItem on:click={reportJSON} text="JSON" />
    </OverflowMenu>

    <Button
      kind="ghost"
      on:click={() => handleClickPreviousNext('previous')}
      disabled={!pageInfo?.previous}
      icon={ArrowLeft}
      iconDescription="Previous CVE"
    />
    <Button href="/dashboard/organizations/{$currentOrganizationId}/modules/{$currentModuleId}/tcx/cve" kind="ghost">
      Back to list
    </Button>
    <Button
      kind="ghost"
      on:click={() => handleClickPreviousNext('next')}
      disabled={!pageInfo?.next}
      icon={ArrowRight}
      iconDescription="Next CVE"
      tooltipAlignment="end"
    />
  </div>
</div>

{#if !cveResponse}
  <SkeletonPlaceholder class="w-full h-96" />
{:else}
  <div class="grid gap-4 pb-20">
    <CveDetailHeader attributes={cveResponse.data.attributes} relationships={cveResponse.data.relationships} />

    <!-- DESCRIPTION -->
    <section>
      <Accordion>
        <AccordionItem class="[&>button]:flex [&>button]:items-center [&>button]:bg-ctip-ui" open>
          <span slot="title" class="text-xl">Description</span>
          <div class="px-4 raw-html">
            {@html cveResponse.data.attributes.description}
          </div>
        </AccordionItem>
        <AccordionItem class="[&>button]:flex [&>button]:items-center [&>button]:bg-ctip-ui">
          <span slot="title" class="text-xl">
            References
            <Tag>{cveResponse.data.attributes.references.length}</Tag>
          </span>
          <div class="px-4 raw-html">
            {#each cveResponse.data.attributes.references as reference}
              <div>
                <Tag size="sm">{reference.type || '-'}</Tag>
                <a href={reference.url} target="_blank">
                  {reference.url}
                </a>
              </div>
            {/each}
          </div>
        </AccordionItem>
      </Accordion>
    </section>

    <TabRelationsTables id={$page.params.cve} model={TCXModel.CVE} relationships={cveResponse.data.relationships} />
    <AffectedPlatformsTable {cveResponse} />
    <ExploitsTable {cveResponse} />
  </div>
{/if}
