<script lang="ts">
  import Client from '$lib/client';
  import { currentOrganizationId } from '$stores/organization';
  import { DataTable, Modal, RadioButton, RadioButtonGroup, SkeletonText } from 'carbon-components-svelte';
  import { SETTINGS_DICTIONARY, MODULES_TYPES_DICTIONARY } from '$lib/constants/assets';
  import { Download, Information } from 'carbon-icons-svelte';
  import TooltipWithIcon from '../TooltipWithIcon/TooltipWithIcon.svelte';
  import { COLORS } from '$lib/constants/colors';
  import GenericButton from '../Buttons/GenericButton.svelte';
  import * as FileSaver from 'file-saver';

  export let open = false;

  let totalSettings = {};
  let parsedData = {};
  let totalSettingsLoading = false;
  let totalSettingsDownloading = false;
  let filterTotalSettings: 'all' | 'enabled' | 'disabled' = 'all';
  $: filterTotalSettings && init();

  const client = new Client();

  async function init() {
    totalSettingsLoading = true;
    try {
      const filter = filterTotalSettings === 'all' ? null : filterTotalSettings === 'enabled' ? true : false;
      const { data } = await client.assets.getTotalSettings($currentOrganizationId, filter);

      totalSettings = Object.entries(data).reduce((acc, [key, val]) => {
        // THREATS is last element
        const orderedEntries = Object.entries(val).sort((a, b) => {
          if (a[0] === 'THREATS') {
            return 1;
          }
          if (b[0] === 'THREATS') {
            return -1;
          }
          return 0;
        });
        acc[key] = orderedEntries;
        return acc;
      }, {});

      parseTables();

      totalSettingsLoading = false;
    } catch (error) {
      totalSettingsLoading = false;
    }
  }

  function parseTables() {
    parsedData = {};
    Object.entries(totalSettings)
      .sort()
      .forEach(([key, value]: [string, [string, number]], index) => {
        const headers = [];
        const row = { id: index };
        value.forEach((element) => {
          headers.push({
            key: element[0].toLowerCase(),
            value: SETTINGS_DICTIONARY[element[0]]?.toUpperCase() || element[0].toUpperCase()
          });
          row[element[0].toLowerCase()] = element[1];
        });
        parsedData[key] = { headers, rows: [row] };
      });
  }

  async function downloadTotalSettings() {
    totalSettingsDownloading = true;
    try {
      const { data } = await client.assets.downloadTotalSettings($currentOrganizationId);
      const blob = new Blob([data], {
        type: 'application/octet-stream'
      });
      FileSaver.saveAs(blob, `total_settings_org_${$currentOrganizationId}_export.csv`);

      totalSettingsDownloading = false;
    } catch (error) {
      totalSettingsDownloading = false;
    }
  }
</script>

<Modal
  bind:open
  modalHeading="Total settings values"
  passiveModal={false}
  size="lg"
  primaryButtonText="Cancel"
  on:click:button--primary={() => (open = false)}
>
  <div class="flex items-end justify-between">
    <RadioButtonGroup
      orientation="vertical"
      legendText="Filter by Enabled/Disabled"
      bind:selected={filterTotalSettings}
    >
      <RadioButton labelText="All modules" value="all" />
      <RadioButton labelText="Enabled modules" value="enabled" />
      <RadioButton labelText="Disabled modules" value="disabled" />
    </RadioButtonGroup>
    <GenericButton on:click={downloadTotalSettings} disabled={totalSettingsDownloading}>
      <Download class="mr-2" /> Download Report
    </GenericButton>
  </div>
  {#if totalSettingsLoading}
    <SkeletonText paragraph lines={25} class="mt-5" />
  {:else}
    {#each Object.keys(parsedData) as key}
      <div class="mt-5">
        <div class="flex items-center justify-center h-12 border-b-2 border-solid border-b-ctip-interactive bg-ctip-background">
          <span class="font-bold uppercase">{MODULES_TYPES_DICTIONARY[key]}</span>
        </div>
        <DataTable class="[&_td]:text-center" headers={parsedData[key].headers} rows={parsedData[key].rows}>
          <svelte:fragment slot="cell-header" let:header>
            {#if header.key === 'subdomain' && key === 'CREDENTIALS'}
              <span class="flex justify-center">
                {header.value}
                <TooltipWithIcon
                  color={COLORS.interactive}
                  tooltipText="All subdomains that not have a main domain configurated will be taken into account for accounting process."
                  icon={Information}
                  classStyle="ml-2"
                />
              </span>
            {:else}
              {header.value}
            {/if}
          </svelte:fragment>
        </DataTable>
      </div>
    {/each}
  {/if}
</Modal>
