<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Client from '$lib/client';
  import type User from '$lib/types/user';
  import PdfViewer from '$src/routes/PdfViewer.svelte';
  import bannerOpenStore from '$stores/bannerOpen';
  import { assets } from '$stores/darkMode';
  import menuExpandedStore from '$stores/menuExpanded';
  import notifications from '$stores/notification';
  import { currentOrganization, currentOrganizationId, organizationsStore } from '$stores/organization';
  import roleStore from '$stores/role';
  import userStore from '$stores/user';
  import axios from 'axios';
  import {
    Button,
    ComposedModal,
    DataTable,
    DataTableSkeleton,
    Dropdown,
    Modal,
    ModalBody,
    ModalHeader,
    OverflowMenu,
    OverflowMenuItem,
    Pagination,
    Tag
  } from 'carbon-components-svelte';
  import type { DataTableHeader } from 'carbon-components-svelte/types/DataTable/DataTable.svelte';
  import {
    Checkmark,
    Close,
    Download,
    Email,
    Home,
    Menu,
    RadioButton,
    RadioButtonChecked,
    TrashCan,
    View
  } from 'carbon-icons-svelte';
  import { onMount } from 'svelte';
  import Profile from './Profile.svelte';

  const client = new Client();

  const messagesHeaders: DataTableHeader[] = [
    { key: 'text', value: 'MESSAGE', width: '250px' },
    {
      key: 'createdAt',
      value: 'CREATION DATE',
      width: '190px',
      display: (timestamp: number) => new Date(timestamp).toLocaleString()
    },
    {
      key: 'updatedAt',
      value: 'UPDATE DATE',
      width: '190px',
      display: (timestamp: number) => new Date(timestamp).toLocaleString()
    },
    { key: 'markRead', value: '', width: '50px' },
    { key: 'delete', value: '', width: '50px' }
  ];

  type Report = {
    name: string;
    link: string;
    previewCut: number;
    key: string;
  };

  const reports: Report[] = [
    {
      name: 'Financial Threat Landscape - UK',
      link: '/assets/pdfs/Financial Threat Landscape - UK.pdf',
      previewCut: 14,
      key: 'FinancialThreatLandscapeUK'
    },
    {
      name: 'Financial Threat Landscape - Germany',
      link: '/assets/pdfs/Financial Threat Landscape - Germany.pdf',
      previewCut: 14,
      key: 'FinancialThreatLandscapeGermany'
    },
    {
      name: 'Financial Threat Landscape - Benelux',
      link: '/assets/pdfs/Financial Threat Landscape - Benelux.pdf',
      previewCut: 14,
      key: 'FinancialThreatLandscapeBenelux'
    }
  ];

  const pageSize = 10;
  let profileOpen = false;
  let messagedOpen = false;
  let p = 1;
  let messages = [];
  let totalMessages = 0;
  let messagesLoading = false;
  let selectedMessageId: number;
  let deleteMessageModalOpen = false;
  let unread = 0;
  let countMessagesInterval: NodeJS.Timeout;
  let logoHeight = '36';
  let reportsPdfModalOpen = false;
  let viewPdfModalOpen = false;
  let selectedPdf: Report;

  $: messagedOpen && getMessages(p);
  $: canShowAdmin = $roleStore.master || $roleStore.superadmin || $roleStore.admin || $roleStore.globalAnalyst;
  $: browser && setCountMessagesInterval($userStore);
  $: showMenu = $currentOrganizationId && !$page.url.pathname.startsWith('/profile');

  onMount(() => {
    const origin = window.__env.origin;
    if (origin === 'https://tclayer8.blueliv.com') {
      logoHeight = '26';
    } else if (origin === 'https://dt.doh.gov.ae') {
      logoHeight = '45';
    }
    return () => {
      clearInterval(countMessagesInterval);
    };
  });

  function setCountMessagesInterval(user: User) {
    clearInterval(countMessagesInterval);
    if (user?.licenseAccepted) {
      countMessages();
      countMessagesInterval = setInterval(() => countMessages(), 5 * 60 * 1000);
    }
  }

  async function countMessages() {
    const response = await client.user.getUnread();
    unread = response.unread;
  }

  async function getMessages(p: number) {
    messagesLoading = true;
    const response = await client.user.getMessages(p, pageSize);
    messages = response.messages;
    totalMessages = response.totalRegistres;
    messagesLoading = false;
  }

  async function markAdRead(messageId: number) {
    await client.user.markMessageAsRead(messageId);
    await getMessages(p);
  }

  function setDeleteMessage(messageId: number) {
    selectedMessageId = messageId;
    deleteMessageModalOpen = true;
  }

  async function deleteMessage() {
    deleteMessageModalOpen = false;
    await client.user.deleteMessage(selectedMessageId);
    if (p !== 1) {
      p = 1;
    } else {
      await getMessages(p);
    }
  }

  async function changeOrganization({ detail: { selectedId } }) {
    if ($currentOrganizationId === selectedId) return;
    await goto(`/dashboard/organizations/${selectedId}/summary`);
  }

  async function downloadPdf(report: Report) {
    try {
      await client.user.metricsDownloadReport(report.key);
      const link = document.createElement('a');
      link.href = report.link;
      link.download = `${report.name}.pdf`;
      link.click();
      link.remove();
    } catch (error) {
      notifications.notify({ kind: 'error', title: 'Error', subtitle: 'Some error has ocurred' });
    }
  }

  async function viewPdf(report: Report) {
    try {
      await client.user.metricsViewReport(report.key);
      selectedPdf = report;
      viewPdfModalOpen = true;
    } catch (error) {
      notifications.notify({ kind: 'error', title: 'Error', subtitle: 'Some error has ocurred' });
    }
  }
