<script lang="ts">
  import Client from '$lib/client';
  import { onMount } from 'svelte';
  import { currentOrganizationId } from '$stores/organization';
  import { currentModule } from '$stores/module';
  import preferencesStore from '$stores/preferences';
  import type { TermsListType } from '$lib/types/settings';
  import HeadOverTable from '$lib/components/Settings/HeadOverTable.svelte';
  import roleStore from '$stores/role';
  import GenericButton from '$lib/components/Buttons/GenericButton.svelte';
  import { AddAlt, Edit, TrashCan } from 'carbon-icons-svelte';
  import { DataTable, DataTableSkeleton } from 'carbon-components-svelte';
  import EmptyData from '$lib/components/EmptyData/EmptyData.svelte';
  import EnableDisable from '$lib/components/EnableDisable/EnableDisable.svelte';
  import ResponsivePageNavigation from '$lib/components/ResponsivePageNavigation.svelte';
  import { MODULE_NAME } from '$lib/constants/modules';
  import WarningModal from '$lib/components/CommonModal/WarningModal/WarningModal.svelte';
  import notifications from '$stores/notification';

  const client = new Client();

  let isLoading = false;
  let page = 1;
  let maxRows = $preferencesStore.defaultRows ?? 10;
  let totalResources = 0;
  let q = '';
  let deleteConfirmation = false;
  let toDelete: TermsListType;

  let rows = [];
  let headers = [
    { key: 'reputationalSearchTopicName', value: 'Topic' },
    { key: 'searchPhrase', value: 'Search Word' },
    ...($currentModule.moduleName !== MODULE_NAME.SOCIAL_MEDIA ? [{ key: 'searchEngines', value: 'News' }] : []),
    ...($currentModule.moduleName !== MODULE_NAME.SOCIAL_MEDIA ? [{ key: 'searchTwitter', value: 'Twitter' }] : []),
    ...(!$roleStore.customer ? [{ key: 'edit', value: 'Edit' }] : []),
    ...(!$roleStore.customer ? [{ key: 'delete', value: 'Delete' }] : [])
  ];

  $: numPages = Math.ceil(totalResources / maxRows);

  onMount(() => {
    init();
    return () => {
      client.abort();
    };
  });

  async function init() {
    isLoading = true;
    const data = await client.settings.getSettingsData(
      $currentOrganizationId,
      $currentModule.id,
      $currentModule.moduleName,
      'terms',
      page,
      maxRows,
      q
    );
    rows = data.values;
    totalResources = data.totalResources;
    isLoading = false;
  }

  async function setStatus(status: boolean, id: number, attr: 'searchEngines' | 'searchTwitter') {
    rows = rows.map((row) => (id === row.id ? { ...row, [attr]: status } : row));
    const tempSettingObject = {};
    tempSettingObject[attr] = status;

    await client.settings.saveSettingsPatchByModule(
      $currentOrganizationId,
      $currentModule.id,
      $currentModule.moduleName,
      id,
      tempSettingObject,
      'terms'
    );
  }

  function onOpenDelete(row: unknown) {
    toDelete = row as TermsListType;
    deleteConfirmation = true;
  }

  async function onDelete() {
    let termType = toDelete.termType;

    if (termType === 'TWITTER_TWEETS_FROM_PROFILE') {
      termType = 'TWEETS_FROM_PROFILE';
    } else if (termType === 'USERNAME') {
      termType = 'EMAIL';
    } else if (termType === 'SUBDOMAIN') {
      termType = 'DOMAIN';
    } else if (termType === 'IP_RANGE') {
      termType = 'IP';
    } else if (termType === 'CPE_TECH_VENDOR' || termType === 'CPE_TECH_PRODUCT' || termType === 'CPE_TECH_VERSION') {
      termType = 'CPE_TECH';
    }

    const values_to_delete =
      termType === 'CPE_TECH'
        ? [{ title: toDelete.searchPhrase, cpe: toDelete.extraField }]
        : [{ value: toDelete.searchPhrase }];
    await client.settings.deleteSettingDataParameter(
      $currentOrganizationId,
      $currentModule.id,
      $currentModule.moduleName,
      termType,
      { values_to_delete }
    );
    deleteConfirmation = false;
    init();
    notifications.notify({
      kind: 'success',
      title: `Deleted ${toDelete.searchPhrase} term`
    });
  }
</script>

