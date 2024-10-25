<script lang="ts">
  import GenericButton from '$lib/components/Buttons/GenericButton.svelte';
  import type { KindType, SizeType } from '$lib/types';
  import { activeClasses } from '$lib/utils';

  export let kind: KindType = 'ghost';
  export let size: SizeType = 'small';
  export let isActive = false;
  export let disabled = false;
</script>

<GenericButton
  data-test="filters"
  class="px-2 rounded h-fit text-ctip-btnLight border-[1px] border-solid border-ctip-border dark:text-white
  {isActive ? activeClasses : 'border-ctip-border'}
  {$$restProps.class}"
  {kind}
  {size}
  {disabled}
  on:click
  on:mouseenter
  on:mouseover
  on:mouseleave
>
  <slot />
</GenericButton>
