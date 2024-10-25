<script lang="ts">
  import Client from '$lib/client';
  import GenericButton from '$lib/components/Buttons/GenericButton.svelte';
  import WarningModal from '$lib/components/CommonModal/WarningModal/WarningModal.svelte';
  import type Module from '$lib/types/module';
  import { currentModule } from '$stores/module';
  import notifications from '$stores/notification';
  import { currentOrganizationId } from '$stores/organization';
  import roleStore from '$stores/role';
  import {
    Button,
    Checkbox,
    FormGroup,
    InlineLoading,
    Modal,
    SkeletonPlaceholder,
    TextInput,
    TextInputSkeleton,
    TooltipIcon
  } from 'carbon-components-svelte';
  import { Add, AddFilled, Edit, HelpFilled, TrashCan } from 'carbon-icons-svelte';
  import { onDestroy } from 'svelte';
  import { handleServerError } from './common';
  import ParameterBase from './ParameterBase.svelte';

  export let apiPath: string;
  export let placeholder: string;
  export let title: string;
  export let noItemsMessage: string;

  const client = new Client();
  onDestroy(() => client.abort());

  type BankItem = {
    id: number;
    value: string;
    bincodes: string[];
  };
  type BankSettingsResponse = {
    type: string;
    values: BankItem[];
  };

  type BankSettingsSavePaylad = {
    type: string;
    values: {
      value: string;
      bincodes: string[];
    }[];
  };

  let items: BankItem[] = [];
  let loading = false;
  let addExpanded = false;
  let itemsToDelete: BankItem[] = [];
  let isSaving = false;
  let isDeleting = false;

  // BinCodes modal form
  let isEdit = false;
  let changeName = false;
  let bankModalOpen = false;
  let bankModalLoading = false;
  let originalBankName = '';
  let bankName = '';
  let bincode = '';
  let bincodes: string[] = [];
  let selectedBincodesToDelete: string[] = [];

  $: getItems($currentOrganizationId, $currentModule, apiPath);
  $: validBincodes = validateBincodes(bincode);

  async function getItems(organizationId: number, module: Module, apiPath: string) {
    loading = true;
    const response = await client.modules.getModuleSettings<BankSettingsResponse>(organizationId, module, apiPath);
    items = response.values;
    loading = false;
  }

  async function saveBank() {
    isSaving = true;
    const payload: BankSettingsSavePaylad = {
      type: apiPath.toUpperCase(),
      values: [{ value: bankName, bincodes }]
    };
    try {
      const response = await client.modules.setModuleSettings<BankSettingsSavePaylad>(
        $currentOrganizationId,
        $currentModule,
        payload
      );
      handleServerError(response);
    } catch (error) {
      handleServerError(error.response?.data);
    }

    try {
      if (changeName) {
        const item = items.find((it) => it.value === originalBankName);
        if (item) {
          await deleteSettings([item.value]);
        }
      }
    } catch (error) {}

    bankModalOpen = false;
    await getItems($currentOrganizationId, $currentModule, apiPath);
    isSaving = false;
  }

  function openAddBankModal() {
    bankModalOpen = true;
    changeName = false;
    isEdit = false;
    bankName = '';
    bincodes = [];
  }

  async function openAddBincodes(id: number) {
    bankModalOpen = true;
    bankModalLoading = true;
    changeName = false;
    const response = await client.modules.getModuleSettings<BankSettingsResponse>(
      $currentOrganizationId,
      $currentModule,
      apiPath
    );
    const item = response.values.find((item) => item.id === id);
    bankModalLoading = false;
    if (!item) {
      bankModalOpen = false;
      items = response.values;
      return;
    }
    isEdit = true;
    bankName = item.value;
    bincodes = item.bincodes;
  }

  function onDelete(event: CustomEvent<BankItem[]>) {
    itemsToDelete = event.detail;
  }

  async function deleteSettings(values: string[]) {
    const payload = {
      type: apiPath.toUpperCase(),
      values: values.map((value) => ({ value }))
    };
    await client.modules.deleteModuleSettings($currentOrganizationId, $currentModule, payload);
  }

  async function doDelete() {
    isDeleting = true;
    const deletedValues = itemsToDelete.map((item) => item.value);
    await deleteSettings(deletedValues);
    items = items.filter((item) => !deletedValues.includes(item.value));
    itemsToDelete = null;
    isDeleting = false;
  }

  function getDeleteQuestion(itemsToDelete: BankItem[]) {
    const isPlural = itemsToDelete?.length > 1;
    return `Are you sure you want to delete this ${isPlural ? 'banks' : 'bank'}?`;
  }

  function validateBincodes(input: string) {
    if (!input) return true;
    const match = /,/g;
    const replaced = input.replace(match, '');
    const regex = /^[0-9]+$/g;
    const correct = replaced.match(regex);
    return correct;
  }

  function addBincode() {
    const binCode = bincode.trim().split(',');
    const wrongBincodes = [];
    const rightBincodes = [];

    for (let i = 0; i < binCode.length; i++) {
      if (binCode[i].length !== 6 && binCode[i].length !== 8) {
        wrongBincodes.push(binCode[i]);
      } else {
        rightBincodes.push(binCode[i]);
      }
    }

    const duplicatedBincodes = [];
    rightBincodes.forEach((el) => {
      const indexBinCodes = bincodes.indexOf(el);
      if (indexBinCodes === -1) {
        bincodes = [el, ...bincodes];
      } else {
        duplicatedBincodes.push(el);
      }
    });

    if (duplicatedBincodes.length) {
      notifications.notify({
        kind: 'warning',
        title: 'Duplicated and not added',
        subtitle: duplicatedBincodes.join(', '),
        timeout: 0
      });
    }

    if (wrongBincodes.length > 0) {
      notifications.notify({
        kind: 'warning',
        title: 'Bincodes must be 6 or 8 digits length',
        subtitle: wrongBincodes.join(', '),
        timeout: 0
      });
    }

    bincode = '';
  }

  function deleteBincodes() {
    bincodes = bincodes.filter((bc) => !selectedBincodesToDelete.includes(bc));
    selectedBincodesToDelete = [];
  }
