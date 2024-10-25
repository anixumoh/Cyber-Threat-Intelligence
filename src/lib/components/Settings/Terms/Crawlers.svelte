<script lang="ts">
  import InfoCard from '$lib/components/Card/InfoCard.svelte';
  import { DataTable, SkeletonText, TextInput } from 'carbon-components-svelte';
  import roleStore from '$stores/role';
  import EnableDisable from '$lib/components/EnableDisable/EnableDisable.svelte';
  import type { ConfiguredType } from '$lib/types/settings';
  import { onMount } from 'svelte';
  import { InformationFilled } from 'carbon-icons-svelte';
  import CommonModal from '$lib/components/CommonModal/CommonModal.svelte';
  import { currentOrganizationId } from '$stores/organization';
  import { currentModule } from '$stores/module';
  import Client from '$lib/client';
  import { MODULE_NAME } from '$lib/constants/modules';
  import { COLORS } from '$lib/constants/colors';
  import { browser } from '$app/environment';

  const client = new Client();

  export let resource = undefined;
  export let isDetails = false;
  export let crawlers: ConfiguredType[] = [];

  let sheet: HTMLStyleElement;

  let openInfo = false;
  let isLoading = false;

  $: resource && init();

  onMount(() => {
    sheet = document.createElement('style');
    document.body.appendChild(sheet);
    !resource && init();

    return () => {
      document.body.removeChild(sheet);
      client.abort();
    };
  });

  async function init() {
    isLoading = true;
    const { data: fromBE } = await client.settings.getAvailableCrawlers(
      $currentOrganizationId,
      $currentModule.id,
      'terms'
    );

    crawlers = fromBE.map?.((crawler, index) => {
      return {
        ...crawler,
        id: index + 1,
        enabled: isConfigured(crawler),
        visionSchedExpression: getAnalysis(crawler)
      };
    });

    if ($currentModule.moduleName === MODULE_NAME.CUSTOM) {
      const { data: fromCustom } = await client.settings.getCustomModulePlugins(
        $currentOrganizationId,
        $currentModule.id
      );

      const availables = [];
      const unavailables = [];
      crawlers.forEach((crawler) => {
        const avail = {
          ...crawler,
          available: fromCustom.includes(crawler.name)
        };
        if (avail.available) {
          availables.push(avail);
        } else {
          unavailables.push(avail);
        }
      });
      crawlers = [...availables, ...unavailables];
    }
    isLoading = false;
  }

  function isConfigured(transformada) {
    return resource
      ? !!resource?.configured?.find?.(
          (activeElement) => activeElement.pluginId === transformada.name && activeElement.enabled
        )
      : false;
  }

  function getAnalysis(transformada) {
    const index = resource?.configured?.findIndex?.((x) => x.pluginId === transformada.name);
    if (index > -1) {
      return resource.configured[index].visionSchedExpression;
    } else {
      return transformada.visionSchedExpression;
    }
  }

  function onUpdateEnable(row) {
    crawlers = crawlers?.map?.((crawler: ConfiguredType) => {
      return {
        ...crawler,
        enabled: row.name.toLowerCase() === crawler.name.toLowerCase() ? !crawler.enabled : crawler.enabled
      };
    });
  }

  function onUpdateVisionSched(event, name: string) {
    crawlers = crawlers?.map?.((crawler: ConfiguredType) => {
      return {
        ...crawler,
        enabled: name.toLowerCase() === crawler.name.toLowerCase() ? event.target.value : crawler.visionSchedExpression
      };
    });
  }

  $: unAvailables = crawlers
    ?.filter((resource: ConfiguredType) => resource.hasOwnProperty('available') && !resource.available)
    ?.map?.((resource: any) => resource.id);
  $: unAvailablesSelectors = unAvailables?.map?.((id) => `#crawlers-table > table > tbody > tr[data-row="${id}"]`);
  $: unAvailablesCustomStyle = unAvailablesSelectors?.length
    ? `${unAvailablesSelectors.join(',\n')} {pointer-events: none; opacity: 0.4; background-color: ${COLORS.white};}`
    : '';

  $: if (browser && sheet) sheet.innerHTML = `${unAvailablesCustomStyle}`;
</script>

<InfoCard title="Crawlers">
  {#if isLoading}
    <div class="block w-full mt-2">
      <SkeletonText paragraph lines={15} />
    </div>
  {:else}
    <DataTable
      id="crawlers-table"
      class="w-full overflow-scroll h-80"
      headers={[
        { key: 'name', value: 'Crawler', width: '40%' },
        { key: 'enabled', value: 'Enable' },
        ...($roleStore.master || $roleStore.superadmin
          ? [{ key: 'visionSchedExpression', value: 'ANALYSIS SCHEDULING EXPRESSION', width: '40%' }]
          : []),
        { key: 'info', value: '' }
      ]}
      rows={crawlers}
    >
      <svelte:fragment slot="cell" let:row let:cell>
        {#if cell.key === 'enabled'}
          <EnableDisable disabled={isDetails} isEnabled={row.enabled} on:click={() => onUpdateEnable(row)} />
        {:else if cell.key === 'visionSchedExpression'}
          {#if (row.hasOwnProperty('available') && row.available) || !row.hasOwnProperty('available')}
            <TextInput
              value={row.visionSchedExpression}
              disabled={!row.enabled || isDetails}
              on:keyup={(event) => onUpdateVisionSched(event, row.name)}
            />
          {:else}
            <span />
          {/if}
        {:else if cell.key === 'info'}
          {#if (row.hasOwnProperty('available') && row.available) || !row.hasOwnProperty('available')}
            <span on:click={() => (openInfo = !openInfo)}>
              <InformationFilled class="cursor-pointer text-ctip-interactive" />
            </span>
          {:else}
            <span />
          {/if}
        {:else}
          {cell.value}
        {/if}
      </svelte:fragment>
    </DataTable>
  {/if}
</InfoCard>

<CommonModal open={openInfo} modalHeading="Info" passiveModal size="sm" on:closeModal>
  <pre class="text-ctip-text">
  <p class="font-bold">Format:</p>
  *  *  *  *  *  *
  ┬  ┬  ┬  ┬  ┬  ┬
  │  │  │  │  │  └─── day of week (0 - 6) (0 is Sunday)
  │  │  │  │  └────── month (1 - 12)
  │  │  │  └───────── day of month (1 - 31)
  │  │  └──────────── hour (0 - 23)
  │  └─────────────── minute (0 - 59)
  └────────────────── second (0 - 59)</pre>
  <p class="font-bold">Examples:</p>
  <ul class="list-disc ml-7">
    <li>0 0 * * * ? : Every hour</li>
    <li>0 0/5 * * * ? : Every 5 minutes</li>
    <li>0 0 12 * * ? : Every day at 12 p.m.</li>
    <li>0 0 8 1 * ? : Every 1st day of month at 8 a.m.</li>
    <li>0 0 8 * * 1-5? : On mondays to fridays at 8 a.m.</li>
  </ul>
</CommonModal>
