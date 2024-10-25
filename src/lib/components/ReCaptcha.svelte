<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';

  const RECAPTCHA_PUBLIC_KEY = '6LcKOkEUAAAAADiJBok6-IAqGQ8BvwyqmU6hnqG3';

  let mounted = false;
  let placeholder: HTMLDivElement;

  const dispatch = createEventDispatcher();

  onMount(() => {
    window['recaptchaLoaded'] = recaptchaLoaded;
    mounted = true;
    return () => {
      delete window['recaptchaLoaded'];
    };
  });

  function onSolve(token: string) {
    dispatch('solve');
  }

  function recaptchaLoaded() {
    window.grecaptcha.render(placeholder, { sitekey: RECAPTCHA_PUBLIC_KEY, callback: onSolve });
  }
</script>

<svelte:head>
  {#if mounted}
    <script src="https://www.google.com/recaptcha/api.js?render=explicit&onload=recaptchaLoaded&hl=en"></script>
  {/if}
</svelte:head>

<div id="catcha-placeholder" bind:this={placeholder} />
