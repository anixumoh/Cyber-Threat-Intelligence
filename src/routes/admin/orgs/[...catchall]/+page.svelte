<script lang="ts">
  import modalTeleport from '$lib/actions/modalTeleport';
  import CatchAllRoute from '$lib/components/CatchAllRoute.svelte';
  import { onMount } from 'svelte';
  import EditFilterTemplateModal from '../../filters/EditFilterTemplateModal.svelte';
  import { safeSendEvent } from '$lib/utils/angularCommunication';

  let filterTemplateModalOpen = false;
  let selectedFilterId: number | undefined;
  let selectedOrganizationId: number;

  onMount(() => {
    document.addEventListener('open-filter-template', handleOpenFilterTemplate);
    return () => document.removeEventListener('open-filter-template', handleOpenFilterTemplate);
  });

  function handleOpenFilterTemplate(e: CustomEvent) {
    selectedFilterId = e.detail?.id;
    selectedOrganizationId = e.detail?.organizationId;
    filterTemplateModalOpen = true;
  }

  function onSaveFilterTemplate() {
    safeSendEvent('save-filter-template');
  }
</script>

<CatchAllRoute />

<div use:modalTeleport>
  <EditFilterTemplateModal
    filterId={selectedFilterId}
    bind:open={filterTemplateModalOpen}
    on:save={onSaveFilterTemplate}
    organizationId={selectedOrganizationId}
  />
</div>
