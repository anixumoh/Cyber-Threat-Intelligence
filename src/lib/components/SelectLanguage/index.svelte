<script lang="ts">
  import GenericSingleSelect from '$lib/components/Filter/GenericSingleSelect.svelte';
  import { createEventDispatcher } from 'svelte';
  import languagesStore from '$stores/languages';
  import type { AlignPopoverType } from '$lib/types';

  const dispatch = createEventDispatcher();

  export let selectedValue = '';
  export let title = '';
  export let align: AlignPopoverType = 'bottom';

  export function onChangeSelected($event) {
    const { detail } = $event;
    const language = $languagesStore.find((item) => item.language_id === detail);
    dispatch('changeLanguage', language);
    selectedValue = detail;
  }
</script>

<GenericSingleSelect
  {selectedValue}
  items={$languagesStore}
  {align}
  {title}
  value="language_id"
  display="language"
  on:changeSelected={onChangeSelected}
/>
