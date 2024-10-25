<script lang="ts">
  import { Tile } from 'carbon-components-svelte';
  import { onMount } from 'svelte';
  import { assets } from '$stores/darkMode';

  let logoHeight = '60';
  onMount(() => {
    const origin = window.__env.origin;
    if (origin === 'https://tclayer8.blueliv.com') {
      logoHeight = '32';
    }
  });
</script>

<main class="flex h-screen login">
  <div class="w-[450px] mx-auto mt-52">
    <Tile class="p-6 rounded">
      {#if $assets.logo}
        <img class:bg-white={$assets.noDarkLogo} src={$assets.logo} alt="Brand logo" class="mb-8" height={logoHeight} />
      {/if}
      <slot />
    </Tile>
  </div>
</main>

<style>
  main {
    background: url('/assets/bglogin2.jpg') no-repeat center center fixed;
    background-size: cover;
  }
</style>
