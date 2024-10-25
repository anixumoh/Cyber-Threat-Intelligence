<script lang="ts">
  import InfoCard from '$lib/components/Card/InfoCard.svelte';
  import { Toggle } from 'carbon-components-svelte';

  type TransformadaType = {
    name: string;
    checked: boolean;
  };

  export let sources: TransformadaType[] = [];
  export let disabled = false;
</script>

<InfoCard title="NAME">
  <ul class="h-80 overflow-y-scroll w-full">
    {#each sources as source}
      <li
        class="hover:bg-ctip-light hover:text-ctip-primary border-0 py-0 px-3"
        class:pointer-events-none={disabled}
        class:opacity-50={disabled}
      >
        <div class="flex justify-between items-center m-0 relative">
          <span>{source.name}</span>
          <span><Toggle labelA="" labelB="" bind:toggled={source.checked} size="sm" /></span>
        </div>
      </li>
    {/each}
  </ul>
</InfoCard>
