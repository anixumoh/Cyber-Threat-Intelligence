<script>
  import { goto } from '$app/navigation';
  import { currentOrganizationId, currentOrganization, organizationsStore } from '$stores/organization';
  import { onMount } from 'svelte';
  import userStore from '$stores/user';
  import Client from '$lib/client';
  import logout from '$lib/utils/logout';
  import preferencesStore from '$stores/preferences';
  import { moduleCacheStore } from '$stores/module';
  import { page } from '$app/stores';
  import { Loading } from 'carbon-components-svelte';

  const client = new Client();

  onMount(async () => {
    await shouldEnable2FA();
    await initOrgs();
    await persistOrganizations();
  });

  async function initOrgs() {
    const [organizations, _] = await Promise.all([
      client.modules.getOrganizations(),
      preferencesStore.loadPreferences()
    ]);
    $organizationsStore = organizations;
    const organizationId = +$page.params.organizationId || $currentOrganizationId;
    if (!$moduleCacheStore?.[organizationId] && organizationId) {
      await moduleCacheStore.fetchModules(organizationId);
    }
  }

  async function shouldEnable2FA() {
    if (!$userStore.twoFactorAuthentication) {
      const response = await client.user.shouldEnable2FA();
      const forced = response.data ?? false;
      if (forced) {
        await logout();
        notifications.notify({
          title: 'You need to activate two factor authentication in order to use the app',
          kind: 'error'
        });
      }
    }
  }

  async function persistOrganizations() {
    if (!$organizationsStore[0]) {
      await goto(`/admin/orgs`, { replaceState: true });
    } else {
      let expectedOrgIndex = 0;
      const enabled = $organizationsStore.findIndex((e) => e.enabled);
      if (enabled !== -1) {
        expectedOrgIndex = enabled;
      }
      $currentOrganizationId = $organizationsStore[expectedOrgIndex].id;
      // Add a conditional whether a default ornagization exists. Not at the moment. We should be able to set an organization as default
      if ($currentOrganization?.trial) {
        if (enabled !== -1) {
          await goto(`/dashboard/organizations/${$organizationsStore[enabled].id}/indexed`, { replaceState: true });
        } else {
          await goto(`/dashboard/organizations/${$organizationsStore[0].id}/indexed`, { replaceState: true });
        }
      } else {
        if (enabled !== -1) {
          await goto(`/dashboard/organizations/${$organizationsStore[enabled].id}/summary`, { replaceState: true });
        } else {
          await goto(`/dashboard/organizations/${$organizationsStore[0].id}/summary`, { replaceState: true });
        }
      }
    }
  }
</script>

<Loading />
