<script lang="ts">
  import { onMount } from 'svelte';
  import threatsStore from '$stores/threats';
  import { currentOrganization } from '$stores/organization';
  import { currentModule } from '$stores/module';
  import GenericButton from '$lib/components/Buttons/GenericButton.svelte';
  import { ChevronDown, Download } from 'carbon-icons-svelte';
  import { InlineLoading, TextInput } from 'carbon-components-svelte';
  import Client from '$lib/client';
  import notifications from '$stores/notification';
  import GenericSingleSelect from '$lib/components/Filter/GenericSingleSelect.svelte';
  import { emailRegexp } from '$lib/utils/regexPatterns';

  let languageReport = '';
  let inputReport = '';
  let isDownloading = false;
  $: emailError = inputReport !== '' && !inputReport.match(emailRegexp);

  const client = new Client();

  onMount(() => {
    return () => {
      client.abort();
    };
  });

  async function sendReport() {
    const emailToSend = inputReport.toString().replace(' ', '');
    await client.threats.sendReport(
      $currentOrganization.id,
      $currentModule.id,
      $currentModule.moduleName,
      $threatsStore.selectedForDetails.resourceId,
      emailToSend,
      languageReport
    );
    notifications.notify({
      kind: 'success',
      title: 'Success',
      subtitle: 'The report was sent'
    });
    inputReport = '';
    languageReport = '';
  }

  async function downloadReport() {
    isDownloading = true;
    await client.threats.downloadReport(
      $currentOrganization.id,
      $currentModule.id,
      $currentModule.moduleName,
      $threatsStore.selectedForDetails.resourceId,
      languageReport
    );
    isDownloading = false;
  }
</script>

<div class="mr-2 pt-3 pb-4">
  <div class="flex">
    <GenericSingleSelect
      iconPosition="right"
      align="bottom-left"
      highlightedWhenSeleted={false}
      customClass="border text-ctip-btnLight"
      selectedValue={languageReport}
      items={[
        { text: 'English', value: 'en' },
        { text: 'Spanish', value: 'es' },
        { text: 'Portuguese', value: 'pt' }
      ]}
      value="value"
      display="text"
      title={`Language: ${languageReport}`}
      icon={ChevronDown}
      alwaysShowIcon
      on:changeSelected={(event) => {
        languageReport = event.detail;
      }}
    />
    <div class="max-w-xs">
      <TextInput
        bind:value={inputReport}
        placeholder="Enter here the e-mail address"
        size="sm"
        invalid={emailError}
        invalidText="Invalid e-mail"
        class="ml-1"
      />
    </div>
    <GenericButton
      on:click={sendReport}
      kind="primary"
      class="ml-1"
      disabled={!languageReport || !inputReport || emailError}>Send</GenericButton
    >
    <GenericButton on:click={downloadReport} kind="secondary" class="ml-3 h-6">
      {#if isDownloading}
        <InlineLoading class="mr-2" />
      {:else}
        <Download class="mr-3" />
      {/if}
      <span>Download</span>
    </GenericButton>
  </div>
</div>
