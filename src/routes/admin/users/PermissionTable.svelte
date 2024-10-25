<script lang="ts">
  import WarningModal from '$lib/components/CommonModal/WarningModal/WarningModal.svelte';
  import type { ModuleSearchGrant } from '$lib/types/admin';
  import type Organization from '$lib/types/organization';
  import { moduleCacheStore, type ModuleCache } from '$stores/module';
  import { Button } from 'carbon-components-svelte';
  import { TrashCan } from 'carbon-icons-svelte';
  import type { OrganizationSearchGrant } from './types';

  export let initialGrants: OrganizationSearchGrant[];
  export let organizations: Organization[] = [];
  export let searchGrant: OrganizationSearchGrant[] = [];

  type Role = 'operator' | 'customer' | 'analyst';

  let values: Record<string | number, Role[]> = {};
  let removeOrganizationModalOpen = false;
  let selectedOrganizationId: number;

  $: selectedOrganizationName = organizations.find((org) => org.id === selectedOrganizationId)?.name;
  $: setInitialGrants(initialGrants);
  $: searchGrant = getSearchGrant(organizations, $moduleCacheStore, values);
  $: organizations.forEach((org) => {
    if (!$moduleCacheStore[org.id]) moduleCacheStore.fetchModules(org.id);
  });

  function setInitialGrants(initialGrants: OrganizationSearchGrant[]) {
    if (!initialGrants?.length) return;

    initialGrants.forEach((grant) => {
      const role = getRoleFromGrant(grant);
      if (role) {
        values[grant.itemId] = [role];
      }

      grant?.reputationalSearchGrants?.forEach((moduleGrant) => {
        const role = getRoleFromGrant(moduleGrant);
        if (role) {
          values[`${grant.itemId}_${moduleGrant.itemId}`] = [role];
        }
      });
    });
  }

  function getRoleFromGrant(grant: OrganizationSearchGrant | ModuleSearchGrant): Role | null {
    if (grant.analyst) return 'analyst';
    if (grant.mssp_customer) return 'customer';
    if (grant.operator) return 'operator';
    return null;
  }

  function getSearchGrant(
    organizations: Organization[],
    moduleMap: ModuleCache,
    values: Record<string | number, Role[]>
  ): OrganizationSearchGrant[] {
    const result: OrganizationSearchGrant[] = [];

    organizations.forEach((org) => {
      const orgRole = values?.[org.id]?.[0];
      const orgGrant: OrganizationSearchGrant = {
        itemId: org.id,
        analyst: orgRole === 'analyst',
        mssp_customer: orgRole === 'customer',
        operator: orgRole === 'operator',
        reputationalSearchGrants: []
      };

      const modules = moduleMap[org.id];
      if (!modules) return;
      orgGrant.reputationalSearchGrants = modules
        .map((mod) => {
          const moduleRole = orgRole ? false : values?.[`${org.id}_${mod.id}`]?.[0];
          const modGrant: ModuleSearchGrant = {
            itemId: mod.id,
            analyst: moduleRole === 'analyst',
            mssp_customer: moduleRole === 'customer',
            operator: moduleRole === 'operator'
          };
          return modGrant;
        })
        .filter(Boolean);
      result.push(orgGrant);
    });
    return result;
  }

  function confirmRemoveOrganization(orgId: number) {
    removeOrganizationModalOpen = true;
    selectedOrganizationId = orgId;
  }

  function removeOrganization() {
    if (!selectedOrganizationId) return;
    organizations = organizations.filter((org) => org.id !== selectedOrganizationId);
    selectedOrganizationId = null;
    removeOrganizationModalOpen = false;
  }
</script>

