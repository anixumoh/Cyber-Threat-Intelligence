<script lang="ts">
  import { Popover } from 'carbon-components-svelte';
  import type { SvelteComponent } from 'svelte';
  import TableFilterMenu from './TableFilterMenu.svelte';

  export let icon: typeof SvelteComponent<any> = undefined;
  export let title = '';

  let open = false;
</script>

<li
  class="flex relative items-center text-left border-0 px-2 py-2 cursor-pointer hover:bg-ctip-selected"
  on:mouseover={() => (open = true)}
  on:mouseleave={() => (open = false)}
  on:focus={() => (open = true)}
>
  <div data-outline>
    <div class="w-full">
      <svelte:component this={icon} />
      <span class="ml-2">{title}</span>
    </div>
    <Popover {open} align="right-top" class="-ml-2">
      <ul>
        <slot>
          <TableFilterMenu>Example</TableFilterMenu>
        </slot>
      </ul>
    </Popover>
  </div>
</li>
