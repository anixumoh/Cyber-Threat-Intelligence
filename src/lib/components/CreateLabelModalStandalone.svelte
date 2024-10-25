<script lang="ts">
  import Client from '$lib/client';
  import type { LabelPayload } from '$lib/client/services/modules';
  import { labelColors } from '$lib/constants/colors';
  import { currentModule } from '$stores/module';
  import { currentOrganizationId } from '$stores/organization';
  import {
    Dropdown,
    FormGroup,
    InlineLoading,
    Modal,
    RadioButton,
    RadioButtonGroup,
    TextInput
  } from 'carbon-components-svelte';
  import { createEventDispatcher, onDestroy } from 'svelte';

  const dispatch = createEventDispatcher();
  const client = new Client();
  onDestroy(() => client.abort());

  enum LABEL_MODE {
    UNSELECTED = '',
    GLOBAL = 'GLOBAL',
    ORGANIZATION = 'ORGANIZATION',
    MODULE = 'MODULE'
  }

  export let open = false;

  let saving = false;
  let name = '';
  let labelMode: LABEL_MODE = LABEL_MODE.UNSELECTED;
  let selectedId = '';

  $: valid = !!name && !!selectedId && !!labelMode;

  $: colorItems = [
    { id: '', text: name, disabled: true },
    ...labelColors.map((color) => ({
      id: color,
      text: name
    })),
    ...(selectedId && !labelColors.some((c) => c === selectedId) ? [{ id: selectedId, text: name }] : [])
  ];

  async function saveLabel() {
    saving = true;

    const payload: LabelPayload = {
      bgColorHex: selectedId,
      label: name,
      labelProtected: false,
      prioritized: false,
      textColorHex: '#FFFFFF'
    };

    if (labelMode === LABEL_MODE.MODULE) {
      payload.moduleId = $currentModule.id;
      payload.organizationId = $currentOrganizationId;
    } else if (labelMode === LABEL_MODE.ORGANIZATION) {
      payload.organizationId = $currentOrganizationId;
    }

    const newLabel = await client.modules.createLabel(payload);
    dispatch('save', newLabel);

    saving = false;
    open = false;
  }
</script>

<Modal
  class="[&>div]:min-h-[570px]"
  bind:open
  modalHeading="Labels"
  primaryButtonDisabled={saving || !valid}
  primaryButtonText="Save"
  primaryButtonIcon={saving && InlineLoading}
  secondaryButtonText="Cancel"
  on:click:button--secondary={() => (open = false)}
  on:click:button--primary={saveLabel}
>
  <FormGroup>
    <TextInput name="name" labelText="Label name" bind:value={name} />
  </FormGroup>

  <FormGroup>
    <div style="--label-selected-color: {selectedId}">
      <Dropdown
        id="label-color"
        bind:selectedId
        class="[&>div>div>div>div]:p-0"
        disabled={!name}
        titleText="Select Color"
        items={colorItems}
        let:item
      >
        {#if item.disabled}
          <div class="flex items-center w-full h-full p-2">
            {name}
          </div>
        {:else}
          <div class="flex items-center w-full h-full p-2" style="border: 2px solid {item.id}">
            {name}
          </div>
        {/if}
      </Dropdown>
    </div>
  </FormGroup>

  <FormGroup>
    <RadioButtonGroup orientation="vertical" legendText="Type" bind:selected={labelMode}>
      <RadioButton labelText="Global" value={LABEL_MODE.GLOBAL} />
      <RadioButton labelText="Organization" value={LABEL_MODE.ORGANIZATION} />
      <RadioButton labelText="Module" value={LABEL_MODE.MODULE} />
    </RadioButtonGroup>
  </FormGroup>
</Modal>

<style>
  :global(#label-color) {
    border: 2px solid var(--label-selected-color);
  }
</style>
