<script lang="ts">
  export let isEnabled = false;
  export let disabled = false;
</script>

<button
  {disabled}
  class="circle-status aspect-square rounded-full border-2 border-solid border-ctip-grayThreat w-5 h-5 z-20"
  class:bg-ctip-success={isEnabled}
  class:bg-ctip-dangerThreat={!isEnabled}
  on:click
  on:keypress
  {...$$restProps}
/>
