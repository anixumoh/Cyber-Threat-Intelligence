<script lang="ts">
  import InfoCard from './InfoCard.svelte';

  export let title = 'title';
</script>

<InfoCard {title} withBorderBottom={false}>
  <svelte:fragment slot="action">
    <slot name="action" />
  </svelte:fragment>
  <slot />
</InfoCard>
<div
  class="border bg-ctip-ui text-ctip-text !border-t-0 rounded-b-md p-2 flex justify-end w-full"
>
  <slot name="actions-form" />
</div>