<table class="table">
  <thead class="[&>th]:bg-ctip-hover-ui [&>th]:text-ctip-text">
    <th>ORGANIZATION</th>
    <th>MODULE</th>
    <th class="text-center w-24">ANALYST</th>
    <th class="text-center w-24">OPERATOR</th>
    <th class="text-center w-24">CUSTOMER</th>
  </thead>

  <tbody>
    {#each organizations as organization}
      <tr>
        <td class="text-ctip-text">
          <div class="flex items-center gap-2">
            <Button
              on:click={() => confirmRemoveOrganization(organization.id)}
              size="small"
              kind="danger-ghost"
              class="rounded px-1.5 [&>svg]:ml-0"
              icon={TrashCan}
              iconDescription="Remove organization"
              tooltipAlignment="start"
            />
            {organization.name}
          </div>
        </td>
        <td class="text-ctip-text">
          <div class="flex items-center border-b border-ctip-border border-solid h-6 last:border-none">ALL</div>
          {#if !values[organization.id]?.length}
            {#each $moduleCacheStore[organization.id] as module}
              <div
                class="flex items-center border-b border-ctip-border border-solid h-6 text-ellipsis overflow-hidden whitespace-nowrap last:border-none"
              >
                {module.name}
              </div>
            {/each}
          {/if}
        </td>

        <td>
          <div
            class="flex items-center border-b border-ctip-border border-solid text-center justify-center h-6 last:border-none"
          >
            <input
              bind:group={values[organization.id]}
              class="w-3.5"
              disabled={values[organization.id]?.length && !values[organization.id].includes('analyst')}
              value="analyst"
              type="checkbox"
            />
          </div>
          {#if !values[organization.id]?.length}
            {#each $moduleCacheStore[organization.id] as module}
              <div
                class="border-b border-ctip-border border-solid flex text-center justify-center h-6 last:border-none"
              >
                <input
                  bind:group={values[`${organization.id}_${module.id}`]}
                  class="w-3.5"
                  disabled={values[`${organization.id}_${module.id}`]?.length &&
                    !values[`${organization.id}_${module.id}`].includes('analyst')}
                  value="analyst"
                  type="checkbox"
                />
              </div>
            {/each}
          {/if}
        </td>

        <td>
          <div class="border-b border-ctip-border border-solid flex text-center justify-center h-6 last:border-none">
            <input
              bind:group={values[organization.id]}
              class="w-3.5"
              disabled={values[organization.id]?.length && !values[organization.id].includes('operator')}
              value="operator"
              type="checkbox"
            />
          </div>
          {#if !values[organization.id]?.length}
            {#each $moduleCacheStore[organization.id] as module}
              <div
                class="border-b border-ctip-border border-solid flex text-center justify-center h-6 last:border-none"
              >
                <input
                  bind:group={values[`${organization.id}_${module.id}`]}
                  class="w-3.5"
                  disabled={values[`${organization.id}_${module.id}`]?.length &&
                    !values[`${organization.id}_${module.id}`].includes('operator')}
                  value="operator"
                  type="checkbox"
                />
              </div>
            {/each}
          {/if}
        </td>

        <td>
          <div class="border-b border-ctip-border border-solid flex text-center justify-center h-6 last:border-none">
            <input
              bind:group={values[organization.id]}
              class="w-3.5"
              disabled={values[organization.id]?.length && !values[organization.id].includes('customer')}
              value="customer"
              type="checkbox"
            />
          </div>
          {#if !values[organization.id]?.length}
            {#each $moduleCacheStore[organization.id] as module}
              <div
                class="border-b border-ctip-border border-solid flex text-center justify-center h-6 last:border-none"
              >
                <input
                  bind:group={values[`${organization.id}_${module.id}`]}
                  class="w-3.5"
                  disabled={values[`${organization.id}_${module.id}`]?.length &&
                    !values[`${organization.id}_${module.id}`].includes('customer')}
                  value="customer"
                  type="checkbox"
                />
              </div>
            {/each}
          {/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<WarningModal
  bind:open={removeOrganizationModalOpen}
  shouldSubmitOnEnter={false}
  modalHeading="Confirmation"
  question="Are you sure you want to discard the organization {selectedOrganizationName} ?"
  secondMessage="User permissions to the selected organization's modules will also be deleted."
  on:closeModal={() => (removeOrganizationModalOpen = false)}
  on:submit={() => removeOrganization()}
/>
