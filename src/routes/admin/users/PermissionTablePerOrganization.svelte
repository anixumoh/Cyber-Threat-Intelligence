<script lang="ts">
  import WarningModal from '$lib/components/CommonModal/WarningModal/WarningModal.svelte';
  import type { Grant, ModuleSearchGrant } from '$lib/types/admin';
  import type Organization from '$lib/types/organization';
  import { moduleCacheStore, type ModuleCache } from '$stores/module';
  import { Button, Loading } from 'carbon-components-svelte';
  import { TrashCan } from 'carbon-icons-svelte';
  import type { OrganizationSearchGrant } from './types';
  import Client from '$lib/client';
  import notifications from '$stores/notification';
  import { createEventDispatcher } from 'svelte';

  export let organization: Organization;
  export let users: Grant[] = [];
  export let searchGrant: OrganizationSearchGrant[] = [];

  type Role = 'operator' | 'customer' | 'analyst';
  const dispatch = createEventDispatcher<{ onRemoveUser: void }>();

  let values: Record<string | number, Role[]> = {};
  let loading = false;
  let removeUserFromOrgModalOpen = false;
  let deletingUserFromOrg: Grant;
  const client = new Client();

  $: selectedOrganizationName = organization.name;
  $: searchGrant = getSearchGrant([organization], $moduleCacheStore, values);
  $: if (!$moduleCacheStore[organization.id]) moduleCacheStore.fetchModules(organization.id);

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

  function confirmRemoveOrganization(user: Grant) {
    deletingUserFromOrg = user;
    removeUserFromOrgModalOpen = true;
  }

  async function removeUserFromOrganization() {
    removeUserFromOrgModalOpen = false;
    deletingUserFromOrg.master = false;
    deletingUserFromOrg.mssp_admin = false;
    deletingUserFromOrg.superadmin = false;
    deletingUserFromOrg.trial = false;
    deletingUserFromOrg.sales = false;
    deletingUserFromOrg.superSearchGrants = [];
    try {
      await saveNewGrant(deletingUserFromOrg);
      users = users.filter((user) => user.userId !== deletingUserFromOrg.userId);
      notifications.notify({ title: 'Success', kind: 'success', subtitle: 'User removed from organization' });
      dispatch('onRemoveUser');
    } catch (error) {
      notifications.notify({ title: 'Error', kind: 'error', subtitle: error.message });
    } finally {
      deletingUserFromOrg = null;
    }
  }
  function shouldShowAllModules(user: Grant) {
    if (
      user.superSearchGrants[0].analyst == false &&
      user.superSearchGrants[0].operator == false &&
      user.superSearchGrants[0].mssp_customer == false
    ) {
      return true;
    }
    return false;
  }
  function verifyIfRoleIsChecked(user: Grant, module, role: string) {
    const grants = user.superSearchGrants[0].reputationalSearchGrants.find((grant) => grant.itemId === module.id);
    if (grants) {
      return grants[role];
    }
    return false;
  }
  function verifyIfRoleIsDisabled(user: Grant, module, role: string) {
    const grants = user.superSearchGrants[0].reputationalSearchGrants.find((grant) => grant.itemId === module.id);
    if (grants) {
      if (grants[role]) return false;
      if (role == 'analyst' && (grants['mssp_customer'] || grants['operator'])) {
        return true;
      }
      if (role == 'operator' && (grants['analyst'] || grants['mssp_customer'])) {
        return true;
      }
      if (role == 'mssp_customer' && (grants['analyst'] || grants['operator'])) {
        return true;
      }
    }
    return false;
  }
  async function saveNewGrant(user: Grant) {
    try {
      loading = true;
      await client.admin.saveUserGrantsForOrg(user.userId, user);
    } catch (error) {
      notifications.notify({ title: 'Error', kind: 'error', subtitle: error.message });
    } finally {
      loading = false;
    }
  }
</script>

