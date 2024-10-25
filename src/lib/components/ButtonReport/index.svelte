<script lang="ts">
  import { Button } from 'carbon-components-svelte';
  import { Download } from 'carbon-icons-svelte';
  import { currentOrganizationId } from '$stores/organization';

  export let text = 'Report';
  export let params = '';
</script>

<Button
  href="/dashboard/organizations/{$currentOrganizationId}/reports?selected={params}"
  icon={Download}
  size="small"
  kind="ghost"
>
  {text}
</Button>
