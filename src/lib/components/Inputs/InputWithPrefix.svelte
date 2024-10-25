<script lang="ts">
  import { FormGroup, TextInput } from 'carbon-components-svelte';

  export let placeholder = '';
  export let labelText = '';
  export let name = '';
  export let prefix = '';
  export let value = '';
  // export let key = '';
  // export let shortName = '';
  export let disabled = false;
  export let errors;
</script>

<FormGroup class="relative w-full input-with-prefix">
  <span
    class="absolute top-6 border-solid border-b border-ctip-hover-ui bg-ctip-ui rounded-l-md h-10 flex items-center w-56 pl-2 pr-3"
  >
    {prefix}
  </span>
  <TextInput
    {labelText}
    {placeholder}
    {name}
    {disabled}
    bind:value
    class="absolute left-16 rounded-l-none w-10/12"
    invalid={errors}
    invalidText={errors}
  />
</FormGroup>

<style>
  :global(.input-with-prefix .bx--form-requirement) {
    position: absolute;
    top: 61px;
  }

  :global(.input-with-prefix svg) {
    top: 20px;
    z-index: 1;
    right: 16px;
  }
</style>
