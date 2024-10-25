<script lang="ts">
  import { page } from '$app/stores';
  import AdvancedFilters from '$lib/components/FilterTemplate/AdvancedFilters.svelte';
</script>

<AdvancedFilters filterId={+$page.params.filterId} />
