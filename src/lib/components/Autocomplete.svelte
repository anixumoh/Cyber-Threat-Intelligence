<script lang="ts">
  import { ComboBox } from 'carbon-components-svelte';
  import type { ComboBoxProps } from 'carbon-components-svelte/types/ComboBox/ComboBox.svelte';

  type T = $$Generic;

  export let items: T[] = [];
  export let display: keyof T = undefined;
  export let value: keyof T;
  export let selectedValue: T[typeof value];
  export let name = '';
  export let title = '';
  export let placeholder = '';
  export let direction: ComboBoxProps['direction'] = 'bottom';
  export let shouldFilterItem: ComboBoxProps['shouldFilterItem'] = (item, value) =>
    item.text.toLocaleLowerCase().includes(value.toLocaleLowerCase());
  export let search = '';
</script>

<ComboBox
  on:select
  bind:selectedId={selectedValue}
  bind:value={search}
  titleText={title}
  items={items.map((item) => ({ id: item[value], text: `${item[display]}` }))}
  {shouldFilterItem}
  {name}
  {placeholder}
  {direction}
  {...$$restProps}
/>
