<script lang="ts">
  import { type SvelteComponent, onMount, tick } from 'svelte';
  import preferencesStore from '$stores/preferences';
  import { Button, InlineNotification, Modal, Tab, Tabs, Toggle, TooltipIcon } from 'carbon-components-svelte';
  import { Apps, Close, Edit, Information, Reset, Save } from 'carbon-icons-svelte';
  import breadcrumbs from '../breadcrumbs';
  import ActorsUpdates from './components/ActorsUpdates.svelte';
  import CyberSecurityNews from './components/CyberSecurityNews.svelte';
  import LatestIndicators from './components/LatestIndicators.svelte';
  import ThreatMap from './components/ThreatMap.svelte';
  import AttackPatterns from './tables/AttackPatterns.svelte';
  import LatestCampaigns from './tables/LatestCampaigns.svelte';
  import LatestTools from './tables/LatestTools.svelte';
  import RelevantCve from './tables/RelevantCVE.svelte';
  import ActorsByRegion from './components/ActorsByRegion.svelte';
  import ActorsByIndustry from './components/ActorsByIndustry.svelte';
  import LastRamsonwareAttacks from './components/LastRamsonwareAttacks.svelte';
  import AttackByIndustry from './components/AttackByIndustry.svelte';

  type Customization = {
    component: keyof typeof COMPONENT_MAP;
    columns: 1 | 2;
    rows: 1 | 2 | 3;
  };

  type Catalog = {
    name: string;
    description: string;
    enabled: boolean;
  };

  const COMPONENT_MAP = {
    ActorsUpdates,
    CyberSecurityNews,
    ThreatMap,
    LatestIndicators,
    ActorsByRegion,
    ActorsByIndustry,
    LastRamsonwareAttacks,
    AttackByIndustry
  } as const;

  const tables = {
    campaigns: {
      name: 'Latest campaigns',
      component: LatestCampaigns
    },
    latestTools: {
      name: 'Latest tools',
      component: LatestTools
    },
    relevantCVE: {
      name: 'Relevant CVE',
      component: RelevantCve
    },
    attackPatterns: {
      name: 'Attack patterns',
      component: AttackPatterns
    }
  } satisfies Record<string, { name: string; component: typeof SvelteComponent }>;

  type ComponentCatalog = Record<keyof typeof COMPONENT_MAP, Catalog>;

  let componentCatalog: ComponentCatalog = {
    ActorsUpdates: {
      name: 'Actors Updates',
      description: 'Actor updates description here',
      enabled: true
    },
    ActorsByRegion: {
      name: 'Actors by Region',
      description: 'Actors by region description',
      enabled: true
    },
    ActorsByIndustry: {
      name: 'Actors by Industry',
      description: 'Actors by industry description',
      enabled: true
    },
    ThreatMap: {
      name: 'ThreatMap',
      description: 'Maps component description here',
      enabled: true
    },
    LastRamsonwareAttacks: {
      name: 'LastRamsonwareAttacks',
      description: 'Last Ramsonware Attacks description here',
      enabled: true
    },
    AttackByIndustry: {
      name: 'AttackByIndustry',
      description: 'Last Ramsonware Attacks chart description here',
      enabled: true
    },
    CyberSecurityNews: {
      name: 'Cyber Security News',
      description: 'Cyber Security news description here',
      enabled: true
    },
    LatestIndicators: {
      name: 'Latest Indicators',
      description: 'Latest Indicators description here',
      enabled: true
    }
  };

  const DASHBOARD_VERSION = 1.1;
  const defaultCustomization: readonly Customization[] = Object.freeze([
    {
      component: 'ActorsUpdates',
      columns: 2,
      rows: 1
    },
    {
      component: 'ActorsByRegion',
      columns: 1,
      rows: 1
    },
    {
      component: 'ActorsByIndustry',
      columns: 1,
      rows: 1
    },
    {
      component: 'ThreatMap',
      columns: 2,
      rows: 2
    },
    {
      component: 'LastRamsonwareAttacks',
      columns: 1,
      rows: 1
    },
    {
      component: 'AttackByIndustry',
      columns: 1,
      rows: 1
    },
    {
      component: 'CyberSecurityNews',
      columns: 2,
      rows: 2
    },
    {
      component: 'LatestIndicators',
      columns: 2,
      rows: 1
    }
  ]);

  onMount(() => {
    breadcrumbs.add('Dashboard', '/dashboard');
    customization = getLastCustomization();
  });

  let customize = false;
  let customization: Customization[] = [];
  let componentsModalOpen = false;
  let selectedTab = 0;
  let elements: HTMLDivElement[] = [];
  let dragging = false;
  let draggingInfo: { componentKey: keyof typeof COMPONENT_MAP; itemIndex: number };
  let componentHover: keyof typeof COMPONENT_MAP;
  let resizingIndex: number;
  let startingSize: { x: number; y: number } = undefined;

  const SIZE_TO_CHANGE = 75;

  const reziseObserver = new ResizeObserver((entries) => {
    entries.forEach((entry) => {
      if (resizingIndex === undefined) return;

      const sizes = { x: entry.contentRect.width, y: entry.contentRect.height };
      if (!startingSize) {
        startingSize = sizes;
        return;
      }

      const xDiff = sizes.x - startingSize.x;
      const yDiff = sizes.y - startingSize.y;

      if (xDiff > SIZE_TO_CHANGE) {
        customization[resizingIndex].columns = 2;
      }
      if (xDiff < -SIZE_TO_CHANGE) {
        customization[resizingIndex].columns = 1;
      }

      if (yDiff > SIZE_TO_CHANGE) {
        customization[resizingIndex].rows = Math.min(customization[resizingIndex].rows + 1, 3) as 2 | 3;
        startingSize = sizes;
      }

      if (yDiff < -SIZE_TO_CHANGE) {
        customization[resizingIndex].rows = Math.max(customization[resizingIndex].rows - 1, 1) as 1 | 2;
        startingSize = sizes;
      }
    });
  });

  function startResize(index: number) {
    resizingIndex = index;
    reziseObserver.observe(elements[index]);
  }

  async function endResize() {
    if (!customize) return;
    reziseObserver.disconnect();
    startingSize = undefined;
    dragging = false;
    resizingIndex = undefined;
    await tick();
    elements.forEach((el) => {
      el.style.removeProperty('width');
      el.style.removeProperty('height');
    });
  }

  function getLastCustomization() {
    if (DASHBOARD_VERSION !== $preferencesStore?.tcx_dashboard_version) {
      $preferencesStore.tcx_dashboard_version = DASHBOARD_VERSION;
      return structuredClone(defaultCustomization) as Customization[];
    }

    selectedTab = $preferencesStore?.tcx_default_tab || 0;

    if ($preferencesStore?.tcx_customization?.length) {
      return structuredClone($preferencesStore.tcx_customization) as Customization[];
    }

    Object.entries(componentCatalog).forEach(([key, val]) => {
      val.enabled = !!defaultCustomization.find((x) => x.component === key);
    });

    return structuredClone(defaultCustomization) as Customization[];
  }

  function startCustomization() {
    customize = true;
  }

  function enableComponent(componentKey: keyof typeof COMPONENT_MAP) {
    customization = [
      ...customization,
      {
        component: componentKey,
        columns: 1,
        rows: 1
      }
    ];
  }
  function disableComponent(componentKey: keyof typeof COMPONENT_MAP) {
    customization = customization.filter((c) => c.component !== componentKey);
  }

  function cancelCustomization() {
    customize = false;
    customization = getLastCustomization();
  }

  function resetCustomization() {
    customization = structuredClone(defaultCustomization);
  }

  function showComponents() {
    componentsModalOpen = true;
  }

  function saveCustomization() {
    customize = false;
    $preferencesStore.tcx_customization = customization;
    $preferencesStore.tcx_default_tab = selectedTab;
    preferencesStore.setAndSave($preferencesStore);
  }

  function dragStart(componentKey: keyof typeof COMPONENT_MAP, itemIndex: number) {
    if (!customize) return;
    resizingIndex = undefined;
    dragging = true;
    draggingInfo = { componentKey, itemIndex };
  }

  async function dragEnd() {
    await tick();
    dragging = false;
    draggingInfo = null;
    componentHover = null;
  }

  function drop(componentKey: keyof typeof COMPONENT_MAP) {
    const fromIndex = draggingInfo?.itemIndex;
    const toIndex = customization.findIndex((c) => c.component === componentKey);

    if (fromIndex === undefined || toIndex === -1) return;

    const originalFrom: Customization = structuredClone(customization[fromIndex]);
    const originalTo: Customization = structuredClone(customization[toIndex]);

    customization[toIndex] = structuredClone(originalFrom) as Customization;
    customization[toIndex].columns = originalTo.columns;
    customization[toIndex].rows = originalTo.rows;

    customization[fromIndex] = structuredClone(originalTo) as Customization;
    customization[fromIndex].columns = originalFrom.columns;
    customization[fromIndex].rows = originalFrom.rows;
  }
