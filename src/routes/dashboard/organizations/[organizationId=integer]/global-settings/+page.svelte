<script lang="ts">
  import GenericButton from '$lib/components/Buttons/GenericButton.svelte';
  import InfoCard from '$lib/components/Card/InfoCard.svelte';
  import TotalSettings from '$lib/components/GlobalSettings/TotalSettings.svelte';
  import { modulesStore } from '$stores/module';
  import { onMount } from 'svelte';
  import { SETTINGS_PER_MODULE, PRIORITY_TYPES, PRIORITY_TYPES_SORT, SETTINGS_DICTIONARY } from '$lib/constants/assets';
  import Client from '$lib/client';
  import { currentOrganization, currentOrganizationId } from '$stores/organization';
  import {
    DataTable,
    InlineNotification,
    Loading,
    Modal,
    Toolbar,
    ToolbarContent,
    ToolbarSearch
  } from 'carbon-components-svelte';
  import { Filter, FilterRemove } from 'carbon-icons-svelte';
  import Filters from '$lib/components/GlobalSettings/Filters.svelte';
  import TooltipWrap from '$lib/components/TooltipWrap.svelte';
  import roleStore from '$stores/role';
  import SearchDebounce from '$lib/components/SearchDebounce.svelte';
  import EmptyData from '$lib/components/EmptyData/EmptyData.svelte';
  import { isEmpty } from 'lodash';
  import AssetCard from '$lib/components/GlobalSettings/AssetCard.svelte';
  import type { DeleteType, SettingsDataType, DataToEditItemType, ErrorInfoDataType } from '$lib/types/assets';
  import notifications from '$stores/notification';
  import { ERROR_DICTIONARY } from '$lib/constants/errors.Dictionary';
  import globalSettingsStore from '$stores/globalSettings';

  let open = false; // show up or show down the total settings modal
  let openFilters = false; // show up or show down the filters modal
  let searchExpanded = false;
  let loadingGlobalSettings = false;
  let allowedSettingTypes = [];
  let allowedModules = [];
  let tagsList: string[] = [];
  let provisionalSettingsType = [];
  let provisionalModuleType = [];
  let provisionalTags = [];
  let filteredSettingTypes = []; // for not repeat settings
  let items = [];
  let search = '';
  let errorModal = false;
  let errorInfo: ErrorInfoDataType = { type: '', data: [], modules: [], tag: '' };

  $: modulesTypesMulti = [...new Set(allowedModules.map(({ type }: any) => type))].filter(
    (type: string) => type !== 'THREAT_CONTEXT' && type !== 'CUSTOM'
  );
  $: disabledView = !$roleStore.admin && !$roleStore.master && !$roleStore.superadmin && !$currentOrganization.enabled;
  $: showEditButton =
    errorInfo.type === 'DOMAIN' &&
    !errorInfo.data.some((element: ErrorInfoDataType[]) =>
      element.some(({ messageKey }) => messageKey === 'error.band_exceed_total')
    );

  const client = new Client();
  const settingTypes = [
    'TWITTER_TWEETS_FROM_PROFILE',
    'IMAGE',
    'EXTRA_CATEGORIES',
    'TWEETS_FROM_PROFILE',
    'TWITTER_PROFILE',
    'RSS',
    'CPE_TECH',
    'TYPO_KEYWORD_DISTANCE',
    'TYPO_KEYWORD_REGEX',
    'TYPOSQUATTING',
    'FILE_EXTENSION',
    'CONFIDENTIAL',
    'FILENAME',
    'KEYWORD',
    'CREDIT_CARD',
    'BANK',
    'EMAIL',
    'IP',
    'DOMAIN'
  ];

  onMount(() => {
    init();
  });

  async function init() {
    try {
      loadingGlobalSettings = true;
      allowedModules = $modulesStore;
      const index = allowedModules.findIndex((x) => x.type === 'THREAT_CONTEXT');
      if (index > -1) {
        allowedModules.splice(index);
      }
      const moduleTypes = [...new Set($modulesStore.map((item) => item.type))];
      settingTypes.forEach((setting) => {
        moduleTypes.forEach((mod) => {
          if (
            SETTINGS_PER_MODULE[setting] &&
            SETTINGS_PER_MODULE[setting].includes(mod) &&
            !allowedSettingTypes.includes(setting)
          ) {
            allowedSettingTypes = [setting, ...allowedSettingTypes];
          }
        });
      });
      await getTags();
    } catch (k) {
      loadingGlobalSettings = false;
    }
  }

  async function getTags() {
    const { data } = await client.assets.getTags($currentOrganizationId);
    tagsList = data.list;
    await list();
  }

  async function list() {
    loadingGlobalSettings = true;
    try {
      filteredSettingTypes = [];
      const params = {
        ...(provisionalTags.length && { tags: provisionalTags.join() }),
        ...(provisionalModuleType.length && { modulesTypes: provisionalModuleType.join() }),
        ...(provisionalSettingsType.length && { types: provisionalSettingsType.join() }),
        ...(search && { q: search })
      };
      const { data } = await client.assets.getSettings($currentOrganizationId, params);

      const priorityAssets = [];
      const newArray = [];
      const emptyAssets = [];
      settingTypes.forEach((setting) => {
        const obj = {
          type: setting,
          values: data?.[setting] || []
        };

        if (data?.[setting] && PRIORITY_TYPES.includes(setting)) {
          Object.entries(PRIORITY_TYPES_SORT).forEach((value) => {
            if (setting === value[0].toString()) {
              obj['sort'] = value[1];
            }
          });
          priorityAssets.push(obj);
          filteredSettingTypes.push(setting);
        } else if (data?.[setting] || params?.types?.includes(setting)) {
          newArray.unshift(obj);
          filteredSettingTypes.push(setting);
        } else if (isEmpty(params) && setting in SETTINGS_PER_MODULE) {
          allowedModules.forEach((mod) => {
            if (SETTINGS_PER_MODULE[setting].includes(mod.type) && !filteredSettingTypes.includes(setting)) {
              emptyAssets.unshift(obj);
              filteredSettingTypes.push(setting);
            }
          });
        } else if (SETTINGS_PER_MODULE?.[setting] && params?.modulesTypes && !params?.types && !params?.tags) {
          params.modulesTypes.split(',').forEach((mod) => {
            if (SETTINGS_PER_MODULE[setting].includes(mod) && !filteredSettingTypes.includes(setting)) {
              emptyAssets.unshift(obj);
              filteredSettingTypes.push(setting);
            }
          });
        }
      });

      items = priorityAssets.sort((a, b) => a.sort - b.sort).concat(newArray.concat(emptyAssets));
      loadingGlobalSettings = false;
    } catch (error) {
      loadingGlobalSettings = false;
    }
  }

  function clearFilters() {
    provisionalSettingsType = [];
    provisionalModuleType = [];
    provisionalTags = [];
    list();
  }

  function filterByTag(tag: string) {
    provisionalTags = [...provisionalTags, tag];
    list();
  }

  async function deleteOneSetting(data) {
    try {
      loadingGlobalSettings = true;
      const settingType = data.settingType.startsWith('credit') ? 'credit_card' : data.settingType;
      const isRss = settingType === 'RSS';
      const isTech = settingType === 'CPE_TECH';
      let value = data.term;
      if (isRss) {
        value = {
          url: value,
          title: value
        };
      } else if (isTech) {
        value = {
          cpe: data.cpe,
          title: value
        };
      }
      const values = [{ ...(isRss || isTech ? { ...value } : { value }) }];
      const { failed } = await client.assets.deleteSetting($currentOrganizationId, data.modules, settingType, values);
      await list();

      if (!isEmpty(failed)) {
        errorModal = true;
        errorInfo = {
          type: data.settingType,
          data: Object.keys(failed).map((key) => failed[key]),
          modules: data.modules,
          tag: ''
        };
      } else {
        notifications.notify({
          kind: 'success',
          title: 'Deleted succesfully'
        });
      }

      loadingGlobalSettings = false;
    } catch (error) {
      loadingGlobalSettings = false;
      notifications.notify({
        kind: 'error',
        title: 'Something went wrong, please try again'
      });
    }
  }

  async function deleteMultiple(data: DeleteType) {
    loadingGlobalSettings = true;
    try {
      const settingType = data.settingType.startsWith('credit') ? 'credit_card' : data.settingType;
      const isTech = settingType === 'CPE_TECH';
      const modules = data.data.map((a: SettingsDataType) => a.modules);
      const merged = [].concat(...modules);
      const ids = merged.map((e) => {
        return e.moduleId;
      });

      const uniqueIds = [...new Set(ids)];
      const terms = data.data.map(({ searchPhrase, cpe }) =>
        isTech ? { title: searchPhrase, cpe } : { value: searchPhrase }
      );
      const { failed } = await client.assets.deleteSetting($currentOrganizationId, uniqueIds, settingType, terms);
      await list();

      if (!isEmpty(failed)) {
        errorModal = true;
        errorInfo = {
          type: data.settingType,
          data: Object.keys(failed).map((key) => failed[key]),
          modules: merged,
          tag: ''
        };
      } else {
        notifications.notify({
          kind: 'success',
          title: 'Deleted succesfully'
        });
      }

      loadingGlobalSettings = false;
    } catch (error) {
      loadingGlobalSettings = false;
      notifications.notify({
        kind: 'error',
        title: 'Something went wrong, please try again'
      });
    }
  }

  async function editElement(element: DataToEditItemType) {
    loadingGlobalSettings = true;
    try {
      if (element.type === 'IMAGE') {
        await client.assets.editTags($currentOrganizationId, element);
      } else {
        await client.assets.editElement($currentOrganizationId, element);
      }

      await getTags();
      loadingGlobalSettings = false;
    } catch (error) {
      loadingGlobalSettings = false;
    }
  }

  function validateResponse(response: any[]) {
    return Object.entries(response).some(([key, value]: any) => value.length);
  }

  async function addSetting(data) {
    loadingGlobalSettings = true;
    try {
      let response;
      if (data.settingType === 'IMAGE') {
        response = await client.assets.saveSettingsImage($currentOrganizationId, data);
      } else {
        response = await client.assets.saveSettingsData($currentOrganizationId, data);
      }
      const { ok, failed } = response.data;

      if (ok === true || (!isEmpty(ok) && validateResponse(ok))) {
        list();
        notifications.notify({
          kind: 'success',
          title: 'Your setting was added successfully!',
          subtitle: `The ${SETTINGS_DICTIONARY[data.settingType]} have been saved correctly.`
        });
      }

      if (!isEmpty(failed)) {
        errorModal = true;
        errorInfo = {
          type: data.settingType,
          data: Object.keys(failed).map((key) => failed[key]),
          modules: data.modules,
          tag: data.tag
        };
      }
    } catch (error) {
      loadingGlobalSettings = false;
    }
  }

  function getModuleName(id: number) {
    return allowedModules.find((x) => x.id === id).name;
  }

  function getMessageKey(key: string) {
    return ERROR_DICTIONARY[key] ? ERROR_DICTIONARY[key] : 'There was a problem while processing the request';
  }

  function parseError(item) {
    return item.map((error, index) => ({ id: index, value: error.field, error: getMessageKey(error.messageKey) }));
  }

  function editFailedTerms() {
    const terms = [];

    errorInfo.data.forEach((mod) => {
      mod.forEach((element) => {
        terms.push(element.field);
      });
    });

    const unique = [...new Set(terms)];

    $globalSettingsStore = {
      ...$globalSettingsStore,
      action: 'edit',
      errorInfo: {
        moduleTye: errorInfo.type,
        terms: unique,
        modules: errorInfo.modules,
        tag: errorInfo.tag
      }
    };

    errorModal = false;
    loadingGlobalSettings = false;
  }

  function cancelEditFailed() {
    $globalSettingsStore = {
      ...$globalSettingsStore,
      action: 'cancel'
    };
    errorModal = false;
    loadingGlobalSettings = false;
  }