</script>

{#if $userStore}
  <nav class="h-14" class:mt-12={$bannerOpenStore}>
    <div class="fixed top-0 z-50 w-full">
      {#if $bannerOpenStore}
        <div class="flex justify-center items-center bg-ctip-primary text-white text-xl relative">
          <Button
            class="max-w-full h-14 text-xs lg:text-base xl:text-xl 2xl:text-2xl"
            on:click={() => (reportsPdfModalOpen = true)}
          >
            The new Financial Industry Threat Landscape report is now available. Free this time! Click here to preview
            or download it
          </Button>

          <OverflowMenu
            size="sm"
            class="absolute left-4 [&_svg]:fill-white [&_svg]:hover:fill-ctip-primary [&_ul]:w-auto [&_button]:max-w-full"
          >
            <OverflowMenuItem on:click={bannerOpenStore.dismiss} text="Don't show again" />
          </OverflowMenu>

          <Button
            on:click={bannerOpenStore.close}
            icon={Close}
            iconDescription="Close"
            tooltipPosition="left"
            class="absolute right-4"
            size="small"
          />
        </div>
      {/if}

      <div
        id="header"
        class="transition-colors duration-700 flex items-center content-between justify-between bg-ctip-background !shadow-sm dark:!bg-neutral-800 text-ctip-text h-14 dark:!shadow-neutral-700"
      >
        <div class="flex justify-between h-full">
          {#if showMenu}
            <Button class="w-14 flex items-center justify-center" kind="ghost" on:click={menuExpandedStore.toggle}>
              <Menu />
            </Button>
          {:else}
            <Button class="w-14 flex items-center justify-center" kind="ghost" href="/">
              <Home />
            </Button>
          {/if}

          <div class="h-full px-3 py-2.5 flex items-center">
            <a target="_blank" href="https://outpost24.com/products/cyber-threat-intelligence" rel="noreferrer">
              {#if $assets.logo}
                <img
                  class:bg-white={$assets.noDarkLogo}
                  src={$assets.logo}
                  alt="Brand logo"
                  height={logoHeight}
                  class="max-w-[160px]"
                />
              {/if}
            </a>
          </div>
          <div class="py-2 pl-10 min-w-[15rem] organizations">
            {#if showMenu}
              <div class="relative">
                <Dropdown
                  id="organization"
                  light
                  class="[&>div]:border-none [&>div]:pl-5 [&>div>div]:w-fit [&>div>div]:min-w-full"
                  on:select={changeOrganization}
                  items={$organizationsStore.map(({ id, name, enabled }) => ({ id, text: name, enabled }))}
                  itemToString={(org) => org.text}
                  selectedId={$currentOrganizationId}
                  let:item
                >
                  {#if item.enabled}
                    <span class="mx-2 text-green-600">
                      <RadioButtonChecked />
                    </span>
                  {:else}
                    <span class="mx-2 text-gray-400">
                      <RadioButton />
                    </span>
                  {/if}
                  {item.text}
                </Dropdown>

                <div class="absolute top-2.5">
                  {#if $currentOrganization?.enabled}
                    <span class="mx-2 text-green-600">
                      <RadioButtonChecked />
                    </span>
                  {:else}
                    <span class="mx-2 text-gray-400">
                      <RadioButton />
                    </span>
                  {/if}
                </div>
              </div>
            {/if}
          </div>
        </div>

        <div class="flex justify-between h-full">
          {#if canShowAdmin}
            <div class="py-2" data-test="top-navbar-items">
              <Button kind="ghost" size="field" href="/admin">Admin</Button>
            </div>
          {/if}

          {#if $roleStore.superadmin || $roleStore.master || $roleStore.admin || $roleStore.grants.isAnyModuleAnalyst}
            <div class="py-2" data-test="top-navbar-items">
              <Button kind="ghost" size="field" href="/dashboard/api-key">API Key</Button>
            </div>
          {/if}

          <div class="py-2" data-test="top-navbar-items">
            <Button
              kind="ghost"
              size="field"
              href="https://outpost24.atlassian.net/servicedesk/customer/portal/8"
              target="_blank"
            >
              Support
            </Button>
          </div>

          <div class="py-2" data-test="top-navbar-items">
            <Button size="field" kind="ghost" on:click={() => (messagedOpen = true)}>
              <Email size={24} />
              {#if unread}
                <div class="absolute top-0 ml-2 -mt-2">
                  <Tag class="whitespace-nowrap" size="sm" type="red">{unread}</Tag>
                </div>
              {/if}
            </Button>
          </div>

          <div class="h-full" data-test="top-navbar-items">
            <Button data-test="profile" kind="ghost" class="h-full" on:click={() => (profileOpen = !profileOpen)}>
              <span
                class="flex items-center justify-center w-10 h-10 text-xl font-bold text-white rounded-full bg-ctip-primary"
              >
                {$userStore?.username[0]?.toLocaleUpperCase() || 'U'}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  </nav>

  <Profile bind:open={profileOpen} />

  <ComposedModal size="lg" bind:open={messagedOpen}>
    <ModalHeader>
      <h4>
        Messages
        <Tag type="blue">{totalMessages}</Tag>
      </h4>
    </ModalHeader>
    <ModalBody class="px-4">
      {#if messagesLoading}
        <DataTableSkeleton headers={messagesHeaders} showHeader={false} showToolbar={false} />
      {:else}
        <DataTable headers={messagesHeaders} rows={messages} {pageSize}>
          <svelte:fragment slot="cell" let:row let:cell>
            {#if cell.key === 'text'}
              {@html cell.value}
            {:else if cell.key === 'markRead'}
              {#if row.read}
                <Button kind="ghost" icon={Checkmark} disabled />
              {:else}
                <Button kind="ghost" icon={Email} iconDescription="Mark as read" on:click={() => markAdRead(row.id)} />
              {/if}
            {:else if cell.key === 'delete'}
              <Button
                kind="danger-ghost"
                icon={TrashCan}
                iconDescription="Delete"
                on:click={() => setDeleteMessage(row.id)}
              />
            {:else}
              {cell.display ? cell.display(cell.value) : cell.value}
            {/if}
          </svelte:fragment>
        </DataTable>
        <Pagination bind:page={p} totalItems={totalMessages} {pageSize} />
      {/if}
    </ModalBody>
  </ComposedModal>

  <Modal
    danger
    modalHeading="Are you sure you want to delete this message?"
    secondaryButtonText="Close"
    primaryButtonText="Delete"
    bind:open={deleteMessageModalOpen}
    on:click:button--primary={deleteMessage}
    on:click:button--secondary={() => (deleteMessageModalOpen = false)}
  />
{/if}

<Modal
  bind:open={reportsPdfModalOpen}
  modalHeading="The new Industry Threat Landscape report is now available. Free this time!"
  primaryButtonText="Close"
  on:click:button--primary={() => (reportsPdfModalOpen = false)}
>
  <div class="grid gap-4 pb-20">
    <table class="table">
      <thead>
        <tr>
          <th>Report name</th>
          <th class="text-center">Preview</th>
          <th class="text-center">Download</th>
        </tr>
      </thead>

      <tbody>
        {#each reports as report}
          <tr>
            <td class="text-ctip-text">{report.name}</td>
            <td class="text-center">
              <Button
                size="small"
                icon={View}
                iconDescription="Preview"
                tooltipPosition="left"
                on:click={() => viewPdf(report)}
              />
            </td>
            <td class="text-center">
              <Button
                size="small"
                icon={Download}
                iconDescription="Download"
                on:click={() => downloadPdf(report)}
                tooltipPosition="left"
              />
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</Modal>

<Modal
  size="lg"
  bind:open={viewPdfModalOpen}
  modalHeading={selectedPdf?.name}
  primaryButtonText="Close"
  on:click:button--primary={() => (viewPdfModalOpen = false)}
>
  <!-- {#if selectedPdf?.link}
    <embed src={selectedPdf.link} width="100%" style="height: 80vh;" type="application/pdf" />
  {/if} -->

  {#if selectedPdf?.link}
    {#await axios.get(selectedPdf.link, { responseType: 'blob' }) then response}
      <div class="relative">
        <PdfViewer pdf={response.data} cutPages={selectedPdf.previewCut} />
        <div class="absolute gradient-see-more" />
      </div>
      <div class="flex justify-center">
        <Button
          icon={Download}
          iconDescription="Download"
          on:click={() => downloadPdf(selectedPdf)}
          tooltipPosition="left"
          class="max-w-none -mt-40 h-fit"
        >
          Download to read more
        </Button>
      </div>
    {/await}
  {/if}
</Modal>

<style>
  .gradient-see-more {
    background-color: var(--ctip-ui);
    height: 500px;
    width: 100%;
    bottom: -1px;
    mask-image: linear-gradient(to top, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0));
  }
</style>
