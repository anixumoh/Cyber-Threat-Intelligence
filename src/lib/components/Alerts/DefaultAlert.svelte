<script lang="ts">
  import { Add, AddAlt, Notification, Rss, TrashCan } from 'carbon-icons-svelte';
  import Drawer from '../Drawer/Drawer.svelte';
  import { MODULE_NAME } from '$lib/constants/modules';
  import { currentOrganizationId } from '$stores/organization';
  import { currentModule } from '$stores/module';
  import Client from '$lib/client';
  import {
    Checkbox,
    ComboBox,
    DataTable,
    InlineLoading,
    InlineNotification,
    NotificationActionButton,
    SkeletonPlaceholder,
    TextInput
  } from 'carbon-components-svelte';
  import type { AuthorizedUser } from '$lib/client/services/modules';
  import type { FeedsType, AlertModulesType, AlertResponse } from '$lib/types/alerts';
  import InfoCard from '../Card/InfoCard.svelte';
  import roleStore from '$stores/role';
  import GenericButton from '../Buttons/GenericButton.svelte';
  import EmptyData from '../EmptyData/EmptyData.svelte';
  import notifications from '$stores/notification';
  import WarningModal from '../CommonModal/WarningModal/WarningModal.svelte';
  import { emailRegexp } from '$lib/utils/regexPatterns';
  import type Module from '$lib/types/module';

  const client = new Client();

  export let isOpen = false;
  export let module: Module = undefined;

  let isLoading = false;
  let loadingUsers = true;
  let showAddUser = false;
  let showAddEmail = false;
  let openDeleteModal = false;
  let isDeleting = false;
  let isValidEmail = true;
  let isEmptyEmail = false;
  let userToDelete = undefined;
  let usersList: AuthorizedUser[] = [];
  let addedUsersList = [];
  let parsedUserList = [];
  let feeds: FeedsType;
  let listBanksFeeds = [];
  let listCreditCardsFeeds = [];
  let statefeeds: boolean;
  let modules: AlertModulesType;
  let emailToAdd = '';

  $: mod = module ?? $currentModule;
  $: !isOpen && reset();
  $: isOpen && mod && init();
  $: parsedTable(addedUsersList);

  async function init() {
    isLoading = true;
    if (mod.moduleName === MODULE_NAME.CREDIT_CARD) {
      const requests = [
        client.feedsService.getFeedBooleans($currentOrganizationId, mod.id, mod.moduleName),
        client.feedsService.getAlertFeeds($currentOrganizationId, mod.id, mod.moduleName),
        client.feedsService.getBankFeeds($currentOrganizationId, mod.id, mod.moduleName),
        client.feedsService.getCreditCardFeeds($currentOrganizationId, mod.id, mod.moduleName)
      ];
      const [resultData1, resultData2, resultData3, resultData4] = await Promise.all<
        [FeedsType, AlertResponse, AlertResponse, AlertResponse]
      >(requests);

      feeds = resultData1;
      addedUsersList = resultData2.values;
      listBanksFeeds = resultData3.values;
      listCreditCardsFeeds = resultData4.values;
    }
    getAuthorizedUsers();
    isLoading = false;
  }

  function reset() {
    isLoading = false;
    loadingUsers = true;
    showAddUser = false;
    showAddEmail = false;
    openDeleteModal = false;
    isDeleting = false;
    isValidEmail = true;
    isEmptyEmail = false;
    userToDelete = undefined;
    usersList = [];
    addedUsersList = [];
    parsedUserList = [];
    emailToAdd = '';
  }

  async function getAuthorizedUsers() {
    usersList = await client.modules.getAuthorizedUsers(mod.id);
    if (mod.moduleName !== MODULE_NAME.CREDIT_CARD) {
      await getAddedUsers();
    }
    addEmails();
  }

  async function getAddedUsers() {
    const { values } = await client.feedsService.getAlertFeeds($currentOrganizationId, mod.id, mod.moduleName);
    addedUsersList = [...values];
  }

  function addEmails() {
    if (addedUsersList.length && usersList.length) {
      addedUsersList.forEach((addedUser, index) => {
        usersList.map((user) => {
          if (addedUser.id === user.id.toString() || addedUser.id === user.id) {
            addedUsersList[index] = { ...addedUser, username: addedUser.value, email: user.email };
          } else {
            return addedUser;
          }
        });
      });
      loadingUsers = false;
    } else {
      loadingUsers = false;
    }
  }

  function changeStateNewCard() {
    feeds = {
      ...feeds,
      activateAlerts: !feeds.activateAlerts,
      alertBanks: true,
      alertCorporates: true
    };
    statefeeds = feeds.activateAlerts;
    modules = 'activatealerts';
    sendFeedData();
  }

  function changeStatePublicFeed() {
    feeds = {
      ...feeds,
      publicFeed: !feeds.publicFeed
    };
    statefeeds = feeds.publicFeed;
    modules = 'publicfeed';
    sendFeedData();
  }

  function changeStateBankCard() {
    feeds = {
      ...feeds,
      alertBanks: !feeds.alertBanks
    };
    statefeeds = feeds.alertBanks;
    modules = 'alertbank';
    sendFeedData();
  }

  function changeStateCorpCard() {
    feeds = {
      ...feeds,
      alertCorporates: !feeds.alertCorporates
    };
    statefeeds = feeds.alertCorporates;
    modules = 'alertcorporate';
    sendFeedData();
  }

  async function sendFeedData() {
    await client.feedsService.saveFeedSettingsDataCarding(
      $currentOrganizationId,
      mod.id,
      mod.moduleName,
      modules,
      statefeeds
    );
  }

  function parsedTable(addedUsers) {
    parsedUserList = addedUsers.map((user) => ({
      ...user,
      user: user.username || 'Custom User',
      theEmail: user.email || user.value
    }));
  }

  async function onDeleteUser() {
    try {
      isDeleting = true;
      await client.settings.deleteSettingDataParameter($currentOrganizationId, mod.id, mod.moduleName, 'alert', {
        values_to_delete: [{ value: userToDelete.id || userToDelete.value }]
      });
      await getAuthorizedUsers();
      isDeleting = false;
      openDeleteModal = false;
      loadingUsers = false;
    } catch (error) {
      isDeleting = false;
      notifications.notify({
        kind: 'error',
        title: error?.message ?? 'There is already an error'
      });
    }
  }

  async function onDelete(element) {
    userToDelete = element;
    openDeleteModal = true;
  }

  function selectUser(selected: string) {
    const selectedItem = usersList.find((user) => user.username === selected);
    const id = selectedItem.id;
    selectedItem.value = selectedItem.username;
    let duplicated = undefined;
    const existEmail = !!selectedItem?.email;
    if (existEmail) {
      duplicated = addedUsersList.findIndex((user) => user.email === selectedItem.email);
    }
    if (existEmail && duplicated > -1) {
      notifications.notify({
        kind: 'error',
        title: 'There is already an alert for that user'
      });
      showAddUser = false;
    } else {
      loadingUsers = true;
      addedUsersList.unshift(selectedItem);
      sendUser(id);
      showAddUser = false;
    }
  }

  function selectEmail() {
    const duplicated = addedUsersList.findIndex((user) => user.email === emailToAdd);

    if (duplicated > -1) {
      notifications.notify({
        kind: 'error',
        title: 'There is already an alert for that e-mail'
      });
      return;
    } else {
      const userIndex = usersList.findIndex((user) => user.email === emailToAdd);
      loadingUsers = true;
      const toSend = userIndex > -1 ? usersList[userIndex].id : emailToAdd;
      sendUser(toSend);
      isValidEmail = true;
      isEmptyEmail = false;
      showAddEmail = false;
      emailToAdd = '';
    }
  }

  async function sendUser(id: string | number) {
    try {
      await client.settings.saveSettingsData($currentOrganizationId, mod.id, mod.moduleName, 'ALERT', [{ value: id }]);
      await getAuthorizedUsers();
    } catch (error) {
      let msg = '';
      if (error?.message.includes('error.email_already_exist')) {
        msg = 'There is already an alert for that e-mail';
      }
      if (error?.message.includes('error.invalid_alert_parameters')) {
        msg = 'Invalid alert parameters';
      }

      notifications.notify({
        kind: 'error',
        title: msg ?? 'There is already an error'
      });
    }
  }

  function changeDataEmail(event) {
    emailToAdd = event?.target?.value;
    if (!emailToAdd) {
      isEmptyEmail = true;
      isValidEmail = true;
    } else {
      isEmptyEmail = false;
      isValidEmail = !!emailToAdd.match(emailRegexp);
    }
  }

  function onBlurDataEmail() {
    if (!emailToAdd) {
      isEmptyEmail = true;
      isValidEmail = true;
    }
  }
