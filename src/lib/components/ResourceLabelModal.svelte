<script lang="ts">
  import Client from '$lib/client';
  import type { CVE } from '$lib/client/services/malware';
  import type { LabelPayload, LabelType } from '$lib/client/services/modules';
  import LabelItem from '$lib/components/LabelItem/LabelItem.svelte';
  import { labelColors } from '$lib/constants/colors';
  import type Module from '$lib/types/module';
  import { currentModule, modulesStore } from '$stores/module';
  import { currentOrganizationId } from '$stores/organization';
  import roleStore from '$stores/role';
  import {
    Button,
    ComposedModal,
    Dropdown,
    FormGroup,
    InlineLoading,
    ModalBody,
    ModalHeader,
    RadioButton,
    RadioButtonGroup,
    Search,
    TextInput
  } from 'carbon-components-svelte';
  import { Checkmark, Edit } from 'carbon-icons-svelte';
  import { createEventDispatcher, onDestroy } from 'svelte';

  export let open = false;
  export let resources: Resouce[] | CVE[] = [];
  export let isIncident = false;
  export let moduleId: number = undefined;

  const client = new Client();
  const dispatch = createEventDispatcher();

  type Resouce = {
    resourceId: number;
    labels: LabelType[];
  };

  let initilSelection: number[] = [];
  let selectedIds: number[] = [];
  let labels: LabelType[] = [];
  let search = '';
  let loading = false;
  let saving = false;
  let deleting = false;
  let edittingLabel: LabelType;

  type Mode = 'Assign' | 'Create' | 'Edit';
  let mode: Mode = 'Assign';
  let name = '';
  let selectedId = '';

  enum LABEL_MODE {
    UNSELECTED = '',
    GLOBAL = 'GLOBAL',
    ORGANIZATION = 'ORGANIZATION',
    MODULE = 'MODULE'
  }

  let labelMode: LABEL_MODE = LABEL_MODE.UNSELECTED;

  $: module = $modulesStore.find((mod) => mod.id === moduleId) || $currentModule;
  $: if (open) {
    setSelectedLabelIds(resources);
    loadLabels($currentOrganizationId, module);
  }
  $: disabledSubmit = isSubmitDisabled(mode, name, selectedId, labelMode);
  $: labelsFiltered = labels.filter((label) => label.label.toLowerCase().includes(search.toLowerCase()));
  $: colorItems = [
    { id: '', text: name, disabled: true },
    ...labelColors.map((color) => ({
      id: color,
      text: name
    })),
    ...(selectedId && !labelColors.some((c) => c === selectedId) ? [{ id: selectedId, text: name }] : [])
  ];
  $: canCreateOrEdit = $roleStore.superadmin || $roleStore.admin || $roleStore.master || $roleStore.analyst;
  onDestroy(() => client.abort());

  function isSubmitDisabled(mode: Mode, name: string, selectedId: string, labelMode: LABEL_MODE) {
    switch (mode) {
      case 'Assign':
        return false;
      case 'Edit':
        return !(name && selectedId);
      case 'Create':
        return !(name && selectedId && labelMode);
    }
  }

  async function loadLabels(orgId: number, module: Module) {
    loading = true;
    const labelsTmp = await client.modules.getLabels(orgId, module, false, isIncident);
    parsedLabelsList(labelsTmp);
    loading = false;
  }

  function parsedLabelsList(labelsTmp, newElement?: LabelType) {
    const selectedLabels = [];
    const unselectedLabels = [];
    for (const item of labelsTmp) {
      const exist = selectedIds.find((id) => id === item.id);
      if (exist) {
        selectedLabels.push(item);
      } else {
        if (newElement?.id === item.id) {
          unselectedLabels.unshift(newElement);
        } else {
          unselectedLabels.push(item);
        }
      }
    }
    labels = [...selectedLabels, ...unselectedLabels];
  }

  function setSelectedLabelIds(resources: Resouce[] | CVE[]) {
    let labelIds = resources[0]?.labels?.map?.((label) => label.id);
    for (let i = 1; i < resources.length; i++) {
      const nextLabels = resources[i].labels.map((labels) => labels.id);
      labelIds = labelIds.filter((label) => nextLabels.includes(label));
    }
    initilSelection = labelIds;
    selectedIds = [...labelIds];
  }

  function toggleSelectedId(e: Event, selectedId: number) {
    e.stopImmediatePropagation();

    if (selectedIds.includes(selectedId)) {
      selectedIds = selectedIds.filter((id) => id !== selectedId);
    } else {
      selectedIds = [...selectedIds, selectedId];
    }
  }

  async function submitLabels() {
    saving = true;
    let resourcesAreCVEs = false;
    if ('cve' in resources[0]) {
      resourcesAreCVEs = true;
    }
    const addedIds = selectedIds.filter((id) => !initilSelection.includes(id));
    const removedIds = initilSelection.filter((id) => !selectedIds.includes(id));
    const resourcesIds = resources?.map?.((resource) => resource.resourceId || resource.id);
    if (!resourcesAreCVEs) {
      if (isIncident) {
        const data = [];
        resourcesIds.forEach((id: number) => {
          const dataItem = `${id}:${addedIds.concat(removedIds).join('|')}`;
          data.push(dataItem);
        });
        await client.incidents.toggleLabel($currentOrganizationId, module.id, data);
      } else {
        const removePromises = removedIds.map((labelId) =>
          client.threats.toggleLabel(resourcesIds, labelId, $currentOrganizationId, module)
        );

        const addPromises = addedIds.map((labelId) => {
          const resourcesIds = resources
            .filter((resource) => !resource.labels.some((label) => label.id === labelId))
            .map((resource) => resource.resourceId);
          return client.threats.toggleLabel(resourcesIds, labelId, $currentOrganizationId, module);
        });
        await Promise.all([...removePromises, ...addPromises]);
      }
    } else {
      const addPromises = addedIds.map((id) =>
        client.modules.updateExplorerResourceWithLabels($currentOrganizationId, module.id, resourcesIds, id)
      );
      const removePromises = removedIds.map((id) =>
        client.modules.updateExplorerResourceWithLabels($currentOrganizationId, module.id, resourcesIds, id)
      );
      await Promise.all([...addPromises, ...removePromises]);
    }
    dispatch('save', {
      addedIds,
      added: labels.filter((label) => addedIds.includes(label.id)),
      removedIds
    });
    saving = false;
    open = false;
  }

  function openCreateLabel() {
    name = '';
    selectedId = '';
    labelMode = LABEL_MODE.UNSELECTED;
    mode = 'Create';
  }

  function openEditLabel(label: LabelType) {
    edittingLabel = label;
    name = label.label;
    selectedId = label.bgColorHex;
    mode = 'Edit';

    if (edittingLabel.moduleId) {
      labelMode = LABEL_MODE.MODULE;
    } else if (edittingLabel.organizationId) {
      labelMode = LABEL_MODE.ORGANIZATION;
    } else {
      labelMode = LABEL_MODE.GLOBAL;
    }
  }

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
      payload.moduleId = module.id;
      payload.organizationId = $currentOrganizationId;
    } else if (labelMode === LABEL_MODE.ORGANIZATION) {
      payload.organizationId = $currentOrganizationId;
    }

    if (mode === 'Create') {
      const newLabel = await client.modules.createLabel(payload);
      labels = [...labels, newLabel];
      parsedLabelsList(labels, newLabel);
      selectedIds = [...selectedIds, newLabel.id];
    } else if (mode === 'Edit') {
      payload.labelTypeId = edittingLabel.labelTypeId;
      payload.labelProtected = edittingLabel.labelProtected;
      payload.prioritized = edittingLabel.prioritized;
      const editedLabel = await client.modules.editLabel(edittingLabel.id, payload);
      const index = labels.findIndex((label) => label.id === edittingLabel.id);
      labels[index] = editedLabel;
    }

    saving = false;
    mode = 'Assign';
  }

  async function deleteLabel() {
    deleting = true;
    await client.modules.deleteLabel($currentOrganizationId, edittingLabel.id);
    labels = labels.filter((label) => label.id !== edittingLabel.id);
    deleting = false;
    mode = 'Assign';
  }
