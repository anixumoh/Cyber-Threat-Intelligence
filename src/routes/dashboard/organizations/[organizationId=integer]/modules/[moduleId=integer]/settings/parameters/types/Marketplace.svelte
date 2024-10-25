<script lang="ts">
  import Client from '$lib/client';
  import type { Country } from '$lib/client/services/settings';
  import type Module from '$lib/types/module';
  import { currentModule } from '$stores/module';
  import { currentOrganizationId } from '$stores/organization';
  import roleStore from '$stores/role';
  import { Checkbox, Select, SelectItem } from 'carbon-components-svelte';
  import { tick } from 'svelte';
  import ParameterBase from './ParameterBase.svelte';

  export let apiPath: string;
  export let title: string;
  export let info: string;

  const items = [
    { id: 'officialMarkets', name: 'Official Markets' },
    { id: 'alternativeMarkets', name: 'Alternative Markets' }
  ];
  const client = new Client();

  let loading = false;
  let isSaving = false;
  let countries: Country[] = [];

  let selectedItems: string[] = [];
  let selectedCountry: string = null;

  $: haveAlternative = selectedItems.includes('alternativeMarkets');
  $: getCountries();
  $: getItems($currentOrganizationId, $currentModule, apiPath);

  async function getCountries() {
    countries = await client.settings.getCountries();
  }

  async function getItems(organizationId: number, module: Module, apiPath: string) {
    loading = true;
    selectedItems = [];
    const response = await client.modules.getModuleSettings(organizationId, module, apiPath);

    selectedItems = [];
    response.values.forEach((item) => {
      if (item.id === 'country') {
        selectedCountry = item.value;
      } else if (item.value === 'true') {
        selectedItems = [...selectedItems, item.id];
      }
    });
    loading = false;
  }

  async function onChange(name: string, checked: boolean) {
    isSaving = true;
    if (checked) {
      selectedItems = [...selectedItems, name];
    } else {
      selectedItems = selectedItems.filter((item) => item !== name);
    }
    if (name === 'alternativeMarkets' && !checked) {
      selectedCountry = null;
    }
    await saveState();
    isSaving = false;
  }

  async function saveState() {
    await tick(); // wait for haveAlternative
    const values: { id: string; value: string | boolean | null }[] = items.map((item) => ({
      id: item.id,
      value: selectedItems.includes(item.id)
    }));
    values.push({
      id: 'country',
      value: selectedCountry || null
    });

    const payload = {
      type: apiPath.toUpperCase(),
      values
    };
    try {
      await client.modules.setModuleSettings($currentOrganizationId, $currentModule, payload);
    } catch (error) {}
  }
</script>

<ParameterBase {title} {items} {loading} {info} itemKey="id" itemValue="name" hideSelectAll hideSearch>
  <svelte:fragment slot="item" let:item>
    <div class="flex justify-between items-center border-b border-solid border-ctip-light py-2 px-2 w-full">
      <div title={item.name} class="grid grid-flow-col items-center">
        <Checkbox
          disabled={isSaving || $roleStore.customer || $roleStore.operator}
          on:check={(e) => onChange(item.id, e.detail)}
          checked={selectedItems.includes(item.id)}
          value={item.id}
          class="m-0 mr-2 [&_label]:m-0"
        />
        <div class="overflow-hidden text-ellipsis whitespace-nowrap">
          {item.name}
        </div>
      </div>
    </div>
  </svelte:fragment>
  <div slot="after" class="p-4">
    {#if haveAlternative}
      <Select
        disabled={$roleStore.customer || $roleStore.operator}
        bind:selected={selectedCountry}
        labelText="Country"
        on:change={saveState}
      >
        <SelectItem value="" text="" />
        {#each countries as country}
          {country.id}
          <SelectItem value={country.id} text={country.name} />
        {/each}
      </Select>
    {/if}
  </div>
</ParameterBase>