</script>

<div class="flex justify-between">
  <h3>Global Settings</h3>
  <GenericButton kind="tertiary" on:click={() => (open = true)}>Total settings values</GenericButton>
</div>

<InfoCard>
  <svelte:fragment slot="action">
    <Toolbar
      class="toolbar-content-clip-path-none sticky grid top-14 !z-[5]
      {openFilters ? 'static lg:sticky' : ''}
      "
    >
      <ToolbarContent>
        <div class="flex items-center w-full">
          <div class="mr-auto [&_ul]:!left-0" />

          {#if provisionalSettingsType.length || provisionalModuleType.length || provisionalTags.length || openFilters}
            <TooltipWrap direction="top" align="end">
              <span class="w-40 block" slot="tooltip">Clear filters to enable free text search</span>
              <ToolbarSearch class="opacity-30 w-11" disabled />
            </TooltipWrap>
          {:else}
            <SearchDebounce bind:expanded={searchExpanded} bind:value={search} on:search={list} startSearch={1} />
          {/if}
          <div class="w-2" />
          {#if provisionalSettingsType.length || provisionalModuleType.length || provisionalTags.length}
            <GenericButton
              kind="danger-tertiary"
              class="mr-2 pr-10 min-w-[125px]"
              on:click={clearFilters}
              icon={FilterRemove}
            >
              Clear filters
            </GenericButton>
          {/if}
          <div class="relative">
            <GenericButton
              kind="primary"
              class="pr-10 min-w-[132px]"
              disabled={searchExpanded}
              on:click={(e) => {
                e.stopImmediatePropagation();
                openFilters = !openFilters;
              }}
              icon={Filter}
            >
              Filters
            </GenericButton>

            {#if openFilters}
              <Filters
                bind:openFilters
                bind:provisionalSettingsType
                bind:provisionalModuleType
                bind:provisionalTags
                bind:allowedSettingTypes
                bind:modulesTypesMulti
                bind:tagsList
                on:applyFilter={list}
              />
            {/if}
          </div>
        </div></ToolbarContent
      >
    </Toolbar>
  </svelte:fragment>
  <div class="flex flex-col w-full">
    {#if disabledView}
      <InlineNotification
        hideCloseButton
        kind="warning"
        subtitle="Settings configurations can't be modified because this organization is disabled."
        class="max-w-full"
      />
    {/if}
    <div
      class:cursor-not-allowed={disabledView}
      class:opacity-60={disabledView}
      class:pointer-events-none={disabledView}
    >
      {#if loadingGlobalSettings}
        <Loading />
      {:else if !loadingGlobalSettings && !allowedModules.length}
        <EmptyData
          messageObj={{
            msg: `You haven't added any modules yet. Once you have created some modules, you will be able to manage all your
            assets here.`
          }}
        />
      {:else if !loadingGlobalSettings && !items.length}
        <EmptyData
          messageObj={{
            msg: `No results found`
          }}
        />
      {:else}
        <div class="grid grid-cols-2 gap-5 p-4">
          {#each items as item}
            <AssetCard
              bind:setting={item}
              on:delete={(event) => deleteMultiple(event.detail)}
              on:deleteSingle={(event) => deleteOneSetting(event.detail)}
              on:editElement={(event) => editElement(event.detail)}
              on:addNewSetting={(event) => addSetting(event.detail)}
              on:filter={(event) => filterByTag(event.detail)}
              {allowedModules}
            />
          {/each}
        </div>
      {/if}
    </div>
  </div>
</InfoCard>

<TotalSettings bind:open />
<Modal
  bind:open={errorModal}
  modalHeading="Error Info"
  passiveModal={false}
  size="lg"
  primaryButtonText={showEditButton ? 'Edit' : 'Cancel'}
  secondaryButtonText={showEditButton ? 'Cancel' : ''}
  on:click:button--primary={showEditButton ? editFailedTerms : cancelEditFailed}
  on:click:button--secondary={cancelEditFailed}
>
  {#each errorInfo.data as item}
    <p class="font-bold mb-1 text-primary">{getModuleName(item[0].moduleId)}</p>
    <DataTable
      class="[&_td]:text-center"
      headers={[
        { key: 'value', value: 'Value' },
        { key: 'error', value: 'Error' }
      ]}
      rows={parseError(item)}
    />
  {/each}
</Modal>
