<script lang="ts">
  import type { InformType } from '$lib/types';
  import { WarningFilled } from 'carbon-icons-svelte';

  export let status: InformType;
  export let text = '';
  export let index = null;

  function itemStatusClass(inform: InformType) {
    switch (inform) {
      case 'NOT_IMPORTANT':
        return 'info-dark';
      case 'POSITIVE':
        return 'info-success';
      case 'INFORMATIVE':
        return 'info-primary';
      case 'NEGATIVE':
        return 'info-danger';
    }
  }
</script>

<li
  data-test={'NOT_IMPORTANT' + index}
  class="flex items-center text-left border-0 px-2 py-2 cursor-pointer hover:bg-ctip-selected {itemStatusClass(status)}"
  on:click
>
  <WarningFilled class="mr-2" />
  <span>{text.toUpperCase()}</span>
</li>

<style>
  :global(.dark .info-dark svg),
  :global(.dark .info-dark) {
    fill: white !important;
    color: white !important;
  }
  :global(.dark .info-dark svg):hover,
  :global(.dark .info-dark):hover {
    fill: gray !important;
    color: gray !important;
  }
  :global(.info-dark svg),
  .info-dark {
    fill: var(--ctip-darkThreat) !important;
    color: var(--ctip-darkThreat);
  }

  :global(.info-success svg),
  .info-success {
    fill: var(--ctip-successThreat) !important;
    color: var(--ctip-successThreat);
  }

  :global(.info-primary svg),
  .info-primary {
    fill: var(--ctip-primary) !important;
    color: var(--ctip-primary);
  }

  :global(.info-danger svg),
  .info-danger {
    fill: var(--ctip-dangerThreat) !important;
    color: var(--ctip-dangerThreat);
  }
</style>
