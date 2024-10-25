<script lang="ts">
  import Client from '$lib/client';
  import type { CVEAttributes, TCXCVEMentionResponse, TCXModelRelationships } from '$lib/types/tcx';
  import { formatDate } from '$lib/utils/functions';
  import { Accordion, AccordionItem, Button, SkeletonPlaceholder, Tag } from 'carbon-components-svelte';
  import ScoreCve from '../ScoreCve.svelte';

  export let attributes: CVEAttributes;
  export let relationships: TCXModelRelationships;

  const client = new Client();

  let mentions: TCXCVEMentionResponse[] = [];
  let mentionsOpened = false;
  let mentionsOpen = false;
  let mentionsLoading = false;

  $: mentionsOpen && getCVEMentions(attributes.name);

  async function getCVEMentions(cve: string) {
    if (mentionsOpened) return;
    mentionsLoading = true;
    mentionsOpened = true;
    mentions = await client.tcx.getCVEMentions(cve);
    mentionsLoading = false;
  }

  function colorMetric(metric: string, inversed = false) {
    const successMetrics = ['NONE', 'LOW', 'SINGLE'];
    const dangerMetrics = ['HIGH', 'REQUIRED', 'COMPLETE', 'MULTIPLE'];
    if ((!inversed && dangerMetrics.includes(metric)) || (inversed && successMetrics.includes(metric))) {
      return 'text-ctip-dangerThreat';
    }
    if (dangerMetrics.includes(metric) || successMetrics.includes(metric)) {
      return 'text-ctip-success';
    }
    return '';
  }
</script>

