<script lang="ts">
  import Client from '$lib/client';
  import GenericButton from '$lib/components/Buttons/GenericButton.svelte';
  import WarningModal from '$lib/components/CommonModal/WarningModal/WarningModal.svelte';
  import { MODULE_NAME } from '$lib/constants/modules';
  import { createDebounceSearch, handleItems } from '$lib/functions/cpeTech';
  import type Module from '$lib/types/module';
  import { currentModule } from '$stores/module';
  import { currentOrganizationId } from '$stores/organization';
  import roleStore from '$stores/role';
  import {
    Button,
    Checkbox,
    ComboBox,
    ComposedModal,
    InlineLoading,
    ModalBody,
    ModalFooter,
    ModalHeader,
    TextInput,
    Toggle,
    Tooltip
  } from 'carbon-components-svelte';
  import type { ComboBoxItem } from 'carbon-components-svelte/types/ComboBox/ComboBox.svelte';
  import { CloudUpload } from 'carbon-icons-svelte';
  import { onDestroy } from 'svelte';
  import ParameterBase from './ParameterBase.svelte';
  import { handleServerError } from './common';

  export let apiPath: string;
  export let placeholder: string;
  export let title: string;
  export let info: string;
  export let noItemsMessage: string;

  const client = new Client();
  onDestroy(() => client.abort());

  type PlatformTechnologiesSettingsResponse = {
    type: string;
    values: {
      cpe: string;
      id: any;
      product: boolean;
      title: string;
      vendor: boolean;
      version: boolean;
    }[];
  };

  type Item = PlatformTechnologiesSettingsResponse['values'][0];
  let items: Item[] = [];
  let originalItems: Item[] = [];
  let loading = false;
  let addExpanded = false;
  let tooltipOpen = false;
  let isDisplayingCpeWithTitle = false;

  let uploadInputEl: HTMLInputElement;
  let showErrorModal = false;
  let cpeError: string[] = [];

  let vendorLoading = false;
  let productLoading = false;
  let versionLoading = false;
  let vendorSearch = '';
  let productSearch = '';
  let versionSearch = '';
  let includeDeprecateds = false;
  let isSaving = false;
  let manualCPE = '';

  let vendor: ComboBoxItem;
  let product: ComboBoxItem;
  let version: ComboBoxItem;

  let vendors: ComboBoxItem[] = [];
  let products: ComboBoxItem[] = [];
  let versions: ComboBoxItem[] = [];

  let itemsToDelete: Item[] = [];
  let isDeleting = false;

  $: getItems($currentOrganizationId, $currentModule, apiPath);

  async function getItems(organizationId: number, module: Module, apiPath: string) {
    loading = true;
    const response = await client.modules.getModuleSettings<PlatformTechnologiesSettingsResponse>(
      organizationId,
      module,
      apiPath
    );
    items = response.values;
    originalItems = JSON.parse(JSON.stringify(items));
    loading = false;
  }

  const debounceSearchVendor = createDebounceSearch(searchVendor, 500, () => (vendorLoading = true));
  const debounceSearchProduct = createDebounceSearch(searchProduct, 500, () => (productLoading = true));
  const debounceSearchVersion = createDebounceSearch(searchVersion, 500, () => (versionLoading = true));

  $: debounceSearchVendor(vendorSearch);
  $: vendor && debounceSearchProduct(productSearch);
  $: vendor && product && debounceSearchVersion(versionSearch);

  $: if (addExpanded) {
    vendor = undefined;
    product = undefined;
    version = undefined;
    manualCPE = '';
  }

  async function searchVendor(input: string) {
    if (input) {
      const response = await client.modules.getVendorsCPE(input);
      vendors = response.map((v) => ({ id: v.value, text: v.label }));
    } else {
      vendors = [];
    }
    vendorLoading = false;
  }

  async function searchProduct(input: string) {
    if (input) {
      const response = await client.modules.getProductsCPE(vendor.id, input);
      products = response.map((p) => ({ id: p.value, text: p.label }));
    } else {
      products = [];
    }
    productLoading = false;
  }

  async function searchVersion(input: string) {
    if (input) {
      const response = await client.modules.getProductVersionsCPE(
        vendor.id,
        product.id,
        versionSearch,
        includeDeprecateds
      );
      versions = response.map((v) => ({ id: v.cpeName, text: v.title, item: v }));
    } else {
      versions = [];
    }
    versionLoading = false;
  }

  async function addSetting() {
    let value: Record<string, any>;
    if (version) {
      value = {
        title: version.text,
        version: version.id
      };
    } else if (product) {
      value = {
        vendor: vendor.id,
        product: product.id,
        title: product.text
      };
    } else if (vendor) {
      value = {
        vendor: vendor.id,
        title: vendor.text
      };
    } else {
      return;
    }

    const payload = {
      type: apiPath.toUpperCase(),
      values: [value]
    };

    try {
      isSaving = true;
      await client.modules.setModuleSettings($currentOrganizationId, $currentModule, payload);
    } catch (error) {
      handleServerError(error.response?.data);
    }

    product = undefined;
    vendor = undefined;
    version = undefined;
    isSaving = false;
    addExpanded = false;

    await getItems($currentOrganizationId, $currentModule, apiPath);
  }

  function onDelete(event: CustomEvent<Item[]>) {
    itemsToDelete = event.detail;
  }

  async function doDelete() {
    isDeleting = true;
    const values = itemsToDelete.map((item) => ({ cpe: item.cpe, title: item.title }));
    const deletecCPE = values.map((val) => val.cpe);

    const payload = {
      type: apiPath.toUpperCase(),
      values
    };
    await client.modules.deleteModuleSettings($currentOrganizationId, $currentModule, payload);
    items = items.filter((item) => !deletecCPE.includes(item.cpe));

    itemsToDelete = null;
    isDeleting = false;
  }

  async function importCpes() {
    const fileList: FileList = uploadInputEl?.files;
    if (!fileList?.length) return;
    const file = fileList[0];
    const formData: FormData = new FormData();
    formData.append('file', file);

    try {
      const response = await client.modules.importCpes($currentOrganizationId, $currentModule, formData);
      if ('error' in response && Array.isArray(response.error) && response.error.length) {
        showErrorModal = true;
        cpeError = response.error;
      } else {
        handleServerError(response);
      }
    } catch (error) {
      handleServerError(error.response?.data);
    }

    await getItems($currentOrganizationId, $currentModule, apiPath);
    uploadInputEl.value = '';
  }
  let tooltipTimeout: NodeJS.Timeout;
  function tooltipMouseEnter() {
    clearTimeout(tooltipTimeout);
    tooltipOpen = true;
  }
  function tooltipMouseLeave() {
    clearTimeout(tooltipTimeout);
    tooltipTimeout = setTimeout(() => (tooltipOpen = false), 100);
  }

  async function addManualCpe() {
    const payload = {
      type: apiPath.toUpperCase(),
      values: [{ cpe: manualCPE }]
    };

    isSaving = true;
    try {
      const response = await client.modules.setModuleSettings($currentOrganizationId, $currentModule, payload);
      handleServerError({ ...response, message: 'INVALID_CPE' });
      manualCPE = '';
      addExpanded = false;
      await getItems($currentOrganizationId, $currentModule, apiPath);
    } catch (error) {
      handleServerError(error.response?.data);
    } finally {
      isSaving = false;
    }
  }

  function onClose() {
    addExpanded = false;
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
  canAdd
  itemKey="cpe"
  itemValue="title"
  filterItem={(item, search) =>
    String(item.title).toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
    String(item.cpe).toLocaleLowerCase().includes(search.toLocaleLowerCase())}
>
  <svelte:fragment slot="item-display" let:item>
    <div class="grid grid-flow-col gap-4" class:grid-cols-2={isDisplayingCpeWithTitle}>
      <div title={item.title} class="text-ellipsis overflow-hidden whitespace-nowrap">{item.title}</div>
      {#if isDisplayingCpeWithTitle}
        <div title={item.cpe} class="text-ellipsis overflow-hidden whitespace-nowrap">{item.cpe}</div>
      {/if}
    </div>
  </svelte:fragment>
  <svelte:fragment slot="under-title">
    <Toggle labelA="Show CPEs" labelB="Show CPEs" size="sm" bind:toggled={isDisplayingCpeWithTitle} />
  </svelte:fragment>
  <svelte:fragment slot="actions">
    <div class="px-2" on:mouseenter={tooltipMouseEnter} on:mouseleave={tooltipMouseLeave}>
      <Tooltip bind:open={tooltipOpen} class="!z-50 [&>div]:z-50 [&_svg]:fill-ctip-interactive mt-1">
        <div on:mouseenter={tooltipMouseEnter} on:mouseleave={tooltipMouseLeave}>
          {info}
          {#if $currentModule.moduleName === MODULE_NAME.EXPLORER}
            <p class="italic">
              <br />
              If you choose to import from a csv file, the format should be as follows, with a cpe per line:
            </p>
            <ul class="ml-2">
              <li class="mt-2">cpe:2.3:a:oracle:*:*:*:*:*:*:*:*:*</li>
              <li>cpe:2.3:a:oracle:*:*:*:*:*:*:*:*:*</li>
              <li class="mb-2">cpe:2.3:a:oracle:applications_framework:11.5.10.2:*:*:*:*:*:*:*</li>
            </ul>
            <p class="italic">The import is limited to 1000 records per upload.</p>
            <p class="mb-2 italic">
              You can read more regarding CPE naming
              <a rel="noreferrer" target="_blank" href="https://cpe.mitre.org/specification/">here</a>.
            </p>
          {/if}
        </div>
      </Tooltip>
    </div>

    {#if !($roleStore.customer || $roleStore.operator)}
      <Button
        icon={CloudUpload}
        iconDescription="Import cpes from a csv file"
        kind="ghost"
        class="px-2 rounded"
        size="small"
        on:click={() => uploadInputEl.click()}
      />
      <input bind:this={uploadInputEl} type="file" accept=".csv" on:change={importCpes} hidden />
    {/if}
  </svelte:fragment>
  <div slot="add-form" class="min-h-[273px]">
    <div class="px-1 pb-1 flex gap-4 w-full">
      <div class="grid gap-1.5 grow">
        <Checkbox labelText="Include deprecated versions" bind:checked={includeDeprecateds} />
        <div>
          <ComboBox
            size="sm"
            bind:value={vendorSearch}
            on:select={(e) => {
              vendor = e.detail.selectedItem;
            }}
            on:clear={() => (vendor = undefined)}
            titleText="Vendor"
            placeholder="Search for vendor"
            items={handleItems(vendors, vendorLoading, vendorSearch)}
          />
        </div>

        {#if vendor}
          <div>
            <ComboBox
              size="sm"
              bind:value={productSearch}
              on:select={(e) => {
                product = e.detail.selectedItem;
              }}
              on:clear={() => (product = undefined)}
              titleText="Product"
              placeholder="Search for product"
              items={handleItems(products, productLoading, productSearch)}
            />
          </div>
        {/if}

        {#if vendor && product}
          <div>
            <ComboBox
              size="sm"
              bind:value={versionSearch}
              on:select={(e) => {
                version = e.detail.selectedItem;
              }}
              on:clear={() => (version = undefined)}
              titleText="Version"
              placeholder="Search for a version"
              items={handleItems(versions, versionLoading, versionSearch)}
            />
          </div>
        {/if}

        <div class="flex flex-row-reverse gap-2 mt-1">
          <GenericButton disabled={!vendor || isSaving} kind="primary" size="small" on:click={addSetting}>
            Add
          </GenericButton>
          <GenericButton kind="danger-tertiary" size="small" on:click={onClose}>Close</GenericButton>
        </div>
      </div>

      {#if $currentModule.moduleName === MODULE_NAME.EXPLORER}
        <div class="border-l border-solid border-ctip-border p-2 grow mt-8">
          <TextInput labelText="Add CPE" placeholder="Enter CPE value" bind:value={manualCPE} />

          <div class="flex flex-row-reverse gap-2 mt-1">
            <GenericButton disabled={!manualCPE || isSaving} kind="primary" size="small" on:click={addManualCpe}>
              Add
            </GenericButton>
            <GenericButton kind="danger-tertiary" size="small" on:click={onClose}>Close</GenericButton>
          </div>
        </div>
      {/if}
    </div>
  </div>
</ParameterBase>

<WarningModal
  open={!!itemsToDelete?.length}
  modalHeading="Confirmation"
  question="Are you sure you want to delete product?"
  secondMessage="This action cannot be undone."
  primaryButtonDisabled={isDeleting}
  primaryButtonIcon={isDeleting ? InlineLoading : null}
  on:submit={doDelete}
  on:closeModal={() => (itemsToDelete = null)}
/>

<ComposedModal bind:open={showErrorModal}>
  <ModalHeader title="Error" />
  <ModalBody>
    <div class="pb-4">Some cpes could not be imported due to format issues:</div>
    <ul>
      {#each cpeError as cpe}
        <li>{cpe}</li>
      {/each}
    </ul>
  </ModalBody>
  <ModalFooter secondaryButtonText="Close" on:click:button--secondary={() => (showErrorModal = false)} />
</ComposedModal>
