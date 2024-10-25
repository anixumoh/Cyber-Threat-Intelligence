<script lang="ts">
  import CommonModal from '$lib/components/CommonModal/CommonModal.svelte';
  import { WarningAltFilled } from 'carbon-icons-svelte';
  import type { SvelteComponent } from 'svelte';

  let className = '';

  export let open = false;
  export let modalHeading = 'Warning';
  export let question = 'Are you sure?';
  export let secondMessage = '';
  export let primaryButtonText = 'Yes';
  export let secondaryButtonText = 'Cancel';
  export let passiveModal = false;
  export let shouldSubmitOnEnter = true;
  export let primaryButtonDisabled = false;
  export let primaryButtonIcon: typeof SvelteComponent<any> = null;
  export { className as class };
</script>

<CommonModal
  bind:open
  {modalHeading}
  {primaryButtonText}
  {secondaryButtonText}
  {passiveModal}
  {shouldSubmitOnEnter}
  {primaryButtonDisabled}
  {primaryButtonIcon}
  class={className ?? 'z-20'}
  on:submit
  on:closeModal
>
  <div class="flex justify-evenly items-center warning-icon">
    <WarningAltFilled class="w-10 h-10 fill-ctip-warningIcon" />
    <div class="w-[490px]">
      <p class="pr-0 font-bold">{question}</p>
      {#if secondMessage}
        <p class="pr-0">{@html secondMessage}</p>
      {/if}
    </div>
  </div>
</CommonModal>