</script>

<svelte:window on:mouseup={endResize} />

<div class="flex gap-2 mb-2 {customize ? '' : 'absolute top-0 right-0'}">
  <div class="grow" />
  {#if customize}
    <Button icon={Close} on:click={cancelCustomization} kind="danger-tertiary" size="small">Cancel</Button>
    <Button icon={Reset} on:click={resetCustomization} kind="danger-tertiary" size="small">Reset default</Button>
    <Button icon={Apps} on:click={showComponents} kind="tertiary" size="small">Components</Button>
    <Button icon={Save} on:click={saveCustomization} kind="primary" size="small">Save</Button>
  {:else}
    <Button icon={Edit} on:click={startCustomization} kind="ghost" size="small">Customize</Button>
  {/if}
</div>

<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
  {#each customization as box, i (box.component)}
    <div
      bind:this={elements[i]}
      class="relative w-full h-full p-2 rounded bg-ctip-ui border-ctip-border border-4 border-solid"
      class:border={!customize}
      class:resize={customize}
      class:overflow-hidden={customize}
      class:z-50={resizingIndex === i}
      on:mousedown={() => {
        if (customize && !dragging) startResize(i);
      }}
      draggable={customize}
      on:dragstart={() => dragStart(box.component, i)}
      on:dragend={dragEnd}
      class:drop-in-border={draggingInfo?.componentKey &&
        componentHover === box.component &&
        draggingInfo?.componentKey !== box.component}
      class:origin-drop={draggingInfo?.componentKey === box.component}
      on:dragenter={() => (componentHover = box.component)}
      on:dragleave={() => (componentHover = null)}
      on:drop={() => drop(box.component)}
      on:dragover={(e) => {
        resizingIndex = undefined;
        componentHover = box.component;
        e.preventDefault();
      }}
      class:md:col-span-2={box.columns === 2}
      class:md:row-span-2={box.rows === 2}
      class:md:row-span-3={box.rows === 3}
    >
      <svelte:component this={COMPONENT_MAP[box.component]} columns={box.columns} rows={box.rows} />

      {#if customize}
        <div class="absolute inset-0 mr-2 bg-[#00000044]" />
        <div class="absolute inset-0 mb-2 bg-[#00000044] flex items-center justify-center text-4xl font-bold">
          {box.columns} x {box.rows}
        </div>
      {/if}
    </div>
  {/each}
</div>

<div class="mt-2 mb-10">
  <div class="flex">
    <Tabs bind:selected={selectedTab}>
      {#each Object.values(tables) as val}
        <Tab label={val.name} />
      {/each}
    </Tabs>
    {#if customize}
      <InlineNotification
        class="m-0"
        hideCloseButton
        lowContrast
        kind="info"
        subtitle="The selected tab will remain as default"
      />
    {/if}
  </div>

  <svelte:component this={Object.values(tables)[selectedTab].component} />
</div>

<Modal
  primaryButtonText="Close"
  on:click:button--primary={() => (componentsModalOpen = false)}
  modalHeading="Components"
  bind:open={componentsModalOpen}
>
  <main class="grid gap-4">
    {#each Object.entries(componentCatalog) as [componentKey, catalog]}
      <article>
        <Toggle
          on:toggle={(e) => {
            if (e.detail.toggled) {
              enableComponent(componentKey);
            } else {
              disableComponent(componentKey);
            }
          }}
          toggled={catalog.enabled}
        >
          <svelte:fragment slot="labelText">
            <div class="flex justify-center gap-2">
              {catalog.name}
              <TooltipIcon direction="right" icon={Information} tooltipText={catalog.description} />
            </div>
          </svelte:fragment>
        </Toggle>
      </article>
    {/each}
  </main>
</Modal>

<style>
  .drop-in-border {
    background-image: linear-gradient(90deg, var(--ctip-interactive) 50%, transparent 50%),
      linear-gradient(90deg, var(--ctip-interactive) 50%, transparent 50%),
      linear-gradient(0deg, var(--ctip-interactive) 50%, transparent 50%),
      linear-gradient(0deg, var(--ctip-interactive) 50%, transparent 50%);
    background-repeat: repeat-x, repeat-x, repeat-y, repeat-y;
    background-size: 15px 2px, 15px 2px, 2px 15px, 2px 15px;
    background-position: left top, right bottom, left bottom, right top;
    animation: border-dance 1s infinite linear;
  }
  @keyframes border-dance {
    0% {
      background-position: left top, right bottom, left bottom, right top;
    }
    100% {
      background-position: left 15px top, right 15px bottom, left bottom 15px, right top 15px;
    }
  }
  .origin-drop {
    background-image: linear-gradient(90deg, silver 50%, transparent 50%),
      linear-gradient(90deg, silver 50%, transparent 50%), linear-gradient(0deg, silver 50%, transparent 50%),
      linear-gradient(0deg, silver 50%, transparent 50%);
    background-repeat: repeat-x, repeat-x, repeat-y, repeat-y;
    background-size: 15px 2px, 15px 2px, 2px 15px, 2px 15px;
    background-position: left top, right bottom, left bottom, right top;
  }
</style>
