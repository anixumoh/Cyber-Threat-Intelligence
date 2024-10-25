<script lang="ts">
  import { Tag } from 'carbon-components-svelte';

  export let label = undefined;
  export let background = undefined;
</script>

<div style="--label-background-color: {background}">
  <Tag type="outline" class="whitespace-nowrap">{label}</Tag>
</div>

<style>
  div :global(.bx--tag--outline) {
    box-shadow: inset 0 0 0 3px var(--label-background-color);
    font-size: 10px;
    font-weight: bold;
    margin: 0.01rem;
  }
</style>
