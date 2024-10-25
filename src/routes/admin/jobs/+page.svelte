<script lang="ts">
  import { Tab, Tabs } from 'carbon-components-svelte';
  import InExecutionList from './InExecutionList.svelte';
  import ScheduledList from './ScheduledList.svelte';

  let selected = 0;
</script>

<div class="flex gap-4 items-center">
  <h4>Jobs</h4>

  <Tabs bind:selected autoWidth>
    <Tab label="In Execution" />
    <Tab label="Scheduled" />
  </Tabs>
</div>

{#if selected === 0}
  <InExecutionList />
{:else}
  <ScheduledList />
{/if}
