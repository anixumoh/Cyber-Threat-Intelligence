<script lang="ts">
  import { goto } from '$app/navigation';
  import { currentModuleId } from '$stores/module';
  import { currentOrganizationId } from '$stores/organization';
  $: goto(`/dashboard/organizations/${$currentOrganizationId}/modules/${$currentModuleId}/tcx/dashboard`);
</script>
