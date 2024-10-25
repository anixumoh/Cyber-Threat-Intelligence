<script lang="ts">
  import {
    Button,
    DataTable,
    DataTableSkeleton,
    Modal,
    Pagination,
    Select,
    SelectItem,
    StructuredList,
    StructuredListBody,
    StructuredListCell,
    StructuredListRow
  } from 'carbon-components-svelte';
  import Client from '$lib/client';
  import type Organization from '$lib/types/organization';
  import type { DataTableHeader } from 'carbon-components-svelte/types/DataTable/DataTable.svelte';
  import { Toggle } from 'carbon-components-svelte';
  import {
    AddAlt,
    CaretUp,
    CloudDownload,
    Edit,
    Export,
    ListDropdown,
    Password,
    Renew,
    TrashCan
  } from 'carbon-icons-svelte';
  import type { SortType } from '$lib/types';
  import type { Customer, Params } from './types';
  import ModuleCard from '$lib/components/Admin/Orgs/ModuleCard.svelte';
  import { onMount } from 'svelte';
  import { Loading } from 'carbon-components-svelte';
  import { moduleIconMap } from '$lib/components/layout/menu-helper';
  import { MODULE_NAME } from '$lib/constants/modules';
  import roleStore from '$stores/role';
  import GenericButton from '$lib/components/Buttons/GenericButton.svelte';
  import notifications from '$stores/notification';
  import type { SyncClientResult } from '$lib/types/admin';
  import type Module from '$lib/types/module';
  import { modulesTypes, type ModuleType } from '$lib/types/module';
  import { moduleCacheStore, modulesStore } from '$stores/module';
  import CreateModule from '$lib/components/CRUD_Modules/CreateModules/CreateModule.svelte';
  import { currentOrganizationId, organizationsStore } from '$stores/organization';
  import { pageSizes } from '$lib/constants/pagination';
  import EditModule from '$lib/components/CRUD_Modules/EditModules/EditModule.svelte';
  import EditOrganization from '$lib/components/CRUD_Organizations/EditOrganization/EditOrganization.svelte';
  import { isLoadingOrg } from '$stores/organization';

  //VARIABLES
  //sync functionallity:
  let customers: Customer[] = [];
  let selectedCustomer: number = null;
  let selectedSyncOrgId: number = null;
  let isSyncingCustomer = false;
  let syncWithClientResult: SyncClientResult = null;
  let syncWithCustomerModalOpen = false;
  let loadingCustomers = false;

  //delete functionallity:
  let moduleDataTobeDeleted: { belongsToOrgId?: number; moduleId?: number } = {};

  //edit functionallity:
  let moduleDataToEdit: Module = null;
  let editModuleModalOpen = false;
  let editOrgModalOpen = false;
  let editOrganizationModule;
  let moduleTypeToEdit: ModuleType;
  let editingModuleOfOrgId: number;
  let editOrgPredefinedTab: number = 0;

  //import new module functionallity:
  let importingNewModule = false;
  let newModuleModalOpen = false;
  let loadingNewModuleData = false;

  //create new module functionallity:
  let possibleNewModulesToCreate: ModuleType[] = [];
  let selectedNewModule: ModuleType;
  let currentModulesOnDisplay: { id: number; modules: Module[]; loadingModules: boolean }[] = [];

  //other
  let loadingTableData: boolean = false;
  let loadingMonitoredAssets: boolean = false;
  let isShowingAssets = false;
  let rows: Organization[] = [];
  let expandedRowIds = [];
  let selectedRowIds: number[] = [];
  let totalResources: number;
  let sortKey: 'name';
  let sortDirection: SortType = 'descending';
  let paramsForTable: Params = {
    currentPage: 1,
    pageSize: 10,
    orderByName: true
  };
  let filteredAssets;
  let modulesThatAreLoading: Record<number, boolean> = {};

  const client = new Client();
  const headers: DataTableHeader[] = [
    { key: 'name', value: 'Name' },
    { key: 'status', value: 'Status', sort: false, width: '200px' }
  ];

  $: getOrganizations(paramsForTable);
  $: notContractedModulesExist = syncWithClientResult?.not_contracted.length > 0;
  //LIFECYCLEs
  onMount(async () => {
    await loadMonitoredAssets();
  });

  //FUNCTIONS
  async function loadMonitoredAssets() {
    loadingMonitoredAssets = true;
    const { IP, IP_RANGE, DOMAIN, SUBDOMAIN, KEYWORD, BINCODES } = await client.modules.getMonitoredAssets();
    filteredAssets = { IP, IP_RANGE, DOMAIN, SUBDOMAIN, KEYWORD, BINCODES };
    loadingMonitoredAssets = false;
  }
  async function getOrganizations(params: Params) {
    loadingTableData = true;
    const data = await client.modules.getOrganizationsFiltered(params.currentPage, params.pageSize, params.orderByName);
    rows = data.list as Organization[];
    totalResources = data.total_resources;
    loadingTableData = false;
  }
  function onClickHeader(e: CustomEvent) {
    const key = e?.detail?.header?.key;
    const direction: SortType = e?.detail?.sortDirection;
    if (key && direction) {
      setSortFilter(key, direction);
    }
    sortKey = direction === 'none' ? undefined : key;
    sortDirection = direction;
  }

  function setSortFilter(key: string, mode: SortType) {
    const orderByName = mode === 'descending' ? false : true;
    paramsForTable = { ...paramsForTable, orderByName };
  }
  async function handleRowExpand(row) {
    if (expandedRowIds.includes(row.id)) {
      expandedRowIds = expandedRowIds.filter((id) => id !== row.id);
      currentModulesOnDisplay = currentModulesOnDisplay.filter((item) => item.id !== row.id);
    } else {
      expandedRowIds = [...expandedRowIds, row.id];
      await loadModulesOfCurrentRow(row.id);
    }
    (document.activeElement as HTMLElement)?.blur();
  }
  async function loadModulesOfCurrentRow(rowId: number, forceLoad: boolean = false) {
    const index = currentModulesOnDisplay.findIndex((item) => item.id === rowId);
    if (index === -1) {
      currentModulesOnDisplay = [...currentModulesOnDisplay, { id: rowId, modules: [], loadingModules: true }];
      const modules = (await client.threats.getModulesStandalone(rowId)).data as Module[];

      currentModulesOnDisplay = currentModulesOnDisplay.map((item) => {
        if (item.id === rowId) {
          return { ...item, modules, loadingModules: false };
        }
        return item;
      });
    }
    if (forceLoad) {
      currentModulesOnDisplay = currentModulesOnDisplay.map((item) => {
        if (item.id === rowId) {
          return { ...item, loadingModules: true };
        }
        return item;
      });
      const { data: modules } = await client.threats.getModulesStandalone(rowId);
      currentModulesOnDisplay = currentModulesOnDisplay.map((item) => {
        if (item.id === rowId) {
          return { ...item, modules, loadingModules: false };
        }
        return item;
      });
    }
  }
  async function exportOrganizationClicked(id: number) {
    const response = await client.modules.exportOrganizations(id);
    const link = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(response),
      download: `Org_${id}_export.zip`
    });
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function newModuleClicked(orgId: number) {
    newModuleModalOpen = true;
    loadingNewModuleData = true;
    await moduleCacheStore.fetchModules(orgId);
    $currentOrganizationId = orgId;
    const allowedModules = await client.modules.getAllowedModules(orgId);
    const threat_context = $modulesStore?.some?.((m) => m.moduleName === 'threat_context');
    possibleNewModulesToCreate = modulesTypes.filter((mod: ModuleType) => {
      if (threat_context && mod.type === 'threat_context') {
        return false;
      } else if (allowedModules?.includes?.(mod.key.toUpperCase()) || mod.key === 'credit_cards_full') {
        return true;
      }
      return false;
    });
    loadingNewModuleData = false;
  }

  async function importModuleClicked(id: number) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.click();
    input.onchange = async (e) => {
      try {
        importingNewModule = true;
        const file = (e.target as HTMLInputElement).files[0];
        const formData: FormData = new FormData();
        formData.append('import_json', file);
        await client.modules.importModule(id, formData);
        await loadModulesOfCurrentRow(id, true);
        notifications.notify({ title: 'Module imported', kind: 'success', subtitle: 'Module imported successfully' });
      } catch (error) {
        notifications.notify({ title: error, kind: 'error', subtitle: 'Error importing module' });
      } finally {
        importingNewModule = false;
      }
    };
    document.body.removeChild(input);
  }
  async function syncWithCustomerClicked(orgId: number, customerId: number) {
    syncWithCustomerModalOpen = true;
    selectedSyncOrgId = orgId;
    loadingCustomers = true;
    try {
      const {
        data: { content }
      } = await client.gateway.post('CUSTOMER', '/api/customers/search?page=1&size=300', { customerId: customerId });
      customers = content.map(({ id, name }: { id: number; name: string }) => ({ id, name }));
      selectedCustomer = customers.find((customer) => customer.id === customerId).id;
    } catch (error) {
      notifications.notify({
        title: 'Sync with customer',
        kind: 'error',
        subtitle: `Error getting customers for the current organization`
      });
    }
    loadingCustomers = false;
  }
  function scrollToTopOfTable() {
    const target = document.getElementById('orgs-table');
    const yOffset = -50;
    const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
    (document.activeElement as HTMLElement)?.blur();
  }
  async function syncCustomerClicked() {
    isSyncingCustomer = true;
    try {
      syncWithClientResult = await client.admin.syncOrg(selectedSyncOrgId, selectedCustomer);
      notifications.notify({
        title: 'Sync with customer',
        kind: 'success',
        subtitle: `Organization synced with customer successfully`
      });
      syncWithCustomerModalOpen = false;
    } catch (error) {
      notifications.notify({
        title: 'Sync with customer',
        kind: 'error',
        subtitle: `Error syncing organization ${selectedSyncOrgId} with customer ${selectedCustomer}`
      });
    }
    isSyncingCustomer = false;
  }
  function getModuleLink(mod: Module) {
    const path = `/dashboard/organizations/${selectedSyncOrgId}/modules/${mod.id}`;
    return mod.type.includes('THREAT_CONTEXT') ? path.concat(`/threat_context/actors`) : path;
  }
  function getModuleNameById(url: string): Module {
    const id = url.replace(/\/organization\/[0-9]+\/module\//g, '');
    const module = currentModulesOnDisplay
      .find((e) => e.id === selectedSyncOrgId)
      .modules.find((e) => e.id.toString() === id);

    return module as Module;
  }
  function selectNewModuleClicked(mod: ModuleType) {
    selectedNewModule = mod;
  }
  async function downloadModuleClicked(data: CustomEvent) {
    try {
      const jsonData = await client.modules.downloadModule(data.detail.belongsToOrgId, data.detail.moduleId);
      const name = jsonData.module ? jsonData.module.name : jsonData.name;
      const fileName = `${name}_${new Date().getTime()}.json`;
      const string = JSON.stringify(jsonData);
      const file = new File([string], fileName, { type: 'application/json' });
      const link = Object.assign(document.createElement('a'), {
        href: URL.createObjectURL(file),
        download: fileName
      });
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      notifications.notify({ title: 'Module downloaded', kind: 'success', subtitle: 'Downloaded successfully' });
    } catch (error) {
      notifications.notify({ title: 'Error downloading module', kind: 'error', subtitle: error });
    }
  }
  function editModuleClicked(data: CustomEvent) {
    moduleDataToEdit = currentModulesOnDisplay
      .find((org) => org.id === data.detail.belongsToOrgId)
      .modules.find((mod) => mod.id === data.detail.moduleId);
    let typeOfModuleToEdit = moduleDataToEdit.type.toLowerCase();

    if (typeOfModuleToEdit === 'credit_cards_full') typeOfModuleToEdit = 'credit_card';
    if (typeOfModuleToEdit === 'credentials') typeOfModuleToEdit = 'credential';
    moduleTypeToEdit = modulesTypes.find((mod) => mod.type === typeOfModuleToEdit);
    editingModuleOfOrgId = data.detail.belongsToOrgId;
    editModuleModalOpen = true;
  }
  function deleteModuleClicked(data: CustomEvent) {
    moduleDataTobeDeleted = data.detail;
  }
  async function deleteModuleConfirmed() {
    try {
      await client.modules.deleteModule(
        moduleDataTobeDeleted.belongsToOrgId,
        moduleDataTobeDeleted.moduleId.toString()
      );
      notifications.notify({ title: 'Module deleted', kind: 'success', subtitle: 'Module deleted successfully' });
      currentModulesOnDisplay = currentModulesOnDisplay.map((org) => {
        if (org.id === moduleDataTobeDeleted.belongsToOrgId) {
          org.modules = org.modules.filter((mod) => mod.id !== moduleDataTobeDeleted.moduleId);
        }
        return org;
      });
    } catch (error) {
      notifications.notify({ title: 'Error deleting module', kind: 'error', subtitle: error });
    } finally {
      moduleDataTobeDeleted = {};
    }
  }
  async function toggleModuleClicked(data: CustomEvent) {
    try {
      const moduleToUpdate = currentModulesOnDisplay
        .find((e) => e.id === data.detail.belongsToOrgId)
        ?.modules.find((e) => e.id === data.detail.moduleId);
      if (moduleToUpdate) {
        moduleToUpdate.enabled = data.detail.extraParams;
        modulesThatAreLoading[data.detail.moduleId] = true;
        await client.modules.editModule(data.detail.belongsToOrgId, moduleToUpdate);
        modulesThatAreLoading[data.detail.moduleId] = false;
        const activatedOrDeactivated = data.detail.extraParams ? 'activated' : 'deactivated';
        notifications.notify({
          title: `Success`,
          kind: 'success',
          subtitle: `Module ${activatedOrDeactivated} successfully`
        });
      } else {
        throw new Error('Module not found');
      }
    } catch (error) {
      notifications.notify({ title: 'Error toggling module', kind: 'error', subtitle: error });
    }
  }
  async function toggleHideCVV(data: CustomEvent) {
    try {
      moduleDataToEdit = currentModulesOnDisplay
        .find((org) => org.id === data.detail.belongsToOrgId)
        .modules.find((mod) => mod.id === data.detail.moduleId);
      moduleDataToEdit.hideCC = !moduleDataToEdit.hideCC;
      modulesThatAreLoading[data.detail.moduleId] = true;

      await client.modules.editModule(data.detail.belongsToOrgId, moduleDataToEdit);
      currentModulesOnDisplay = currentModulesOnDisplay;
      modulesThatAreLoading[data.detail.moduleId] = false;
      const action = moduleDataToEdit.hideCC ? 'hide CVV' : 'reveal CVV';
      notifications.notify({
        title: `Success`,
        kind: 'success',
        subtitle: `Module succesfully changed to ${action}.`
      });
    } catch (error) {
      notifications.notify({ title: 'Error', kind: 'error' });
    }
  }
  async function toggleHidePassword(data: CustomEvent) {
    try {
      moduleDataToEdit = currentModulesOnDisplay
        .find((org) => org.id === data.detail.belongsToOrgId)
        .modules.find((mod) => mod.id === data.detail.moduleId);
      moduleDataToEdit.hidePasswords = !moduleDataToEdit.hidePasswords;
      modulesThatAreLoading[data.detail.moduleId] = true;
      await client.modules.editModule(data.detail.belongsToOrgId, moduleDataToEdit);
      currentModulesOnDisplay = currentModulesOnDisplay;
      modulesThatAreLoading[data.detail.moduleId] = false;
      const action = moduleDataToEdit.hidePasswords ? 'hide passwords' : 'reveal passwords';
      notifications.notify({
        title: `Success`,
        kind: 'success',
        subtitle: `Module succesfully changed to ${action}.`
      });
    } catch (error) {
      notifications.notify({ title: 'Error', kind: 'error' });
    }
  }
  async function openEditOrgModal(id: number) {
    editOrgModalOpen = true;
    await organizationsStore.loadOrgInfoForEdit(id);
  }
  async function orgStatusToggled(orgId: number) {
    try {
      const org = rows.find((org) => org.id === orgId);
      await client.admin.toggleOrganizationStatus(orgId, !org.enabled);
      org.enabled = !org.enabled;
      rows = rows;
      notifications.notify({
        title: 'Success',
        kind: 'success',
        subtitle: `Organization ${org.enabled ? 'enabled' : 'disabled'} successfully`
      });
    } catch (error) {
      notifications.notify({ title: 'Error', kind: 'error', subtitle: error });
    }
  }
</script>

<Button
  kind="tertiary"
  on:click={() => (isShowingAssets = !isShowingAssets)}
  size="small"
  class="w-full sm:w-auto px-2 rounded mb-3"
  iconDescription="Assets">{isShowingAssets ? 'Hide monitored assets' : 'Show monitored assets'}</Button
>
{#if isShowingAssets}
  <div>
    <div class="relative overflow-x-auto">
      {#if !loadingMonitoredAssets}
        <table class="w-3/6 mb-4 text-sm text-left text-gray-500 dark:text-gray-400 border border-solid">
          <tbody>
            {#each Object.entries(filteredAssets) as [key, value], i}
              {#if i % 2 === 0}
                <tr class=" border-b">
                  <td class="px-6 py-2 font-medium whitespace-nowrap">
                    {key}
                  </td>
                  <td class="px-6 py-2">
                    {value}
                  </td>
                  {#if filteredAssets[Object.keys(filteredAssets)[i + 1]]}
                    <td class="px-6 py-2 font-medium whitespace-nowrap">
                      {Object.keys(filteredAssets)[i + 1]}
                    </td>
                    <td class="px-6 py-2">
                      {filteredAssets[Object.keys(filteredAssets)[i + 1]]}
                    </td>
                  {:else}
                    <td class="px-6 py-2" />
                    <td class="px-6 py-2" />
                  {/if}
                </tr>
              {/if}
            {/each}
          </tbody>
        </table>
      {:else}
        <Loading withOverlay={false} />
      {/if}
    </div>
  </div>
{/if}

<h5>Organizations</h5>
{#if loadingTableData}
  <DataTableSkeleton
    {headers}
    class="[&_th]:text-left [&_th_button]:justify-start"
    rows={paramsForTable.pageSize}
    showHeader={false}
    showToolbar={false}
  />
{:else}
  <DataTable
    id="orgs-table"
    sortable
    expandable
    bind:expandedRowIds
    size="compact"
    class="[&_th]:text-left [&_th_button]:justify-start"
    batchSelection
    on:click:header={onClickHeader}
    bind:sortKey
    bind:sortDirection
    bind:selectedRowIds
    {headers}
    {rows}
  >
    <svelte:fragment slot="expanded-row" let:row>
      <div class="flex justify-end mr-3 mb-4">
        <GenericButton
          disabled={!row.enabled && !$roleStore.superadmin}
          kind="tertiary"
          size="small"
          hasTooltip={!row.enabled && !$roleStore.superadmin}
          hasDefaultGenericButtonClasses={false}
          iconDescription="This organization is disabled so you cannot create a new module"
          icon={AddAlt}
          on:click={() => {
            newModuleClicked(row.id);
          }}>New Module</GenericButton
        >
        <Button
          on:click={() => exportOrganizationClicked(row.id)}
          kind="tertiary"
          size="small"
          icon={Export}
          iconDescription="Export">Export Orgranization</Button
        >
        {#if $roleStore.superadmin || $roleStore.master}
          <Button
            on:click={() => {
              syncWithCustomerClicked(row.id, row.customerId);
            }}
            kind="tertiary"
            class={isSyncingCustomer ? '[&_svg]:animate-spin' : ''}
            size="small"
            icon={Renew}
            iconDescription="Sync">Sync with customer</Button
          >
        {/if}
        <GenericButton
          disabled={!row.enabled && !$roleStore.superadmin}
          kind="tertiary"
          size="small"
          hasTooltip={!row.enabled && !$roleStore.superadmin}
          hasDefaultGenericButtonClasses={false}
          iconDescription="This organization is disabled so you cannot import a new module"
          icon={CloudDownload}
          on:click={() => importModuleClicked(row.id)}>Import Module</GenericButton
        >
        {#if importingNewModule}
          <Loading />
        {/if}
      </div>
      <div class="flex flex-wrap">
        {#if currentModulesOnDisplay.find((item) => item.id === row.id).loadingModules}
          <div class="flex justify-center w-full">
            <Loading withOverlay={false} />
          </div>
        {:else}
          {#each currentModulesOnDisplay.find((item) => item.id === row.id).modules as moduleOnDisplay}
            <ModuleCard
              on:download={downloadModuleClicked}
              on:edit={editModuleClicked}
              on:delete={deleteModuleClicked}
              on:toggle={toggleModuleClicked}
              on:hidePasswords={toggleHidePassword}
              on:hideCVV={toggleHideCVV}
              moduleId={moduleOnDisplay.id}
              headerText={moduleOnDisplay.type}
              imageUrl={moduleIconMap[MODULE_NAME[moduleOnDisplay.type]]}
              subtitle={moduleOnDisplay.shortName}
              moduleType={MODULE_NAME[moduleOnDisplay.type]}
              showLoading={modulesThatAreLoading[moduleOnDisplay.id]}
              urlProperties={{ text: moduleOnDisplay.name, url: '/dashboard' }}
              enabled={moduleOnDisplay.enabled}
              toggleIsDisabled={!row.enabled}
              belongsToOrgId={row.id}
              hidePasswords={moduleOnDisplay.hidePasswords}
              hideCC={moduleOnDisplay.hideCC}
            />
          {/each}
        {/if}
      </div>
    </svelte:fragment>
    <svelte:fragment slot="cell" let:row let:cell>
      {#if cell.key === 'name'}
        {cell.value}
      {:else}
        <div class="flex gap-1">
          <Toggle
            class="flex-grow-0"
            size="sm"
            labelA=""
            labelB=""
            toggled={row.enabled}
            on:change={() => {
              orgStatusToggled(row.id);
            }}
          />
          <Button
            kind="ghost"
            size="small"
            icon={ListDropdown}
            iconDescription="Modules"
            on:click={() => handleRowExpand(row)}
          />
          <Button
            on:click={() => {
              editOrgPredefinedTab = 4;
              openEditOrgModal(row.id);
            }}
            kind="ghost"
            size="small"
            icon={Password}
            iconDescription="Permissions"
          />
          <Button
            on:click={() => {
              openEditOrgModal(row.id);
            }}
            kind="ghost"
            size="small"
            icon={Edit}
            iconDescription="Edit"
          />
          <Button kind="ghost" size="small" icon={TrashCan} iconDescription="Delete" />
        </div>
      {/if}
    </svelte:fragment>
  </DataTable>
  {#if rows.length}
    <div class="flex items-center sticky bottom-0">
      <Pagination
        bind:pageSize={paramsForTable.pageSize}
        {pageSizes}
        bind:page={paramsForTable.currentPage}
        totalItems={totalResources}
        pageText={(page) => ''}
        itemRangeText={(min, max, total) => `${min}–${max}`}
      />
      <div class="absolute bottom-1 right-60">
        <Button
          on:click={scrollToTopOfTable}
          size="small"
          tooltipPosition="top"
          iconDescription="Scroll to top"
          kind="primary"
          icon={CaretUp}
        />
      </div>
    </div>
  {/if}
{/if}

<Modal
  size="sm"
  on:click:button--secondary={() => (syncWithCustomerModalOpen = false)}
  on:click:button--primary={syncCustomerClicked}
  primaryButtonDisabled={!selectedCustomer || isSyncingCustomer}
  primaryButtonText="Save and sync"
  secondaryButtonText="Cancel"
  modalHeading="Assign a customer"
  bind:open={syncWithCustomerModalOpen}
>
  {#if loadingCustomers || isSyncingCustomer}
    <Loading class="h-16 flex justify-center w-full" withOverlay={false} />
  {:else}
    <Select bind:selected={selectedCustomer}>
      <SelectItem />
      {#each customers as customer}
        <SelectItem value={customer.id} text={customer.name} />
      {/each}
    </Select>
  {/if}
</Modal>
<Modal
  primaryButtonText="Close"
  on:click:button--primary={() => (syncWithClientResult = null)}
  on:close={() => (syncWithClientResult = null)}
  on:click:button--secondary={() => (syncWithClientResult = null)}
  modalHeading="Errors overview"
  bind:open={notContractedModulesExist}
>
  <p>The following modules in the organization are not contracted in the customer contract:</p>
  {#if syncWithClientResult}
    <div class="flex flex-col">
      <StructuredList>
        <StructuredListBody>
          {#each syncWithClientResult?.not_contracted as notContractedModule}
            {@const currentModuleData = getModuleNameById(notContractedModule)}
            <StructuredListRow>
              <StructuredListCell>
                <a href={getModuleLink(currentModuleData)}> {currentModuleData.name}</a>
              </StructuredListCell>
            </StructuredListRow>
          {/each}
        </StructuredListBody>
      </StructuredList>
    </div>
  {/if}
</Modal>
<Modal
  on:close={() => {
    newModuleModalOpen = false;
    selectedNewModule = null;
  }}
  passiveModal
  modalHeading="Add new module"
  bind:open={newModuleModalOpen}
>
  {#if loadingNewModuleData}
    <Loading class="h-16 flex justify-center w-full" withOverlay={false} />
  {:else if !selectedNewModule && newModuleModalOpen}
    <div class="grid grid-cols-4">
      {#each possibleNewModulesToCreate as currentModule}
        <ModuleCard
          on:click={() => selectNewModuleClicked(currentModule)}
          onlyIconAndText
          headerText={currentModule.name}
          imageUrl={currentModule.image}
        />
      {/each}
    </div>
  {:else}
    <CreateModule
      onFinishedCreationCallback={() => {
        newModuleModalOpen = false;
        selectedNewModule = null;
        loadModulesOfCurrentRow($currentOrganizationId, true);
      }}
      redirectAfterCreation={false}
      selectedModule={selectedNewModule}
    />
    <Button
      on:click={() => {
        selectedNewModule = null;
      }}>Back</Button
    >
  {/if}
</Modal>

<Modal
  on:close={() => {
    moduleDataTobeDeleted = {};
  }}
  modalHeading="Are you sure you want to delete this module?"
  primaryButtonText="Yes"
  on:click:button--secondary={() => (moduleDataTobeDeleted = {})}
  on:click:button--primary={deleteModuleConfirmed}
  secondaryButtonText="No"
  open={Object.keys(moduleDataTobeDeleted).length > 0}
>
  <p>This action cannot be undone.</p></Modal
>
<Modal
  on:close={() => {
    editModuleModalOpen = false;
    moduleTypeToEdit = null;
  }}
  passiveModal
  modalHeading="Edit module"
  bind:open={editModuleModalOpen}
>
  <EditModule
    orgId={editingModuleOfOrgId}
    orgEnabled={editingModuleOfOrgId && rows.find((org) => org.id === editingModuleOfOrgId).enabled}
    moduleData={moduleDataToEdit}
    strictTermText={moduleDataToEdit?.moduleStrictTokens?.join?.('\n')}
    prefix={moduleTypeToEdit?.prefix}
    key={moduleTypeToEdit?.key}
    shortName={moduleDataToEdit?.shortName?.replace(moduleTypeToEdit?.prefix, '')}
    selectedModuleType={moduleTypeToEdit}
    onFinishedEditionCallback={() => {
      editModuleModalOpen = false;
      moduleTypeToEdit = null;
      loadModulesOfCurrentRow(editingModuleOfOrgId, true);
    }}
  />
</Modal>

<Modal
  class="items-start [&>div]:mt-[104px] [&>div]:min-w-[80%]"
  preventCloseOnClickOutside
  primaryButtonText="Save"
  secondaryButtonText="Close"
  primaryButtonDisabled={$isLoadingOrg}
  on:click:button--secondary={() => (editOrgModalOpen = false)}
  on:click:button--primary={editOrganizationModule.handleSaveClick()}
  on:close={() => {
    if (!$isLoadingOrg) editOrgModalOpen = false;
  }}
  modalHeading="Detail Organization"
  bind:open={editOrgModalOpen}
>
  {#if editOrgModalOpen}
    <EditOrganization
      selectedTab={editOrgPredefinedTab}
      on:save={() => {
        getOrganizations(paramsForTable);
      }}
      bind:this={editOrganizationModule}
    />
  {/if}
</Modal>
