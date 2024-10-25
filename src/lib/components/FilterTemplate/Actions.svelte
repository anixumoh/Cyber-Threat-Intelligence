<script lang="ts">
  import type { AuthorizedUser, LabelType } from '$lib/client/services/modules';
  import type { LabelListItem } from '$lib/client/services/settings';
  import GenericButton from '$lib/components/Buttons/GenericButton.svelte';
  import CreateLabelModalStandalone from '$lib/components/CreateLabelModalStandalone.svelte';
  import ContentAlert from '$lib/components/Filter/ContentAlert.svelte';
  import MultiSelectBox from '$lib/components/FilterTemplate/MultiSelectBox.svelte';
  import StarRating from '$lib/components/StarRating/index.svelte';
  import { COLORS } from '$lib/constants/colors';
  import { emailRegexp } from '$lib/utils/regexPatterns';
  import contentAlertStore from '$stores/contentAlert';
  import { currentModule } from '$stores/module';
  import notifications from '$stores/notification';
  import {
    Checkbox,
    ComboBox,
    DataTable,
    InlineNotification,
    OverflowMenu,
    OverflowMenuItem,
    TextInput,
    Toggle,
    TooltipIcon
  } from 'carbon-components-svelte';
  import { Add, AddFilled, Information, TrashCan } from 'carbon-icons-svelte';
  import type { createForm } from 'felte';
  import { getContext } from 'svelte';
  import type * as yup from 'yup';
  import { actionsSchema, analysisResultActionsArray } from './constants';

  type ActionsForm = ReturnType<typeof createForm<yup.InferType<typeof actionsSchema>>>;
  const { actionsForm } = getContext<{ actionsForm: ActionsForm }>('forms');
  const { data } = actionsForm;
  type Destination = yup.InferType<typeof actionsSchema>['destinations'][0];

  type TLP_OPTION = { color: string; label: string; value };
  const TLP_OPTIONS: TLP_OPTION[] = [
    { color: COLORS.grayThreat, label: 'White', value: 'WHITE' },
    { color: COLORS.greenThreat, label: 'Green', value: 'GREEN' },
    { color: COLORS.amberThreat, label: 'Amber', value: 'AMBER' },
    { color: COLORS.dangerThreat, label: 'Red', value: 'RED' }
  ];

  export let labels: LabelListItem[];
  export let users: AuthorizedUser[];

  let labelModalOpen = false;
  let canCreateLabels = true;
  let addEmailOpen = false;
  let addUserOpen = false;
  let email = '';
  let searchUser = '';

  $: filteredUsers = users.filter((user) => user.username.includes(searchUser));

  let alertContentFields = $contentAlertStore.editing
    ? $data.alertContentFields
    : $contentAlertStore.response[$currentModule?.type];

  function updateSendAlert(sendAlert: boolean) {
    $contentAlertStore.sendAlert = sendAlert;
    if (!sendAlert) {
      $data.alertContentFields = [];
    } else {
      alertContentFields = $contentAlertStore.response[$currentModule?.type];
      $data.alertContentFields = alertContentFields;
      contentAlertStore.updateFromNewContentAlerts($currentModule?.type);
      contentAlertStore.updateSelected($currentModule?.type);
    }
  }

  function onSaveLabel(event: CustomEvent<LabelType>) {
    labels = [
      {
        bgColorRGB: event.detail.bgColorHex,
        textColorRGB: event.detail.textColorHex,
        ...event.detail
      },
      ...labels
    ];
    $data.labels = [...$data.labels, event.detail.id];
  }

  function onAddEmail() {
    if (email.match(emailRegexp)) {
      const user = users.find((u) => u.email === email);
      if (user) {
        addUser(userToDestination(user));
      } else {
        addUser({
          emailEnabled: true,
          userEmail: email,
          usersId: null,
          usersName: null
        });
      }
      addEmailOpen = false;
      email = '';
    }
  }

  function onAddUser(userId: number) {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    searchUser = '';
    addUserOpen = false;
    addUser(userToDestination(user));
  }

  function userToDestination(user: AuthorizedUser): Destination {
    return {
      emailEnabled: true,
      userEmail: user.email,
      usersId: user.id,
      usersName: user.username
    };
  }

  function addUser(destination: Destination) {
    if (!$data?.destinations?.length) $data.destinations = [];
    if ($data.destinations.some((r) => r.userEmail === destination.userEmail)) {
      notifications.notify({
        kind: 'error',
        title: 'Error',
        subtitle: destination.usersId ? 'That user was already added' : 'That e-mail was already added'
      });
      return;
    }
    $data.destinations = [...$data.destinations, { ...destination, key: destination.userEmail }];
  }

  function deleteEmail(index: number) {
    $data.destinations = [...$data.destinations.slice(0, index), ...$data.destinations.slice(index + 1)];
  }
</script>

<div class="text-base border-b-2 border-solid border-ctip-interactive">Filter Actions</div>

