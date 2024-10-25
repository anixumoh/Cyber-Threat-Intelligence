<script lang="ts">
  import Client from '$lib/client';
  import type { DataTableHeader } from 'carbon-components-svelte/types/DataTable/DataTable.svelte';
  import { Button, DataTable, DataTableSkeleton, Tag } from 'carbon-components-svelte';
  import { currentOrganizationId } from '$stores/organization';
  import { currentModuleId } from '$stores/module';

  interface AttackPatternResponse {
    data: AttackPatternData[];
  }

  interface AttackPatternData {
    id: string;
    attributes: AttackPatternAttributes;
  }

  interface AttackPatternAttributes {
    related_weaknesses: Array<string[]>;
    description: string;
    name: string;
    tlp: string;
    related_vulnerabilities: Array<string[]>;
    updated_at: string;
    prerequisites: string[];
    capec_id?: number;
    created_at: string;
    attack_phases: AttackPhase[] | AttackPhasesClass;
    attacker_skills_or_knowledge_required: Array<string[]>;
    severity: string;
    solutions_and_mitigations: string[];
    purposes: string[];
    technique_id: string;
    references: Array<Array<null | string>>;
    uuid?: string;
  }

  interface AttackPhase {
    name: string;
    steps: Step[];
    number: string;
  }

  interface Step {
    name: string;
    number: string;
    description: string;
  }

  interface AttackPhasesClass {}

  type AttackPattern = Omit<AttackPatternData, 'attributes'> & AttackPatternAttributes;

  const client = new Client();
  const headers: DataTableHeader[] = [
    { key: 'name', value: 'Name' },
    { key: 'capec_id', value: 'Type' },
    { key: 'purposes', value: 'Purposes' },
    { key: 'severity', value: 'Severity', display: (row) => row.severity || '-' }
  ];

  let rows: AttackPattern[] = [];
  let loading = false;

  $: getAttackPatterns();

  async function getAttackPatterns() {
    loading = true;
    const url = '/api/v1/attack-pattern/?page&limit=10';
    const response = await client.gateway.get<AttackPatternResponse>('THIAPP', url);
    rows = response.data.data.map((row) => ({
      id: row.id,
      ...row.attributes
    }));
    loading = false;
  }
</script>

{#if loading}
  <DataTableSkeleton rows={10} columns={headers.length} showHeader={false} showToolbar={false} />
{:else}
  <DataTable {headers} {rows}>
    <svelte:fragment slot="cell" let:row let:cell>
      {#if cell.key === 'name'}
        {cell.value}
      {:else if cell.key === 'capec_id'}
        {cell.value ? 'CAPEC' : 'ATT&CK'}
      {:else if cell.key === 'purposes'}
        {#each cell.value as purpose}
          <Tag>{purpose}</Tag>
        {/each}
      {:else}
        <div class="text-center">
          {cell.display ? cell.display(row) : cell.value}
        </div>
      {/if}
    </svelte:fragment>
  </DataTable>
{/if}

<div class="flex flex-row-reverse">
  <Button
    kind="ghost"
    size="small"
    href="/dashboard/organizations/{$currentOrganizationId}/modules/{$currentModuleId}/tcx/global-search?display=all-attack-patterns"
  >
    See all Attack Patterns
  </Button>
</div>
