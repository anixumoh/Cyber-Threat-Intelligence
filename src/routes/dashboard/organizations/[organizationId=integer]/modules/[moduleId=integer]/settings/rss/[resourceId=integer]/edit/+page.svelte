<script lang="ts">
  import { page } from '$app/stores';
  import EditRss from '../../EditRss.svelte';
</script>

<EditRss id={+$page.params.resourceId} />
