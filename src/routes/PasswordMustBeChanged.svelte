<script lang="ts">
  import { ComposedModal, ModalBody } from 'carbon-components-svelte';
  import { tick } from 'svelte';
  import ChangePassword from './profile/account/ChangePassword.svelte';

  let open = true;
  let changed = false;

  async function preventClose() {
    if (changed) return;
    open = false;
    await tick();
    open = true;
  }

  function onPasswordChanged() {
    changed = true;
    open = false;
  }
</script>

<ComposedModal
  class="sm:[&>div]:absolute sm:[&>div]:top-[10%]"
  on:close={preventClose}
  size="sm"
  preventCloseOnClickOutside
  bind:open
>
  <ModalBody class="px-4" hasForm>
    <h4>You have to change your password to continue your session.</h4>

    <div class="p-4">
      <div class="mt-8">
        <ChangePassword on:changed={onPasswordChanged} />
      </div>
    </div>
  </ModalBody>
</ComposedModal>
