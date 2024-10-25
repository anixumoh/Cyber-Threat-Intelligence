<script lang="ts">
  import { goto } from '$app/navigation';
  import userStore from '$stores/user';
  import { onMount } from 'svelte';

  onMount(() => {
    if ($userStore) goto('/dashboard');
    else goto('/login');
  });
</script>
