<script lang="ts">
  import Client from '$lib/client';
  import { GATEWAY_APP } from '$lib/constants/gateway';
  import externalLinkStore from '$stores/externalLink';
  import { SkeletonPlaceholder } from 'carbon-components-svelte';
  import { onMount } from 'svelte';
  import CommonModal from '$lib/components/CommonModal/CommonModal.svelte';

  export let src: string;
  export let isBase64: boolean = false;
  export let withLink = true;
  export let isExtraData = false;

  const client = new Client();
  const noImage = '/assets/default_images/No_image.jpg';

  let img: string;
  let modalExpandImage = false;

  onMount(() => {
    isBase64 ? (img = src) : getImage();
    return () => client.abort();
  });

  async function getImage() {
    const url = `/download_base64?url=${src}`;
    try {
      const response = await client.gateway.postImage<string>(GATEWAY_APP.IMAGES_DOWNLOADER, url, {});
      img = `data:image/png;base64,${response.data}`;
    } catch (error) {
      img = noImage;
    }
  }
</script>

{#if !img}
  <SkeletonPlaceholder class="h-full w-full" />
{:else if img === noImage}
  <div class:flex={!isExtraData} class:items-center={!isExtraData} class:justify-center={!isExtraData}>
    <img class="max-h-full max-w-full" class:w-36={isExtraData} src={img} alt="" />
  </div>
{:else if withLink}
  <a
    class="flex items-center justify-center"
    on:click={externalLinkStore.handleClick}
    href={src}
    target="_blank"
    rel="noreferrer noopener"
  >
    <img class="max-h-full max-w-full" src={img} alt="" />
  </a>
{:else}
  <img class="max-h-full max-w-full" src={img} alt="" on:click={() => (modalExpandImage = true)} />
{/if}

<CommonModal
  bind:open={modalExpandImage}
  passiveModal
  modalHeading="ScreenShot"
  on:closeModal={() => (modalExpandImage = false)}
>
  <img width="100%" src={img} alt="Expand" />
</CommonModal>
