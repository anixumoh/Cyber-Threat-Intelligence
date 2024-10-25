<script lang="ts">
  import { Checkbox } from 'carbon-components-svelte';
  import ParameterBase from './ParameterBase.svelte';
  import INDUSTRIES from '$lib/constants/industries';

  export let title: string;
  export let info: string;

  const items = INDUSTRIES.map((industry) => ({ value: industry }));

  let selectedIds: string[] = [];
  let loading = false;

  $: getItems();

  async function getItems() {
    loading = true;
    await new Promise((resolve) => setTimeout(resolve, 1000));
    loading = false;
  }

  async function onChange(key: string, checked: boolean) {
    console.log(key, checked);
  }
</script>

<ParameterBase {title} {items} {info} {loading} itemKey="value" itemValue="value" hideSelectAll>
  <svelte:fragment slot="item" let:item>
    <div class="flex justify-between items-center border-b border-solid border-ctip-light py-2 px-2 w-full">
      <div class="grid grid-flow-col items-center">
        <div class="w-10">
          <Checkbox
            on:check={(e) => onChange(item.value, e.detail)}
            checked={selectedIds.includes(item.value)}
            bind:group={selectedIds}
            value={item.value}
            class="m-0 mr-2 [&_label]:m-0"
          />
        </div>
        {item.value}
      </div>
    </div>
  </svelte:fragment>
</ParameterBase>
