<script lang="ts">
  import type { MenuItem } from '$src/routes/admin/types';
  import { page } from '$app/stores';
  import menuExpandedStore from '$stores/menuExpanded';
  import { Button, Modal, SkeletonPlaceholder, Tile } from 'carbon-components-svelte';
  import { Branch } from 'carbon-icons-svelte';
  import Client from '$lib/client';
  import darkMode from '$stores/darkMode';
  import { environment } from '$lib/environments/environment.prod';
  import roleStore from '$stores/role';

  export let menuItems: MenuItem[] = [];
  let versionModalOpen = false;
  let versionOpened = false;

  const client = new Client();

  function openVersion() {
    versionOpened = true;
    versionModalOpen = true;
  }
</script>

<nav
  id="admin-menu"
  class:overflow-y-auto={$menuExpandedStore}
  class="fixed custom-scrollbar top-14 left-0 flex flex-col h-[calc(100vh-56px)] bg-ctip-ui [&_svg]:w-5 [&_svg]:h-5"
>
  {#each menuItems as item}
    {#if item.canAccess()}
      {@const active = $page.url.pathname.startsWith(item.href)}
      <div
        class="border-l-4 border-solid border-transparent
        hover:border-ctip-interactive
        hover:text-ctip-hover-interactive
        [&_*]:hover:fill-ctip-interactive
        {active ? 'bg-ctip-hover-ui !border-ctip-interactive' : '[&_*]:fill-ctip-text'}
        "
      >
        {#if $menuExpandedStore}
          <Button class="w-full text-ctip-text hover:text-ctip-hover-interactive" href={item.href} kind="ghost">
            <div class="flex gap-4" class:text-ctip-interactive={active}>
              <svelte:component this={item.icon} class="-ml-[1px]" />
              {item.name}
            </div>
          </Button>
        {:else}
          <Button href={item.href} kind="ghost" icon={item.icon} iconDescription={item.name} tooltipPosition="right" />
        {/if}
      </div>
    {/if}
  {/each}

  {#if $roleStore.master || $roleStore.superadmin}
    <div class="pt-6 pb-2 mx-auto mt-auto">
      {#if $menuExpandedStore}
        <Button on:click={openVersion} data-test="version-button" size="small" class="px-24 rounded" kind="tertiary">
          Version
        </Button>
      {:else}
        <Button
          on:click={openVersion}
          data-test="version-button"
          kind="ghost"
          icon={Branch}
          iconDescription="Version"
          tooltipPosition="right"
        />
      {/if}
    </div>
  {/if}
</nav>

<Modal
  class="[&>div]:max-h-full"
  size="xs"
  primaryButtonText="Close"
  bind:open={versionModalOpen}
  modalHeading="Version info"
  on:click:button--primary={() => (versionModalOpen = false)}
>
  {#if versionOpened}
    <div class="grid gap-10 p-4">
      <div class="flex justify-center mx-auto">
        {#if $darkMode}
          <img width="160px" height="50px" alt="blueliv" src="assets/brand/logotype_blueliv_white.svg" />
        {:else}
          <img width="160px" height="50px" alt="blueliv" src="assets/brand/logotype_blueliv.svg" />
        {/if}
      </div>

      <div class="text-base">
        <h4>Frontend</h4>
        <Tile light class="grid gap-2">
          <div>
            <span>Version:</span>
            <span data-test="version">{environment.version}</span>
          </div>
          <div>
            <span>Date:</span>
            <span>{window?.__env?.deployDate}</span>
          </div>
          <div>
            <span>Branch:</span>
            <span>{environment.branch}</span>
          </div>
        </Tile>
      </div>

      <div class="text-base">
        <h4>Backend</h4>
        {#await client.admin.getVersion()}
          <SkeletonPlaceholder class="w-full h-[120px]" />
        {:then version}
          <Tile light class="grid gap-2">
            <div>
              <span>Version:</span>
              <span>{version.version}</span>
            </div>
            <div>
              <span>Date:</span>
              <span>{version.buildDate}</span>
            </div>
            <div>
              <span>Branch:</span>
              <span>{version.branch}</span>
            </div>
          </Tile>
        {/await}
      </div>
    </div>
  {/if}
</Modal>
