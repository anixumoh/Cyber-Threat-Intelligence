<script lang="ts">
  import axios from 'axios';
  import copy from 'clipboard-copy';
  import {
    FormGroup,
    ListItem,
    OrderedList,
    TextInput,
    Button,
    InlineLoading,
    TextArea,
    SkeletonPlaceholder
  } from 'carbon-components-svelte';
  import { CopyFile, Download } from 'carbon-icons-svelte';
  import { createEventDispatcher } from 'svelte';
  import * as FileSaver from 'file-saver';

  export let qr: string;
  export let secret: string;

  const dispatch = createEventDispatcher();

  let submitting = false;
  let errorMessage = '';
  let code = '';
  let codes: string[] = [];
  $: code = (code.match(/\d/g) || []).join(''); // allow only numbers

  async function submit() {
    submitting = true;

    const data = {
      code,
      secret
    };
    const url = '/api/v2/user/verify2FA';

    try {
      const response = await axios.post(url, data).catch((error) => {
        const message = error?.response?.data?.field;
        throw new Error(message);
      });

      codes = response.data;
      dispatch('enabled');
    } catch (error) {
      errorMessage = error?.message ?? 'An internal server error occurred.';
    } finally {
      submitting = false;
    }
  }

  function downloadCodes() {
    const codesMultiline = codes.map((code) => code.toString().concat('\n'));
    const blob = new Blob(codesMultiline, {
      type: 'text/plain'
    });
    FileSaver.saveAs(blob, 'blueliv-recovery-account-codes.txt');
  }
</script>

{#if codes.length}
  <div class="md:flex w-full">
    <div class="w-full md:w-1/2 md:pr-4">
      <TextArea readonly rows={5} light value={codes.join('\n')} />
    </div>
    <div class="w-full md:w-1/2 py-4">
      <div class="pb-2">We strongly recommend that you copy your recovery codes and keep them safe.</div>
      <div>
        If you lose access and don't have configured a phone backup number, using these codes will be the only way to
        recover your account.
      </div>
    </div>
  </div>
  <div class="mt-4">
    <Button
      kind="tertiary"
      iconDescription="Copy"
      icon={CopyFile}
      class="md:!max-w-full"
      on:click={() => copy(codes.join(','))}
    >
      Copy
    </Button>
    <Button kind="tertiary" iconDescription="Download" icon={Download} class="md:!max-w-full" on:click={downloadCodes}>
      Download
    </Button>
  </div>
{:else}
  <div>
    <h6>Enable Verification in 2 Steps</h6>
    <div class="p-4">
      <OrderedList native>
        <ListItem>Get</ListItem>
        <OrderedList native nested>
          <ListItem>
            Google Authenticator app on
            <a
              href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2"
              target="_blank"
            >
              Google Play (Android)
            </a>
            or
            <a href="https://itunes.apple.com/us/app/google-authenticator/id388497605" target="_blank">
              iTunes (IOS)
            </a>
          </ListItem>
          <ListItem>
            Microsoft Authenticator app on
            <a href="https://play.google.com/store/apps/details?id=com.azure.authenticator" target="_blank">
              Google Play (Android)
            </a>
            or
            <a href="https://apps.apple.com/us/app/microsoft-authenticator/id983156458" target="_blank">
              iTunes (IOS)
            </a>
          </ListItem>
          <ListItem>
            Oracle Authenticator app on
            <a href="https://play.google.com/store/apps/details?id=oracle.idm.mobile.authenticator" target="_blank">
              Google Play (Android)
            </a>
            or
            <a href="https://apps.apple.com/us/app/oracle-mobile-authenticator/id835904829" target="_blank">
              iTunes (IOS)
            </a>
          </ListItem>
        </OrderedList>
        <ListItem>In the app select add an account.</ListItem>
        <ListItem>Select to scan a barcode.</ListItem>
      </OrderedList>
    </div>
    {#if qr}
      <img class="block mx-auto" src="data:image/jpg;base64,{qr}" alt="qr" />
    {:else}
      <SkeletonPlaceholder class="mx-auto w-[200px] h-[200px]" />
    {/if}
    <form class="flex flex-col" on:submit|preventDefault={submit}>
      <FormGroup>
        <TextInput
          bind:value={code}
          name="code"
          labelText="Write your validation code"
          placeholder="xxx xxx"
          autocomplete="off"
          minlength={6}
          maxlength={6}
          invalidText={errorMessage}
          invalid={!!errorMessage}
        />
      </FormGroup>

      <Button
        id="login"
        type="submit"
        kind="primary"
        disabled={submitting || code?.length !== 6}
        icon={submitting ? InlineLoading : null}
        class="!max-w-full"
      >
        Send
      </Button>
    </form>
  </div>
{/if}