{#if loading}
  <Loading />
{/if}
<table class="table">
  <thead class="[&>th]:bg-ctip-hover-ui [&>th]:text-ctip-text">
    <th>USER NAME</th>
    <th>MODULE</th>
    <th class="text-center w-24">ANALYST</th>
    <th class="text-center w-24">OPERATOR</th>
    <th class="text-center w-24">CUSTOMER</th>
  </thead>

  <tbody>
    {#each users as user}
      <tr>
        <td class="text-ctip-text">
          <div class="flex items-center gap-2">
            <Button
              on:click={() => confirmRemoveOrganization(user)}
              size="small"
              kind="danger-ghost"
              class="rounded px-1.5 [&>svg]:ml-0"
              icon={TrashCan}
              iconDescription="Remove user"
              tooltipAlignment="start"
            />
            {user.username}
          </div>
        </td>
        <td class="text-ctip-text">
          <div class="flex items-center border-b border-ctip-border border-solid h-6 last:border-none">ALL</div>
          {#if shouldShowAllModules(user)}
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
              bind:checked={user.superSearchGrants[0].analyst}
              class="w-3.5"
              disabled={user.superSearchGrants[0].operator || user.superSearchGrants[0].mssp_customer}
              value="analyst"
              type="checkbox"
              on:change={() => {
                saveNewGrant(user);
              }}
            />
          </div>
          {#if shouldShowAllModules(user)}
            {#each $moduleCacheStore[organization.id] as module}
              <div
                class="border-b border-ctip-border border-solid flex text-center justify-center h-6 last:border-none"
              >
                <input
                  checked={verifyIfRoleIsChecked(user, module, 'analyst')}
                  class="w-3.5"
                  value="analyst"
                  disabled={verifyIfRoleIsDisabled(user, module, 'analyst')}
                  type="checkbox"
                  on:change={(e) => {
                    const grantExists = user.superSearchGrants[0].reputationalSearchGrants.find(
                      (grant) => grant.itemId === module.id
                    );
                    if (grantExists) {
                      grantExists.analyst = e.target.checked;
                    } else {
                      user.superSearchGrants[0].reputationalSearchGrants.push({
                        itemId: module.id,
                        analyst: e.target.checked,
                        mssp_customer: false,
                        operator: false
                      });
                    }
                    user.superSearchGrants[0].reputationalSearchGrants = [
                      ...user.superSearchGrants[0].reputationalSearchGrants
                    ];
                    saveNewGrant(user);
                  }}
                />
              </div>
            {/each}
          {/if}
        </td>

        <td>
          <div class="border-b border-ctip-border border-solid flex text-center justify-center h-6 last:border-none">
            <input
              bind:checked={user.superSearchGrants[0].operator}
              class="w-3.5"
              disabled={user.superSearchGrants[0].analyst || user.superSearchGrants[0].mssp_customer}
              value="operator"
              type="checkbox"
              on:change={() => {
                saveNewGrant(user);
              }}
            />
          </div>
          {#if shouldShowAllModules(user)}
            {#each $moduleCacheStore[organization.id] as module}
              <div
                class="border-b border-ctip-border border-solid flex text-center justify-center h-6 last:border-none"
              >
                <input
                  checked={verifyIfRoleIsChecked(user, module, 'operator')}
                  class="w-3.5"
                  disabled={verifyIfRoleIsDisabled(user, module, 'operator')}
                  value="operator"
                  type="checkbox"
                  on:change={(e) => {
                    const grantExists = user.superSearchGrants[0].reputationalSearchGrants.find(
                      (grant) => grant.itemId === module.id
                    );
                    if (grantExists) {
                      grantExists.operator = e.target.checked;
                    } else {
                      user.superSearchGrants[0].reputationalSearchGrants.push({
                        itemId: module.id,
                        analyst: false,
                        mssp_customer: false,
                        operator: e.target.checked
                      });
                    }
                    user.superSearchGrants[0].reputationalSearchGrants = [
                      ...user.superSearchGrants[0].reputationalSearchGrants
                    ];
                    saveNewGrant(user);
                  }}
                />
              </div>
            {/each}
          {/if}
        </td>

        <td>
          <div class="border-b border-ctip-border border-solid flex text-center justify-center h-6 last:border-none">
            <input
              bind:checked={user.superSearchGrants[0].mssp_customer}
              class="w-3.5"
              disabled={user.superSearchGrants[0].operator || user.superSearchGrants[0].analyst}
              value="customer"
              type="checkbox"
              on:change={() => {
                saveNewGrant(user);
              }}
            />
          </div>
          {#if shouldShowAllModules(user)}
            {#each $moduleCacheStore[organization.id] as module}
              <div
                class="border-b border-ctip-border border-solid flex text-center justify-center h-6 last:border-none"
              >
                <input
                  checked={verifyIfRoleIsChecked(user, module, 'mssp_customer')}
                  class="w-3.5"
                  disabled={verifyIfRoleIsDisabled(user, module, 'mssp_customer')}
                  value="customer"
                  type="checkbox"
                  on:change={(e) => {
                    const grantExists = user.superSearchGrants[0].reputationalSearchGrants.find(
                      (grant) => grant.itemId === module.id
                    );
                    if (grantExists) {
                      grantExists.mssp_customer = e.target.checked;
                    } else {
                      user.superSearchGrants[0].reputationalSearchGrants.push({
                        itemId: module.id,
                        analyst: false,
                        mssp_customer: e.target.checked,
                        operator: false
                      });
                    }
                    user.superSearchGrants[0].reputationalSearchGrants = [
                      ...user.superSearchGrants[0].reputationalSearchGrants
                    ];
                    saveNewGrant(user);
                  }}
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
  class="w-full [&>div]:mb-auto [&>div]:min-w-[40vw] [&>div]:mt-[160px] "
  bind:open={removeUserFromOrgModalOpen}
  shouldSubmitOnEnter={false}
  modalHeading="Confirmation"
  on:closeModal={() => (removeUserFromOrgModalOpen = false)}
  question="Are you sure you want to remove the user from the organization {selectedOrganizationName} ?"
  on:submit={() => removeUserFromOrganization()}
/>
