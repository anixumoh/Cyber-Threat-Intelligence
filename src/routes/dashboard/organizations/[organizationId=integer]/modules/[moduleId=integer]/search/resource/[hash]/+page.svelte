<script lang="ts">
  import { page } from '$app/stores';
  import Client from '$lib/client';
  import GenericButton from '$lib/components/Buttons/GenericButton.svelte';
  import { getHumanReadableDateWithSeconds } from '$lib/utils/functions';
  import { currentModuleId } from '$stores/module';
  import { currentOrganizationId } from '$stores/organization';
  import {
    Button,
    ContentSwitcher,
    InlineLoading,
    Modal,
    SkeletonPlaceholder,
    Switch,
    Tag
  } from 'carbon-components-svelte';
  import { Download, Laptop, Link, Maximize, Misuse, TaskRemove, Time } from 'carbon-icons-svelte';
  import { marked } from 'marked';
  import { HASH_KEY } from '../../constants';
  import { detailResultStore } from '../../store';
  import { diffString } from '../../utils';
  import CalendarChart from './CalendarChart.svelte';

  const client = new Client();

  let screenshotModalOpen = false;
  let contentModalOpen = false;
  let diffModalOpen = false;
  let selectedIndex = 0;
  let selectedTimestamp: number;
  let markdownHtml = '';
  let timestampLoading = false;
  let timestampLoadingError = false;
  let isDownloading = false;
  let startDiff = false;
  let diffLoading = false;
  let diffHtml = '';

  $: url_hash = $page.params[HASH_KEY];
  $: detailResultStore.getDetails(url_hash);
  $: detail = $detailResultStore[url_hash];

  $: markdownHtml = processWithMarked(detail?.result?.markdown);
  $: updates = detail?.result?.events?.filter((e) => +e.event_type === 2);
  $: sortedUpdatesTimestamps = updates?.map((e) => e.timestamp.$date).sort((a, b) => b - a);
  $: lastUpdate = sortedUpdatesTimestamps?.[0];
  $: if (lastUpdate && !selectedTimestamp) {
    selectedTimestamp = lastUpdate;
  }

  async function getTimestampDetail(timestamp: number) {
    timestampLoadingError = false;
    timestampLoading = true;
    try {
      const detail = await client.modules.getDarkWebDetailTimestamp(
        $currentOrganizationId,
        $currentModuleId,
        url_hash,
        timestamp
      );
      markdownHtml = processWithMarked(detail.markdown);
    } catch (error) {
      timestampLoadingError = true;
    } finally {
      timestampLoading = false;
    }
  }

  function processWithMarked(content: string) {
    if (!content) return '';
    // Remove links
    content = content.replace(/(https*:\/\/[^/?]+)(\.[A-Za-z0-9]+[/?)])/gi, '$1.$2');

    // marked.parse does not work if the line has 4 spaces or more
    content = content.replace(/ {3,}/gm, ' ');

    return marked.parse(content);
  }

  async function download() {
    isDownloading = true;

    try {
      const filename = `${detail.result.url}.html`;

      const url = `/api_priority/download/${url_hash}`;
      const response = await client.gateway.get<Blob>('GLADOS', url, { responseType: 'blob' });
      const href = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = href;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(href);
    } catch (error) {
      console.error(error);
    } finally {
      isDownloading = false;
    }
  }

  function selectTimestamp(e: CustomEvent<number>) {
    if (e.detail === selectedTimestamp) return;

    selectedTimestamp = e.detail;
    getTimestampDetail(selectedTimestamp);
  }

  async function selectDiff(e: CustomEvent<number>) {
    if (e.detail === selectedTimestamp) return;

    const aTimestamp = selectedTimestamp;
    const bTimestamp = e.detail;

    diffModalOpen = true;
    diffLoading = true;
    startDiff = false;

    try {
      const response = await client.modules.getDarkWebDiff(
        $currentOrganizationId,
        $currentModuleId,
        detail.result.url,
        aTimestamp,
        bTimestamp
      );
      diffHtml = diffString(response.text_a, response.text_b);
    } catch (error) {
      console.error(error);
      diffHtml = 'error loading diff';
    } finally {
      diffLoading = false;
    }
  }
</script>

