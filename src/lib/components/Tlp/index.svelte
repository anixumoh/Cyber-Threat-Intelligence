<script lang="ts">
  import type { TlpType } from '$lib/types';
  import { createEventDispatcher } from 'svelte';
  import clickOutside from '$lib/actions/clickOutside';
  import { COLORS } from '$lib/constants/colors';
  import { Popover } from 'carbon-components-svelte';

  const { grayThreat, greenThreat, amberThreat, dangerThreat } = COLORS;
  const dispatch = createEventDispatcher<{ setTlp: { status: TlpType } }>();
  const COLOR_MAP: Record<TlpType, string> = {
    WHITE: grayThreat,
    GREEN: greenThreat,
    AMBER: amberThreat,
    RED: dangerThreat
  };
  const TLP: TlpType[] = ['WHITE', 'GREEN', 'AMBER', 'RED'];

  let tlpVisible = false;

  export let status: TlpType;
  export let readonly = false;

  function showTlp(event) {
    event.stopImmediatePropagation();
    tlpVisible = !tlpVisible;
  }

  function updateStatus(e: Event, newStatus: TlpType) {
    e.stopImmediatePropagation();
    tlpVisible = false;
    status = newStatus;
    dispatch('setTlp', { status: newStatus });
  }
</script>

<div
  class="relative flex items-center justify-center"
  data-outline
  use:clickOutside
  on:clickOutside={() => (tlpVisible = false)}
>
  <div
    class="w-5 h-5 border-2 border-solid rounded-full cursor-pointer aspect-square border-ctip-grayThreat bg-[var(--tlp-color,#bdbdbd)]"
    style="--tlp-color: {COLOR_MAP[status]}"
    on:click={(event) => !readonly && showTlp(event)}
  />
  <Popover open={tlpVisible} align="left">
    <ul class="flex flex-col justify-center">
      {#each TLP as tlp}
        <li class="px-2 py-1 border-0" on:click={($event) => updateStatus($event, tlp)}>
          <div
            class="rounded-full cursor-pointer w-[0.9375em] h-[0.9375em] bg-[var(--tlp-color)]"
            style="--tlp-color: {COLOR_MAP[tlp]}"
          />
        </li>
      {/each}
    </ul>
  </Popover>
</div>
