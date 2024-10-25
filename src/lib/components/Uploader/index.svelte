<script lang="ts">
  import Client from '$lib/client';
  import { beforeUpload } from '$lib/utils/functions';
  import { Button, InlineLoading, TooltipDefinition } from 'carbon-components-svelte';
  import {
    Add,
    CheckmarkFilled,
    ChevronDown,
    ChevronUp,
    CloseFilled,
    CloseOutline,
    InformationFilled,
    Renew,
    TrashCan,
    Upload
  } from 'carbon-icons-svelte';
  import { currentModule } from '$stores/module';
  import { currentOrganization } from '$stores/organization';
  import { createEventDispatcher } from 'svelte';
  import GenericButton from '$lib/components/Buttons/GenericButton.svelte';

  type StatusFileType = File & {
    name: string;
    status: string;
    id: string;
    estimatedTime: any;
    errorMessage?: any;
    error?: any;
  };

  export let iconDescription =
    'Analyze the behaviour of potential malicious samples such as .exe, .dll, .sys, .doc, .pdf, .com and .zip in our sandbox. Max. file size is 20MB.';

  let fileinput: HTMLInputElement;
  let filesStatus: StatusFileType[] = [];
  let filesObjs: File[] = [];
  let isMinified = true;

  const client = new Client();
  const dispatch = createEventDispatcher();

  function toogleMinified() {
    isMinified = !isMinified;
  }

  function isUploading(status) {
    return status.some((s) => s.status === 'uploading');
  }

  function getNumUploading(status) {
    return status.filter((s) => s.status === 'uploading').length;
  }

  function getNumUploaded(status) {
    return status.filter((s) => s.status === 'complete').length;
  }

  function getNumError(status) {
    return status.filter((s) => s.status === 'error').length;
  }

  function estimatedTime(status) {
    return Math.round(Math.floor(status.map((x) => x.estimatedTime || 0).reduce((a, b) => (a > b ? a : b), 0)));
  }

  function onCloseUploaderStatus() {
    filesStatus = [];
  }

  function shortenFilename(filename: string) {
    return filename.length > 50 ? filename.slice(0, 40) + '...' + filename.slice(-8, 8) : filename;
  }

  function updateFilesObjs(file: StatusFileType, status: any, message?: string) {
    filesStatus = filesStatus.map((f: StatusFileType) => {
      if (f.name === file.name) {
        const { errorMessage, ...rest } = f;
        return {
          ...rest,
          status,
          ...(status !== 'uploading' && errorMessage ? { errorMessage } : {}),
          ...(message ? { errorMessage: { error: { message } } } : {})
        };
      } else {
        return f;
      }
    });
  }

  function getErrorText(file: StatusFileType) {
    const { status, errorMessage, estimatedTime, error = '' } = file;
    if (status === 'error') {
      if (
        errorMessage?.error?.message === 'malware.already_uploaded' ||
        errorMessage?.error?.message === 'error.already_uploaded'
      ) {
        return 'File already uploaded.';
      } else if (errorMessage?.error?.message === 'error.undefined_error') {
        return 'File upload error. Please, try again.';
      } else if (errorMessage?.error?.message === 'malware.max_file_size') {
        return 'File size cannot exceed 20MB.';
      } else if (errorMessage?.error?.message === 'Upload malware file is empty') {
        return 'Upload malware file is empty';
      } else if (errorMessage?.error === 'file_not_allowed') {
        return 'Extension does not match file type';
      } else if (!errorMessage?.error?.message) {
        return `${error} - Error uploading the file`;
      }
    } else if (status === 'complete') {
      if (errorMessage?.error?.message === 'error.already_uploaded') {
        return 'File already uploaded.';
      }
    }
    return '';
  }

  const onFileSelected = (e) => {
    const { files: filesArg } = e.target;

    const files = Array.prototype.slice.call(filesArg); // Files to Array
    const getFileId = (file: File) => `${file.name}:${file.lastModified}:${file.size}`;

    filesObjs = [...filesObjs, ...files];
    filesStatus = [
      ...filesStatus,
      ...files.map((f: StatusFileType) => {
        const { lastModified, name, size, type, webkitRelativePath } = f;
        return { lastModified, name, size, type, webkitRelativePath, status: 'uploading', id: getFileId(f) };
      })
    ];

    files.forEach((f: StatusFileType, index: number) => {
      ((file: StatusFileType, indx) => {
        if (beforeUpload(file)) {
          uploadOneFileOrUrl(file);
        } else {
          updateFilesObjs(file, 'error', 'malware.max_file_size');
        }
      })(f, index);
    });
  };

  async function uploadOneFileOrUrl(fileOrUrl, isUrl = false) {
    try {
      const { data } = await client.files.uploadMalwareFile(
        $currentOrganization.id,
        $currentModule.id,
        $currentModule.moduleName,
        fileOrUrl
      );
      if (data?.message?.includes?.('error')) {
        const isAlreadyUploaded = data?.message === 'error.already_uploaded' ? 'complete' : 'error';
        updateFilesObjs(fileOrUrl, isAlreadyUploaded, data?.message);
      } else {
        updateFilesObjs(fileOrUrl, 'complete');
        dispatch('uploadFile');
      }
    } catch (error) {
      console.log('error to upload: ', error);
    }
  }

  async function reUploadFile(fileObject) {
    updateFilesObjs(fileObject, 'uploading');
    const now = new Date().getTime();
    const getFileId = (file) => `${file.name}:${file.lastModified}:${file.size}`;
    const getFileOrUrlId = (f) => (fileObject.isUrl ? `url:${now}` : getFileId(f));
    filesStatus = filesStatus.map((f) => (f.id === fileObject.id ? { ...f, id: getFileOrUrlId(f) } : f));
    const fileToSend = filesObjs.find((file: File) => file.name === fileObject.name);
    await uploadOneFileOrUrl(fileToSend);
  }

  function removeFile(fileId: string) {
    filesStatus = filesStatus.filter((file: StatusFileType) => file.id !== fileId);
  }
