<script lang="ts">
  import { page } from '$app/stores';
  import { currentModule } from '$stores/module';
  import { currentOrganizationId } from '$stores/organization';
  import Client from '$lib/client';
  import { onMount } from 'svelte';
  import UploaderFile from '$lib/components/Uploader/UploaderFile.svelte';
  import { SkeletonText } from 'carbon-components-svelte';
  import Crawlers from './Crawlers.svelte';
  import HeaderDetailsTerm from './HeaderDetailsTerm.svelte';
  import { getHumanReadableDate } from '$lib/utils/functions';
  import { MODULE_NAME } from '$lib/constants/modules';

  const client = new Client();
  const { termId } = $page.params;

  export let resource = undefined;

  let imageFile = undefined;
  let isLoading = false;

  onMount(() => {
    init();
    return () => {
      client.abort();
    };
  });

  async function init() {
    isLoading = true;

    const { data } = await client.settings.getSettingsDataView(
      $currentOrganizationId,
      $currentModule.id,
      $currentModule.moduleName,
      'terms',
      +termId
    );
    resource = {
      ...data,
      createdAt: getHumanReadableDate(data.createdAt)
    };
    if (data.searchImageFilename) {
      const { data: image } = await client.settings.getSettingsDataViewImage(
        $currentOrganizationId,
        $currentModule.id,
        +termId
      );
      resource.image = image;
      imageFile = image;
    }

    isLoading = false;
  }
</script>

{#if isLoading}
  <div class="block w-full mt-2">
    <SkeletonText paragraph lines={15} />
  </div>
{:else}
  <div class="flex flex-col justify-between w-full">
    <div class="flex justify-between m-3">
      <UploaderFile showUploadButton={false} bind:imageFile />
      <HeaderDetailsTerm {resource} />
    </div>
    <div>
      {#if ($currentModule.moduleName === MODULE_NAME.SOCIAL_MEDIA && resource?.crawler) || $currentModule.moduleName !== MODULE_NAME.SOCIAL_MEDIA}
        <Crawlers {resource} isDetails />
      {/if}
    </div>
  </div>
{/if}
