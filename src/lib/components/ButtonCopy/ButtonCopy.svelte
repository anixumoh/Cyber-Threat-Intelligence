<script lang="ts">
  import { CopyButton } from 'carbon-components-svelte';

  export let text = 'Copy';
</script>

<CopyButton {text} class="bg-transparent" />