</script>

<GenericButton kind="tertiary" class="mb-2" on:click={() => fileinput.click()}>Upload a sample <Add /></GenericButton>
<TooltipDefinition tooltipText={iconDescription}>
  <GenericButton kind="tertiary">
    <InformationFilled class="upload-info" />
  </GenericButton>
</TooltipDefinition>
<input
  style="display:none"
  type="file"
  accept=".exe, .dll, .sys, .doc, .pdf, .com, .zip, .jpg, .jepg, .png"
  multiple
  on:change={(e) => onFileSelected(e)}
  bind:this={fileinput}
/>

{#if filesStatus.length}
  <div
    class="flex flex-col border-solid border-[1px] border-ctip-dark rounded-t-[5px] fixed bottom-0 right-[60px] w-[560px] z-10"
    class:is-minified={isMinified}
    class:is-maximized={!isMinified}
  >
    <header class="flex h-[60px] bg-ctip-primaryHover text-ctip-white text-sm" class:is-maximized={!isMinified}>
      <div class="flex items-center justify-between w-100">
        <div class="flex flex-col pl-3">
          {#if isUploading(filesStatus)}
            <span>Uploading {getNumUploading(filesStatus)} files</span>
            <span class="text-ctip-gray font-[200]">{estimatedTime(filesStatus) || 0}s remaining</span>
          {:else}
            <span>Upload Completed</span>
          {/if}
        </div>
        <div class="flex justify-around items-center pr-3 w-[240px]">
          <Upload class="text-ctip-successThreat" /><span>{getNumUploaded(filesStatus)} file(s) uploaded</span>
          <CloseOutline class="text-ctip-dangerThreat" /><span>{getNumError(filesStatus)} errors</span>
        </div>
      </div>
      <div class="flex justify-around pt-[3px] w-[46px] right-0 absolute">
        <span on:click={toogleMinified} class="cursor-pointer">
          {#if isMinified}
            <ChevronUp />
          {:else}
            <ChevronDown />
          {/if}
        </span>
        <span on:click={onCloseUploaderStatus} class="cursor-pointer"><CloseOutline /></span>
      </div>
    </header>
    {#if !isMinified}
      <main class="flex flex-col">
        <section class="flex items-center justify-end bg-ctip-grayMiddle pb-[5px]">
          <Button kind="ghost" on:click={onCloseUploaderStatus}>Cancel</Button>
        </section>
        {#each filesStatus as file}
          <section
            class="flex items-center justify-between bg-ctip-white border-b-solid border-b-[1px] border-b-ctip-light pt-[10px] pb-[10px]"
          >
            <div class="flex items-center">
              <div class="pl-3 pr-3" class:error-icon={file.errorMessage}>
                {#if file.status === 'complete'}
                  <CheckmarkFilled class="text-ctip-successThreat" />
                {:else if file.status === 'error'}
                  <CloseFilled class="text-ctip-dangerThreat" />
                {:else if file.status === 'uploading'}
                  <InlineLoading class="text-ctip-grayThreat" />
                {/if}
              </div>
              <div class="text-ctip-gray w-[450px]">
                {shortenFilename(file.name)}<br />
                {#if file.status === 'error' || file.status === 'complete'}
                  <span class="text-ctip-dangerThreat">{getErrorText(file)}</span>
                {/if}
              </div>
              <div class="flex justify-between w-[50px]">
                {#if file.status === 'error'}
                  <span on:click={() => reUploadFile(file)} class="cursor-pointer"><Renew /></span>
                {/if}
                {#if file.status !== 'uploading'}
                  <span on:click={() => removeFile(file.id)} class="cursor-pointer"><TrashCan /></span>
                {/if}
              </div>
            </div>
          </section>
        {/each}
      </main>
    {/if}
  </div>
{/if}

<style>
  :global(svg.upload-info) {
    fill: var(--ctip-interactive);
  }

  :global(button:hover svg.upload-info) {
    fill: var(--ctip-white);
  }
</style>
