<script lang="ts">
  import { dev } from '$app/environment';
  import { page } from '$app/stores';
  import bannerOpenStore from '$stores/bannerOpen';
  import menuExpandedStore from '$stores/menuExpanded';
  import { modulesStore } from '$stores/module';
  import { currentOrganization, currentOrganizationId } from '$stores/organization';
  import preferencesStore from '$stores/preferences';
  import roleStore from '$stores/role';
  import { Button } from 'carbon-components-svelte';
  import { CloudSatelliteLink, Folder, Meter, Settings } from 'carbon-icons-svelte';
  import { onMount } from 'svelte';
  import BaseMenuItem from './BaseMenuItem.svelte';
  import { getModulesMenu, makeItem } from './menu-helper';

  let generalExpanded = false;
  let assetExpanded = false;
  let modulesExpanded = false;

  let generalHightlight = false;
  let assetsHightlight = false;
  let modulesHightlight = false;

  onMount(() => {
    const timeout = setTimeout(() => {
      const menu = document.getElementById('sidebar-menu');
      if (menu) {
        const actives = menu.getElementsByClassName('menu-active');
        if (actives.length) {
          const active = actives[actives.length - 1];
          active.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        }
      }
    }, 500);
    return () => clearTimeout(timeout);
  });

  $: currentUrl = $page.url.pathname;
  $: selectedModuleId = +$page.params.moduleId ?? null;

  $: if (generalItems.some((item) => item.active)) {
    setGeneralExpanded();
  }

  $: if (assetItems.some((item) => item.active)) {
    setAssetExpanded();
  }

  $: if ($currentOrganizationId && selectedModuleId && moduleItems.length) {
    setModulesExpanded(true);
  }

  $: if ($preferencesStore.openModules && $menuExpandedStore) {
    setModulesExpanded();
  }

  function setGeneralExpanded() {
    if ($menuExpandedStore) generalExpanded = true;
    generalHightlight = true;
    assetsHightlight = false;
    modulesHightlight = false;
  }

  function setAssetExpanded() {
    if ($menuExpandedStore) assetExpanded = true;
    generalHightlight = false;
    assetsHightlight = true;
    modulesHightlight = false;
  }

  function setModulesExpanded(hightlight = false) {
    if ($menuExpandedStore) modulesExpanded = true;
    if (hightlight) {
      generalHightlight = false;
      assetsHightlight = false;
      modulesHightlight = true;
    }
  }

  $: generalItems = $roleStore.trial
    ? []
    : [
        makeItem('Dashboard', `/dashboard/organizations/${$currentOrganizationId}`, currentUrl),

        (dev ||
          window.location.hostname.includes('master.blueliv.com') ||
          window.location.hostname.includes('onliners.blueliv.com')) &&
          makeItem('Panintelligence', `/dashboard/organizations/${$currentOrganizationId}/panintelligence`, currentUrl),

        !$roleStore.customer &&
          makeItem('Reports', `/dashboard/organizations/${$currentOrganizationId}/reports`, currentUrl),
        makeItem('All Threats', `/dashboard/organizations/${$currentOrganizationId}/indexed`, currentUrl),
        makeItem('All Incidents', `/dashboard/organizations/${$currentOrganizationId}/summary`, currentUrl),
        showAlerts &&
          makeItem('All Alerts', `/dashboard/organizations/${$currentOrganizationId}/all-alerts`, currentUrl)
      ].filter(Boolean);

  $: assetItems = $roleStore.trial
    ? []
    : [
        makeItem(
          'Discovery',
          `/dashboard/organizations/${$currentOrganizationId}/asset-discovery/discovery`,
          currentUrl
        ),
        makeItem('Settings', `/dashboard/organizations/${$currentOrganizationId}/asset-discovery/settings`, currentUrl)
      ].filter(Boolean);

  $: canCreateModules =
    $roleStore.admin ||
    $roleStore.master ||
    $roleStore.superadmin ||
    $roleStore.grants.globalAnalyst.includes($currentOrganizationId);

  $: isHigherRole = $roleStore.admin || $roleStore.master || $roleStore.superadmin;
  $: showAlerts = $roleStore.superadmin || $roleStore.admin || $roleStore.analyst || $roleStore.master;

  $: moduleItems = getModulesMenu(
    $modulesStore,
    $currentOrganization,
    selectedModuleId,
    currentUrl,
    canCreateModules,
    isHigherRole,
    showAlerts
  ).filter(Boolean);

  $: showMenu = !$page.url.pathname.startsWith('/profile');
</script>

{#if $currentOrganizationId && showMenu}
  <div
    id="sidebar-menu"
    style="--cds-link-01: black"
    class:pt-14={$bannerOpenStore}
    class="flex flex-col justify-between fixed left-0 top-14 border-r border-gray-400 dark:border-neutral-700 border-solid h-screen dark:text-white transition-all bg-ctip-background
    {$menuExpandedStore ? 'w-[250px] z-10' : 'w-20 z-[1000]'}"
  >
    <div class="overflow-auto bg-ctip-ui text-ctip-text custom-scrollbar">
      <BaseMenuItem
        bind:expanded={generalExpanded}
        menuExpanded={$menuExpandedStore}
        hightlight={generalHightlight}
        icon={Meter}
        items={generalItems}
        title="GENERAL VIEW"
      />

      <BaseMenuItem
        bind:expanded={assetExpanded}
        menuExpanded={$menuExpandedStore}
        hightlight={assetsHightlight}
        icon={CloudSatelliteLink}
        items={assetItems}
        title="ASSET DISCOVERY"
      />

      <BaseMenuItem
        bind:expanded={modulesExpanded}
        menuExpanded={$menuExpandedStore}
        hightlight={modulesHightlight}
        icon={Folder}
        items={moduleItems}
        title="MODULES"
      />
    </div>

    <div class="border-t border-gray-400 border-solid dark:border-neutral-600 mb-14">
      <Button
        href="/dashboard/organizations/{$currentOrganizationId}/global-settings"
        kind="ghost"
        size="field"
        class="flex w-full h-12 items-center text-base hover:opacity-90 dark:text-white
        {$menuExpandedStore ? 'justify-between' : 'justify-center'}"
      >
        {#if $menuExpandedStore}
          <span>Global Settings</span>
        {/if}
        <Settings />
      </Button>
    </div>
  </div>
{/if}
