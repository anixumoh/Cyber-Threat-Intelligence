<script lang="ts">
  import { Search } from 'carbon-components-svelte';
  import { createEventDispatcher } from 'svelte';
  import debounce from '$lib/actions/debounce';

  const dispatch = createEventDispatcher();

  export let value = '';
  export let duration = 1500;
  export let startSearch = 3;
  export let name = '';
  export let placeholder = 'Search...';
  export let expanded = true;
  export let disabled = false;

  function onSearch() {
    dispatch('search', value);
  }
</script>

<input class="hidden" bind:value use:debounce={{ value, func: onSearch, duration, startSearch }} />
<Search bind:disabled bind:value size="sm" {placeholder} bind:expanded expandable />
