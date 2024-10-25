<script lang="ts">
  import externalLinkStore from '$stores/externalLink';
  import { Button, ComposedModal, ModalBody, ModalFooter, ModalHeader } from 'carbon-components-svelte';

  let open = false;
  $: if ($externalLinkStore) {
    open = true;
  }

  function close() {
    open = false;
  }
  function onClose() {
    setTimeout(() => externalLinkStore.set(null), 300);
  }
</script>

<ComposedModal bind:open on:close={onClose}>
  <ModalHeader title="External link warning" />
  <ModalBody>
    <p>You are trying to open an external link. Are you sure you want to continue?</p>
    <pre class="border-[1px] border-solid p-4 text-ctip-text">{$externalLinkStore}</pre>
  </ModalBody>
  <ModalFooter>
    <Button on:click={close} kind="secondary">Go back</Button>
    <Button on:click={close} target="_blank" rel="noreferrer noopener" href={$externalLinkStore} kind="primary">
      Continue
    </Button>
  </ModalFooter>
</ComposedModal>
