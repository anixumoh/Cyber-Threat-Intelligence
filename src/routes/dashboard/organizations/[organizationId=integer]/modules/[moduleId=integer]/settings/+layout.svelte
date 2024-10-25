<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import ModuleHeading from '$lib/components/module/ModuleHeading.svelte';
  import { currentModule, currentModuleId } from '$stores/module';
  import { currentOrganization, currentOrganizationId } from '$stores/organization';
  import { Tabs, Tab, InlineNotification } from 'carbon-components-svelte';
  import { MODULE_NAME, type ModuleNameType } from '$lib/constants/modules';
  import roleStore from '$stores/role';

  const TABS = {
    parameters: 'Parameters',
    filters: `${
      $currentModule.moduleName === MODULE_NAME.CUSTOM || $currentModule.moduleName === MODULE_NAME.SOCIAL_MEDIA
        ? ''
        : 'Advanced'
    } Filters`,
    terms: `${
      $currentModule.moduleName === MODULE_NAME.CUSTOM || $currentModule.moduleName === MODULE_NAME.SOCIAL_MEDIA
        ? ''
        : 'Raw'
    } Terms`,
    classification: 'Classify',
    rss: 'RSS'
  };
  type TabKey = keyof typeof TABS;

  const MODULE_TABS: Partial<Record<ModuleNameType, TabKey[]>> = {
    [MODULE_NAME.CREDENTIAL]: ['parameters', 'filters', 'terms', 'classification'],
    [MODULE_NAME.CREDIT_CARD]: ['parameters', 'filters', 'terms'],
    [MODULE_NAME.CUSTOM]: ['terms', 'filters', 'rss'],
    [MODULE_NAME.DARK_WEB]: ['parameters', 'filters', 'terms'],
    [MODULE_NAME.DATA_LEAKAGE]: ['parameters', 'filters', 'terms'],
    [MODULE_NAME.DOMAIN_PROTECTION]: ['parameters', 'filters', 'terms'],
    [MODULE_NAME.HACKTIVISM]: ['parameters', 'filters', 'terms'],
    [MODULE_NAME.MEDIA_TRACKER]: ['parameters', 'filters', 'terms'],
    [MODULE_NAME.MOBILE_APPS]: ['parameters', 'filters', 'terms'],
    [MODULE_NAME.SOCIAL_MEDIA]: ['terms', 'filters', 'rss'],
    [MODULE_NAME.MALWARE]: ['parameters', 'filters'],
    [MODULE_NAME.EXPLORER]: ['parameters', 'filters'],
    [MODULE_NAME.THREAT_CONTEXT]: ['parameters']
  };

  let selected = 0;

  $: selected = getSelectedTab($page.url.pathname, moduleTabs);
  $: settingsBaseHref = `/dashboard/organizations/${$currentOrganizationId}/modules/${$currentModuleId}/settings`;
  $: moduleTabs = getAllowedTabs($currentModule.moduleName);
  $: allDisabled = !$currentOrganization.enabled && !($roleStore.master || $roleStore.admin || $roleStore.superadmin);

  function getSelectedTab(url: string, tabs: string[]) {
    const index = tabs.findIndex((tab) => {
      return url.includes(tab);
    });
    if (index >= 0) return index;
    return 0;
  }

  function getAllowedTabs(moduleName: ModuleNameType) {
    const tabs = MODULE_TABS[moduleName] ?? [];
    return tabs.filter((tab) => {
      if ($roleStore.master || $roleStore.superadmin) return true;
      if (tab === 'terms') {
        return moduleName === MODULE_NAME.CUSTOM;
      } else if (tab === 'classification') {
        return !$roleStore.customer;
      }
      return true;
    });
  }
</script>

<ModuleHeading title="SETTINGS" />

{#if allDisabled}
  <InlineNotification
    class="max-w-full"
    hideCloseButton
    lowContrast
    kind="warning"
    title="Settings configurations can't be modified because this organization is disabled."
  />
{/if}

<div class:all-disabled={allDisabled}>
  {#if moduleTabs.length}
    <Tabs id="tabs" {selected}>
      {#each moduleTabs as tabKey}
        {@const url = `${settingsBaseHref}/${tabKey}`}
        <Tab label={TABS[tabKey]} href={url} on:click={() => goto(url)} />
      {/each}
    </Tabs>
  {/if}

  <div class="mt-4">
    <slot />
  </div>
</div>

<style>
  .all-disabled {
    opacity: 0.5;
    pointer-events: none;
    user-select: none;
  }
</style>
