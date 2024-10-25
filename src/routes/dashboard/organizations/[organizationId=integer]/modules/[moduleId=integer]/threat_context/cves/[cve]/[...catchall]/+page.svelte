<script lang="ts">
  import modalTeleport from '$lib/actions/modalTeleport';
  import type { CVE } from '$lib/client/services/malware';
  import CatchAllRoute from '$lib/components/CatchAllRoute.svelte';
  import ResourceLabelModal from '$lib/components/ResourceLabelModal.svelte';
  import { safeSendEvent } from '$lib/utils/angularCommunication';
  import { onMount } from 'svelte';

  let isLabelsModalOpen = false;
  let selectedCVEs: CVE[] = [];
  let explorerModuleId: number;

  onMount(() => {
    document.addEventListener('open-cve-edit-labels', handleOpenCveEditLabels);
    return () => document.removeEventListener('open-cve-edit-labels', handleOpenCveEditLabels);
  });

  function handleOpenCveEditLabels(e: CustomEvent) {
    const { cve, moduleId } = e.detail;
    selectedCVEs = [cve];
    isLabelsModalOpen = true;
    explorerModuleId = moduleId;
  }

  function reloadCVE() {
    safeSendEvent('cve-reload');
  }
</script>

<CatchAllRoute />

<div use:modalTeleport>
  <ResourceLabelModal
    on:save={reloadCVE}
    bind:open={isLabelsModalOpen}
    resources={selectedCVEs}
    moduleId={explorerModuleId}
  />
</div>
