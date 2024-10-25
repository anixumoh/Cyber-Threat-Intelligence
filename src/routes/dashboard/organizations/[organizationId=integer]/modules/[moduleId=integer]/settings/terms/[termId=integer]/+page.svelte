<script lang="ts">
  import { page } from '$app/stores';
  import GenericButton from '$lib/components/Buttons/GenericButton.svelte';
  import { currentOrganizationId } from '$stores/organization';
  import { currentModule } from '$stores/module';
  import { ChevronLeft, Edit, OperationsRecord } from 'carbon-icons-svelte';
  import InfoCard from '$lib/components/Card/InfoCard.svelte';
  import Client from '$lib/client';
  import notifications from '$stores/notification';
  import Details from '$lib/components/Settings/Terms/Details.svelte';
  import { MODULE_NAME } from '$lib/constants/modules';

  const client = new Client();
  const { termId } = $page.params;

  let detailsObj = undefined;

  async function runSearch() {
    try {
      await client.settings.runSearch($currentOrganizationId, $currentModule.id, +termId);
      notifications.notify({
        kind: 'success',
        title: `You can now check the Jobs section in Admin to see the progress.`
      });
    } catch (error) {
      notifications.notify({
        kind: 'error',
        title: 'Something went wrong. Please try again and make sure both the organization and the module are enabled.'
      });
    }
  }
</script>

<InfoCard title="General Info" withBorderBottom={false}>
  <svelte:fragment slot="action-left">
    <GenericButton
      class="ml-2"
      href="/dashboard/organizations/{$currentOrganizationId}/modules/{$currentModule.id}/settings/terms/{termId}/edit{$currentModule.moduleName ===
        MODULE_NAME.SOCIAL_MEDIA && !detailsObj?.crawler
        ? `?type=image`
        : ``}"
    >
      <Edit /><span class="ml-1">Edit</span>
    </GenericButton>
    <GenericButton on:click={runSearch}>
      <OperationsRecord /><span class="ml-1">Run Search</span>
    </GenericButton>
  </svelte:fragment>
  <svelte:fragment slot="action">
    <GenericButton href="/dashboard/organizations/{$currentOrganizationId}/modules/{$currentModule.id}/settings/terms">
      <ChevronLeft /><span class="ml-1">Back to list</span>
    </GenericButton>
  </svelte:fragment>
  <Details bind:resource={detailsObj} />
</InfoCard>
