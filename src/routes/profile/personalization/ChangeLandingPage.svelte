<script lang="ts">
  import Client from '$lib/client';
  import userStore from '$stores/user';
  import { Button, Dropdown, FormGroup, InlineLoading } from 'carbon-components-svelte';
  import notifications from '$stores/notification';
  import { organizationsStore } from '$stores/organization';
  import { moduleCacheStore } from '$stores/module';
  import { onMount } from 'svelte';

  const defaultModules = [
    {
      name: 'Dashboard',
      id: 'dashboard'
    },
    {
      name: 'All Incidents',
      id: 'summary'
    },
    { name: 'All threats', id: 'indexed' },
    { name: 'Reports', id: 'reports' },
    { name: 'Admin', id: 'admin' }
  ];
  const client = new Client();

  let organizationId: number;
  let moduleId: string | number;
  let isSaving = false;
  let isDeleting = false;

  onMount(() => {
    try {
      const landingParams = $userStore.landingPage.split(',');
      organizationId = +landingParams[1];
      moduleId = +landingParams[3] || landingParams[3];
    } catch (error) {}
  });

  $: modules = organizationId ? [...defaultModules, ...($moduleCacheStore?.[organizationId] ?? [])] : [];
  $: loadModules(organizationId);
  $: isWaiting = isSaving || isDeleting;
  $: valid = !!organizationId && !!moduleId;

  async function save() {
    isSaving = true;
    try {
      const org = $organizationsStore.find((org) => org.id === organizationId);
      const module = modules.find((mod) => mod.id === moduleId);
      const landing = `${org.name},${organizationId},${module.name},${moduleId}`;
      await client.user.setLandingPage(landing);
      $userStore.landingPage = landing;
      notifications.notify({
        kind: 'success',
        title: 'Your account was updated successfully!',
        subtitle: 'Account update successful'
      });
    } catch (error) {
      const msg = error?.response?.data?.message || 'Something went wrong';
      notifications.notify({
        kind: 'error',
        title: msg
      });
    }
    isSaving = false;
  }

  async function deleteCustomSettings() {
    isDeleting = true;
    await client.user.setLandingPage('');
    isDeleting = false;
    $userStore.landingPage = '';
    organizationId = undefined;
    moduleId = undefined;
  }

  async function loadModules(organizationId: number) {
    if (organizationId && !$moduleCacheStore[organizationId]) {
      moduleCacheStore.fetchModules(organizationId);
    }
  }
</script>

<form class="w-full" on:submit|preventDefault={save}>
  <FormGroup class="w-full flex">
    <div class="w-full">
      <Dropdown
        id="organization-change-landing"
        bind:selectedId={organizationId}
        titleText="Organization"
        label=""
        items={$organizationsStore.map((org) => ({ id: org.id, text: org.name }))}
        disabled={isWaiting}
      />
    </div>
  </FormGroup>

  <FormGroup class="w-full">
    <div class="w-full">
      <Dropdown
        id="module-change-landing"
        bind:selectedId={moduleId}
        titleText="Module"
        label=""
        items={modules.map((mod) => ({ id: mod.id, text: mod.name }))}
        disabled={isWaiting}
      />
    </div>
  </FormGroup>

  <Button on:click={save} type="button" icon={isSaving ? InlineLoading : undefined} disabled={isWaiting || !valid}>
    Submit
  </Button>
  <Button
    on:click={deleteCustomSettings}
    type="button"
    icon={isDeleting ? InlineLoading : undefined}
    disabled={isWaiting || !$userStore?.landingPage}
  >
    Delete custom settings
  </Button>
</form>