</script>

<ComposedModal
  on:close={() => (search = '')}
  on:open={() => (mode = 'Assign')}
  size="sm"
  bind:open
  preventCloseOnClickOutside
  selectorPrimaryFocus={null}
>
  <ModalHeader title="Label">
    {#if mode === 'Create' || mode === 'Edit'}
      <div class="flex justify-end -mt-8 mr-4">
        <Button on:click={() => (mode = 'Assign')} kind="secondary" size="small">Back to list</Button>
      </div>
    {/if}
  </ModalHeader>
  <ModalBody>
    {#if mode === 'Assign'}
      {#if canCreateOrEdit}
        <div class="flex justify-end mb-2">
          <Button on:click={openCreateLabel}>Create label</Button>
        </div>
      {/if}
      <Search bind:value={search} />
      <div class="mt-4">
        {#if loading}
          <InlineLoading class="flex items-center justify-center" />
        {:else}
          <div role="group" aria-label="selectable tiles">
            {#each labelsFiltered as label}
              <div
                class="flex justify-between items-center h-9 cursor-pointer mt-2 mb-2 pl-2 pr-2 hover:bg-ctip-hover-ui"
                class:bg-ctip-hover-ui={selectedIds.includes(label.id)}
                on:click={(e) => toggleSelectedId(e, label.id)}
              >
                <LabelItem {label} />
                <div class="flex justify-between">
                  {#if selectedIds.includes(label.id)}
                    <span><Checkmark /></span>
                  {/if}
                  {#if canCreateOrEdit}
                    <button
                      class="ml-4 border-none bg-transparent text-ctip-text"
                      on:click={() => openEditLabel(label)}
                    >
                      <Edit />
                    </button>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {:else}
      <div class="min-h-[400px]">
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
        {#if mode === 'Create'}
          <FormGroup>
            <RadioButtonGroup orientation="vertical" legendText="Type" bind:selected={labelMode}>
              <RadioButton labelText="Global" value={LABEL_MODE.GLOBAL} />
              <RadioButton labelText="Organization" value={LABEL_MODE.ORGANIZATION} />
              <RadioButton labelText="Module" value={LABEL_MODE.MODULE} />
            </RadioButtonGroup>
          </FormGroup>
        {/if}
      </div>
    {/if}
  </ModalBody>

  <div class="flex justify-between">
    <Button on:click={() => (open = false)} class="w-1/2 max-w-none" kind="secondary" size="lg">Cancel</Button>
    {#if mode === 'Assign'}
      <Button
        disabled={disabledSubmit || saving}
        on:click={submitLabels}
        icon={saving && InlineLoading}
        class="w-1/2 max-w-none"
        kind="primary"
        size="lg"
      >
        Assign labels
      </Button>
    {:else if mode === 'Create'}
      <Button
        disabled={disabledSubmit || saving}
        icon={saving && InlineLoading}
        on:click={saveLabel}
        class="w-1/2 max-w-none"
        kind="primary"
        size="lg"
      >
        Create label
      </Button>
    {:else if mode === 'Edit'}
      <Button
        on:click={deleteLabel}
        disabled={deleting}
        icon={deleting && InlineLoading}
        class="w-1/4 max-w-none px-2"
        kind="danger"
        size="lg"
      >
        Delete label
      </Button>
      <Button
        on:click={saveLabel}
        disabled={disabledSubmit || saving}
        icon={saving && InlineLoading}
        class="w-1/4 max-w-none px-2"
        kind="primary"
        size="lg"
      >
        Edit label
      </Button>
    {/if}
  </div>
</ComposedModal>

<style>
  :global(#label-color) {
    border: 2px solid var(--label-selected-color);
  }
</style>