<div class="grid lg:grid-cols-3 gap-4">
  <div class="col-span-3 lg:col-span-1">
    <section class="grid items-center w-full gap-4 p-2 bg-ctip-ui justify-between">
      <div class="grid grid-cols-[auto_1fr] gap-2 items-center justify-center [&_*]:text-xl">
        {#if attributes.bl_score}
          <ScoreCve score={attributes.bl_score.toFixed(1)} />
        {:else}
          <span class="font-bold text-ctip-success">N/A</span>
        {/if}
        <div class="text-xl font-bold overflow-hidden whitespace-nowrap text-ellipsis" title={attributes.name}>
          {attributes.name}
        </div>
      </div>

      <div class="flex gap-2 items-center">
        <div>Publication date</div>
        <div><Tag type="blue">{formatDate(attributes.published_at)}</Tag></div>
      </div>
    </section>

    <section class="bg-ctip-ui h-fit">
      <Accordion>
        <AccordionItem
          class="[&>button]:w-full [&>button]:flex [&>button]:items-center [&>button]:bg-ctip-ui [&>div]:p-0"
          bind:open={mentionsOpen}
        >
          <span slot="title" class="flex justify-between">
            <span class="text-xl">Mentions</span>
            <Tag class="whitespace-nowrap" type="blue">
              {relationships?.mentions?.meta?.count || '-'}
            </Tag>
          </span>
          {#if mentionsLoading}
            <SkeletonPlaceholder class="w-full h-20" />
          {:else}
            {#each mentions as mention}
              {@const feed_source_category = mention?.data?.[0]?.attributes.feed_source_category}
              {#if feed_source_category}
                <Button kind="ghost" size="small" class="flex justify-between w-full">
                  <div>{feed_source_category}</div>
                  <Tag>{mention.meta.pagination.count}</Tag>
                </Button>
              {/if}
            {/each}
          {/if}
        </AccordionItem>
      </Accordion>
    </section>
  </div>

  <!-- INFO -->
  <div class="grid gap-4 col-span-3 lg:col-span-2">
    <div>
      <section class="bg-ctip-ui h-fit">
        <Accordion>
          <AccordionItem class="[&>button]:w-full [&>button]:flex [&>button]:items-center [&>button]:bg-ctip-ui">
            <span slot="title" class="text-xl flex gap-2 justify-between">
              <div class="mr-2">Common Vulnerability Scoring System</div>

              {#if attributes.cvss?.v2?.baseScore !== undefined}
                <div>
                  <span class="mr-2">CVSS V2</span>
                  <Tag>
                    <span>{attributes.cvss.v2.baseScore}/10</span>
                  </Tag>
                </div>
              {/if}

              {#if attributes.cvss?.v3?.baseScore !== undefined}
                <div>
                  <span class="mr-2">CVSS V3</span>
                  <Tag>
                    <span>{attributes.cvss.v3.baseScore}/10</span>
                  </Tag>
                </div>
              {/if}
            </span>

            <div class="flex w-full break-all flex-wrap justify-center gap-y-2">
              {#if attributes.cvss?.v2}
                <div class="w-fit">
                  <div class="border p-1.5 font-bold text-center">CVSS V2</div>
                  <div class="border p-1.5">Base Score: {attributes.cvss.v2.baseScore}/10</div>
                  <div class="border p-1.5">Vector String: {attributes.cvss.v2.vectorString}</div>
                  <div class="border p-1.5">Access Vector: {attributes.cvss.v2.accessVector}</div>
                  <div class="border p-1.5">
                    Access complexity:
                    <span class={colorMetric(attributes.cvss.v2.accessComplexity, true)}>
                      {attributes.cvss.v2.accessComplexity}
                    </span>
                  </div>
                  <div class="border p-1.5">
                    Authentication:
                    <span class={colorMetric(attributes.cvss.v2.authentication, true)}>
                      {attributes.cvss.v2.authentication}
                    </span>
                  </div>
                  <div class="border p-1.5">
                    Confidentiality Impact:
                    <span class={colorMetric(attributes.cvss.v2.confidentialityImpact)}>
                      {attributes.cvss.v2.confidentialityImpact}
                    </span>
                  </div>
                  <div class="border p-1.5">
                    Integrity Impact:
                    <span class={colorMetric(attributes.cvss.v2.integrityImpact)}>
                      {attributes.cvss.v2.integrityImpact}
                    </span>
                  </div>
                  <div class="border p-1.5">
                    Availability Impact:
                    <span class={colorMetric(attributes.cvss.v2.availabilityImpact)}>
                      {attributes.cvss.v2.availabilityImpact}
                    </span>
                  </div>
                </div>
              {/if}

              {#if attributes.cvss?.v3}
                <div class="w-fit">
                  <div class="border p-1.5 font-bold text-center">CVSS V3</div>
                  <div class="border p-1.5">Base Score: {attributes.cvss.v3.baseScore}/10</div>
                  <div class="border p-1.5">
                    Base Severity:
                    <span class={colorMetric(attributes.cvss.v3.baseSeverity)}>
                      {attributes.cvss.v3.baseSeverity}
                    </span>
                  </div>
                  <div class="border p-1.5">
                    Vector String: {attributes.cvss.v3.vectorString}
                  </div>
                  <div class="border p-1.5">
                    Attack Vector: {attributes.cvss.v3.attackVector}
                  </div>

                  <div class="border p-1.5">
                    Attack complexity::
                    <span class={colorMetric(attributes.cvss.v3.attackComplexity, true)}>
                      {attributes.cvss.v3.attackComplexity}
                    </span>
                  </div>
                  <div class="border p-1.5">
                    Privileges required:
                    <span class={colorMetric(attributes.cvss.v3.privilegesRequired, true)}>
                      {attributes.cvss.v3.privilegesRequired}
                    </span>
                  </div>
                  <div class="border p-1.5">
                    User Interaction:
                    <span class={colorMetric(attributes.cvss.v3.userInteraction, true)}>
                      {attributes.cvss.v3.userInteraction}
                    </span>
                  </div>
                  <div class="border p-1.5">
                    Scope:
                    <span class={colorMetric(attributes.cvss.v3.scope)}>
                      {attributes.cvss.v3.scope}
                    </span>
                  </div>
                  <div class="border p-1.5">
                    Confidentiality Impact:
                    <span class={colorMetric(attributes.cvss.v3.confidentialityImpact)}>
                      {attributes.cvss.v3.confidentialityImpact}
                    </span>
                  </div>
                  <div class="border p-1.5">
                    Integrity Impact:
                    <span class={colorMetric(attributes.cvss.v3.integrityImpact)}>
                      {attributes.cvss.v3.integrityImpact}
                    </span>
                  </div>
                  <div class="border p-1.5">
                    Availability Impact:
                    <span class={colorMetric(attributes.cvss.v3.availabilityImpact)}>
                      {attributes.cvss.v3.availabilityImpact}
                    </span>
                  </div>
                </div>
              {/if}
            </div>
          </AccordionItem>
        </Accordion>
      </section>

      {#if attributes.microsoft_bulletins?.length}
        <section class="bg-ctip-ui h-fit">
          <Accordion>
            <AccordionItem class="[&>button]:w-full [&>button]:flex [&>button]:items-center [&>button]:bg-ctip-ui">
              <span slot="title" class="text-xl grid gap-2 justify-between">
                <div class="mr-2">
                  Microsoft Bulletins
                  <Tag>{attributes.microsoft_bulletins.length}</Tag>
                </div>
              </span>

              <div class="grid w-full">
                {#each attributes.microsoft_bulletins as bulletin}
                  <div>
                    <h5>{bulletin.title || bulletin.name}</h5>
                    <ul>
                      <li>Impact: {bulletin.impact}</li>
                      <li>Severity: {bulletin.severity}</li>
                      {#if bulletin.bulletin_id}
                        <li>
                          <a
                            href="https://technet.microsoft.com/en-us/library/security/{bulletin.bulletin_id}"
                            target="_blank"
                          >
                            Bulletin link
                          </a>
                        </li>
                      {/if}

                      {#if bulletin.cves_url}
                        <li><a href={bulletin.cves_url} target="_blank">CVE link</a></li>
                      {/if}

                      {#if bulletin.knowledgebase_id}
                        <li>
                          <a href="https://support.microsoft.com/en-us/kb/{bulletin.knowledgebase_id}" target="_blank">
                            Knowledgebase link
                          </a>
                        </li>
                      {/if}
                    </ul>
                  </div>
                {/each}
              </div>
            </AccordionItem>
          </Accordion>
        </section>
      {/if}
    </div>
  </div>
</div>
