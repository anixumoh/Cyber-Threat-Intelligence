<script>
  export let title = 'star';
  export let filled = false;
  export let fillAndStroke = false;
</script>

<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="100%"
  height="10"
  viewBox="0 0 51 48"
  class="h-5 mr-1 stroke-[4px]"
  on:mouseover
  on:mouseleave
  on:click
  let:class
>
  <title>{title}</title>
  <path
    class:filled
    class:fill-and-stroke={!filled && fillAndStroke}
    class="starPath"
    d="m25,1 6,17h18l-14,11 5,17-15-10-15,10 5-17-14-11h18z"
  />
</svg>

<style>
  .starPath {
    fill: none;
    stroke: var(--ctip-gray);
  }
  .filled {
    fill: var(--ctip-warningStar);
    stroke: var(--ctip-warningStar);
  }

  .fill-and-stroke {
    fill: none;
    stroke: var(--ctip-warningStar);
  }
</style>
