<script lang="ts">
  import { Tag } from 'carbon-components-svelte';
  import type { TagProps } from 'carbon-components-svelte/types/Tag/Tag.svelte';

  export let score: string | number;
  export let size: TagProps['size'] = 'default'

  $: color = getColor(score);

  function getColor(num: string | number) {
    if (+num >= 7) return 'bg-ctip-dangerThreat';
    if (+num >= 4) return 'bg-ctip-warning dark:!text-black';
    return 'bg-ctip-success dark:!text-black';
  }
</script>

<Tag {size} class="text-white font-bold whitespace-nowrap {color}">{score}</Tag>
