<script lang="ts">
  import Client from '$lib/client';
  import { createEventDispatcher, onMount } from 'svelte';
  import { currentOrganization } from '$stores/organization';
  import { currentModule } from '$stores/module';
  import { MODULE_NAME } from '$lib/constants/modules';
  import threatsStore from '$stores/threats';
  import roleStore from '$stores/role';
  import GenericSingleSelect from '$lib/components/Filter/GenericSingleSelect.svelte';
  import { List, TrashCan } from 'carbon-icons-svelte';
  import { pageSizes } from '$lib/constants/pagination';
  import { DataTable, truncate } from 'carbon-components-svelte';
  import { getHumanReadableDate } from '$lib/utils/functions';
  import ResponsivePageNavigation from '$lib/components/ResponsivePageNavigation.svelte';
  import TooltipWithIcon from '$lib/components/TooltipWithIcon/TooltipWithIcon.svelte';
  import WarningModal from '$lib/components/CommonModal/WarningModal/WarningModal.svelte';
  import { COLORS } from '$lib/constants/colors';
  import TcxLinkeable from '$lib/components/TcxLinkeable/TcxLinkeable.svelte';
  import preferencesStore from '$stores/preferences';
  import EmptyData from '$lib/components/EmptyData/EmptyData.svelte';
  import { tooltip } from '$lib/actions/tooltip';

  let showTable = false;
  let isDeleteConfirmationOpened = false;

  let heads = [];
  let items = [];
  let selectedRowIds = [];
  let selectedToDelete = [];
  let typeOfDelete: 'single' | 'bulk' = 'single';
  let pageSize = 10;
  let page = 1;
  let numPages = 0;
  let initMaxRows: number;

  const client = new Client();
  const dispatch = createEventDispatcher();

  onMount(() => {
    init();
    return () => {
      client.abort();
    };
  });

  async function init() {
    initMaxRows = $preferencesStore?.defaultRows ?? 10;
    resourceData(false, initMaxRows);
    tableHeaders();
  }

  async function resourceData(firstPage = false, initMaxRows?: any) {
    if (initMaxRows) {
      pageSize = initMaxRows;
    }
    page = firstPage ? 1 : page;

    if ($currentModule.moduleName === MODULE_NAME.CREDIT_CARD) {
      if ($roleStore.customer) {
        showTable = false;
        return;
      }
      showTable = true;
      items = getItemsFiltered();
      parseDateTable();
    } else if (
      $currentModule.moduleName === MODULE_NAME.HACKTIVISM &&
      $threatsStore.selectedForDetails?.retweetInfo?.length
    ) {
      showTable = true;
      items = getItemsFiltered();
      parseDateTable();
    }
  }

  function getItemsFiltered() {
    if ($currentModule.moduleName === MODULE_NAME.CREDIT_CARD) {
      numPages = Math.ceil($threatsStore.selectedForDetails?.creditCards.length / pageSize);
      return $threatsStore.selectedForDetails?.creditCards;
    } else if ($currentModule.moduleName === MODULE_NAME.HACKTIVISM) {
      numPages = Math.ceil($threatsStore.selectedForDetails?.retweetInfo.length / pageSize);
      return $threatsStore.selectedForDetails?.retweetInfo;
    }
  }

  function parseDateTable() {
    items = items?.map?.((item, index) => {
      const date =
        item.reportedAt || item.reportedat
          ? getHumanReadableDate(item.reportedAt) || getHumanReadableDate(item.reportedat)
          : '-';

      if ($currentModule.moduleName === MODULE_NAME.CREDIT_CARD) {
        const number = item.ccnumber || item.ccNumber ? item.ccnumber || item.ccNumber : '-';
        const expiration = item.ccexpiration || item.ccExpiration ? item.ccexpiration || item.ccExpiration : '-';
        const cvv = item.cccvv || item.ccCvv ? item.cccvv || item.ccCvv : '-';
        const owner = item.ccowner || item.ccOwner ? item.ccowner || item.ccOwner : '-';
        const source = item.source || item.Source ? item.source || item.Source : '-';
        const validated = item.validated ? 'Yes' : 'No';
        const confidenceLevel = item.confidenceLevel ? item.confidenceLevel : '-';

        return {
          ...item,
          number,
          expiration,
          cvv,
          owner,
          source,
          validated,
          confidenceLevel,
          date
        };
      } else if ($currentModule.moduleName === MODULE_NAME.HACKTIVISM) {
        const twitterProfile = item.screen_name ? `@${item.screen_name}` : '-';
        const createAt = item.created_at ? getHumanReadableDate(item.created_at) : '-';
        const url = item.retweet_status_id
          ? `http://twitter.com/${item.screen_name}/status/${item.retweet_status_id}`
          : '-';
        return {
          ...item,
          twitterProfile,
          url,
          id: index,
          date: createAt
        };
      }
    });
  }

  function tableHeaders() {
    if ($threatsStore.selectedForDetails) {
      if ($currentModule.moduleName === MODULE_NAME.CREDIT_CARD) {
        heads = [
          { key: 'number', value: 'CARD NUMBER', sort: false, width: '130px' },
          { key: 'expiration', value: 'EXPIRATION', sort: false, width: '100px' },
          { key: 'cvv', value: 'CVV', sort: false, width: '60px' },
          { key: 'owner', value: 'OWNER', sort: false, width: '90px' },
          { key: 'source', value: 'CRIME SERVICE TYPE', sort: false, width: '180px' },
          { key: 'validated', value: 'LUHN VALIDATION', sort: false, width: '100px' },
          { key: 'date', value: 'REPORTED AT', sort: false, width: '130px' },
          { key: 'confidenceLevel', value: 'CONFIDENCE', sort: false, width: '100px' },
          { key: 'delete', value: 'Delete', sort: false, width: '15px' }
        ];
      } else if ($currentModule.moduleName === MODULE_NAME.HACKTIVISM) {
        heads = [
          { key: 'twitterProfile', value: 'Twitter Profile', sort: false, width: '70px' },
          { key: 'date', value: 'DATE TIME', sort: false, width: '50px' },
          { key: 'url', value: 'URL', sort: false, width: '100px' }
        ];
      }
    }
  }

  function onChangeMaxRows(event) {
    pageSize = +event.detail;
    page = 1;
    resourceData();
  }

  async function onDelete() {
    if (typeOfDelete === 'bulk') {
      await onDeleteBulk();
    } else {
      await onDeleteOne();
    }
  }

  async function onDeleteOne() {
    await client.threats.deleteResourceInDetail(
      $currentOrganization.id,
      $currentModule.id,
      $currentModule.moduleName,
      $threatsStore.selectedForDetails.resourceId,
      selectedToDelete
    );
    isDeleteConfirmationOpened = false;
    dispatch('reload');
  }

  async function onDeleteBulk() {
    await client.threats.deleteResourceInDetail(
      $currentOrganization.id,
      $currentModule.id,
      $currentModule.moduleName,
      $threatsStore.selectedForDetails.resourceId,
      selectedRowIds
    );
    isDeleteConfirmationOpened = false;
    dispatch('reload');
  }