<div class="px-4 pt-3 pb-4 bg-ctip-ui">
  <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
    <div class="relative">
      <MultiSelectBox
        bind:selectedValues={$data.labels}
        title="Labels"
        canSearch
        items={labels}
        valueKey="id"
        displayKey="label"
      >
        <div slot="title" class="flex items-center justify-between w-full">
          Labels
          {#if canCreateLabels}
            <GenericButton on:click={() => (labelModalOpen = true)}>
              <Add />
              New Label
            </GenericButton>
          {/if}
        </div>
      </MultiSelectBox>
    </div>
    <MultiSelectBox
      bind:selectedValues={$data.analysisResult}
      title="Assign result type"
      items={analysisResultActionsArray}
      valueKey="key"
      displayKey="name"
      type="radio"
    />

    <div class="grid gap-6 p-4 mt-8 text-base border rounded bg-ctip-background md:col-span-2 md:grid-cols-2">
      <div class="grid gap-5">
        <div>
          <span>TLP Status</span>
          <div class="flex items-center justify-between px-2 py-1 border rounded">
            <div>TLP Color</div>
            <OverflowMenu flipped size="sm" class="rounded">
              <svelte:fragment slot="menu">
                {#if $data.tlp}
                  {@const tlp = TLP_OPTIONS.find((tlp) => tlp.value === $data.tlp)}
                  <div
                    class="w-4 h-4 border-2 border-solid rounded-full circle-status aspect-square border-ctip-grayThreat"
                    style="background-color: {tlp.color}"
                  />
                {:else}
                  <AddFilled />
                {/if}
              </svelte:fragment>
              {#each TLP_OPTIONS as option}
                {@const active = $data.tlp === option.value}
                <OverflowMenuItem on:click={() => ($data.tlp = option.value)} class={active ? 'bg-ctip-primary' : ''}>
                  {#if option.color}
                    <div
                      class="w-4 h-4 border-2 border-solid rounded-full circle-status aspect-square border-ctip-grayThreat"
                      style="background-color: {option.color}"
                    />
                  {/if}
                  <span class:text-white={active} class="pl-2">{option.label}</span>
                </OverflowMenuItem>
              {/each}
              <OverflowMenuItem on:click={() => ($data.tlp = undefined)}>
                <span class="pl-2">- None</span>
              </OverflowMenuItem>
            </OverflowMenu>
          </div>
        </div>
        <div>
          <span>Rating</span>
          <div class="grid items-center justify-center px-2 py-2 border rounded">
            <StarRating bind:rating={$data.rating} resourceId={1} />
          </div>
        </div>
      </div>
      <div class="grid gap-5">
        <div>
          <span>Filter Execution</span>
          <div class="flex items-center justify-between px-2 py-2 border rounded">
            <div>Stop</div>
            <div class="relative">
              <Toggle
                bind:toggled={$data.filterExecutionStop}
                class="absolute top-0 right-0 mr-2 -mt-2"
                size="sm"
                hideLabel
                labelA=""
                labelB=""
              />
            </div>
          </div>
        </div>
        <div>
          <span>Filter Execution</span>
          <div class="flex items-center justify-between px-2 py-2 border rounded">
            <div>Stop & Delete</div>
            <div class="relative">
              <Toggle
                bind:toggled={$data.filterExecutioStopDelete}
                class="absolute top-0 right-0 mr-2 -mt-2"
                size="sm"
                hideLabel
                labelA=""
                labelB=""
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="mt-10 text-base border-b-2 border-solid border-ctip-interactive">Alerts</div>

<div class="px-4 pt-10 pb-4 mb-20 text-base bg-ctip-ui">
  <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
    <div class="flex items-center justify-between px-2 py-2 border rounded bg-ctip-background">
      <div class="flex items-center">
        <span class="mr-2">Activate Alert</span>
        <TooltipIcon
          class="my-tooltip"
          tooltipText="Activates the alert and allows you to define notification frequencies."
          icon={Information}
        />
      </div>
      <div class="relative">
        <Toggle
          bind:toggled={$data.launchAlert}
          on:change={() => {
            $data.threshold = 1;
            $data.interval = 1;
            $data.sendAlert = false;
          }}
          class="absolute top-0 right-0 mr-2 -mt-2"
          size="sm"
          hideLabel
          labelA=""
          labelB=""
        />
      </div>
    </div>

    <div class="flex items-center justify-between px-2 py-2 border rounded bg-ctip-background">
      <div class="flex items-center">
        <span class="mr-2">Relevant results</span>
        <TooltipIcon
          class="my-tooltip"
          tooltipText="Minimum number of relevant results per alert, per defined time (Time interval)."
          icon={Information}
        />
      </div>
      <div class="relative">
        <input
          disabled={!$data.launchAlert}
          bind:value={$data.threshold}
          class="w-14"
          type="number"
          min="1"
          max="999"
          on:input={() => {
            if ($data.threshold < 1) $data.threshold = 1;
            if ($data.threshold > 999) $data.threshold = 999;
          }}
        />
      </div>
    </div>

    <div class="flex items-center justify-between px-2 py-2 border rounded bg-ctip-background">
      <div>Send an alert every (in min)</div>
      <div class="relative">
        <input
          disabled={!$data.launchAlert}
          bind:value={$data.interval}
          class="w-14"
          type="number"
          min="1"
          max="999"
          on:input={() => {
            if ($data.interval < 1) $data.interval = 1;
            if ($data.interval > 999) $data.interval = 999;
          }}
        />
      </div>
    </div>

    {#if $data.launchAlert}
      <div class="flex items-center justify-between px-2 py-2 border rounded bg-ctip-background">
        <div class="flex items-center">
          <span class="mr-2">Send alert by email</span>
          <TooltipIcon
            class="my-tooltip"
            tooltipText="Enables the sending of configured alerts by email."
            icon={Information}
          />
        </div>
        <div class="relative">
          <Toggle
            bind:toggled={$data.sendAlert}
            class="absolute top-0 right-0 mr-2 -mt-2"
            size="sm"
            hideLabel
            labelA=""
            labelB=""
            on:toggle={(e) => updateSendAlert(e.detail.toggled)}
          />
        </div>
      </div>
    {/if}
  </div>
  {#if $data.sendAlert}
    <ContentAlert
      bind:alertContentFields
      module={$currentModule}
      on:update-form={() => ($data.alertContentFields = alertContentFields)}
    />
    <div class="w-full mt-4 border border-gray-200 border-solid">
      <div class="flex justify-between p-2 border-b border-gray-200 border-solid">
        <div class="flex items-center">
          <span class="mr-2">Alert recipients configuration</span>
          <TooltipIcon class="my-tooltip" tooltipText="Configuration of alert recipients." icon={Information} />
        </div>
        <div class="flex gap-2">
          {#if addEmailOpen}
            <div class="flex items-stretch border border-gray-200 border-solid rounded">
              <GenericButton on:click={() => (addEmailOpen = false)}>Close</GenericButton>
              <TextInput
                size="sm"
                bind:value={email}
                class="rounded-none"
                type="text"
                placeholder="Write here e-mail"
                invalid={email && !email.match(emailRegexp)}
              />
              <GenericButton on:click={onAddEmail}><Add /></GenericButton>
            </div>
          {/if}
          {#if addUserOpen}
            <div class="flex items-stretch border border-gray-200 border-solid rounded">
              <GenericButton on:click={() => (addUserOpen = false)}>Close</GenericButton>
              <div class="[&_svg]:hidden">
                <ComboBox
                  class="border-none"
                  size="sm"
                  bind:value={searchUser}
                  on:select={(e) => onAddUser(e.detail.selectedId)}
                  light
                  placeholder="Write here user"
                  items={filteredUsers.map((user) => ({ ...user, text: user.username }))}
                />
              </div>
            </div>
          {/if}
          <GenericButton
            on:click={() => {
              addEmailOpen = true;
              addUserOpen = false;
            }}
          >
            <AddFilled />
            <span class="pl-2">Add Email</span>
          </GenericButton>

          <GenericButton
            on:click={() => {
              addUserOpen = true;
              addEmailOpen = false;
            }}
          >
            <AddFilled />
            <span class="pl-2">Add User</span>
          </GenericButton>
        </div>
      </div>

      {#if $data?.destinations?.length}
        <DataTable
          class="[&_td]:text-center"
          rows={$data.destinations.map((x, i) => ({ ...x, id: i }))}
          headers={[
            { key: 'usersName', value: 'USER', display: (usersName) => usersName ?? 'Custom User' },
            { key: 'userEmail', value: 'EMAIL' },
            { key: 'emailEnabled', value: 'ENABLED', width: '100px' },
            { key: 'delete', value: 'DELETE', width: '100px' }
          ]}
        >
          <svelte:fragment slot="cell" let:row let:cell>
            {#if cell.key === 'emailEnabled'}
              <Checkbox
                class="m-0 [&_label]:m-0"
                on:check={(e) => ($data.destinations[row.id].emailEnabled = e.detail)}
                hideLabel
                checked={cell.value}
              />
            {:else if cell.key === 'delete'}
              <GenericButton on:click={() => deleteEmail(row.id)} class="text-ctip-danger">
                <TrashCan />
              </GenericButton>
            {:else}
              {cell.display ? cell.display(cell.value) : cell.value}
            {/if}
          </svelte:fragment>
        </DataTable>
      {:else}
        <InlineNotification
          class="max-w-full m-0"
          hideCloseButton
          lowContrast
          kind="error"
          title="No alert recipients have been configured yet."
        />
      {/if}
    </div>
  {/if}
</div>

<CreateLabelModalStandalone bind:open={labelModalOpen} on:save={onSaveLabel} />

<style>
  :global(.my-tooltip svg, .my-tooltip:hover svg) {
    fill: var(--ctip-interactive);
  }
</style>
