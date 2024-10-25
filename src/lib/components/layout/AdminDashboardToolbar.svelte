<script lang="ts">
  import { Button } from 'carbon-components-svelte';
  import { onMount } from 'svelte';
  import userStore from '$stores/user';
  import { currentOrganizationId } from '$stores/organization';
  import { assets } from '$stores/darkMode';
  import Profile from './Profile.svelte';
  import { Menu } from 'carbon-icons-svelte';
  import menuExpandedStore from '$stores/menuExpanded';

  let profileOpen = false;
  let logoHeight = '36';

  onMount(() => {
    const origin = window.__env.origin;
    if (origin === 'https://tclayer8.blueliv.com') {
      logoHeight = '26';
    } else if (origin === 'https://dt.doh.gov.ae') {
      logoHeight = '45';
    }
  });

  $: backUrl = $currentOrganizationId ? `/dashboard/organizations/${$currentOrganizationId}/summary` : '/dashboard';
</script>

<nav
  id="header"
  class="fixed flex top-0 z-50 items-center content-between justify-between w-full bg-neutral-700 !shadow-sm h-14"
>
  <div class="flex justify-between h-full">
    <Button
      class="flex items-center justify-center hover:bg-neutral-500 w-14"
      kind="ghost"
      on:click={menuExpandedStore.toggle}
    >
      <Menu class="fill-white" />
    </Button>

    <div class="h-full px-3 py-2.5 flex items-center">
      <a target="_blank" href="https://outpost24.com/products/cyber-threat-intelligence" rel="noreferrer">
        {#if $assets.logo}
          <img
            class:bg-white={$assets.noDarkLogo}
            src={$assets.darkLogo}
            alt="Brand logo"
            height={logoHeight}
            class="max-w-[160px]"
          />
        {/if}
      </a>
    </div>
  </div>

  <div class="flex justify-between h-full">
    <div class="py-2" data-test="top-navbar-items">
      <Button class="text-white hover:bg-neutral-500" kind="ghost" size="field" href={backUrl}>
        Back to Threat Compass
      </Button>
    </div>

    <div class="h-full" data-test="top-navbar-items">
      <Button data-test="profile" kind="ghost" class="h-full" on:click={() => (profileOpen = !profileOpen)}>
        <span
          class="flex items-center justify-center w-10 h-10 text-xl font-bold text-white rounded-full bg-ctip-primary"
        >
          {$userStore?.username[0]?.toLocaleUpperCase() || 'U'}
        </span>
      </Button>
    </div>
  </div>
</nav>

<Profile bind:open={profileOpen} />