</script>

{#if showTable}
  <div class="my-4">
    <div class="flex justify-between my-3">
      {#if items?.length}
        <GenericSingleSelect
          align="bottom-right"
          highlightedWhenSeleted={false}
          customClass="border text-ctip-btnLight"
          selectedValue={pageSize}
          items={pageSizes.map((size) => ({ text: size, value: size }))}
          value="value"
          display="text"
          title={`${pageSize}`}
          icon={List}
          alwaysShowIcon
          on:changeSelected={(event) => onChangeMaxRows(event)}
        />
      {/if}
    </div>
    {#if items?.length}
      <div class="overflow-x-auto">
        <div class="min-w-[900px] pb-3">
          <DataTable
            headers={heads}
            rows={items}
            {pageSize}
            {page}
            batchSelection={$currentModule.moduleName === MODULE_NAME.CREDENTIAL ||
              $currentModule.moduleName === MODULE_NAME.CREDIT_CARD}
            bind:selectedRowIds
            class="[&_td]:text-center"
          >
            <svelte:fragment slot="cell-header" let:header>
              {#if header.key === 'delete'}
                <TooltipWithIcon
                  direction="bottom"
                  tooltipText="Delete all"
                  icon={TrashCan}
                  color="danger"
                  disabled={!selectedRowIds?.length}
                  on:click={(event) => {
                    event.stopImmediatePropagation();
                    isDeleteConfirmationOpened = true;
                    typeOfDelete = 'bulk';
                  }}
                />
              {:else}
                {header.value}
              {/if}
            </svelte:fragment>
            <svelte:fragment slot="cell" let:cell let:row>
              {#if cell.key === 'url'}
                <span use:truncate use:tooltip title={row.url}>{row.url}</span>
              {:else if cell.key === 'source' && $currentModule.moduleName === MODULE_NAME.CREDIT_CARD}
                <TcxLinkeable value={row.source} checkForActors isCreditCard />
              {:else if cell.key === 'delete'}
                <TooltipWithIcon
                  direction="bottom"
                  tooltipText="Delete"
                  icon={TrashCan}
                  color={COLORS.danger}
                  on:click={(event) => {
                    event.stopImmediatePropagation();
                    isDeleteConfirmationOpened = true;
                    selectedToDelete = [row.id];
                    typeOfDelete = 'single';
                  }}
                />
              {:else}
                {cell.value}
              {/if}
            </svelte:fragment>
          </DataTable>
        </div>
      </div>

      <div class="flex items-center">
        <ResponsivePageNavigation bind:page total={numPages} />
      </div>
    {:else}
      <EmptyData />
    {/if}
  </div>
{/if}

<WarningModal
  bind:open={isDeleteConfirmationOpened}
  modalHeading="Delete"
  question={`Are you sure you want to delete the selected item${typeOfDelete === 'bulk' ? 's' : ''}?`}
  secondMessage="This action cannot be undone."
  on:submit={onDelete}
  on:closeModal={() => (isDeleteConfirmationOpened = false)}
/>
