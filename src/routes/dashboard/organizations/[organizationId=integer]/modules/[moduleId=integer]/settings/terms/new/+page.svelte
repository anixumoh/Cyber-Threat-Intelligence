<script lang="ts">
  import AddImage from '$lib/components/Settings/Terms/AddImage.svelte';
  import AddSearchPhrase from '$lib/components/Settings/Terms/AddSearchPhrase.svelte';
  import TermsNewEdit from '$lib/components/Settings/Terms/TermsNewEdit.svelte';

  const urlParams = new URLSearchParams(window.location.search);
  const hasType = urlParams.has('type');
  $: formType = urlParams.get('type');
</script>

{#if hasType}
  {#if formType === 'phrase'}
    <AddSearchPhrase />
  {:else}
    <AddImage />
  {/if}
{:else}
  <TermsNewEdit action="Add" />
{/if}
