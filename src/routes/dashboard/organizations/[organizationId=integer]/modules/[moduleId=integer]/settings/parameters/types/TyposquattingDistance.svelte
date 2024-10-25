<script lang="ts">
  import type * as yup from 'yup';
  import Client from '$lib/client';
  import type { SettingsResponse } from '$lib/client/services/modules';
  import type Module from '$lib/types/module';
  import { currentModule } from '$stores/module';
  import { currentOrganizationId } from '$stores/organization';
  import { onDestroy } from 'svelte';
  import { handleErrors, handleServerError, validateInput } from './common';
  import ParameterBase from './ParameterBase.svelte';
  import WarningModal from '$lib/components/CommonModal/WarningModal/WarningModal.svelte';
  import { InlineLoading } from 'carbon-components-svelte';
  import roleStore from '$stores/role';

  export let apiPath: string;
  export let title: string;
  export let info: string;
  export let placeholder: string;
  export let noItemsMessage: string;
  export let validation: yup.StringSchema;

  let itemsToDelete: SettingsResponse['values'] = [];

  const client = new Client();
  const delayUpdates: Record<string, NodeJS.Timeout> = {};
  onDestroy(() => client.abort());

  let items: SettingsResponse['values'] = [];
  let loading = false;
  let addExpanded = false;
  let addText = '';
  let isDeleting = false;
  let savingIds: string[] = [];

  $: getItems($currentOrganizationId, $currentModule, apiPath);

  async function getItems(organizationId: number, module: Module, apiPath: string) {
    loading = true;
    const response = await client.modules.getModuleSettings(organizationId, module, apiPath);
    items = response.values;
    loading = false;
  }

  function getMax(keyword: string) {
    return Math.floor(keyword.length / 2);
  }

  async function onAdd(event: CustomEvent<string>) {
    const input = event.detail;
    if (!input) return;
    addExpanded = false;

    const { errors, notAdded, toAdd } = validateInput(input, items, 'value', validation);
    handleErrors(errors);

    if (toAdd.length) {
      const values = toAdd.map((keyword) => ({ value: `${keyword}~${getMax(keyword)}` }));
      const payload = {
        type: apiPath.toUpperCase(),
        values
      };
      try {
        const response = await client.modules.setModuleSettings($currentOrganizationId, $currentModule, payload);
        notAdded.push(...handleServerError(response));
      } catch (error) {
        handleServerError({ error: true });
      }
      await getItems($currentOrganizationId, $currentModule, apiPath);
    }

    addText = notAdded.join('\n');
  }

  function onDelete(event: CustomEvent<SettingsResponse['values']>) {
    itemsToDelete = event.detail;
  }

  async function doDelete() {
    isDeleting = true;
    const deletedValues = itemsToDelete.map((item) => item.value);
    const values = deletedValues.map((value) => ({ value }));
    const payload = {
      type: apiPath.toUpperCase(),
      values
    };
    await client.modules.deleteModuleSettings($currentOrganizationId, $currentModule, payload);
    items = items.filter((item) => !deletedValues.includes(item.value));
    itemsToDelete = null;
    isDeleting = false;
  }

  function onChange(event: Event, item: SettingsResponse['values'][0]) {
    event.preventDefault();
    const value = +event.target?.value;
    if (!value) return;

    clearTimeout(delayUpdates[item.id]);
    delayUpdates[item.id] = setTimeout(() => {
      updateItem(item, value);
    }, 2000);
  }

  async function updateItem(item: SettingsResponse['values'][0], targetValue: number) {
    const currentKeyword = item.value.split('~')[0];
    const currentValue = +item.value.split('~')[1];
    if (currentValue === targetValue) return;
    if (targetValue > getMax(currentKeyword)) return;

    savingIds = [...savingIds, item.id];
    const payloadRemove = {
      type: apiPath.toUpperCase(),
      values: [{ value: item.value }]
    };
    await client.modules.deleteModuleSettings($currentOrganizationId, $currentModule, payloadRemove);

    const payloadAdd = {
      type: apiPath.toUpperCase(),
      values: [{ value: `${currentKeyword}~${targetValue}` }]
    };
    await client.modules.setModuleSettings($currentOrganizationId, $currentModule, payloadAdd);
    savingIds = savingIds.filter((id) => id !== item.id);
  }

  function preventKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowDown':
        break;
      default:
        event.preventDefault();
        break;
    }
  }
</script>

<ParameterBase
  bind:addExpanded
  bind:addText
  on:add={onAdd}
  on:delete={onDelete}
  {placeholder}
  {title}
  {items}
  {loading}
  {info}
  {noItemsMessage}
  canAdd
  itemKey="id"
  itemValue="value"
>
  <svelte:fragment slot="item-display" let:item>
    {item.value.split('~')[0]}
  </svelte:fragment>
  <svelte:fragment slot="item-actions" let:item>
    <div class="w-12 flex justify-center items-center opacity-0" class:opacity-100={savingIds.includes(item.id)}>
      <InlineLoading />
    </div>
    <input
      on:drop={(e) => e.preventDefault()}
      on:keydown={preventKeydown}
      on:change={(e) => onChange(e, item)}
      class="w-14"
      class:hidden={savingIds.includes(item.id)}
      type="number"
      disabled={$roleStore.customer || $roleStore.operator}
      value={item.value.split('~')[1]}
      min="1"
      max={getMax(item.value.split('~')[0])}
    />
  </svelte:fragment>
</ParameterBase>

<WarningModal
  open={!!itemsToDelete?.length}
  modalHeading="Confirmation"
  question="Are you sure you want to delete this?"
  secondMessage="This action cannot be undone."
  primaryButtonDisabled={isDeleting}
  primaryButtonIcon={isDeleting ? InlineLoading : null}
  on:submit={doDelete}
  on:closeModal={() => (itemsToDelete = null)}
/>
