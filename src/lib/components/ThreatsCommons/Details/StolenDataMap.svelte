<script lang="ts">
  import { COLORS } from '$lib/constants/colors';
  import threatsStore from '$stores/threats';
  import Map from '$lib/components/Map/Map.svelte';
  import { getHumanReadableDate } from '$lib/utils/functions';
  import { Dropdown } from 'carbon-components-svelte';
  import InfoCard from '$lib/components/Card/InfoCard.svelte';
  import type { StolenData } from '$lib/types/threat';
  import EmptyData from '$lib/components/EmptyData/EmptyData.svelte';

  const citySVG =
    'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z';

  let selected = 0;

  $: mapData = getMapData($threatsStore.selectedForDetails.credential?.stolenData);
  $: selectedData = mapData?.[selected];

  function getMapData(stolenData: StolenData[]) {
    if (!stolenData) return [];
    return stolenData
      .map((item) => {
        if (!Object.values(item).length) return;
        const title = `${item.botCity ? `${item.botCity}, ` : ''} ${item.botCountryName || ''}`.trim();
        const dropdownText = [getHumanReadableDate(item.stolenAt), title].filter(Boolean).join(' - ');
        return {
          id: item.botCountry,
          latitude: item.botLatitude,
          longitude: item.botLongitude,
          svgPath: citySVG,
          color: COLORS.dangerThreat,
          stolenAt: item.stolenAt,
          title,
          dropdownText
        };
      })
      .filter(Boolean);
  }

  function onHit(latitude: number, longitude: number) {
    const index = mapData.findIndex((item) => item.latitude === latitude && longitude === longitude);
    if (index >= 0) {
      selected = index;
    }
  }
</script>

<InfoCard title="More Info" class="mt-3">
  {#if mapData.length}
    <div class="grid lg:grid-cols-[350px_1fr] w-full p-2 mx-auto mt-4 gap-8">
      <div>
        <Dropdown
          bind:selectedId={selected}
          items={mapData.map((item, i) => ({
            id: i,
            text: item.dropdownText
          }))}
        />

        <div class="grid gap-4 p-4 mt-2 border border-gray-100 rounded">
          <div class="flex justify-between border-b border-gray-100 border-solid">
            <div>LOCATION</div>
            <div>{selectedData.title || '-'}</div>
          </div>
          <div class="flex justify-between border-b border-gray-100 border-solid">
            <div>LATITUDE</div>
            <div>{selectedData.latitude || '-'}</div>
          </div>
          <div class="flex justify-between border-b border-gray-100 border-solid">
            <div>LONGITUDE</div>
            <div>{selectedData.longitude || '-'}</div>
          </div>
          <div class="flex justify-between border-b border-gray-100 border-solid">
            <div>BREACHED AT</div>
            <div>{getHumanReadableDate(selectedData.stolenAt)}</div>
          </div>
        </div>
      </div>

      <Map {mapData} on:hit={(e) => onHit(e.detail.latitude, e.detail.longitude)} />
    </div>
  {:else}
    <div class="mx-auto">
      <EmptyData messageObj={{ msg: 'No more info available' }} />
    </div>
  {/if}
</InfoCard>
