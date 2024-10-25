<script lang="ts">
  import WarningModal from '$lib/components/CommonModal/WarningModal/WarningModal.svelte';
  import type { Band } from '$lib/types/admin';
  import { Button, Modal, RadioButton, RadioButtonGroup, TextInput } from 'carbon-components-svelte';
  import { createEventDispatcher } from 'svelte';

  export let open = false;
  export let readonly = false;
  export let band: Band;
  export let customBand: Band;
  export let creditCardModuleSelected = false;
  export let isBincodes: boolean;

  const dispatch = createEventDispatcher<{ save: { isCustom: boolean; band?: Band } }>();

  let wasCustom = false;
  let isCustom = false;
  let confirmationModalOpen = false;
  let localBand: Band;
  $: open && copyBand(band);

  function copyBand(band: Band) {
    wasCustom = !!customBand;
    isCustom = !!customBand;
    localBand = structuredClone(customBand || band);
  }

  function reset() {
    isCustom = false;
    localBand = structuredClone(band);
  }

  function save() {
    if (isCustom || wasCustom) {
      confirmationModalOpen = true;
    } else {
      submit();
    }
  }

  function submit() {
    if (isCustom) {
      dispatch('save', { isCustom, band: localBand });
    } else {
      dispatch('save', { isCustom: false });
    }
    confirmationModalOpen = false;
    open = false;
  }

  function setIsCustom() {
    isCustom = true;
  }
</script>

<Modal
  size="sm"
  bind:open
  modalHeading="Current Limits"
  primaryButtonText="Save"
  secondaryButtonText="Close"
  on:click:button--primary={save}
  on:click:button--secondary={() => (open = false)}
>
  <div class="px-4 grid gap-4">
    {#if localBand}
      {#if isCustom}
        <Button disabled={readonly} kind="ghost" size="small" on:click={reset}>Reset default values</Button>
      {/if}
      <div class="flex items-center gap-2">
        <label class="whitespace-nowrap m-0" for="band-name">DEFAULT BAND</label>
        <TextInput id="band-name" readonly value={localBand.name} />
      </div>

      {#if creditCardModuleSelected}
        <div class="flex items-center justify-center w-fit gap-4 mx-auto">
          <RadioButtonGroup disabled class="mt-2" bind:selected={isBincodes}>
            <RadioButton labelText="Credit Cards" value={false} />
            <RadioButton labelText="Bincodes" value={true} />
          </RadioButtonGroup>
        </div>
      {/if}

      <table class="table">
        <thead>
          <tr>
            <th>DESCRIPTION</th>
            <th class="text-center">HIGH LIMIT</th>
          </tr>
        </thead>
        <tbody>
          {#if creditCardModuleSelected}
            <tr>
              <td>BINCODES</td>
              <td class="text-center">
                <input {readonly} disabled={!isBincodes} type="number" bind:value={localBand.bandValues.binCodes} />
              </td>
            </tr>
            <tr>
              <td>CREDIT CARDS</td>
              <td class="text-center">
                <input
                  {readonly}
                  disabled={isBincodes}
                  type="number"
                  bind:value={localBand.bandValues.creditCardsPerYear}
                  on:change={setIsCustom}
                />
              </td>
            </tr>
          {/if}
          <tr>
            <td>EMPLOYEES</td>
            <td class="text-center">
              <input {readonly} type="number" bind:value={localBand.bandValues.employees} on:change={setIsCustom} />
            </td>
          </tr>
          <tr>
            <td>IPs</td>
            <td class="text-center">
              <input {readonly} type="number" bind:value={localBand.bandValues.ips} on:change={setIsCustom} />
            </td>
          </tr>
          <tr>
            <td>KEYWORDS</td>
            <td class="text-center">
              <input {readonly} type="number" bind:value={localBand.bandValues.keywords} on:change={setIsCustom} />
            </td>
          </tr>
          <tr>
            <td>DOMAINS</td>
            <td class="text-center">
              <input {readonly} type="number" bind:value={localBand.bandValues.rootDomains} on:change={setIsCustom} />
            </td>
          </tr>
          <tr>
            <td>E-MAILS</td>
            <td class="text-center">
              <input {readonly} type="number" bind:value={localBand.bandValues.emails} on:change={setIsCustom} />
            </td>
          </tr>
          <tr>
            <td>CPES</td>
            <td class="text-center">
              <input {readonly} type="number" bind:value={localBand.bandValues.cpes} on:change={setIsCustom} />
            </td>
          </tr>
          <tr>
            <td>STORAGE</td>
            <td class="text-center">
              <input {readonly} type="text" bind:value={localBand.bandValues.storage} on:change={setIsCustom} />
            </td>
          </tr>
        </tbody>
      </table>
    {/if}
  </div>
</Modal>

<WarningModal
  bind:open={confirmationModalOpen}
  modalHeading="Confirmation"
  question="Changing the band to a lower limit would have serious impact on the customer."
  secondMessage="Would you like to proceed?"
  on:submit={submit}
  on:closeModal={() => (confirmationModalOpen = false)}
/>
