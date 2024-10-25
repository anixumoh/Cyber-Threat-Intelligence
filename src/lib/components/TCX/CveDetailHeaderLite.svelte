<script lang="ts">
  import modalTeleport from '$lib/actions/modalTeleport';
  import type { CVE, CVELabel } from '$lib/client/services/malware';
  import type { CVEAttributes, TCXModelRelationships } from '$lib/types/tcx';
  import { formatDate } from '$lib/utils/functions';
  import { Accordion, AccordionItem, Button } from 'carbon-components-svelte';
  import { Calendar, Edit, Launch, List, Screen, Tag } from 'carbon-icons-svelte';
  import LabelItem from '../LabelItem/LabelItem.svelte';
  import ResourceLabelModal from '../ResourceLabelModal.svelte';
  import ViewDetailsItem from '../ThreatsCommons/ViewDetailsItem.svelte';

  export let attributes: CVEAttributes;
  export let relationships: TCXModelRelationships;
  export let cve: CVE = undefined;
  export let labels: CVELabel[] = [];

  let isLabelsModalOpen = false;

  function getColor(num: string | number) {
    if (+num >= 7) return 'text-ctip-dangerThreat';
    if (+num >= 4) return 'text-ctip-warning dark:!text-black';
    return 'text-ctip-success';
  }

  function getBorder(num: string | number) {
    if (+num >= 7) return 'border-ctip-dangerThreat';
    if (+num >= 4) return 'border-ctip-warning';
    return 'border-ctip-success';
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

<div class="text-xl font-bold inset-4 -mt-11">
  {attributes.name}
</div>

<div class="grid gap-4">
  <section class="flex w-full gap-4 p-3 rounded-sm border bg-ctip-background justify-between">
    <div
      class="border-[12px] border-solid {getBorder(attributes.bl_score)} rounded-full p-3 aspect-square w-28 h-28 mt-3"
    >
      <div class="flex flex-col justify-center items-center font-bold">
        <span class="text-2xl {getColor(attributes.bl_score)}">
          {attributes.bl_score.toFixed(1) || 'N/A'}
        </span>
        <span class="text-base">Score</span>
      </div>
    </div>

    <div class="flex flex-col grow gap-1">
      <div class="border-b border-solid border-ctip-border p-1.5">
        <ViewDetailsItem class="w-10" title="NAME" value={attributes.name} icon={Screen} />
      </div>
      <div class="border-b border-solid border-ctip-border p-1.5">
        <ViewDetailsItem
          class="w-10"
          title="PUBLICATION DATE"
          value={formatDate(attributes.published_at)}
          icon={Calendar}
        />
      </div>
      <div class="p-1.5">
        <ViewDetailsItem
          class="w-10"
          title="MENTIONS"
          value={String(relationships?.mentions?.meta?.count || 0)}
          icon={List}
        />
      </div>
      {#if cve}
        <div class="p-1 m-1 border-t border-solid border-ctip-border">
          <ViewDetailsItem class="w-10" title="LABELS" icon={Tag} buttonAction>
            <div slot="buttonAction">
              <Button
                on:click={() => (isLabelsModalOpen = true)}
                size="small"
                icon={Edit}
                iconDescription="Edit"
                kind="ghost"
              />
            </div>
            <div class="flex gap-1 max-w-xs flex-wrap justify-end">
              {#each labels as label}
                <LabelItem {label} />
              {/each}
            </div>
          </ViewDetailsItem>
        </div>
      {/if}
    </div>

    <div class="grow">
      <div class="grid gap-4 col-span-3 lg:col-span-2">
        <div>
          {#if attributes.cvss?.v2?.baseScore || attributes.cvss?.v3?.baseScore}
            <h5>Common Vulnerability Scoring System</h5>

            <Accordion>
              {#if attributes.cvss?.v2}
                <AccordionItem class="[&>button]:w-full [&>button]:flex [&>button]:items-center [&>button]:bg-ctip-ui">
                  <div slot="title" class="flex justify-between">
                    <div>CVSS V2</div>
                    <div>(Score: {attributes.cvss.v2.baseScore}/10)</div>
                  </div>

                  <div class="flex w-full break-all flex-wrap justify-center gap-y-2">
                    {#if attributes.cvss.v2}
                      <div class="w-fit">
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
                  </div>
                </AccordionItem>
              {/if}

              {#if attributes.cvss?.v3}
                <AccordionItem class="[&>button]:w-full [&>button]:flex [&>button]:items-center [&>button]:bg-ctip-ui">
                  <div slot="title" class="flex justify-between">
                    <div>CVSS V3</div>
                    <div>(Score: {attributes.cvss.v3.baseScore}/10)</div>
                  </div>

                  <div class="w-fit">
                    <div class="border p-1.5">
                      Base Score: {attributes.cvss.v3.baseScore}/10
                    </div>
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
                </AccordionItem>
              {/if}
            </Accordion>
          {/if}
        </div>

        <div>
          {#if attributes.microsoft_bulletins?.length}
            <h5>Microsoft Bulletins</h5>
            <Accordion>
              {#each attributes.microsoft_bulletins as bulletin}
                <AccordionItem class="[&>button]:w-full [&>button]:flex [&>button]:items-center [&>button]:bg-ctip-ui">
                  <div slot="title">
                    <div>{bulletin.title || bulletin.name}</div>
                  </div>

                  <div class="flex w-full break-all flex-wrap gap-y-2">
                    <ul>
                      <li>Impact: {bulletin.impact}</li>
                      <li>Severity: {bulletin.severity}</li>
                      {#if bulletin.bulletin_id}
                        <li>
                          <Button
                            kind="ghost"
                            size="small"
                            href="https://technet.microsoft.com/en-us/library/security/{bulletin.bulletin_id}"
                            target="_blank"
                            icon={Launch}
                          >
                            Bulletin link
                          </Button>
                        </li>
                      {/if}

                      {#if bulletin.cves_url}
                        <li>
                          <Button kind="ghost" size="small" href={bulletin.cves_url} target="_blank" icon={Launch}>
                            CVE link
                          </Button>
                        </li>
                      {/if}

                      {#if bulletin.knowledgebase_id}
                        <li>
                          <Button
                            kind="ghost"
                            size="small"
                            href="https://support.microsoft.com/en-us/kb/{bulletin.knowledgebase_id}"
                            target="_blank"
                            icon={Launch}
                          >
                            Knowledgebase link
                          </Button>
                        </li>
                      {/if}
                    </ul>
                  </div>
                </AccordionItem>
              {/each}
            </Accordion>
          {/if}
        </div>
      </div>
    </div>
  </section>
</div>

<div use:modalTeleport>
  <ResourceLabelModal on:save bind:open={isLabelsModalOpen} resources={[cve]} />
</div>
