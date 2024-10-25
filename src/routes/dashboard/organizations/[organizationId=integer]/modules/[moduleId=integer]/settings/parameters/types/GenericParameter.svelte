<script lang="ts">
  import type * as yup from 'yup';
  import Client from '$lib/client';
  import type { SettingsResponse } from '$lib/client/services/modules';
  import type Module from '$lib/types/module';
  import { currentModule } from '$stores/module';
  import { currentOrganizationId } from '$stores/organization';
  import { onDestroy } from 'svelte';
  import ParameterBase from './ParameterBase.svelte';
  import { InlineLoading } from 'carbon-components-svelte';
  import WarningModal from '$lib/components/CommonModal/WarningModal/WarningModal.svelte';
  import { handleErrors, handleServerError, validateInput } from './common';

  export let apiPath: string;
  export let info: string;
  export let noItemsMessage: string;
  export let placeholder: string;
  export let title: string;
  export let validation: yup.StringSchema;
  export let adder: (value: string) => object = (value: string) => ({ value });
  export let itemKey: keyof Item = 'id';
  export let itemValue: keyof Item = 'value';

  const client = new Client();
  onDestroy(() => client.abort());

  type Item = SettingsResponse['values'][0];

  let items: Item[] = [];
  let loading = false;
  let addExpanded = false;
  let invalidInput = '';
  let addText = '';
  let itemsToDelete: Item[];
  let isDeleting = false;

  $: getItems($currentOrganizationId, $currentModule, apiPath);

  async function getItems(organizationId: number, module: Module, apiPath: string) {
    loading = true;
    const response = await client.modules.getModuleSettings(organizationId, module, apiPath);
    items = response.values;
    loading = false;
  }

  async function onAdd(event: CustomEvent<string>) {
    const input = event.detail;
    if (!input) return;
    addExpanded = false;

    const { errors, notAdded, toAdd } = validateInput(input, items, itemValue, validation);
    handleErrors(errors);

    if (toAdd.length) {
      const values = toAdd.map(adder);
      const payload = {
        type: apiPath.toUpperCase(),
        values
      };
      try {
        const response = await client.modules.setModuleSettings($currentOrganizationId, $currentModule, payload);
        notAdded.push(...handleServerError(response));
      } catch (error) {
        handleServerError(error.response?.data);
      }
      await getItems($currentOrganizationId, $currentModule, apiPath);
    }

    addText = notAdded.join('\n');
  }

  function onDelete(event: CustomEvent<Item[]>) {
    itemsToDelete = event.detail;
  }

  async function doDelete() {
    isDeleting = true;
    const deletedValues = itemsToDelete.map((item) => item[itemValue]);
    const values = deletedValues.map(adder);
    const payload = {
      type: apiPath.toUpperCase(),
      values
    };
    try {
      const response = await client.modules.deleteModuleSettings($currentOrganizationId, $currentModule, payload);
      handleServerError(response);
      items = items.filter((item) => !deletedValues.includes(item[itemValue]));
    } catch (error) {
      handleServerError({ error: true });
    }
    itemsToDelete = null;
    isDeleting = false;
  }
</script>

<ParameterBase
  bind:addExpanded
  on:add={onAdd}
  on:delete={onDelete}
  bind:addText
  canAdd
  {placeholder}
  {title}
  {items}
  {loading}
  {info}
  {noItemsMessage}
  {invalidInput}
  {itemKey}
  {itemValue}
/>

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
