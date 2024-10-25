<script lang="ts">
  import modalTeleport from '$lib/actions/modalTeleport';
  import { tooltip } from '$lib/actions/tooltip';
  import Client from '$lib/client';
  import { ASSETS_LISTS, CHECK, SETTINGS, SETTINGS_DICTIONARY, SETTINGS_PER_MODULE } from '$lib/constants/assets';
  import { createDebounceSearch, handleItems } from '$lib/functions/cpeTech';
  import type { DataToEditItemType, DeleteType, EditItemType, SettingsDataType, SettingsType } from '$lib/types/assets';
  import { MD5 } from '$lib/utils/generateMD5';
  import globalSettingsStore from '$stores/globalSettings';
  import notifications from '$stores/notification';
  import roleStore from '$stores/role';
  import { validator } from '@felte/validator-yup';
  import {
    Button,
    Checkbox,
    ComboBox,
    DataTable,
    InlineLoading,
    InlineNotification,
    Modal,
    MultiSelect,
    Search,
    Tag,
    TextArea,
    TextInput,
    TooltipDefinition,
    truncate
  } from 'carbon-components-svelte';
  import type { ComboBoxItem } from 'carbon-components-svelte/types/ComboBox/ComboBox.svelte';
  import type { TooltipDefinitionProps } from 'carbon-components-svelte/types/TooltipDefinition/TooltipDefinition.svelte';
  import { Add, AddAlt, CloseFilled, Edit, InformationFilled, Maximize, Save, TrashCan } from 'carbon-icons-svelte';
  import { createForm } from 'felte';
  import { createEventDispatcher, onMount } from 'svelte';
  import { slide } from 'svelte/transition';
  import * as yup from 'yup';
  import GenericButton from '../Buttons/GenericButton.svelte';
  import WarningModal from '../CommonModal/WarningModal/WarningModal.svelte';
  import UploaderFile from '../Uploader/UploaderFile.svelte';

  // code
  export let setting: SettingsType;
  export let searchExpanded = false;
  export let isDetails = true;
  export let hideSearch = false;
  export let openDetailSettings = false;
  export let allowedModules = [];
  export let addText = '';
  export let noItemsMessage = '';

  let infoDiv: HTMLDivElement;
  let align: TooltipDefinitionProps['align'] = 'center';

  let loading = false;
  let moduleSelectionModal = false;
  let addExpanded = false;
  let search = '';
  let selectedRowIds = [];
  let openAddModules = false;
  let isEditingItem: EditItemType = {
    editing: false,
    item: null,
    tag: '',
    modules: {
      original: [],
      toAdd: [],
      toDelete: []
    }
  };
  let selectedItem: SettingsDataType = { searchPhrase: '', modules: [], tag: '' };
  let editTag = '';
  let deleteMultipleConfirmation = false;
  let deleteConfirmationModal = false;
  let group = [];
  let addModuleTmp = [];
  let vendorLoading = false;
  let productLoading = false;
  let versionLoading = false;
  let vendorSearch = '';
  let productSearch = '';
  let versionSearch = '';
  let vendors: ComboBoxItem[] = [];
  let products: ComboBoxItem[] = [];
  let versions: ComboBoxItem[] = [];

  const client = new Client();
  const headers = [
    { key: 'searchPhrase', value: `${SETTINGS_DICTIONARY[setting.type]}`.toUpperCase() },
    { key: 'modules', value: 'MODULES' },
    { key: 'tag', value: 'TAG' },
    { key: 'actions', value: '' }
  ];
  const dispatch = createEventDispatcher<{
    add: string;
    delete: DeleteType;
    filter: string;
    deleteSingle: any;
    editElement: DataToEditItemType;
    addNewSetting: any;
  }>();

  const debounceSearchVendor = createDebounceSearch(searchVendor, 500, () => (vendorLoading = true));
  const debounceSearchProduct = createDebounceSearch(searchProduct, 500, () => (productLoading = true));
  const debounceSearchVersion = createDebounceSearch(searchVersion, 500, () => (versionLoading = true));

  $: setting.type === $globalSettingsStore?.errorInfo?.moduleTye &&
    $globalSettingsStore.action === 'edit' &&
    editFailed();
  $: setting.type === $globalSettingsStore?.errorInfo?.moduleTye &&
    $globalSettingsStore.action === 'cancel' &&
    resetData();

  $: debounceSearchVendor(vendorSearch);
  $: $data.techVendor && debounceSearchProduct(productSearch);
  $: $data.techVendor && $data.techProduct && debounceSearchVersion(versionSearch);

  $: parsed = setting.values.map(({ searchPhrase, modules, tag }, index: number) => ({
    id: index,
    searchPhrase,
    modules,
    tag: tag ?? ''
  }));

  $: rows = search
    ? parsed.filter(
        (item) =>
          item.searchPhrase.toLocaleLowerCase()?.includes(search.toLocaleLowerCase()) ||
          item.tag.toLocaleLowerCase()?.includes(search.toLocaleLowerCase())
      )
    : parsed;

  $: filteredModules = allowedModules.filter?.((module) => SETTINGS_PER_MODULE?.[setting.type]?.includes(module.type));

  $: modulesToAdd = filteredModules.filter(
    ({ id }) =>
      !isEditingItem.modules.original.includes(id) &&
      !isEditingItem.modules.toAdd.includes(id) &&
      !isEditingItem.modules.toDelete.includes(id)
  );

  onMount(() => (align = calculateTooltipPosition()));

  const schema = yup.object({
    modules: yup.array(yup.number()).min(1, 'This field is mandatory.'),
    data: SETTINGS[setting.type].validation,
    // this is for file extension and extra categories
    dataMulti: yup.array(yup.string()).test('required', 'This field is mandatory', (values) => {
      if (setting.type === 'FILE_EXTENSION' || setting.type === 'EXTRA_CATEGORIES') {
        return !!values.length;
      }
      return true;
    }),
    image: yup.mixed(),
    tags: yup.string(),
    techIncludeDeprecated: yup.boolean(),
    techVendor: yup
      .object({
        id: yup.string(),
        text: yup.string()
      })
      .test('required', 'This field is mandatory.', (obj) => {
        if (setting.type === 'CPE_TECH') {
          return !!obj;
        }
        return true;
      }),
    techProduct: yup.object({
      id: yup.string(),
      text: yup.string()
    }),
    techVersion: yup.object({
      id: yup.string(),
      text: yup.string()
    }),
    bincodes: SETTINGS[setting.type]?.validationBincode
  });

  const { form, createSubmitHandler, setTouched, data, isValid, errors, isSubmitting, reset, setData } = createForm<
    yup.InferType<typeof schema>
  >({
    initialValues: {
      modules: [],
      dataMulti: [],
      data: '',
      tags: ''
    },
    extend: validator({ schema }),
    onSubmit: async (values) => {
      try {
        // to save
        addSetting(values);
      } catch (error) {
        const msg = error?.response?.data?.message || 'Something went wrong';
        notifications.notify({
          kind: 'error',
          title: msg
        });
      }
    }
  });
  const submit = createSubmitHandler();

  function editFailed() {
    setData(($data) => ({
      ...$data,
      modules: $globalSettingsStore?.errorInfo.modules,
      data: $globalSettingsStore?.errorInfo.terms.join('\n'),
      tags: $globalSettingsStore?.errorInfo.tag
    }));
    addExpanded = true;
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
      const response = await client.modules.getProductsCPE($data.techVendor.id, input);
      products = response.map((p) => ({ id: p.value, text: p.label }));
    } else {
      products = [];
    }
    productLoading = false;
  }

  async function searchVersion(input: string) {
    if (input) {
      const response = await client.modules.getProductVersionsCPE(
        $data.techVendor.id,
        $data.techProduct.id,
        versionSearch,
        $data.techIncludeDeprecated
      );
      versions = response.map((v) => ({ id: v.cpeName, text: v.title, item: v }));
    } else {
      versions = [];
    }
    versionLoading = false;
  }

  function calculateTooltipPosition(): TooltipDefinitionProps['align'] {
    if (infoDiv) {
      const bounds = infoDiv.getBoundingClientRect();
      if (bounds.x + 300 > window.innerWidth) return 'end';
    }
    return 'center';
  }

  function deleteOrRestoreModule(moduleId: number) {
    const wasOriginal = isEditingItem.modules.original.indexOf(moduleId);
    const canBeRestored = isEditingItem.modules.toDelete.indexOf(moduleId);
    if (canBeRestored > -1) {
      isEditingItem.modules.toDelete.splice(canBeRestored, 1);
      isEditingItem = {
        ...isEditingItem
      };
    } else if (wasOriginal > -1) {
      isEditingItem = {
        ...isEditingItem,
        modules: {
          ...isEditingItem.modules,
          toDelete: [...isEditingItem.modules.toDelete, moduleId]
        }
      };
    }
  }

  function removeProvisional(moduleId: number) {
    const index = isEditingItem.modules.toAdd.indexOf(moduleId);
    isEditingItem.modules.toAdd.splice(index, 1);
    isEditingItem = {
      ...isEditingItem
    };
  }

  function getModuleName(moduleId: number) {
    return allowedModules.find(({ id }) => id === moduleId).name;
  }

  function editItem(element) {
    if (isEditingItem.editing) {
      saveItem(element);
    } else {
      isEditingItem = {
        editing: true,
        item: element.id,
        tag: element.tag,
        modules: { original: element.modules.map((el) => el.moduleId), toAdd: [], toDelete: [] }
      };
    }
  }

  function saveItem(element) {
    loading = true;
    const wordIds = element.modules.map((a) => a.wordId);

    const modulesToAdd = isEditingItem.modules.original
      .filter((el) => !isEditingItem.modules.toDelete?.includes(el))
      .concat(isEditingItem.modules.toAdd);
    const commonData = {
      type: setting.type,
      values: [],
      tag: editTag ? editTag : element.tag,
      modulesToDelete: isEditingItem.modules.toDelete,
      modules: modulesToAdd,
      wordIds
    };

    let dataToSend: DataToEditItemType;

    switch (setting.type) {
      case 'CPE_TECH': {
        dataToSend = {
          ...commonData,
          values: [
            {
              title: element.searchPhrase,
              cpe: element.cpe
            }
          ]
        };
        break;
      }
      case 'BANK': {
        dataToSend = {
          ...commonData,
          values: [
            {
              value: element.searchPhrase,
              bincodes: element.bincodes
            }
          ]
        };
        break;
      }
      case 'RSS': {
        dataToSend = {
          ...commonData,
          values: [
            {
              title: element.searchPhrase,
              url: element.bincodes
            }
          ]
        };
        break;
      }
      default: {
        dataToSend = {
          ...commonData,
          values: [
            {
              value: element.searchPhrase
            }
          ]
        };
        break;
      }
    }
    dispatch('editElement', dataToSend);
    editTag = '';
    loading = false;
  }

  function addSetting(newSettingValues) {
    const commonData = {
      modules: newSettingValues.modules,
      settingType: setting.type.startsWith('credit') ? 'credit_card' : setting.type,
      tag: newSettingValues.tags,
      data: []
    };

    let dataToSend = {};
    switch (setting.type) {
      case 'FILE_EXTENSION': {
        const { tag, ...rest } = commonData;
        dataToSend = { ...rest };
        newSettingValues.dataMulti.forEach((term: string) => {
          dataToSend['data'].push({
            value: term.trim()
          });
        });
        break;
      }
      case 'EXTRA_CATEGORIES': {
        dataToSend = { ...commonData };

        newSettingValues.dataMulti.forEach((term: string) => {
          dataToSend['data'].push({
            value: term
          });
        });
        break;
      }
      case 'TYPO_KEYWORD_DISTANCE': {
        newSettingValues.data = newSettingValues.data
          .trim()
          .split('\n')
          .filter((n) => n);
        dataToSend = { ...commonData };
        newSettingValues.data.forEach((term: string) => {
          dataToSend['data'].push({
            value: `${term.trim()}~${maxDistance(term.length / 2)}`
          });
        });
        break;
      }
      case 'IMAGE': {
        dataToSend = {
          ...commonData,
          searchPhrase: [],
          image: newSettingValues.image
        };
        newSettingValues.data
          .trim()
          .split('\n')
          .forEach((term: string) => {
            dataToSend['searchPhrase'].push({
              value: term.trim()
            });
          });
        break;
      }
      case 'CPE_TECH': {
        dataToSend = {
          ...commonData,
          data: [
            {
              ...(newSettingValues.techVendor &&
                newSettingValues.techProduct &&
                newSettingValues.techVersion && {
                  version: newSettingValues.techVersion.id,
                  title: newSettingValues.techVersion.text
                }),
              ...(newSettingValues.techVendor &&
                newSettingValues.techProduct &&
                !newSettingValues.techVersion && {
                  vendor: newSettingValues.techVendor.id,
                  product: newSettingValues.techProduct.id,
                  title: newSettingValues.techProduct.text
                }),
              ...(newSettingValues.techVendor &&
                !newSettingValues.techProduct &&
                !newSettingValues.techVersion && {
                  vendor: newSettingValues.techVendor.id,
                  title: newSettingValues.techVendor.text
                })
            }
          ]
        };

        break;
      }
      case 'BANK': {
        dataToSend = {
          ...commonData,
          data: [
            {
              value: newSettingValues.data,
              bincodes: newSettingValues.bincodes.split(',').filter((n) => n)
            }
          ]
        };
        break;
      }
      case 'CREDIT_CARD': {
        newSettingValues.data = newSettingValues.data
          .trim()
          .split('\n')
          .filter((n) => n);
        dataToSend = { ...commonData };
        newSettingValues.data.forEach((term: string) => {
          dataToSend['data'].push({
            value: term.length !== 32 ? MD5(term.trim()) : term
          });
        });
        break;
      }
      case 'RSS': {
        newSettingValues.data = newSettingValues.data
          .trim()
          .split('\n')
          .filter((n) => n);
        dataToSend = { ...commonData };
        newSettingValues.data.forEach((term: string) => {
          dataToSend['data'].push({
            title: term,
            url: term
          });
        });
        break;
      }
      default: {
        newSettingValues.data = newSettingValues.data
          .trim()
          .split('\n')
          .filter((n) => n);
        dataToSend = {
          ...commonData,
          tag: newSettingValues.tags
        };
        newSettingValues.data.forEach((term: string) => {
          dataToSend['data'].push({
            value: term.trim()
          });
        });
        break;
      }
    }

    dispatch('addNewSetting', dataToSend);
  }

  function maxDistance(distance) {
    if (distance) {
      return Math.floor(distance);
    }
  }

  function cancelOrDelete(element) {
    if (isEditingItem.editing) {
      canceleditItem();
    } else {
      deleteOptions(element);
    }
  }

  function canceleditItem() {
    setting.values[isEditingItem.item].tag = isEditingItem.tag;
    setting = {
      ...setting,
      values: setting.values.map((item, index: number) => ({
        ...item,
        ...(index === isEditingItem.item && { tag: isEditingItem.tag })
      }))
    };
    isEditingItem = {
      editing: false,
      item: null,
      tag: '',
      modules: {
        original: [],
        toAdd: [],
        toDelete: []
      }
    };
  }

  function deleteOptions(item) {
    selectedItem = item;
    if (item.modules.length > 1) {
      moduleSelectionModal = true;
    } else {
      deleteConfirmationModal = true;
    }
  }

  function deleteMultipleOption() {
    if (selectedRowIds.length > 1) {
      deleteMultipleConfirmation = true;
    } else if (selectedRowIds.length === 1) {
      const data = parsed
        .filter((item) => selectedRowIds?.includes(item.id))
        .map(({ modules, searchPhrase, tag }) => ({ modules, searchPhrase, tag }));

      deleteOptions(data[0]);
    }
  }

  function closeModalToAddModule() {
    openAddModules = false;
    isEditingItem = {
      ...isEditingItem,
      modules: {
        ...isEditingItem.modules,
        toAdd: addModuleTmp
      }
    };
    addModuleTmp = [];
  }

  function deleteTermSingleModule() {
    const data = {
      term: selectedItem.searchPhrase,
      cpe: selectedItem.cpe,
      modules: selectedItem.modules.map((x) => x.moduleId),
      settingType: setting.type
    };
    dispatch('deleteSingle', data);
    deleteConfirmationModal = false;
  }

  function deleteMultiple() {
    const data = parsed
      .filter((item) => selectedRowIds?.includes(item.id))
      .map(({ modules, searchPhrase, tag }) => ({ modules, searchPhrase, tag }));
    const toDelete: DeleteType = {
      data,
      settingType: setting.type
    };
    dispatch('delete', toDelete);
  }

  function deleteTerm() {
    const data = {
      term: selectedItem.searchPhrase,
      cpe: selectedItem?.cpe,
      modules: group,
      settingType: setting.type
    };
    dispatch('deleteSingle', data);
    moduleSelectionModal = false;
  }

  function resetData() {
    addExpanded = false;
    addText = '';
    globalSettingsStore.reset();
    reset();
  }