</script>

<Drawer {isOpen} hasDefaultHeader={false} on:clickAway maxScreenSize="max-w-xl">
  <svelte:fragment slot="custom-header">
    <div class="bg-ctip-ui text-ctip-text border flex justify-between items-center w-full h-14 px-3">
      <div class="flex items-center">
        <div class="w-9 h-9 flex justify-center items-center text-ctip-white bg-ctip-primary rounded-md">
          {#if mod?.moduleName === MODULE_NAME.CREDIT_CARD}
            <Rss class="w-4 h-4" />
          {:else}
            <Notification class="w-4 h-4" />
          {/if}
        </div>
        <div class="ml-2 text-sm">
          <span>{mod?.moduleName === MODULE_NAME.CREDIT_CARD ? 'Feeds' : 'Receive default alert'}</span>
        </div>
      </div>
    </div>
  </svelte:fragment>
  <div class="px-3 py-4" id="drawer-alerts">
    {#if isLoading}
      <SkeletonPlaceholder class="h-24 w-full" />
    {:else}
      <InlineNotification
        hideCloseButton
        kind="info"
        subtitle="You can also create an alert with custom conditions in advanced filters"
      >
        <svelte:fragment slot="actions">
          <NotificationActionButton
            href="dashboard/organizations/{$currentOrganizationId}/modules/{mod?.id}/settings/filters/new"
          >
            Click here
          </NotificationActionButton>
        </svelte:fragment>
      </InlineNotification>
      {#if mod?.moduleName === MODULE_NAME.CREDIT_CARD}
        <InfoCard title="Configure" withBorderBottom={false}>
          <ul class="list-group w-full">
            <li class="flex justify-between items-center my-1 mx-2 w-full">
              <Checkbox
                labelText="Do you want to retrieve cards from public feed?"
                checked={feeds ? feeds.publicFeed : false}
                disabled={$roleStore.customer}
                on:change={changeStatePublicFeed}
              />
            </li>
            <li class="flex justify-between items-center mb-1 mx-2 w-full">
              <Checkbox
                labelText="Do you want to be notified if a new card is detected?"
                checked={feeds ? feeds.activateAlerts : false}
                disabled={$roleStore.customer}
                on:change={changeStateNewCard}
              />
            </li>
            {#if feeds?.activateAlerts}
              <li class="flex justify-between items-center mb-1 mx-2 w-full">
                <ul class="ml-4">
                  <li class="my-1 mx-2">
                    <Checkbox
                      labelText="Bank Card"
                      checked={feeds ? feeds.alertBanks : false}
                      disabled={!listBanksFeeds?.length || $roleStore.customer}
                      on:change={changeStateBankCard}
                    />
                    {#if !listBanksFeeds?.length}
                      <InlineNotification
                        hideCloseButton
                        kind="warning"
                        title="warning: "
                        subtitle="Please, insert a Bank"
                      />
                    {/if}
                  </li>
                  <li class="mb-1 mx-2">
                    <Checkbox
                      labelText="Corporative Card"
                      checked={feeds ? feeds.alertCorporates : false}
                      disabled={!listCreditCardsFeeds?.length || $roleStore.customer}
                      on:change={changeStateCorpCard}
                    />
                    {#if !listCreditCardsFeeds?.length}
                      <InlineNotification
                        hideCloseButton
                        kind="warning"
                        title="warning: "
                        subtitle="Please, insert a Credit Card"
                      />
                    {/if}
                  </li>
                </ul>
              </li>
            {/if}
          </ul>
        </InfoCard>
      {/if}
      {#if (feeds && feeds?.activateAlerts) || mod?.moduleName !== MODULE_NAME.CREDIT_CARD}
        <InfoCard title="Alert recipients configuration" withBorderBottom={false} class="mt-2">
          <svelte:fragment slot="action">
            <GenericButton
              id="add-user-alert"
              disabled={$roleStore.customer}
              on:click={() => {
                showAddUser = true;
                showAddEmail = false;
              }}
            >
              <AddAlt /><span class="ml-1">Add User</span>
            </GenericButton>
            <GenericButton
              on:click={() => {
                showAddUser = false;
                showAddEmail = true;
              }}
              id="add-email-alert"
            >
              <AddAlt /><span class="ml-1">Add Email</span>
            </GenericButton>
          </svelte:fragment>
          <svelte:fragment slot="user-action">
            {#if showAddUser}
              <div class="relative w-6/12">
                <button
                  on:click={() => {
                    showAddUser = false;
                  }}
                  class="absolute top-0 left-[-53px] border-solid border-b border-b-ctip-border border-transparent bg-ctip-background text-ctip-text rounded-l-md h-10 flex items-center w-16 pl-2 pr-3"
                >
                  Close
                </button>
                <ComboBox
                  direction="bottom"
                  items={usersList.map((user) => ({ id: user.username, text: user.username }))}
                  shouldFilterItem={(item, value) => item.text.toLocaleLowerCase().includes(value.toLowerCase())}
                  on:select={(e) => selectUser(e.detail.selectedId)}
                  class="absolute rounded-l-none w-full border-b-ctip-border"
                  placeholder="Write here user"
                />
              </div>
            {/if}
            {#if showAddEmail}
              <div class="relative input-with-prefix pb-3">
                <button
                  on:click={() => {
                    showAddEmail = false;
                    emailToAdd = '';
                  }}
                  class="absolute top-0 left-[-53px] border-solid border-b border-b-ctip-border border-transparent bg-ctip-hover-ui text-ctip-text rounded-l-md h-10 flex items-center w-16 pl-2 pr-3"
                >
                  Close
                </button>
                <TextInput
                  class="rounded-l-none rounded-r-none w-full min-w-[300px] border-b-ctip-border"
                  placeholder="Write here e-mail"
                  invalid={!isValidEmail || isEmptyEmail}
                  invalidText={isEmptyEmail ? 'Please provide an e-mail' : !isValidEmail ? 'Invalid e-mail' : ''}
                  on:keyup={(event) => changeDataEmail(event)}
                  on:blur={onBlurDataEmail}
                />
                <button
                  disabled={!emailToAdd || !isValidEmail || isEmptyEmail}
                  class:opacity-50={!emailToAdd || !isValidEmail || isEmptyEmail}
                  on:click={() => {
                    if (emailToAdd && isValidEmail && !isEmptyEmail) {
                      showAddEmail = false;
                      selectEmail();
                    }
                  }}
                  class="absolute top-0 -right-1 border-solid border-b border-l border-b-ctip-border bg-ctip-hover-ui border-l-ctip-border border-transparent text-ctip-primary rounded-r-md h-10 flex justify-center items-center w-10 px-2"
                >
                  <Add />
                </button>
              </div>
            {/if}
          </svelte:fragment>
          {#if loadingUsers}
            <SkeletonPlaceholder class="h-8 w-full" />
          {:else if addedUsersList.length}
            <DataTable
              class="[&_td]:!bg-transparent [&_th]:text-left [&_th]:uppercase w-full"
              headers={[
                { key: 'user', value: 'User' },
                { key: 'theEmail', value: 'Email' },
                { key: 'delete', value: 'Delete' }
              ]}
              rows={parsedUserList}
            >
              <svelte:fragment slot="cell" let:row let:cell>
                {#if cell.key === 'delete'}
                  <GenericButton
                    disabled={$roleStore.customer}
                    on:click={() => !$roleStore.customer && onDelete(row)}
                    class={$roleStore.customer ? 'opacity-50' : 'text-ctip-danger'}
                  >
                    <TrashCan />
                  </GenericButton>
                {:else}
                  {cell.value}
                {/if}
              </svelte:fragment>
            </DataTable>
          {:else}
            <EmptyData messageObj={{ msg: 'No alert recipients have been configured yet' }} />
          {/if}
        </InfoCard>
      {/if}
    {/if}
  </div>
</Drawer>

<WarningModal
  bind:open={openDeleteModal}
  modalHeading="Delete user"
  question="Are you sure you want to delete the selected user?"
  secondMessage="This action cannot be undone."
  on:submit={() => onDeleteUser()}
  on:closeModal={() => (openDeleteModal = false)}
  primaryButtonIcon={isDeleting && InlineLoading}
/>

<style>
  :global(.input-with-prefix .bx--form-requirement) {
    position: absolute;
    top: 38px;
  }

  :global(.input-with-prefix svg) {
    top: 20px;
    z-index: 1;
    right: 38px;
  }
</style>