{#if detail?.error}
  <div class="flex items-center justify-center h-full">Could not load resource detail</div>
{:else if !detail || detail?.loading}
  <SkeletonPlaceholder class="w-full h-32" />
{:else}
  {#if startDiff}
    <div class="fixed top-0 left-0 w-full h-full z-[4] bg-ctip-background opacity-80" />
  {/if}
  <div class="flex flex-col items-center justify-center gap-4 lg:flex-row lg:items-start">
    <div class="flex flex-col w-full lg:max-w-md lg:w-4/12">
      <!-- Screenshot -->
      <div class="border-[1px] border-solid border-ctip-border max-h-80 flex justify-center">
        {#if detail?.result?.screenshot}
          <Button
            on:click={() => (screenshotModalOpen = true)}
            title="Click to expand"
            kind="ghost"
            class="w-full h-full max-w-full"
          >
            <img
              title="Click to expand"
              alt={detail.result.title}
              class="object-cover w-full h-full max-h-72"
              src="data:image/png;base64,{detail.result.screenshot}"
            />
          </Button>
        {:else}
          <div title="No image" class="flex items-center justify-center text-center bg-gray-300 w-80 h-80">
            <Misuse />
          </div>
        {/if}
      </div>

      <!-- Basic info -->
      <div class="flex flex-col mt-4">
        <div class="border-[1px] border-solid border-ctip-border">
          <div class="px-3 py-2 text-lg bg-ctip-ui">Basic info</div>

          <div class="grid grid-cols-2 px-3 py-2 border-t border-solid border-ctip-border">
            <div>
              <Laptop class="w-8 h-8 p-2 mr-2 text-white fill-white bg-ctip-primary" />
              TITLE
            </div>
            <div class="flex items-center justify-end">
              {detail.result.title || '-'}
            </div>
          </div>

          <div class="grid grid-cols-2 px-3 py-2 border-t border-solid border-ctip-border">
            <div>
              <Link class="w-8 h-8 p-2 mr-2 text-white fill-white bg-ctip-primary" />
              URL
            </div>
            <div class="flex items-center justify-end">
              <span title={detail.result.url} class="overflow-hidden text-ellipsis whitespace-nowrap">
                {detail.result.url || '-'}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-2 px-3 py-2 border-t border-solid border-ctip-border">
            <div>
              <Time class="w-8 h-8 p-2 mr-2 text-white fill-white bg-ctip-primary" />
              EVENT
            </div>
            <div class="flex items-center justify-end">
              {getHumanReadableDateWithSeconds(lastUpdate)}
            </div>
          </div>

          {#if detail.result.tags.length}
            <div class="grid grid-cols-2 px-3 py-2 border-t border-solid border-ctip-border">
              <div>
                <Laptop class="w-8 h-8 p-2 mr-2 text-white fill-white bg-ctip-primary" />
                FORUM
              </div>
              <div class="grid justify-end">
                {#each detail.result.tags as tag}
                  <Tag type={tag === 'PUBLIC FORUM' ? 'green' : 'gray'}>
                    {tag}
                  </Tag>
                {/each}
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="flex flex-col w-full gap-4 lg:w-8/12">
      <div class="border-[1px] border-solid border-ctip-border">
        <div class="flex justify-between px-3 py-2 text-lg bg-ctip-ui">
          <div class="whitespace-nowrap">
            Changed on
            <Tag type="high-contrast" class="font-bold">
              {getHumanReadableDateWithSeconds(selectedTimestamp)}
            </Tag>
          </div>

          <div class="flex flex-wrap gap-2">
            <div class="w-[210px]">
              <ContentSwitcher size="sm" bind:selectedIndex>
                <Switch text="Markdown" />
                <Switch text="Raw" />
              </ContentSwitcher>
            </div>

            <Button
              on:click={download}
              size="small"
              disabled={isDownloading}
              icon={isDownloading ? InlineLoading : Download}
              class="pl-2 pr-10 text-white rounded"
            >
              Download
            </Button>

            <GenericButton kind="primary" on:click={() => (contentModalOpen = true)} size="small">
              <span class="pr-2">Expand</span>
              <Maximize />
            </GenericButton>
          </div>
        </div>

        <div class="border-t border-solid border-ctip-border max-h-[658px] overflow-auto p-3">
          {#if timestampLoading}
            <InlineLoading class="flex items-center justify-center h-full" />
          {:else if timestampLoadingError}
            <div class="flex items-center justify-center">
              <TaskRemove />
            </div>
          {:else if selectedIndex === 0}
            {@html markdownHtml}
          {:else}
            <pre>
              {markdownHtml}
            </pre>
          {/if}
        </div>
      </div>

      <!-- Calendar -->
      <div class="border-[1px] border-solid border-ctip-border z-[5]" class:shadow-2xl={startDiff}>
        <div class="flex justify-between px-3 py-2 text-lg bg-ctip-ui">
          <div>Calendar</div>

          <div>
            {#key startDiff}
              <GenericButton
                on:click={() => (startDiff = !startDiff)}
                size="small"
                kind={startDiff ? 'primary' : 'tertiary'}
              >
                Diff
              </GenericButton>
            {/key}
          </div>
        </div>

        <div class="border-t border-solid border-ctip-border" class:z-50={startDiff}>
          <CalendarChart
            timestamps={sortedUpdatesTimestamps}
            {selectedTimestamp}
            on:clickTimestamp={startDiff ? selectDiff : selectTimestamp}
          />
        </div>
      </div>
    </div>
  </div>
{/if}

<Modal
  on:click:button--primary={() => (screenshotModalOpen = false)}
  primaryButtonText="Close"
  bind:open={screenshotModalOpen}
  modalHeading="Screenshot"
  size="lg"
  hasScrollingContent
>
  {#if detail?.result?.screenshot}
    <img class="w-full" alt="Screenshot" src="data:image/png;base64,{detail.result.screenshot}" />
  {/if}
</Modal>

<Modal
  on:click:button--primary={() => (diffModalOpen = false)}
  primaryButtonText="Close"
  bind:open={diffModalOpen}
  modalHeading="Diff"
  size="lg"
  hasScrollingContent
>
  {#if diffLoading}
    <InlineLoading class="flex items-center justify-center h-full" />
  {:else}
    {@html diffHtml}
  {/if}
</Modal>

<Modal
  on:click:button--primary={() => (contentModalOpen = false)}
  primaryButtonText="Close"
  bind:open={contentModalOpen}
  modalHeading="Content"
  size="lg"
  hasScrollingContent
>
  <div class="flex items-center justify-center mb-4">
    <ContentSwitcher class="w-80" size="sm" bind:selectedIndex>
      <Switch text="Markdown" />
      <Switch text="Raw" />
    </ContentSwitcher>
  </div>
  <div>
    <div class="p-4 bg-ctip-background">
      {#if selectedIndex === 0}
        {@html markdownHtml}
      {:else}
        <pre>
        {markdownHtml}
        </pre>
      {/if}
    </div>
  </div>
</Modal>
