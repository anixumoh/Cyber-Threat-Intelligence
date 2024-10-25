<script lang="ts">
  import type User from '$lib/types/user';
  import Client from '$lib/client';
  import userStore from '$stores/user';
  import { Button, FormGroup, InlineLoading, TextInput } from 'carbon-components-svelte';
  import { Close, Edit, Save } from 'carbon-icons-svelte';
  import { onMount } from 'svelte';

  onMount(() => {
    name = $userStore?.name;
  });

  const client = new Client();

  let name = '';
  let editName = false;
  let savingName = false;

  async function saveName() {
    editName = false;
    savingName = true;
    const user: User = {
      ...$userStore,
      name
    };
    await client.user.editUser($userStore.id, user);
    $userStore.name = name;
    savingName = false;
  }
  function cancelName() {
    editName = false;
    name = $userStore.name;
  }
</script>

<FormGroup class="w-full flex">
  <TextInput labelText="Name" name="name" bind:value={name} disabled={!editName} />
  {#if editName}
    <Button
      size="small"
      data-test="saveNameButton"
      class="h-10 mt-6"
      icon={Save}
      iconDescription="Save"
      kind="ghost"
      on:click={saveName}
    />
    <Button
      --cds-icon-01="var(--ctip-danger)"
      size="small"
      class="h-10 mt-6"
      icon={Close}
      iconDescription="Close"
      kind="ghost"
      on:click={cancelName}
    />
  {:else}
    <Button
      data-test="editNameButton"
      size="small"
      class="h-10 mt-6"
      icon={savingName ? InlineLoading : Edit}
      disabled={savingName}
      iconDescription="Edit"
      kind="ghost"
      on:click={() => (editName = !editName)}
    />
  {/if}
</FormGroup>

<FormGroup class="w-full">
  <TextInput labelText="Username" readonly value={$userStore?.username} />
</FormGroup>

<FormGroup class="w-full">
  <TextInput labelText="Email" readonly value={$userStore?.email} />
</FormGroup>
