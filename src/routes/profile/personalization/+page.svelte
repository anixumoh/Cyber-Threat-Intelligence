<script lang="ts">
  import {
    Accordion,
    AccordionItem,
    Button,
    Dropdown,
    FormGroup,
    InlineLoading,
    Toggle
  } from 'carbon-components-svelte';
  import { BrightnessContrast, Folder, Home, List, Time } from 'carbon-icons-svelte';
  import ChangeTimezone from './ChangeTimezone.svelte';
  import ChangeLandingPage from './ChangeLandingPage.svelte';
  import { pageSizes } from '$lib/constants/pagination';
  import { onMount } from 'svelte';
  import preferencesStore from '$stores/preferences';
  import darkMode from '$stores/darkMode';

  onMount(() => {
    pageSize = $preferencesStore.defaultRows || 10;
  });

  let pageSize = 10;
  let isSavingPageSize = false;
  let isSavingModuleDisplay = false;

  async function savePageSize() {
    isSavingPageSize = true;
    $preferencesStore.defaultRows = pageSize;
    await preferencesStore.setAndSave($preferencesStore);
    isSavingPageSize = false;
  }

  async function toggleModuleDisplay() {
    isSavingModuleDisplay = true;
    await preferencesStore.setAndSave($preferencesStore);
    isSavingModuleDisplay = false;
  }
</script>

<Accordion class="max-w-3xl mx-auto mt-4">
  <AccordionItem class="[&>button]:items-center">
    <div class="flex items-center text-xl" slot="title">
      <Time size={20} />
      <span class="pl-3">Timeset</span>
    </div>

    <div class="flex flex-col items-center justify-center max-w-lg mx-auto mt-4">
      <ChangeTimezone />
    </div>
  </AccordionItem>

  <AccordionItem class="[&>button]:items-center">
    <div class="flex items-center text-xl" slot="title">
      <Home size={20} />
      <span class="pl-3">Default landing page</span>
    </div>

    <div class="flex flex-col items-center justify-center max-w-lg mx-auto mt-4">
      <ChangeLandingPage />
    </div>
  </AccordionItem>

  <AccordionItem class="[&>button]:items-center">
    <div class="flex items-center text-xl" slot="title">
      <List size={20} />
      <span class="pl-3">Default results amount</span>
    </div>

    <div class="flex flex-col items-center justify-center max-w-lg mx-auto mt-4">
      <FormGroup class="w-full">
        <div class="w-full">
          <Dropdown
            name="results-per-page"
            items={pageSizes.map((ps) => ({ id: ps, text: `${ps}` }))}
            bind:selectedId={pageSize}
            titleText="Amount of results per page"
            disabled={isSavingPageSize}
          />
        </div>
      </FormGroup>
      <FormGroup class="w-full">
        <Button
          id="save-results-per-page"
          on:click={savePageSize}
          type="button"
          icon={isSavingPageSize ? InlineLoading : undefined}
          disabled={isSavingPageSize}
        >
          Submit
        </Button>
      </FormGroup>
    </div>
  </AccordionItem>

  <AccordionItem class="[&>button]:items-center">
    <div class="flex items-center text-xl" slot="title">
      <Folder size={20} />
      <span class="pl-3">Module display</span>
    </div>

    <div class="relative">
      {#if isSavingModuleDisplay}
        <InlineLoading class="absolute top-0 left-0 flex items-center justify-center w-full h-full" />
      {/if}
      <Toggle
        id="toggle-module-display"
        disabled={isSavingModuleDisplay}
        class="whitespace-nowrap"
        bind:toggled={$preferencesStore.openModules}
        on:toggle={toggleModuleDisplay}
        labelText="Display module list open the dashboard by default"
      />
    </div>
  </AccordionItem>

  <AccordionItem class="[&>button]:items-center">
    <div class="flex items-center text-xl" slot="title">
      <BrightnessContrast size={20} />
      <span class="pl-3">Dark mode (beta)</span>
    </div>

    <div class="relative">
      <Toggle class="whitespace-nowrap" bind:toggled={$darkMode} labelA="Enable dark mode" labelB="Disable dark mode" />
    </div>
  </AccordionItem>
</Accordion>
