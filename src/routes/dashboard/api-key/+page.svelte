<script lang="ts">
  import { goto } from '$app/navigation';
  import Client from '$lib/client';
  import type { ApiKey } from '$lib/client/services/keys';
  import WarningModal from '$lib/components/CommonModal/WarningModal/WarningModal.svelte';
  import { getHumanReadableDate } from '$lib/utils/functions';
  import notifications from '$stores/notification';
  import roleStore from '$stores/role';
  import userStore from '$stores/user';
  import {
    Button,
    ButtonSkeleton,
    DatePicker,
    DatePickerInput,
    InlineLoading,
    InlineNotification,
    Modal,
    PasswordInput,
    SkeletonPlaceholder,
    TextInput,
    Tile
  } from 'carbon-components-svelte';
  import { Add, Copy, Save, TrashCan } from 'carbon-icons-svelte';
  import clipboardCopy from 'clipboard-copy';
  import dayjs from 'dayjs';
  import { onMount } from 'svelte';

  onMount(() => {
    if (!($roleStore.superadmin || $roleStore.master || $roleStore.admin || $roleStore.analyst)) {
      return goto('/');
    }
  });

  const client = new Client();

  let loading = false;
  let apiKey: ApiKey;
  let creatingApiKey = false;
  let confirmationModalOpen = false;
  let open = false;

  let expirationDate = '';
  let expirationDateChanged = false;
  let savingExpirationDate = false;
  let deleteApiKeyModalOpen = false;
  let deletingApiKey = false;

  $: getApiKey();

  async function getApiKey() {
    loading = true;
    try {
      apiKey = await client.keys.getApiKey($userStore.id);
      expirationDate = dayjs(apiKey.expirationDate).format('DD/MM/YYYY');
    } finally {
      loading = false;
    }
  }

  function openConfirmation() {
    confirmationModalOpen = true;
  }

  async function recreateApiKey() {
    await deleteApiKey();
    await createApiKey();
  }

  async function createApiKey() {
    creatingApiKey = true;

    try {
      apiKey = await client.keys.createApiKey();
      expirationDate = dayjs(apiKey.expirationDate).format('DD/MM/YYYY');
      confirmationModalOpen = false;
      open = true;
    } catch (error) {
      notifications.notify({
        kind: 'error',
        title: 'Error',
        subtitle: 'Some error has ocurred generating the API Key'
      });
    } finally {
      creatingApiKey = false;
    }
  }

  async function saveExpirationDate() {
    savingExpirationDate = true;

    try {
      await client.keys.modifyApiKey($userStore.id, { userId: apiKey.userId, expirationDate: apiKey.expirationDate });
      notifications.notify({ title: 'Expiration date updated', kind: 'success' });
    } catch (error) {
      notifications.notify({
        kind: 'error',
        title: 'Error',
        subtitle: 'Some error has ocurred updating expiration date'
      });
    } finally {
      savingExpirationDate = false;
      expirationDateChanged = false;
    }
  }

  async function deleteApiKey() {
    deletingApiKey = true;
    try {
      await client.keys.revokeApiKey($userStore.id);
      apiKey = undefined;
    } catch (error) {
      notifications.notify({
        kind: 'error',
        title: 'Error',
        subtitle: 'Some error has ocurred deleting the API Key'
      });
    } finally {
      deletingApiKey = false;
      deleteApiKeyModalOpen = false;
    }
  }
</script>

<h4>API Keys</h4>
<h6>Manage your API keys</h6>

{#if loading}
  <SkeletonPlaceholder class="h-16 w-full" />
  <ButtonSkeleton class="mt-2" />
{:else}
  <Tile>
    {#if apiKey}
      <div class="w-fit flex flex-col gap-2">
        <div>
          <TextInput labelText="Created at" value={getHumanReadableDate(apiKey.creationDate)} readonly />
        </div>

        <div class="flex gap-1">
          <DatePicker
            on:change={(e) => {
              const date = e?.detail?.selectedDates?.[0];
              if (date) {
                expirationDateChanged = true;
                apiKey.expirationDate = dayjs(date).valueOf();
              }
            }}
            dateFormat="d/m/Y"
            datePickerType="single"
            readonly
            bind:value={expirationDate}
          >
            <DatePickerInput labelText="Expiration date" placeholder="dd/mm/yy" readonly />
          </DatePicker>
          {#if expirationDateChanged}
            <Button
              disabled={savingExpirationDate}
              on:click={saveExpirationDate}
              class="w-fit px-3 ml-1 mt-auto"
              kind="primary"
              icon={savingExpirationDate ? InlineLoading : Save}
              iconDescription="Update expiration date"
            />
          {/if}
        </div>
      </div>
    {:else}
      <span class="py-4"> No API keys yet </span>
    {/if}
  </Tile>

  <Button
    disabled={creatingApiKey}
    class="mt-2"
    icon={creatingApiKey ? InlineLoading : Add}
    on:click={apiKey ? openConfirmation : createApiKey}
  >
    {#if apiKey}
      Recreate an API key
    {:else}
      Create a new API key
    {/if}
  </Button>

  {#if apiKey}
    <Button kind="danger" class="mt-2" icon={TrashCan} on:click={() => (deleteApiKeyModalOpen = true)}>
      Delete API key
    </Button>
  {/if}
{/if}

<WarningModal
  bind:open={confirmationModalOpen}
  modalHeading="Regenerate API key"
  question="Are you sure you want to regenerate the API key?"
  secondMessage="Your previous API key will be removed, this action cannot be undone."
  on:submit={recreateApiKey}
  on:closeModal={() => (confirmationModalOpen = false)}
  primaryButtonDisabled={creatingApiKey}
  primaryButtonIcon={creatingApiKey ? InlineLoading : undefined}
/>

<WarningModal
  bind:open={deleteApiKeyModalOpen}
  modalHeading="Delete API key"
  question="Are you sure you want to delete the API key?"
  secondMessage="This action cannot be undone."
  on:submit={deleteApiKey}
  on:closeModal={() => (deleteApiKeyModalOpen = false)}
  primaryButtonDisabled={deletingApiKey}
  primaryButtonIcon={deletingApiKey ? InlineLoading : undefined}
/>

<Modal
  modalHeading="API key succefully created"
  bind:open
  secondaryButtonText="Close"
  primaryButtonText="Copy"
  primaryButtonIcon={Copy}
  preventCloseOnClickOutside
  on:click:button--secondary={() => (open = false)}
  on:click:button--primary={() => clipboardCopy(apiKey?.apiKey)}
>
  <div class="p-5">
    <PasswordInput value={apiKey?.apiKey} readonly hidePasswordLabel="Hide API key" showPasswordLabel="Show API key" />
    <InlineNotification kind="info" class="mt-2" hideCloseButton>
      This is your unique API key and it is not recoverable. If you lose this API key, you will have to create a new
      one.
    </InlineNotification>
  </div>
</Modal>
