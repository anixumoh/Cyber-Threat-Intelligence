<script lang="ts">
  import Client from '$lib/client';
  import type { IncidentCatalog } from '$lib/types/admin';
  import { organizationsStore } from '$stores/organization';
  import { InlineLoading, Modal, Select, SelectItem, SelectSkeleton } from 'carbon-components-svelte';

  export let open = false;

  const client = new Client();

  $: open && getAllIndicentCatalogs();

  let isSaving = false;
  let loadingCatalogs = false;
  let catalogs: IncidentCatalog[] = [];
  let changes: Record<number, number> = {};

  async function getAllIndicentCatalogs() {
    loadingCatalogs = true;
    const response = await client.admin.getAllIndicentCatalogs();
    catalogs = response.content;
    loadingCatalogs = false;
  }

  async function save() {
    isSaving = true;
    const promises = Object.entries(changes).map(([orgId, catalogId]) =>
      client.admin.updateOrganizationCatalog(+orgId, catalogId)
    );
    await Promise.allSettled(promises);
    changes = {};
    organizationsStore.reset();
    isSaving = false;
    open = false;
  }

  function registerChange(orgId: number, catalogId: number) {
    changes[orgId] = catalogId;
  }
</script>

<Modal
  bind:open
  modalHeading="Catalog Settings"
  on:click:button--primary={save}
  on:click:button--secondary={() => (open = false)}
  primaryButtonIcon={isSaving ? InlineLoading : undefined}
  secondaryButtonText="Cancel"
  primaryButtonText="Save"
>
  <div class="p-4">
    <table class="table">
      <thead>
        <tr>
          <th>ORGANIZATION</th>
          <th>CATALOG</th>
        </tr>
      </thead>

      <tbody>
        {#each $organizationsStore as org}
          <tr>
            <td>{org.name}</td>
            <td>
              {#if loadingCatalogs}
                <SelectSkeleton hideLabel />
              {:else}
                <Select
                  hideLabel
                  selected={org.catalogId}
                  on:change={(e) => {
                    registerChange(org.id, +e.target.value);
                  }}
                >
                  {#each catalogs as catalog}
                    <SelectItem value={catalog.id} text={catalog.name} />
                  {/each}
                </Select>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</Modal>
