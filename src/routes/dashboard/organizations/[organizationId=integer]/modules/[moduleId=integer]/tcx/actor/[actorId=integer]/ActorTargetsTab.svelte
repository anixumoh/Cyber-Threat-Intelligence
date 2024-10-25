<script lang="ts">
  import type { ActorData, Country, TargetItem } from '$lib/client/services/actors';
  import type { DataTableHeader } from 'carbon-components-svelte/types/DataTable/DataTable.svelte';
  import type { MapData, MapLegend } from '$lib/components/Map/types';
  import { Tab, TabContent, Tabs } from 'carbon-components-svelte';
  import Map from '$lib/components/Map/Map.svelte';
  import EmptyData from '$lib/components/EmptyData/EmptyData.svelte';
  import ExportableDataTable from '$lib/components/ExportableDataTable/ExportableDataTable.svelte';

  export let actor: ActorData;
  export let targets: TargetItem[];
  export let country: Country;

  const COUNTRY_COLOR = '#b73632';
  const REGION_COLOR = '#ecb5ac';
  const COUNTRYACTOR_COLOR = '#60453f';
  // const REGIONACTOR_COLOR = '#795548';
  const ACTOR_COLOR = '#333333';

  const headers: DataTableHeader[] = [
    { key: 'attributes.category', value: 'CATEGORY', display: (row) => row.attributes.category },
    { key: 'attributes.description', value: 'DESCRIPTION', display: (row) => row.attributes.description }
  ];

  const legend: MapLegend[] = [
    { title: 'Threat Actor country', color: ACTOR_COLOR },
    { title: 'Threat Actor country & Targeted country', color: COUNTRYACTOR_COLOR },
    { title: 'Targeted country', color: COUNTRY_COLOR },
    { title: 'Targeted region', color: REGION_COLOR }
  ];

  $: countries = targets.filter((target) => target.attributes.category === 'countries') || [];
  $: regions = targets.filter((target) => target.attributes.category === 'regions') || [];
  $: sectors = targets.filter((target) => target.attributes.category === 'sectors') || [];
  $: organizations = targets.filter((target) => target.attributes.category === 'organizations') || [];
  $: specifics = targets.filter((target) => target.attributes.category === 'specifics') || [];
  $: mapData = buildMapData(actor, countries, regions);

  function buildMapData(actor: ActorData, countries: TargetItem[], regions: TargetItem[]) {
    const actorCountry = actor?.relationships?.country?.data?.id;
    const mapData: MapData[] = [];
    const addedCountries = new Set();
    let actorCountryAdded = false;

    countries.forEach((country) => {
      const isSameAsActor = actorCountry === country.id;
      if (isSameAsActor) {
        actorCountryAdded = true;
      }

      addedCountries.add(country.relationships.country.data.iso_code);
      mapData.push({
        id: country.relationships.country.data.iso_code,
        color: isSameAsActor ? COUNTRYACTOR_COLOR : COUNTRY_COLOR,
        title: country.attributes.name
      });
    });

    if (country && !actorCountryAdded) {
      mapData.push({
        id: country.attributes.iso_code,
        color: ACTOR_COLOR,
        title: country.attributes.name
      });
    }

    regions.forEach((region) => {
      region?.relationships?.region?.data?.countries?.forEach((country) => {
        if (!addedCountries.has(country.iso_code)) {
          mapData.push({
            id: country.iso_code,
            color: REGION_COLOR,
            title: country.name
          });
        }
      });
    });

    return mapData;
  }
</script>

<Tabs autoWidth type="container">
  <Tab label="Geography Map ({countries.length + regions.length})" />
  <Tab label="Sectors ({sectors.length})" />
  <Tab label="Organizations ({organizations.length})" />
  <Tab label="Specifics ({specifics.length})" />
  <div class="[&_th]:!text-left" slot="content">
    <TabContent>
      <div class="mt-3">
        <Map mapType="country_area" {mapData} {legend} />
      </div>
    </TabContent>
    <TabContent>
      {#if sectors.length}
        <ExportableDataTable {headers} rows={sectors} fileName="sectors" />
      {:else}
        <EmptyData messageObj={{ msg: 'No data found' }} />
      {/if}
    </TabContent>
    <TabContent>
      {#if organizations.length}
        <ExportableDataTable {headers} rows={organizations} fileName="organizations" />
      {:else}
        <EmptyData messageObj={{ msg: 'No data found' }} />
      {/if}
    </TabContent>
    <TabContent>
      {#if specifics.length}
        <ExportableDataTable {headers} rows={specifics} fileName="specifics" />
      {:else}
        <EmptyData messageObj={{ msg: 'No data found' }} />
      {/if}
    </TabContent>
  </div>
</Tabs>
