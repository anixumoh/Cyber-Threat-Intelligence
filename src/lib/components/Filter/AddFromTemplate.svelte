<script lang="ts">
  import { goto } from '$app/navigation';
  import Client from '$lib/client';
  import CommonModal from '$lib/components/CommonModal/CommonModal.svelte';
  import { currentModule } from '$stores/module';
  import { currentOrganizationId } from '$stores/organization';
  import { Select, SelectItem, TextInputSkeleton } from 'carbon-components-svelte';
  import { createEventDispatcher, onMount, type SvelteComponent } from 'svelte';

  const client = new Client();
  const dispatch = createEventDispatcher<{ close: void }>();

  export let open = false;
  export let primaryButtonIcon: typeof SvelteComponent = null;

  let listTemplates = [];
  let selectedTemplate = -1;
  let isLoading = false;
  let primaryButtonDisabled = false;

  $: primaryButtonDisabled = selectedTemplate === -1;

  onMount(() => {
    init();
    return () => {
      client.abort();
    };
  });

  async function init() {
    isLoading = true;
    const { data } = await client.settings.getTemplateList($currentOrganizationId);
    listTemplates = data;
    isLoading = false;
  }

  async function onSubmit() {
    //
    const { data } = await client.settings.createFilterFromTemplate(
      $currentOrganizationId,
      $currentModule.id,
      selectedTemplate
    );
    dispatch('close');
    await goto(
      `/dashboard/organizations/${$currentOrganizationId}/modules/${$currentModule.id}/settings/filters/${data.id}/edit`
    );
  }
</script>

<CommonModal
  bind:open
  modalHeading="Add from Template"
  primaryButtonText="Create"
  secondaryButtonText="Cancel"
  passiveModal={false}
  {primaryButtonDisabled}
  {primaryButtonIcon}
  size="sm"
  on:submit={onSubmit}
  on:closeModal
>
  <div class="flex justify-evenly items-center h-32">
    {#if isLoading}
      <TextInputSkeleton hideLabel />
    {:else}
      <Select bind:selected={selectedTemplate}>
        <SelectItem disabled value={-1} text="--Select template--" />
        {#each listTemplates as { id, name }}
          <SelectItem value={id} text={name} />
        {/each}
      </Select>
    {/if}
  </div>
</CommonModal>
