<script lang="ts">
  import { Checkbox, FormGroup, TextInput } from 'carbon-components-svelte';
  import InputWithPrefix from '../Inputs/InputWithPrefix.svelte';

  export let placeholder = '';
  export let name = '';
  export let prefix = '';
  export let key = '';
  export let shortName = '';
  export let disabled = false;
  export let errors;
  export let firstDataLoad = false;
  export let hidePasswordsForCredentials = false;
  export let hideCVVForCreditCards = false;
</script>

<div class="grid gap-4 lg:grid-cols-2 mt-4">
  <FormGroup>
    <TextInput
      labelText="Name"
      {placeholder}
      bind:value={name}
      name="name"
      {disabled}
      invalid={errors.name}
      invalidText={errors.name}
    />
  </FormGroup>
  <InputWithPrefix
    errors={errors.shortName}
    {prefix}
    {disabled}
    labelText="Short-name"
    placeholder="Short-name"
    bind:value={shortName}
    name="shortName"
  />
</div>
{#if key === 'credentials'}
  <Checkbox
    bind:checked={firstDataLoad}
    labelText="The first data load displays credentials with a maximum age of one year."
  />
  <Checkbox bind:checked={hidePasswordsForCredentials} labelText="Hide passwords for this module" />
{/if}
{#if key === 'credit_cards_full'}
  <Checkbox bind:checked={hideCVVForCreditCards} labelText="Hide CVV and expiration dates for this module." />
{/if}
