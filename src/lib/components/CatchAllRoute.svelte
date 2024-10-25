<script lang="ts">
  import NotFound from '$lib/components/NotFound.svelte';
  import { onDestroy } from 'svelte';
  import { showAngular, showSvelte } from '$lib/utils/angularCommunication';
  import { navigating } from '$app/stores';
  import angular404 from '$stores/angular404';
  import { browser } from '$app/environment';
  import { InlineLoading } from 'carbon-components-svelte';

  onDestroy(() => {
    browser && showSvelte();
  });

  let angularStillLoading = false;
  let setAngularLoadingTimeout: ReturnType<typeof setTimeout>;

  $: browser && handleWhatToShow($angular404);

  async function handleWhatToShow(angular404: boolean) {
    angularStillLoading = false;
    clearTimeout(setAngularLoadingTimeout);
    if (angular404) {
      return showSvelte();
    }

    setAngularLoadingTimeout = setTimeout(() => {
      angularStillLoading = true;
    }, 100);
    await showAngular();
    clearTimeout(setAngularLoadingTimeout);
    angularStillLoading = false;
  }
</script>

&nbsp;

{#if $navigating === null && $angular404}
  <NotFound />
{:else if angularStillLoading}
  <InlineLoading class="flex items-center justify-center mt-20" />
{/if}
