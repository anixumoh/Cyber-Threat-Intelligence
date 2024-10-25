<script lang="ts">
  import Client from '$lib/client';
  import CustomerSearch from '$lib/components/CustomerSearch.svelte';
  import roleStore from '$stores/role';
  import { validator } from '@felte/validator-yup';
  import { FileUploaderButton, InlineLoading, Modal, TextInput } from 'carbon-components-svelte';
  import { createForm } from 'felte';
  import { createEventDispatcher } from 'svelte';
  import * as yup from 'yup';

  export let open = false;

  const client = new Client();
  const dispatch = createEventDispatcher<{ save: void }>();

  const schema = yup.object({
    name: yup
      .string()
      .max(40, 'Name must be 40 characters or less')
      .test('alphanumeric', 'Name must only be alphanumerical', (text) => {
        const re = new RegExp('^[a-zA-Z0-9]+$');
        return re.test(text);
      })
      .required('Name is required'),
    customerId: yup.number().required('Customer is required'),
    files: yup.number().test('hasFiles', 'File is required', (numFiles) => numFiles > 0)
  });

  let showError = false;
  let files: File[];
  let customerId = $roleStore.customerId;

  $: $data.customerId = customerId;
  $: $data.files = files?.length ?? 0;

  const { isValid, data, errors, handleSubmit, setTouched, isSubmitting, setIsDirty } = createForm<
    yup.InferType<typeof schema>
  >({
    extend: validator({ schema }),
    async onSubmit(values) {
      showError = false;
      try {
        await client.admin.uploadCatalog(values.name, values.customerId, files[0]);
        open = false;
        dispatch('save');
        $data.name = '';
        files = [];
        setIsDirty(false);
        setTouched('name', false);
      } catch (error) {
        showError = true;
      }
    }
  });
</script>

<Modal
  bind:open
  modalHeading="Upload Catalog"
  on:click:button--primary={handleSubmit}
  on:click:button--secondary={() => (open = false)}
  primaryButtonDisabled={!$isValid || $isSubmitting}
  primaryButtonIcon={$isSubmitting ? InlineLoading : undefined}
  secondaryButtonText="Cancel"
  primaryButtonText="Save"
>
  <form class="p-4 overflow-hidden">
    <div class="flex gap-4">
      <TextInput
        name="name"
        labelText="Catalog name"
        bind:value={$data.name}
        invalid={!!$errors?.name?.[0]}
        invalidText={$errors?.name?.[0]}
        on:blur={() => setTouched('name', true)}
      />
      {#if $roleStore.superadmin || $roleStore.master}
        <CustomerSearch
          bind:customerId
          initialCustomerId={customerId}
          on:blur={() => setTouched('customerId', true)}
          invalid={!!$errors?.customerId?.[0]}
          invalidText={$errors?.customerId?.[0]}
        />
      {/if}
    </div>

    <div class="mt-5 flex justify-center items-center">
      <FileUploaderButton name="files" bind:files size="lg" class="w-full" labelText="Upload a file" />
    </div>

    {#if showError}
      <div class="mt-3 flex justify-center items-center text-center text-ctip-danger">
        There was a problem uploading the catalog. Please make sure there is not another catalog with the same name.
      </div>
    {/if}
  </form>
</Modal>
