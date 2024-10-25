<script lang="ts">
  import ListOfLabels from '$lib/components/ListOfLabels.svelte';
  import { orgToEdit } from '$stores/organization';
</script>

<div class="h-96">
  <ListOfLabels predefinedOrganizationId={$orgToEdit.id} />
</div>
