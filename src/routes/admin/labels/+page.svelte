<script lang="ts">
  import { Tab, Tabs } from 'carbon-components-svelte';
  import LabelList from './LabelList.svelte';
  import LabelTypes from './LabelTypes.svelte';

  let selected = 0;
</script>

<div class="flex gap-4 items-center">
  <h4>Labels</h4>

  <Tabs bind:selected autoWidth>
    <Tab label="Label list" />
    <Tab label="Label types" />
  </Tabs>
</div>

{#if selected === 0}
  <LabelList />
{:else}
  <LabelTypes />
{/if}