</script>

<ParameterBase
  bind:addExpanded
  on:delete={onDelete}
  {placeholder}
  {title}
  {items}
  {loading}
  {noItemsMessage}
  itemKey="id"
  itemValue="value"
>
  <svelte:fragment slot="after-title">
    {#if !($roleStore.customer || $roleStore.operator)}
      <GenericButton on:click={openAddBankModal} class="ml-2">
        <Add />
        <span class="pl-1">Add Bank</span>
      </GenericButton>
    {/if}
  </svelte:fragment>
  <svelte:fragment slot="item-actions" let:item>
    {#if !($roleStore.customer || $roleStore.operator)}
      <Button
        data-test="edit-item"
        kind="ghost"
        class="px-2 rounded"
        size="small"
        on:click={() => openAddBincodes(item.id)}
      >
        <AddFilled />
      </Button>
    {/if}
  </svelte:fragment>
</ParameterBase>

<WarningModal
  open={!!itemsToDelete?.length}
  modalHeading="Confirmation"
  question={getDeleteQuestion(itemsToDelete)}
  secondMessage="This action cannot be undone."
  primaryButtonDisabled={isDeleting}
  primaryButtonIcon={isDeleting ? InlineLoading : null}
  on:submit={doDelete}
  on:closeModal={() => (itemsToDelete = null)}
/>

<Modal
  class="sm:[&>div]:max-h-max sm:[&>div]:absolute sm:[&>div]:top-[10%]"
  bind:open={bankModalOpen}
  preventCloseOnClickOutside
  size="xs"
  modalHeading="BinCodes"
  primaryButtonText="Apply"
  secondaryButtonText="Cancel"
  primaryButtonDisabled={isSaving || bankModalLoading || !bankName || !bincodes.length}
  primaryButtonIcon={isSaving ? InlineLoading : null}
  on:click:button--secondary={() => (bankModalOpen = false)}
  on:click:button--primary={saveBank}
>
  <FormGroup>
    {#if bankModalLoading}
      <TextInputSkeleton hideLabel />
    {:else if changeName}
      <TextInput placeholder={originalBankName} bind:value={bankName} data-test="bank-name" autocomplete="off" />
    {:else if isEdit}
      <div class="flex justify-between">
        <div>
          {bankName}
        </div>
        <GenericButton
          on:click={() => {
            changeName = true;
            originalBankName = bankName;
            bankName = '';
          }}
          icon={Edit}
        />
      </div>
    {:else}
      <TextInput placeholder="Bank Name" bind:value={bankName} data-test="bank-name" autocomplete="off" />
    {/if}
  </FormGroup>

  <FormGroup class="relative flex">
    {#if bankModalLoading}
      <TextInputSkeleton hideLabel />
    {:else}
      <TextInput
        invalid={!validBincodes}
        invalidText="* Bincodes can only contain numbers."
        bind:value={bincode}
        data-test="bincode"
        placeholder="BinCode"
        autocomplete="off"
      />
      <Button
        class="h-10 px-2"
        on:click={addBincode}
        disabled={!bincode || !validBincodes}
        kind="tertiary"
        size="small"
      >
        Add binCodes
      </Button>
      <div class="absolute top-0 right-0 -mt-2 -mr-2">
        <TooltipIcon
          class="[&_svg]:fill-ctip-interactive"
          direction="left"
          tooltipText="To add multiple binCodes, separate them with a comma, no spaces allowed."
          icon={HelpFilled}
        />
      </div>
    {/if}
  </FormGroup>

  <div class="overflow-y-auto border-solid sm:max-h-80 bg-ctip-background border-y border-ctip-border">
    {#if bankModalLoading}
      <SkeletonPlaceholder class="w-full" />
    {:else}
      {#each bincodes as bincode}
        <div class="flex justify-between p-2 hover:bg-ctip-hover-ui">
          <div class="flex items-center">
            <Checkbox bind:group={selectedBincodesToDelete} value={bincode} class="m-0 mr-2 [&_label]:m-0" hideLabel />
            <span class="ml-2">
              {bincode}
            </span>
          </div>
          <div>
            <Button
              on:click={() => (bincodes = bincodes.filter((bc) => bc !== bincode))}
              kind="ghost"
              class="px-2 rounded"
              size="small"
              data-test="delete-bincode-button"
            >
              <TrashCan class="fill-ctip-danger" />
            </Button>
          </div>
        </div>
      {/each}
    {/if}
  </div>

  {#if selectedBincodesToDelete.length}
    <div class="flex flex-row-reverse mt-2">
      <GenericButton data-test="delete-selected-bincodes" on:click={deleteBincodes} kind="danger-tertiary">
        Delete
      </GenericButton>
    </div>
  {/if}
</Modal>
