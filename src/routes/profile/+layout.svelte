<script>
  import { page } from '$app/stores';
  import userStore from '$stores/user';
  import { Button } from 'carbon-components-svelte';
</script>

<div class="flex justify-end mt-2">
  <Button href="/dashboard">Back to dashboard</Button>
</div>

<div class="flex flex-col mt-12 text-center">
  <div class="mx-auto">
    <span class="flex items-center justify-center text-2xl font-bold text-white rounded-full w-14 h-14 bg-ctip-primary">
      {$userStore?.username[0]?.toLocaleUpperCase() || 'U'}
    </span>
  </div>

  <h2 data-test="profileName">Welcome, {$userStore?.name}</h2>
  {#if $page.url.pathname === '/profile/account'}
    <p>Manage your account information and security.</p>
  {:else}
    <p>Set your global preferences, such as your timezone or default landing page.</p>
  {/if}
</div>

<slot />
