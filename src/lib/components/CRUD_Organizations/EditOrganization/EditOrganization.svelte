<script lang="ts">
  import { Loading, Tab, TabContent, Tabs } from 'carbon-components-svelte';
  import EditOrgInfo from './Info/EditOrgInfo.svelte';
  import EditOrgBlacklist from './Blacklist/EditOrgBlacklist.svelte';
  import EditOrgFilterTemplates from './Filter_Templates/EditOrgFilterTemplates.svelte';
  import EditOrgGrants from './Grants/EditOrgGrants.svelte';
  import EditOrgLabels from './Labels/EditOrgLabels.svelte';
  import { isLoadingOrg } from '$stores/organization';

  export let selectedTab;
  let grantsTab;
  let tabs = ['Info', 'Blacklist', 'Filter Templates', 'Labels', 'Grants'];
  let infoTab;
  export async function handleSaveClick() {
    if (selectedTab === 0) {
      infoTab.handleSubmit();
    }
  }
  function changedTab(e) {
    if (e.detail == 4) {
      grantsTab.loadUsers();
    }
  }
</script>

{#if $isLoadingOrg}
  <div class="p-14 h-full w-full flex justify-center">
    <Loading class="h-[33vh]" withOverlay={false} />
  </div>
{:else}
  <Tabs on:change={(e) => changedTab(e)} id="tabs" selected={selectedTab}>
    {#each tabs as tabKey}
      <Tab label={tabKey} />
    {/each}
    <svelte:fragment slot="content">
      <TabContent><EditOrgInfo on:save bind:this={infoTab} /></TabContent>
      <TabContent><EditOrgBlacklist /></TabContent>
      <TabContent><EditOrgFilterTemplates /></TabContent>
      <TabContent><EditOrgLabels /></TabContent>
      <TabContent><EditOrgGrants bind:this={grantsTab} /></TabContent>
    </svelte:fragment>
  </Tabs>
{/if}
