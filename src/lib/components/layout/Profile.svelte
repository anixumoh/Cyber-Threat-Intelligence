<script lang="ts">
  import clickOutside from '$lib/actions/clickOutside';
  import logout from '$lib/utils/logout';
  import userStore from '$stores/user';
  import { Button, Tile } from 'carbon-components-svelte';
  import { Edit, Exit, Screen } from 'carbon-icons-svelte';

  export let open = false;

  async function doLogout() {
    logout();
    open = false;
  }

  function close() {
    open = false;
  }
</script>

{#if open}
  <div class="fixed top-0 left-0 z-30 w-screen h-screen bg-black/80">
    <Tile class="fixed right-0 p-0 top-14">
      <div class="flex flex-col items-center py-8 text-center border-t-2 w-80" use:clickOutside on:clickOutside={close}>
        <div>
          <span
            class="flex items-center justify-center text-xl font-bold border-2 border-solid rounded-full w-14 h-14 text-ctip-primary dark:text-white dark:border-ctip-primary dark:bg-ctip-primary"
          >
            {$userStore?.username[0]?.toLocaleUpperCase() || 'U'}
          </span>
        </div>

        <div class="my-2 text-base">
          <div>{$userStore?.name}</div>
          <div>{$userStore?.email}</div>
        </div>

        <div class="py-3 border-b border-gray-300 border-solid w-72">
          <Button
            data-test="accountSettings"
            href="/profile/account"
            on:click={close}
            class="w-48"
            size="field"
            icon={Edit}
            kind="tertiary"
          >
            Account settings
          </Button>
        </div>

        <div class="py-3 border-b border-gray-300 border-solid w-72">
          <Button
            href="/profile/personalization"
            on:click={close}
            class="w-48"
            size="field"
            icon={Screen}
            kind="tertiary"
          >
            Personalization
          </Button>
        </div>

        <div class="pt-3">
          <Button class="w-48" size="field" icon={Exit} kind="danger-tertiary" on:click={doLogout}>Logout</Button>
        </div>
      </div>
    </Tile>
  </div>
{/if}
