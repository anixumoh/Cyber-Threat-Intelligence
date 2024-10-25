<script lang="ts">
  import type { ModalType } from '$lib/types';
  import { Modal } from 'carbon-components-svelte';
  import { createEventDispatcher, type SvelteComponent } from 'svelte';

  const dispatch = createEventDispatcher();

  export { className as class };
  export let open = false;
  export let modalHeading = 'Title';
  export let primaryButtonText = 'Ok';
  export let secondaryButtonText = 'Cancel';
  export let primaryButtonDisabled = false;
  export let passiveModal = false;
  export let shouldSubmitOnEnter = true;
  export let primaryButtonIcon: typeof SvelteComponent = null;
  export let size: ModalType = undefined;

  let className = '';

  function toggleModal() {
    dispatch('closeModal');
  }
</script>

<Modal
  bind:open
  {passiveModal}
  {shouldSubmitOnEnter}
  {primaryButtonDisabled}
  {modalHeading}
  {primaryButtonText}
  {secondaryButtonText}
  {primaryButtonIcon}
  {size}
  on:click:button--secondary={toggleModal}
  on:close={toggleModal}
  on:submit
  class={`${className} modal-external-link`}
>
  <slot />
</Modal>

<style>
  :global(.light .modal-external-link > div) {
    background-color: var(--ctip-light);
  }
</style>
