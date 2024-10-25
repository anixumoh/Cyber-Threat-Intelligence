<script lang="ts">
  import type Module from '$lib/types/module';
  import type { Incident, IncidentType } from '$lib/client/services/incidents';
  import type { IssueUserType } from '$lib/client/services/threats';
  import { page } from '$app/stores';
  import ModuleHeading from '$lib/components/module/ModuleHeading.svelte';
  import { currentModule, currentModuleId } from '$stores/module';
  import { currentOrganizationId } from '$stores/organization';
  import * as yup from 'yup';
  import {
    Button,
    InlineLoading,
    Modal,
    FormGroup,
    Tab,
    TabContent,
    Tabs,
    Tag,
    Dropdown,
    TextInput,
    TextArea,
    FileUploaderButton,
    Toggle
  } from 'carbon-components-svelte';
  import { ChevronLeft, InformationFilled } from 'carbon-icons-svelte';
  import Client from '$lib/client';
  import LabelItem from '$lib/components/LabelItem/LabelItem.svelte';
  import Overview from './Overview.svelte';
  import PendingPublicationData from './PendingPublicationData.svelte';
  import PublicationHistory from './PublicationHistory.svelte';
  import notifications from '$stores/notification';
  import roleStore from '$stores/role';
  import { slide } from 'svelte/transition';
  import { goto } from '$app/navigation';
  import GenericButton from '$lib/components/Buttons/GenericButton.svelte';
  import { createForm } from 'felte';
  import { validator } from '@felte/validator-yup';

  const client = new Client();

  let isLoadingIncident: boolean = false;
  let isLoadingTypes: boolean = false;
  let isLoadingUsers: boolean = false;
  let isSavingIncident: boolean = false;
  let generateReportModalOpen: boolean = false;
  let isGeneratingReport: boolean = false;
  let notifyModalOpen: boolean = false;
  let isSendingNotify: boolean = false;

  let incident: Incident;
  let incidentTypes: IncidentType[] = [];
  let issueUsers: IssueUserType[] = [];
  let assignee = '';
  // Report
  let reportLanguage: string = 'en';
  let sendTo: string = '';
  // Notify
  let sendEmail: boolean = true;
  let showInformation: boolean = false;
  let recipients: string = '';
  let isLoadingRecipients: boolean = false;
  let hasAttachments: boolean = false;
  let attachments: File[] = [];
  // New activity
  let newActivityModalOpen: boolean = false;
  let isSendingActivity: boolean = false;
  const schema = yup.object({
    title: yup.string().required('Please enter a title'),
    content: yup.string().required('Please add some content')
  });
  const { form, isValid, errors, data, reset } = createForm<yup.InferType<typeof schema>>({
    extend: validator({ schema })
  });

  $: loadIncident($currentOrganizationId, $currentModule.id, +$page.params.incidentId);
  $: loadIncidentTypes($currentOrganizationId, $currentModule);
  $: getUsers($currentOrganizationId, $currentModule.id);
  $: isLoading = isLoadingIncident || isLoadingTypes || isLoadingUsers;
  $: currentPageHref = `/dashboard/organizations/${$currentOrganizationId}/modules/${$currentModuleId}/incidents/${$page.params.incidentId}`;
  $: canSendEmail = $roleStore.master || $roleStore.superadmin;

  $: selected = getSelectedTab($page.url);

  function getSelectedTab(url: URL) {
    if (url.hash === '#pending') return 1;
    if (url.hash === '#history') return 2;
    return 0;
  }

  async function reloadIncident() {
    await loadIncident($currentOrganizationId, $currentModuleId, +$page.params.incidentId);
    selected = getSelectedTab(new URL(window.location.href));
  }

  async function loadIncident(orgId: number, moduleId: number, incidentId: number) {
    if (!incidentId) return;
    isLoadingIncident = true;
    incident = await client.incidents.getIncident(orgId, moduleId, incidentId);
    assignee = incident?.user?.username;
    isLoadingIncident = false;
  }

  async function loadIncidentTypes(orgId: number, module: Module) {
    isLoadingTypes = true;
    incidentTypes = await client.incidents.getIncidentTypes(orgId, module);
    isLoadingTypes = false;
  }

  async function getUsers(orgId: number, moduleId: number) {
    if ($roleStore.customer) return;
    isLoadingUsers = true;
    try {
      issueUsers = await client.threats.getIssueUsers(orgId, moduleId);
    } finally {
      isLoadingUsers = false;
    }
  }

  async function saveIncident() {
    isSavingIncident = true;
    try {
      await client.incidents.saveIncident($currentOrganizationId, $currentModuleId, incident);
      if (assignee !== incident?.user?.username) {
        await client.incidents.assignIncident($currentOrganizationId, $currentModuleId, incident.id, assignee);
      }
      notifications.notify({ kind: 'success', subtitle: 'The incident has been succesfully updated' });
    } catch (error) {
      notifications.notify({
        kind: 'error',
        subtitle: 'Something went wrong, please try again later or contact your administrator'
      });
    }
    isSavingIncident = false;
    await reloadIncident();
  }

  function setUrlHash(hash: string) {
    // Set hash without pushing new history
    const separator = hash ? '#' : '';
    window.history.replaceState('', document.title, `${window.location.pathname}${separator}${hash}`);
  }

  async function generateReport() {
    isGeneratingReport = true;
    try {
      await client.incidents.generateReport(
        $currentOrganizationId,
        $currentModuleId,
        incident.id,
        sendTo,
        reportLanguage
      );
      generateReportModalOpen = false;
    } catch (error) {
      const msg = error?.response?.data?.field || 'Error sending report';
      notifications.notify({ kind: 'error', title: msg });
    }
    isGeneratingReport = false;
  }

  async function openNotifyModal() {
    notifyModalOpen = true;
    recipients = '';
    if (canSendEmail) {
      isLoadingRecipients = true;
      const response = await client.incidents.getRecipients($currentOrganizationId, $currentModuleId);
      isLoadingRecipients = false;
      recipients = cleanRecipients(response.join(','));
    }
  }

  function cleanRecipients(text: string) {
    return text
      .replace(/\n/, ',')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .join(',');
  }

  async function sendNotify() {
    isSendingNotify = true;
    const sendRecipients = sendEmail ? cleanRecipients(recipients) : '';
    await client.incidents.sendNotify(
      $currentOrganizationId,
      $currentModuleId,
      incident.id,
      sendRecipients,
      attachments?.[0]
    );
    await reloadIncident();
    selected = 2;
    notifyModalOpen = false;
    isSendingNotify = false;
  }

  async function addNewActivity() {
    isSendingActivity = true;
    await client.incidents.newActivity(
      $currentOrganizationId,
      $currentModuleId,
      incident.id,
      $data.title,
      $data.content
    );
    await reloadIncident();
    isSendingActivity = false;
    newActivityModalOpen = false;
  }

  async function closeIncident() {
    await client.incidents.closeIncident($currentOrganizationId, $currentModuleId, incident.id);
    await goto(`/dashboard/organizations/${$currentOrganizationId}/modules/${$currentModuleId}/incidents`);
  }

  async function openIncident() {
    await client.incidents.openIncident($currentOrganizationId, $currentModuleId, incident.id);
    await reloadIncident();
  }
