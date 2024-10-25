<script lang="ts">
  import { InlineLoading, MultiSelect } from 'carbon-components-svelte';

  type T = $$Generic;

  export let key: keyof T;
  export let display: keyof T;
  export let selected: T[] = [];
  export let placeholder = '';
  export let searchFunction: (text: string) => Promise<T[]>;

  let items: T[] = [];
  let itemsMap = new Map<typeof key, T>();
  let search = '';
  let searchTimeout: ReturnType<typeof setTimeout>;
  let selectedIds = [];
  let loading = false;

  $: selected = selectedIds.map((id) => itemsMap.get(id));
  $: onSearch(search);
  $: placeholderText = selected.length ? selected.map((i) => i[display]).join(', ') : placeholder;
  $: shownItems = getShownItems(items, selectedIds, itemsMap);

  function onSearch(search: string) {
    clearTimeout(searchTimeout);
    loading = true;
    searchTimeout = setTimeout(async () => {
      items = await searchFunction(search);
      items.forEach((item) => {
        itemsMap.set(item[key], item);
      });
      loading = false;
    }, 500);
  }

  function getShownItems(its: T[], currentSelectedIds: typeof selectedIds, allItemsMapping: typeof itemsMap) {
    const selectedItems = [...itemsMap.values()].filter((it) => currentSelectedIds.includes(it[key]));
    const nonSelected = its.filter((it) => !currentSelectedIds.includes(it[key]));
    return [...selectedItems, ...nonSelected];
  }
</script>

<div class="relative">
  <MultiSelect
    filterable
    placeholder={placeholderText}
    items={shownItems.map((it) => ({ id: it[key], text: String(it[display]) }))}
    bind:value={search}
    bind:selectedIds
  />
  {#if loading}
    <div class="absolute right-0 bottom-0 mb-1.5 mr-16">
      <InlineLoading />
    </div>
  {/if}
</div>
