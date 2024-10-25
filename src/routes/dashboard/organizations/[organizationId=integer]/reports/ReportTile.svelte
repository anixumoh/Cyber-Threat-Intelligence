<script>
  import { ClickableTile } from 'carbon-components-svelte';

  export let iconClass = 'icon-blv-allthreats';
  export let selected = false;
  export let title = '';
  export let description = '';
  export let href = undefined;
  export let disabled = false;
</script>

<ClickableTile
  {disabled}
  {href}
  on:click
  class="rounded border-[1px] border-solid {selected ? 'border-ctip-interactive text-ctip-interactive' : 'border-transparent'}"
>
  <div class="flex items-center justify-center h-16 text-2xl">
    <i class="{iconClass} text-3xl" />
  </div>
  <div class="text-center">
    <h4 class="font-bold">{title}</h4>
    <h6>{description}</h6>
  </div>
</ClickableTile>
