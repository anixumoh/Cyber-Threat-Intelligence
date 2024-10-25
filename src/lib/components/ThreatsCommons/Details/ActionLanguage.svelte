<script lang="ts">
  import Client from '$lib/client';
  import SelectLanguage from '$lib/components/SelectLanguage/index.svelte';
  import type { LanguageType } from '$stores/languages';
  import { currentModule } from '$stores/module';
  import { currentOrganization } from '$stores/organization';
  import threatsStore from '$stores/threats';
  import { InlineLoading } from 'carbon-components-svelte';
  import { Flag } from 'carbon-icons-svelte';
  import ViewDetailsItem from '../ViewDetailsItem.svelte';

  export let tooltipText = '';

  const client = new Client();

  let sendDataLanguage = false;

  async function onChangeLanguage(event) {
    sendDataLanguage = true;
    const language: LanguageType = event.detail;
    await client.threats.onChangeLanguage(
      $currentOrganization.id,
      $currentModule.id,
      $currentModule?.moduleName,
      $threatsStore.selectedForDetails.resourceId,
      language.language_id
    );
    $threatsStore.selectedForDetails.language = language.language;
    $threatsStore.selectedForDetails.languageId = language.language_id;
    $threatsStore.resources = $threatsStore.resources.map((resource) => {
      return {
        ...resource,
        ...(resource.resourceId === $threatsStore.selectedForDetails.resourceId
          ? { language: language.language, languageId: language.language_id }
          : {})
      };
    });
    sendDataLanguage = false;
  }
</script>

<ViewDetailsItem title="language" icon={Flag} action {tooltipText}>
  <svelte:fragment slot="action">
    {#if sendDataLanguage}
      <InlineLoading />
    {:else}
      <SelectLanguage
        title={$threatsStore.selectedForDetails.language}
        selectedValue={$threatsStore.selectedForDetails.languageId}
        align="left"
        on:changeLanguage={onChangeLanguage}
      />
    {/if}
  </svelte:fragment>
</ViewDetailsItem>
