<script lang="ts">
  import { FormGroup, Select, SelectItem, TextInput } from 'carbon-components-svelte';
  import Client from '$lib/client';
  import CommonModal from '$lib/components/CommonModal/CommonModal.svelte';
  import { regexUrl } from '$lib/utils/regexPatterns';
  import { currentModule } from '$stores/module';
  import { currentOrganization } from '$stores/organization';
  import notifications from '$stores/notification';
  import { createEventDispatcher, onMount } from 'svelte';

  const dispatch = createEventDispatcher();
  const client = new Client();

  export let openAddResource = false;

  const newResource = {
    url: '',
    status: undefined
  };
  let isValidUrl = true;

  $: if (newResource.url) {
    isValidUrl = regexUrl.test(newResource.url);
  }

  onMount(() => {
    return () => {
      client.abort();
    };
  });

  async function onSubmit() {
    const { url, status } = newResource;
    const item = { url, result: status };
    try {
      await client.threats.addResourceManually($currentOrganization.id, $currentModule.id, item);
      onCancel();
      notifications.notify({
        kind: 'success',
        title: 'Resource was succesfully added'
      });
    } catch (error) {
      notifications.notify({
        title: 'Error adding new resource'
      });
    }
  }

  function onCancel() {
    dispatch('addedResource', { openAddResource: false });
  }
</script>

<CommonModal
  open={openAddResource}
  modalHeading="Add New URL to Monitor"
  primaryButtonText="Add"
  secondaryButtonText="Cancel"
  on:submit={onSubmit}
  on:closeModal={onCancel}
  primaryButtonDisabled={!newResource.url || !newResource.status}
>
  <FormGroup class="mb-3">
    <TextInput
      id="url"
      labelText="Url"
      placeholder="Type a valid URL: https://www.domain.com"
      bind:value={newResource.url}
      invalid={!isValidUrl}
      invalidText={!isValidUrl ? 'The URL is invalid' : ''}
    />
  </FormGroup>
  <Select
    labelText="Classification Value"
    bind:selected={newResource.status}
    on:change={(e) => (newResource.status = e.detail)}
  >
    <SelectItem value="NOT_IMPORTANT" text="Not important" />
    <SelectItem value="POSITIVE" text="Positive" />
    <SelectItem value="NEGATIVE" text="Negative" />
    <SelectItem value="INFORMATIVE" text="Informative" />
    <SelectItem value="IMPORTANT" text="Important" />
  </Select>
</CommonModal>
