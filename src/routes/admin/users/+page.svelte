<script lang="ts">
  import { Tab, Tabs } from 'carbon-components-svelte';
  import UserList from './UserList.svelte';
  import GroupList from './GroupList.svelte';

  let selected = 0;
</script>

<div class="flex gap-4 items-center">
  <h4>Users</h4>

  <Tabs bind:selected autoWidth>
    <Tab label="User List" />
    <Tab label="Group List" />
  </Tabs>
</div>

{#if selected === 0}
  <UserList />
{:else}
  <GroupList />
{/if}
