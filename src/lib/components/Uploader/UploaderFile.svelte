<script lang="ts">
  import { Add, TrashCan } from 'carbon-icons-svelte';
  import GenericButton from '../Buttons/GenericButton.svelte';
  import CommonModal from '$lib/components/CommonModal/CommonModal.svelte';
  import { TooltipDefinition } from 'carbon-components-svelte';

  export let titleButton = 'Upload';
  export let imageFile = undefined;
  export let showUploadButton = true;
  export let enableDelete = true;

  let fileinput: HTMLInputElement;
  let uploadedImage = undefined;
  let modalExpandImage = false;

  $: (imageFile || imageFile === undefined) && onInitImage();

  function onFileSelected(event) {
    if (event.target.files.length > 0) {
      imageFile = event.target.files[0];
    }
  }

  function onInitImage() {
    if (imageFile) {
      const reader = new FileReader();
      reader.readAsBinaryString(imageFile);
      reader.onload = () => {
        uploadedImage = `data:${imageFile.type};base64,${btoa(reader.result as string)}`;
      };
    } else {
      uploadedImage = '/assets/default_images/No_image.jpg';
    }
  }

  function onFileDeleted() {
    imageFile = undefined;
    uploadedImage = undefined;
  }
</script>

<div class="flex flex-col items-end">
  <div>
    {#if uploadedImage}
      <TooltipDefinition tooltipText="If you click over image, you can see the preview.">
        <img
          class="img-thumbnail mb-3 w-80 h-10"
          class:w-80={!uploadedImage.includes('No_image')}
          class:h-10={!uploadedImage.includes('No_image')}
          class:w-96={uploadedImage.includes('No_image')}
          class:h-52={uploadedImage.includes('No_image')}
          src={uploadedImage}
          alt="uploaded"
          id="file-preview"
          on:click={() => (modalExpandImage = true)}
        />
      </TooltipDefinition>
    {/if}
  </div>

  {#if showUploadButton}
    <div class="justify-self-end justify-center">
      <GenericButton kind="tertiary" class="mb-2 w-56" on:click={() => fileinput.click()}
        >{titleButton} <Add /></GenericButton
      >
      {#if imageFile && enableDelete}
        <span on:click={onFileDeleted}><TrashCan class="text-ctip-danger cursor-pointer ml-2" /></span>
      {/if}
      <input
        style="display:none"
        type="file"
        accept="image/*"
        multiple
        on:change={(e) => onFileSelected(e)}
        bind:this={fileinput}
      />
    </div>
  {/if}
</div>

<CommonModal
  bind:open={modalExpandImage}
  passiveModal
  modalHeading="Image Preview"
  on:closeModal={() => (modalExpandImage = false)}
>
  <img width="100%" src={uploadedImage} alt="Expand" />
</CommonModal>