<HeadOverTable
  title="Terms"
  placeholder="Search for terms"
  bind:q
  bind:maxRows
  on:search={() => {
    page = 1;
    init();
  }}
  on:changeSelected={(event) => {
    maxRows = +event.detail;
    page = 1;
    init();
  }}
>
  <svelte:fragment slot="action-buttons">
    {#if !$roleStore.customer}
      {#if $currentModule.moduleName === MODULE_NAME.SOCIAL_MEDIA}
        <GenericButton
          href={!$roleStore.customer &&
            `/dashboard/organizations/${$currentOrganizationId}/modules/${$currentModule.id}/settings/terms/new?type=phrase`}
        >
          <AddAlt /> <span class="ml-1">Add Search Phrase</span>
        </GenericButton>
        <GenericButton
          href={!$roleStore.customer &&
            `/dashboard/organizations/${$currentOrganizationId}/modules/${$currentModule.id}/settings/terms/new?type=image`}
        >
          <AddAlt /> <span class="ml-1">Add Image</span>
        </GenericButton>
      {/if}
      <GenericButton
        href={`/dashboard/organizations/${$currentOrganizationId}/modules/${$currentModule.id}/settings/terms/new`}
      >
        <AddAlt /> <span class="ml-1">Add Term</span>
      </GenericButton>
    {/if}
  </svelte:fragment>
</HeadOverTable>
{#if isLoading}
  <DataTableSkeleton rows={10} showHeader={false} showToolbar={false} />
{:else if rows.length}
  <DataTable id="raw-terms-table" class="[&_td]:!bg-transparent [&_th]:text-left [&_th]:uppercase" {headers} {rows}>
    <svelte:fragment slot="cell" let:row let:cell>
      {#if cell.key === 'searchPhrase'}
        <GenericButton
          href="/dashboard/organizations/{$currentOrganizationId}/modules/{$currentModule.id}/settings/terms/{row.id}"
        >
          {row.searchPhrase}
        </GenericButton>
      {:else if cell.key === 'reputationalSearchTopicName'}
        {row.reputationalSearchTopicName ?? 'Default'}
      {:else if cell.key === 'searchEngines'}
        <EnableDisable
          isEnabled={row.searchEngines}
          on:click={() => !$roleStore.customer && setStatus(!row.searchEngines, row.id, 'searchEngines')}
        />
      {:else if cell.key === 'searchTwitter'}
        <EnableDisable
          isEnabled={row.searchTwitter}
          on:click={() => !$roleStore.customer && setStatus(!row.searchTwitter, row.id, 'searchTwitter')}
        />
      {:else if cell.key === 'edit'}
        <GenericButton
          href={!$roleStore.customer &&
            `/dashboard/organizations/${$currentOrganizationId}/modules/${$currentModule.id}/settings/terms/${
              row.id
            }/edit${$currentModule.moduleName === MODULE_NAME.SOCIAL_MEDIA && !row.crawler ? '?type=image' : ''}`}
          class={`${!$roleStore.customer ? 'text-ctip-interactive' : 'cursor-not-allowed opacity-50'}`}
        >
          <Edit />
        </GenericButton>
      {:else if cell.key === 'delete'}
        <GenericButton
          on:click={() => !$roleStore.customer && onOpenDelete(row)}
          class={`${!$roleStore.customer ? 'text-ctip-danger' : 'cursor-not-allowed opacity-50'}`}
        >
          <TrashCan />
        </GenericButton>
      {:else}
        {cell.value}
      {/if}
    </svelte:fragment>
  </DataTable>
  {#if numPages > 1}
    <div class="flex items-center">
      <ResponsivePageNavigation
        loading={isLoading}
        on:change={(e) => {
          const targetPage = e.detail.page;
          if (targetPage !== page) {
            page = e.detail.page;
            init();
          }
        }}
        {page}
        total={numPages}
      />
    </div>
  {/if}
{:else}
  <EmptyData
    messageObj={{
      msg: `There are no ${
        $currentModule.moduleName === MODULE_NAME.CUSTOM || $currentModule.moduleName === MODULE_NAME.SOCIAL_MEDIA
          ? ''
          : 'Raw'
      } Terms`
    }}
  />
{/if}

<WarningModal
  bind:open={deleteConfirmation}
  modalHeading="Confirmation"
  question="Are you sure you want to delete this term?"
  secondMessage="This action cannot be undone."
  on:submit={onDelete}
  on:closeModal={() => (deleteConfirmation = false)}
/>
