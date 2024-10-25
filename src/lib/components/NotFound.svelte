<script>
  import { currentOrganizationId } from '$stores/organization';
  import { Home } from 'carbon-icons-svelte';
  import GenericButton from './Buttons/GenericButton.svelte';
</script>

<div class="text-center mt-12">
  <img src="assets/default_images/page_not_found.svg" alt="page not found" class="!mb-5 max-w-[500px]" />

  <h1 class="font-bold">
    <span class="text-ctip-primary text-3xl">Oops 404!</span> That page cannot be found.
  </h1>

  <div class="text-ctip-secondary">
    <div>Sorry, but the page you are looking for was either not found or does not exist.</div>
    <div>Try refreshing the page or click the button below to go back to the Homepage.</div>
    <div class="mt-4">
      <GenericButton
        href={$currentOrganizationId ? `/dashboard/organizations/${$currentOrganizationId}/summary` : '/'}
        kind="primary"
        class="!w-full max-w-full justify-center p-2.5"
      >
        <Home />
        <span class="ml-2">Go back to Homepage</span>
      </GenericButton>
    </div>
  </div>
</div>
