<script lang="ts">
  import Client from '$lib/client';
  import InfoCard from '$lib/components/Card/InfoCard.svelte';
  import threatsStore from '$stores/threats';
  import { onMount } from 'svelte';
  import { currentOrganization } from '$stores/organization';
  import { currentModule } from '$stores/module';
  import { MODULE_NAME } from '$lib/constants/modules';
  import EmptyData from '$lib/components/EmptyData/EmptyData.svelte';
  import { ButtonSet, DataTable } from 'carbon-components-svelte';
  import { getHumanReadableDate } from '$lib/utils/functions';
  import GenericButton from '$lib/components/Buttons/GenericButton.svelte';
  import CommonModal from '$lib/components/CommonModal/CommonModal.svelte';
  import ExternalLink from '$lib/components/ThreatsCommons/ExternalLink/ExternalLink.svelte';
  import FileSaver from 'file-saver';
  import { ChevronLeft, ChevronRight, Maximize } from 'carbon-icons-svelte';
  import Mark from 'mark.js';
  import SafeImage from '$lib/components/SafeImage.svelte';

  const client = new Client();
  let moreInfoData = undefined;
  let safeImageContent = undefined;
  let expandedContent = undefined;
  let dataToPrint = [];

  let isLoadingImage = false;
  let isPhp = false;
  let expandedView = false;
  let contentStopper = false;
  let expandStopper = false;
  let totalMatches = 0;
  let focused = 0;
  let expandFocused = 0;

  let saveImageUrl = '';

  onMount(async () => {
    $threatsStore.selectedForDetails?.resourceId && (await init());
    return () => {
      client.abort();
    };
  });

  async function init() {
    await getMoreInfo();
    initMark();
  }

  function initMark() {
    if (!contentStopper) {
      const content: any = document.querySelector('.content');
      if (content) {
        const instance = new Mark(content);
        instance.mark($threatsStore.selectedForDetails?.searchWords, { separateWordSearch: false });
        const matches = content.getElementsByTagName('mark');
        totalMatches = matches.length;
        contentStopper = true;
      }
    }

    if (!expandStopper) {
      const expandedContent: any = document.querySelector('.expanded-content');

      if (expandedContent) {
        const instance = new Mark(expandedContent);
        instance.mark($threatsStore.selectedForDetails?.searchWords, { separateWordSearch: false });
        expandStopper = true;
      }
    }
  }

  async function getMoreInfo() {
    const { data } = await client.threats.getMoreInfo(
      $currentOrganization.id,
      $currentModule.id,
      $currentModule.moduleName,
      $threatsStore.selectedForDetails?.resourceId
    );
    moreInfoData = data?.map ?? undefined;
    setNewMoreInfo();
  }

  function setNewMoreInfo() {
    const temp = moreInfoData ? JSON.parse(JSON.stringify(moreInfoData)) : undefined;

    if (temp) {
      if (temp?.['Contains Secrets']) {
        delete temp['Contains Secrets'];
      }

      dataToPrint = Object.keys?.(temp)?.map((key) => {
        if (temp?.[key]?.[0]?.type === 'IMAGE') {
          const isBase64 = temp[key][0].value.startsWith('data:image');
          if (isBase64) {
            safeImageContent = temp[key][0].value;
          } else if (!safeImageContent && !isLoadingImage) {
            isLoadingImage = true;
            saveImageUrl = temp[key][0].value;
          }
        }
        return {
          type: key,
          value: temp[key]
        };
      });

      let htmlIndex: number;
      dataToPrint.forEach((data, index) => {
        if (data.type === 'Content') {
          htmlIndex = index;
          isPhp = dataToPrint[index].value[0].value.startsWith('<?');
          if (isPhp) {
            dataToPrint[index]['isPhp'] = true;
          }

          dataToPrint[index].value[0].type = 'RAW';
          expandedContent = typeof htmlIndex !== 'undefined' ? dataToPrint[index].value[0].value : '';
          return htmlIndex;
        }

        if (data.type === 'Secrets') {
          const json = dataToPrint[index].value[0].value;
          if (isJsonString(json)) {
            dataToPrint[index].value[0].value = JSON.stringify(JSON.parse(dataToPrint[index].value[0].value), null, 2);
          }
        }
      });
    }
  }

  function isJsonString(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  async function downloadHashFile() {
    if (moreInfoData['App Hash'] && moreInfoData['App Hash'][0].value) {
      const { data } = await client.threats.downloadShaFile(
        $currentOrganization.id,
        $currentModule.id,
        $threatsStore.selectedForDetails?.resourceId
      );
      const blob = new Blob([data], {
        type: 'application/octet-stream'
      });
      FileSaver.saveAs(blob, 'apphash.apk');
    }
  }

  function focus(step: 'previous' | 'next') {
    const content = document.querySelector('.content');
    const matches = content.getElementsByTagName('mark');
    let index = focused > 0 ? focused - 1 : 0;
    matches[index].classList.remove('selected');

    switch (step) {
      case 'next':
        focused += 1;
        if (focused > totalMatches) {
          focused = 1;
        }

        index = focused - 1;
        matches[index].classList.add('selected');
        matches[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        break;

      case 'previous':
        focused = focused > 0 ? focused - 1 : 0;
        if (focused === 0) {
          focused = totalMatches;
        }

        index = focused - 1;
        matches[index].classList.add('selected');
        matches[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        break;
    }
  }

  function expandFocus(step: 'previous' | 'next') {
    const content = document.querySelector('.expanded-content');
    const matches = content.getElementsByTagName('mark');
    let index = expandFocused > 0 ? expandFocused - 1 : 0;
    matches[index].classList.remove('selected');

    switch (step) {
      case 'next':
        expandFocused += 1;
        if (expandFocused > totalMatches) {
          expandFocused = 1;
        }

        index = expandFocused - 1;
        matches[index].classList.add('selected');
        matches[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        break;

      case 'previous':
        expandFocused = expandFocused > 0 ? expandFocused - 1 : 0;
        if (expandFocused === 0) {
          expandFocused = totalMatches;
        }

        index = expandFocused - 1;
        matches[index].classList.add('selected');
        matches[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        break;
    }
  }

  function removeSelectedClass(cssClass: string, focused: number) {
    const content = document.querySelector(cssClass);
    const matches = content.getElementsByTagName('mark');
    matches[focused].classList.remove('selected');
  }

  function closeExpanded() {
    const index = expandFocused > 0 ? expandFocused - 1 : 0;
    removeSelectedClass('.expanded-content', index);
    expandedView = false;
    expandFocused = 0;
  }
</script>

{#if dataToPrint.length}
  {#each dataToPrint as data}
    {#if data.type && data.value}
      <InfoCard title={data.type} class="mt-3">
        <svelte:fragment slot="action">
          {#if data.type === 'Content' && expandedContent}
            <div class="flex align-middle">
              <GenericButton on:click={() => (expandedView = true)} kind="primary"
                ><Maximize /> <span class="ml-1">Expand</span></GenericButton
              >
              <ButtonSet class="mx-2">
                <GenericButton on:click={() => focus('previous')}><ChevronLeft /></GenericButton>
                <GenericButton on:click={() => focus('next')}><ChevronRight /></GenericButton>
              </ButtonSet>
              <span class="flex self-center">{focused}/{totalMatches}</span>
            </div>
          {/if}
        </svelte:fragment>
        {#each data.value as subData}
          <div class="min-w-full p-4">
            {#if subData.type === 'URL' && data.type !== 'Download Link'}
              <ExternalLink onlyText tooltipText={`${subData.value}`} />
            {/if}
            {#if subData.type !== 'IMAGE' && subData.type !== 'HTML' && subData.type !== 'URL' && subData.type !== 'JSON' && subData.type !== 'RAW'}
              <div class="overflow-auto max-h-[500px]">
                <p class="mb-0 text-ctip-secondary">{subData.value}</p>
              </div>
              {#if $currentModule?.moduleName === MODULE_NAME.MOBILE_APPS && data.type === 'App Hash' && subData.type === 'TEXT'}
                <GenericButton on:click={downloadHashFile}>Download</GenericButton>
              {/if}
            {/if}
            {#if subData.type === 'IMAGE'}
              {#if saveImageUrl}
                <SafeImage src={saveImageUrl} withLink={false} isExtraData />
              {:else}
                <SafeImage isBase64 src={safeImageContent} withLink={false} />
              {/if}
            {/if}
            {#if ((subData.type === 'HTML' || subData.type === 'RAW') && $currentModule?.moduleName !== MODULE_NAME.MEDIA_TRACKER) || subData.type === 'JSON'}
              <div class="overflow-auto max-h-[500px]">
                <div class="show-code">
                  <pre
                    class="p-4 mb-0 whitespace-pre bg-ctip-light text-ctip-secondary"
                    class:content={data.type === 'Content'}
                    id="contentElement">{subData.value}</pre>
                </div>
              </div>
            {/if}
            {#if (subData.type === 'HTML' || subData.type === 'RAW') && $currentModule?.moduleName === MODULE_NAME.MEDIA_TRACKER}
              {subData.value}
            {/if}
          </div>
        {/each}
      </InfoCard>
    {/if}
  {/each}
{:else}
  <EmptyData messageObj={{ msg: 'No additional data' }} />
{/if}

<CommonModal
  bind:open={expandedView}
  passiveModal
  modalHeading="Content"
  size="lg"
  on:closeModal={() => {
    closeExpanded();
  }}
>
  <div class="sticky flex justify-center mb-3 -top-2 bg-ctip-ui">
    <ButtonSet class="mx-1">
      <GenericButton on:click={() => expandFocus('previous')}><ChevronLeft /></GenericButton>
      <GenericButton on:click={() => expandFocus('next')}><ChevronRight /></GenericButton>
    </ButtonSet>
    <span class="flex self-center">{expandFocused}/{totalMatches}</span>
  </div>
  <div class="show-code">
    {#if $currentModule?.moduleName !== MODULE_NAME.MEDIA_TRACKER}
      <pre
        class="p-4 mb-0 whitespace-pre bg-ctip-ui text-ctip-text expanded-content"
        id="expandedContentElemement">{expandedContent}</pre>
    {:else}
      <div class="p-2 overflow-auto max-h-7">
        {{ expandedContent }}
      </div>
    {/if}
  </div>
</CommonModal>

<style>
  :global(.show-code .bx--snippet) {
    max-width: 100%;
  }

  :global(pre mark) {
    font-size: 15px;
    background-color: var(--ctip-warning);
    font-weight: bolder;
  }

  :global(pre mark.selected) {
    background-color: var(--ctip-danger);
  }
</style>
