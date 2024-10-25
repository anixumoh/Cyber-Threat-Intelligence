<script lang="ts">
  import { goto } from '$app/navigation';
  import roleStore from '$stores/role';
  import { Loading } from 'carbon-components-svelte';

  $: if ($roleStore) {
    if ($roleStore.master || $roleStore.superadmin || $roleStore.admin || $roleStore.analyst) {
      goto('/admin/orgs');
    } else {
      goto('/');
    }
  }
</script>

<Loading />