</script>

<div
  data-test={SETTINGS_DICTIONARY[setting.type]}
  class="relative border-[1px] border-solid border-ctip-border rounded h-full"
>
  <div class="relative border-b border-solid rounded-t bg-ctip-ui border-ctip-border">
    <div class="flex flex-wrap items-center justify-between p-2">
      <div class="flex items-center">
        {#if !searchExpanded && !isDetails}
          <span class="font-bold" class:uppercase={setting.type !== 'IP'}>{SETTINGS_DICTIONARY[setting.type]}</span>
          <slot name="after-title" />
        {/if}
      </div>
      <div class="flex items-center gap-1">
        {#if !searchExpanded}
          {#if SETTINGS[setting.type].description}
            <div class="px-2" bind:this={infoDiv}>
              <TooltipDefinition {align}>
                <InformationFilled class="mt-1 fill-ctip-interactive" />
                <svelte:fragment slot="tooltip">
                  <slot name="info">
                    {SETTINGS[setting.type].description}
                  </slot>
                </svelte:fragment>
              </TooltipDefinition>
            </div>
          {/if}
          <slot name="actions" />
          {#if !($roleStore.customer || $roleStore.operator) && !isDetails}
            <Button
              data-test="add"
              kind="ghost"
              class="px-2 rounded"
              size="small"
              on:click={() => (addExpanded = !addExpanded)}
            >
              <Add />
            </Button>
          {/if}
        {/if}
        {#if !hideSearch}
          <Search
            placeholder="{SETTINGS[setting.type].placeholder} or Tag"
            bind:value={search}
            size="sm"
            on:collapse={() => setTimeout(() => (searchExpanded = false), 100)}
            on:expand={() => (searchExpanded = true)}
            expandable
          />
        {/if}
        {#if !isDetails}
          <Button
            data-test="setting-details"
            kind="ghost"
            class="px-2 rounded"
            size="small"
            on:click={() => (openDetailSettings = !openDetailSettings)}
          >
            <Maximize />
          </Button>
        {/if}
      </div>
    </div>
    {#if addExpanded}
      <div class="absolute z-10 grid w-full gap-2 p-2 border-b border-solid bg-ctip-ui border-ctip-border">
        <slot name="add-form">
          <form use:form>
            <div class="mb-3">
              <MultiSelect
                selectedIds={$data?.modules ?? []}
                name="modules"
                label="Modules"
                items={filteredModules.length ? filteredModules?.map(({ id, name }) => ({ id, text: name })) : []}
                on:select={(items) => {
                  setTouched('modules', true);
                  $data.modules = items.detail.selectedIds;
                }}
                invalidText={$errors?.modules?.join(', ')}
                invalid={!!$errors?.modules}
              />
            </div>
            {#if CHECK?.includes(setting.type) || setting.type === 'IMAGE'}
              <div class="mb-3">
                <TextArea
                  name="data"
                  bind:value={$data.data}
                  light
                  rows={setting.type === 'IMAGE' ? 1 : 4}
                  placeholder={SETTINGS[setting.type].placeholderAdd}
                  invalidText={$errors?.data?.join(', ')}
                  invalid={!!$errors.data}
                />
              </div>
            {/if}
            {#if !CHECK?.includes(setting.type)}
              {#if setting.type === 'FILE_EXTENSION' || setting.type === 'EXTRA_CATEGORIES'}
                <div class="mb-3">
                  <MultiSelect
                    name="dataMulti"
                    label={setting.type === 'FILE_EXTENSION' ? 'File Extension' : 'RSS Categories'}
                    items={ASSETS_LISTS[setting.type].map(({ id, value }) => ({ id, text: value }))}
                    let:item
                    on:select={(items) => {
                      setTouched('dataMulti', true);
                      $data.dataMulti = items.detail.selectedIds;
                    }}
                    invalidText={$errors?.dataMulti?.join(', ')}
                    invalid={!!$errors.dataMulti}
                    ><span
                      use:truncate
                      use:tooltip
                      title={ASSETS_LISTS[setting.type].find((asset) => asset.id === item.id).formats}>{item.text}</span
                    >
                  </MultiSelect>
                </div>
              {/if}
              {#if setting.type === 'IMAGE'}
                <UploaderFile titleButton="Choose logo" bind:imageFile={$data.image} />
              {/if}
              {#if setting.type === 'CPE_TECH'}
                <Checkbox
                  labelText="Include deprecated versions"
                  name="techIncludeDeprecated"
                  bind:value={$data.techIncludeDeprecated}
                />
                <div class="mb-3">
                  <ComboBox
                    size="sm"
                    bind:value={vendorSearch}
                    on:select={(e) => {
                      $data.techVendor = e.detail.selectedItem;
                    }}
                    on:clear={() => ($data.techVendor = undefined)}
                    titleText="Vendor"
                    placeholder="Search for vendor"
                    items={handleItems(vendors, vendorLoading, vendorSearch)}
                  />
                  {#if $errors?.techVendor?.[0]}
                    <small class="text-ctip-danger">{$errors.techVendor[0]}</small>
                  {/if}
                </div>
                {#if $data.techVendor}
                  <div class="mb-3">
                    <ComboBox
                      size="sm"
                      bind:value={productSearch}
                      on:select={(e) => {
                        $data.techProduct = e.detail.selectedItem;
                      }}
                      on:clear={() => ($data.techProduct = undefined)}
                      titleText="Product"
                      placeholder="Search for product"
                      items={handleItems(products, productLoading, productSearch)}
                    />
                  </div>
                {/if}
                {#if $data.techVendor && $data.techProduct}
                  <div class="mb-3">
                    <ComboBox
                      size="sm"
                      bind:value={versionSearch}
                      on:select={(e) => {
                        $data.techVersion = e.detail.selectedItem;
                      }}
                      on:clear={() => ($data.techVersion = undefined)}
                      titleText="Version"
                      placeholder="Search for a version"
                      items={handleItems(versions, versionLoading, versionSearch)}
                    />
                  </div>
                {/if}
              {/if}
              {#if setting.type === 'BANK'}
                <div class="mb-3">
                  <TextInput
                    name="data"
                    placeholder={SETTINGS[setting.type].placeholderAdd}
                    invalidText={$errors?.data?.join(', ')}
                    invalid={!!$errors.data}
                    bind:value={$data.data}
                  />
                </div>
                <div class="mb-3">
                  <TextInput
                    name="bincodes"
                    placeholder={SETTINGS[setting.type].placeholderAddBincode}
                    invalidText={$errors?.bincodes?.join(', ')}
                    invalid={!!$errors.bincodes}
                    bind:value={$data.bincodes}
                  />
                </div>
              {/if}
            {/if}
            {#if setting.type !== 'CONFIDENTIAL' && setting.type !== 'RSS' && setting.type !== 'EXTRA_CATEGORIES' && setting.type !== 'FILE_EXTENSION'}
              <div class="mb-3">
                <TextInput name="tags" placeholder="Tag" bind:value={$data.tags} />
              </div>
            {/if}
            <div class="flex flex-row-reverse gap-2">
              <GenericButton on:click={submit} kind="primary" disabled={$isSubmitting}>Save</GenericButton>
              <GenericButton kind="danger-tertiary" size="small" on:click={resetData}>Close</GenericButton>
            </div>
          </form>
        </slot>
      </div>
    {/if}
  </div>
  <div class="relative" class:!h-80={selectedRowIds.length}>
    {#if loading}
      <InlineLoading class="flex items-center justify-center h-full" />
    {:else if setting.values.length}
      <DataTable
        batchSelection={!($roleStore.customer || $roleStore.operator)}
        stickyHeader
        bind:selectedRowIds
        {headers}
        class="[&_thead]:text-xs [&_td]:text-center [&_tr]:h-auto [&_table]:h-[286px] asset-table"
        {rows}
      >
        <svelte:fragment slot="cell" let:cell let:row>
          {#if cell.key === 'searchPhrase'}
            <span use:truncate use:tooltip title={row.searchPhrase}> {row.searchPhrase}</span>
          {:else if cell.key === 'modules'}
            <div class="flex flex-wrap z-10">
              {#each row.modules as module}
                <Tag
                  interactive
                  filter={isEditingItem.editing && isEditingItem.item === row.id && setting.type !== 'IMAGE'}
                  on:close={() => deleteOrRestoreModule(module.moduleId)}
                  class={isEditingItem.editing && isEditingItem.modules.toDelete?.includes(module.moduleId)
                    ? 'whitespace-nowrap module-tag'
                    : 'whitespace-nowrap'}
                  >{module.moduleName}
                </Tag>
              {/each}
              {#if isEditingItem.editing && isEditingItem.item === row.id && setting.type !== 'IMAGE'}
                {#each isEditingItem.modules.toAdd as moduleId}
                  <Tag
                    interactive
                    filter={isEditingItem.editing && isEditingItem.item === row.id && setting.type !== 'IMAGE'}
                    on:close={() => removeProvisional(moduleId)}
                    class={isEditingItem.editing && isEditingItem.modules.toAdd?.includes(moduleId)
                      ? 'whitespace-nowrap bg-ctip-success text-ctip-white'
                      : 'whitespace-nowrap'}
                    >{getModuleName(moduleId)}
                  </Tag>
                {/each}
              {/if}

              {#if isEditingItem.editing && isEditingItem.item === row.id && setting.type !== 'IMAGE'}
                <GenericButton kind="ghost" on:click={() => (openAddModules = true)}><AddAlt /></GenericButton>
              {/if}
            </div>
          {:else if cell.key === 'tag'}
            {#if isEditingItem.editing && isEditingItem.item === row.id}
              <input value={row.tag} class="w-24 h-7" on:keyup={(event) => (editTag = event.target.value)} />
            {:else}
              <span
                use:tooltip
                title="Click to filter by this tag"
                class="cursor-pointer"
                on:click={() => dispatch('filter', row.tag)}>{row.tag}</span
              >
            {/if}
          {:else if cell.key === 'actions'}
            <GenericButton
              data-test="edit"
              class="text-center text-ctip-interactive"
              on:click={() => editItem(row)}
              disabled={isEditingItem.editing && isEditingItem.item !== row.id}
            >
              {#if isEditingItem.editing && isEditingItem.item === row.id}
                <Save />
              {:else}
                <Edit />
              {/if}
            </GenericButton>
            <GenericButton data-test="delete" class="text-ctip-danger" on:click={() => cancelOrDelete(row)}>
              {#if isEditingItem.editing && isEditingItem.item === row.id}
                <CloseFilled />
              {:else}
                <TrashCan />
              {/if}
            </GenericButton>
          {:else}
            {cell.display ? cell.display(row) : cell.value}
          {/if}
        </svelte:fragment>
      </DataTable>
    {:else}
      <div class="grid px-2 py-12">
        <img class="mx-auto" width="70" alt="no-resources-found" src="/assets/default_images/searching.svg" />
        <span class="mx-auto mt-2 text-base text-center text-ctip-interactive">
          {noItemsMessage}
        </span>
      </div>
    {/if}
    <slot name="after" />
  </div>
  {#if selectedRowIds.length}
    <div
      in:slide
      out:slide={{ duration: 100 }}
      class="absolute bottom-0 left-0 flex justify-end w-full p-2 border-t border-solid bg-ctip-ui border-ctip-border"
    >
      <Button on:click={deleteMultipleOption} kind="danger" class="px-2 rounded" size="small">Delete</Button>
    </div>
  {/if}
</div>

<div use:modalTeleport>
  <WarningModal
    bind:open={deleteConfirmationModal}
    modalHeading="Remove setting"
    question="Are you sure you want to remove the selected setting?"
    secondMessage="This action cannot be undone."
    on:submit={deleteTermSingleModule}
    on:closeModal={() => (deleteConfirmationModal = false)}
    class="z-[9001]"
  />
  <WarningModal
    bind:open={deleteMultipleConfirmation}
    modalHeading="Remove settings"
    question="Are you sure you want to remove the selected settings?"
    secondMessage="This action cannot be undone."
    on:submit={deleteMultiple}
    on:closeModal={() => (deleteMultipleConfirmation = false)}
    class="z-[9001]"
  />

  <Modal
    bind:open={openAddModules}
    modalHeading="Add Modules"
    passiveModal={false}
    size="lg"
    primaryButtonText={openAddModules ? 'Close' : ''}
    on:click:button--primary={closeModalToAddModule}
    class="z-[9001]"
  >
    <div class="mb-52">
      <h4>Select at least one Module</h4>
      <MultiSelect
        label="Modules"
        items={modulesToAdd.length ? modulesToAdd?.map(({ id, name }) => ({ id, text: name })) : []}
        on:select={(items) => (addModuleTmp = [...isEditingItem.modules.toAdd, ...items.detail.selectedIds])}
      />
    </div>
  </Modal>
</div>

<div use:modalTeleport>
  <Modal
    bind:open={moduleSelectionModal}
    modalHeading="Choose modules"
    primaryButtonText="Delete"
    secondaryButtonText="Cancel"
    on:submit={deleteTerm}
    on:click:button--secondary={() => (moduleSelectionModal = false)}
    on:close={() => (moduleSelectionModal = false)}
    class="z-[9001]"
  >
    <InlineNotification kind="info" subtitle="Choose the modules you want to delete the term from." />
    {#each selectedItem?.modules as module}
      <Checkbox bind:group labelText={module?.moduleName} value={module?.moduleId} />
    {:else}
      <span>Not</span>
    {/each}
  </Modal>
</div>

<style>
  :global(.module-tag) {
    opacity: 0.4;
  }

  :global(.module-tag svg) {
    transform: rotate(45deg);
  }
</style>
