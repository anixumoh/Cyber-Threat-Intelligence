<script lang="ts">
  import { Checkbox } from 'carbon-components-svelte';
  import ParameterBase from './ParameterBase.svelte';

  export let title: string;
  export let info: string;

  let items: { value: string }[] = [];
  let selectedIds: string[] = [];
  let loading = false;
  let addExpanded = false;

  $: getItems();

  async function getItems() {
    loading = true;
    await new Promise((resolve) => setTimeout(resolve, 1000));
    loading = false;
  }

  async function onCheck(key: string, checked: boolean) {
    console.log(key, checked);
  }

  async function onAdd(value: string) {
    items = [...items, { value }];
    addExpanded = false;
  }
</script>

<ParameterBase
  canAdd
  bind:addExpanded
  on:add={(e) => onAdd(e.detail)}
  {title}
  {items}
  {info}
  {loading}
  itemKey="value"
  itemValue="value"
  hideSelectAll
>
  <svelte:fragment slot="item" let:item>
    <div class="flex justify-between items-center border-b border-solid border-ctip-light py-2 px-2 w-full">
      <div class="grid grid-flow-col items-center">
        <div class="w-10">
          <Checkbox
            on:check={(e) => onCheck(item.value, e.detail)}
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
