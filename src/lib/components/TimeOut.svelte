<script lang="ts">
  import axios from 'axios';
  import { Loading, Tile } from 'carbon-components-svelte';
  import { onMount } from 'svelte';

  const checkTimeoutMs = 10_000;
  let tries = 0;
  let nextPoll = 5;
  let timeout;
  let trying = false;

  onMount(() => {
    timeout = setTimeout(poll, 1000);
    return () => clearTimeout(timeout);
  });

  async function check() {
    const url = '/api/v2/health_check';
    try {
      trying = true;
      await axios.get(url, { timeout: checkTimeoutMs });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error?.response?.status;
        if (status === 401 || status === 404) {
          window.location.href = '/login';
        }
      }
      return false;
    } finally {
      trying = false;
    }
    return true;
  }

  async function poll() {
    nextPoll--;
    if (nextPoll === 0) {
      const success = await check();
      tries++;
      if (success) {
        window.location.reload();
        return;
      } else {
        nextPoll = Math.min(tries * 5, 60);
      }
    }
    setTimeout(poll, 1000);
  }
</script>

<main class="login flex h-screen" class:mantenimiento={localStorage?.getItem('TOKEN')}>
  <div class="w-[450px] mx-auto mt-52">
    <Tile class="p-6 rounded">
      <div class="mt-4">
        {#if localStorage?.getItem('TOKEN')}
          <h3>Ops! Something it's wrong</h3>
          <h1>Maintenance Web</h1>
          <h5>
            We apologise for the inconvenience. This area is undergoing maintenance. It will be available again soon
          </h5>
        {:else}
          <h1>Could not reach server</h1>
          <h4 class="mt-4">Please try again later. If the problem persists, please contact the administrator.</h4>

          <div class="mt-4">
            <div class="flex">
              {#if trying}
                Trying
                <div class="ml-2">
                  <Loading withOverlay={false} small />
                </div>
              {:else}
                Next try in: {nextPoll}
              {/if}
            </div>
          </div>
        {/if}
      </div>
    </Tile>
  </div>
</main>

<style>
  main {
    background: url('/assets/bglogin2.jpg') no-repeat center center fixed;
    background-size: cover;
  }
  .mantenimiento {
    background: url('/assets/404.jpg') no-repeat center center fixed;
    background-size: cover;
  }
</style>