</script>

<ModuleHeading title="INCIDENTS">
  <GenericButton
    size="small"
    kind="tertiary"
    href="/dashboard/organizations/{$currentOrganizationId}/modules/{$currentModuleId}/incidents"
  >
    <ChevronLeft />
    Back
  </GenericButton>
</ModuleHeading>

{#if isLoading}
  <InlineLoading class="flex items-center justify-center h-full" />
{:else}
  <Tabs autoWidth {selected}>
    <Tab label="Overview" href={currentPageHref} on:click={() => setUrlHash('')} />
    <Tab label="Pending Publication Data" href="{currentPageHref}#pending" on:click={() => setUrlHash('pending')} />
    <Tab label="Publication History" href="{currentPageHref}#history" on:click={() => setUrlHash('history')} />
    <svelte:fragment slot="content">
      <div class="flex items-center justify-between p-2 bg-ctip-ui">
        <div class="flex items-center gap-2">
          <div>
            {incident.title}
          </div>
          <div>
            <Tag type="high-contrast">{incident.status}</Tag>
          </div>
        </div>

        <div class="flex flex-col gap-1 md:flex-row">
          {#if !$roleStore.customer}
            <GenericButton on:click={() => (generateReportModalOpen = true)} size="small" kind="tertiary">
              Generate Report
            </GenericButton>
            {#if incident.status === 'OPEN' && (incident?.currentIncompleteNotification?.activities?.length || incident?.currentIncompleteNotification?.resources?.length)}
              <GenericButton on:click={openNotifyModal} size="small" kind="tertiary">Notify</GenericButton>
            {/if}
            {#if incident.status === 'CLOSED'}
              <GenericButton on:click={openIncident} size="small" kind="tertiary">Reopen Incident</GenericButton>
            {:else}
              <GenericButton on:click={() => (newActivityModalOpen = true)} size="small" kind="tertiary">
                New Activity
              </GenericButton>
              <GenericButton on:click={closeIncident} size="small" kind="danger-tertiary">Close Incident</GenericButton>
            {/if}
          {/if}
        </div>
      </div>
      <div class="flex py-2">
        {#each incident.labels as label}
          <LabelItem {label}>
            {label.label}
          </LabelItem>
        {/each}
      </div>

      <TabContent>
        <Overview on:save={saveIncident} bind:assignee bind:incident {incidentTypes} {issueUsers} {isSavingIncident} />
      </TabContent>
      <TabContent>
        <PendingPublicationData bind:incident />
      </TabContent>
      <TabContent>
        <PublicationHistory bind:incident on:fileAttached={reloadIncident} />
      </TabContent>
    </svelte:fragment>
  </Tabs>
{/if}

<Modal
  modalHeading="Add Report"
  on:open={() => {
    reportLanguage = 'en';
    sendTo = '';
  }}
  on:submit={generateReport}
  bind:open={generateReportModalOpen}
  primaryButtonDisabled={!sendTo || isGeneratingReport}
  primaryButtonIcon={isGeneratingReport ? InlineLoading : undefined}
  on:click:button--secondary={() => (generateReportModalOpen = false)}
  primaryButtonText="Add a report"
  secondaryButtonText="Cancel report"
  hasForm
>
  <FormGroup>
    <Dropdown
      titleText="Select language"
      bind:selectedId={reportLanguage}
      items={[
        { id: 'en', text: 'English' },
        { id: 'es', text: 'Spanish' }
      ]}
    />
  </FormGroup>
  <FormGroup>
    <TextInput labelText="Send to" bind:value={sendTo} />
  </FormGroup>
</Modal>

<Modal
  modalHeading="Notify options"
  on:open={() => {
    sendEmail = true;
    hasAttachments = false;
  }}
  on:submit={sendNotify}
  bind:open={notifyModalOpen}
  primaryButtonDisabled={isSendingNotify}
  primaryButtonIcon={isSendingNotify ? InlineLoading : undefined}
  on:click:button--secondary={() => (notifyModalOpen = false)}
  primaryButtonText="Notify Incident"
  secondaryButtonText="Cancel Notify"
  size="sm"
  shouldSubmitOnEnter={false}
>
  {#if notifyModalOpen}
    {#if canSendEmail}
      <div class="border-[1px] border-solid border-gray-200">
        <div class="flex items-center justify-between px-2">
          <div>Send e-mail</div>
          <div>
            <Toggle labelA="" labelB="" bind:toggled={sendEmail} />
          </div>
        </div>
        {#if sendEmail}
          <div class="p-2" transition:slide={{ duration: 100 }}>
            <div class="flex items-center">
              <Button size="small" kind="ghost" on:click={() => (showInformation = !showInformation)}>
                <InformationFilled class="cursor-pointer" />
              </Button>
              Recipients
            </div>
            {#if showInformation}
              <div class="py-2 text-ctip-secondary" transition:slide={{ duration: 100 }}>
                List of users that will receive an e-mail with information about the new threats that have been added to
                this incident since it was last notified. You can add as many as you want, separated with a comma. They
                will be saved as default e-mails for future uses.
              </div>
            {/if}
            {#if isLoadingRecipients}
              <InlineLoading class="flex items-center justify-center h-full" />
            {:else}
              <TextArea bind:value={recipients} name="textarea" />
            {/if}
          </div>
        {/if}
      </div>
    {/if}

    <div class="border-[1px] border-solid border-gray-200">
      <div class="flex items-center justify-between px-2">
        <div>Add attachment</div>
        <div>
          {#if canSendEmail}
            <Toggle labelA="" labelB="" bind:toggled={hasAttachments} />
          {/if}
        </div>
      </div>
      {#if hasAttachments || !canSendEmail}
        <div class="p-2" transition:slide={{ duration: 100 }}>
          <FileUploaderButton labelText="Choose a file" bind:files={attachments} />
        </div>
      {/if}
    </div>
  {/if}
</Modal>

<Modal
  on:open={() => {
    reset();
  }}
  modalHeading="Add activity to an incident"
  on:submit={addNewActivity}
  bind:open={newActivityModalOpen}
  primaryButtonDisabled={isSendingActivity || !$isValid}
  primaryButtonIcon={isSendingActivity ? InlineLoading : undefined}
  on:click:button--secondary={() => (newActivityModalOpen = false)}
  primaryButtonText="Save"
  secondaryButtonText="Cancel"
  size="sm"
  shouldSubmitOnEnter={false}
>
  <form use:form>
    <FormGroup>
      <TextInput
        name="title"
        invalid={!!$errors.title}
        placeholder="Add Title"
        invalidText={$errors?.title?.[0]}
        labelText="Title"
      />
    </FormGroup>

    <FormGroup>
      <TextArea
        name="content"
        invalid={!!$errors.content}
        invalidText={$errors?.content?.[0]}
        placeholder="Add content"
        labelText="Content"
      />
    </FormGroup>
  </form>
</Modal>
