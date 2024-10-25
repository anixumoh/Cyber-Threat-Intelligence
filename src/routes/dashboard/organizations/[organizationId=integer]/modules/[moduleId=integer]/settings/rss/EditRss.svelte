<script lang="ts">
  import type { RssType } from '$lib/types/settings';
  import { createForm } from 'felte';
  import { validator } from '@felte/validator-yup';
  import * as yup from 'yup';
  import { FormGroup, Select, SelectItem, TextInput, TextInputSkeleton } from 'carbon-components-svelte';
  import Client from '$lib/client';
  import type Module from '$lib/types/module';
  import { currentModule } from '$stores/module';
  import { currentOrganizationId } from '$stores/organization';
  import GenericButton from '$lib/components/Buttons/GenericButton.svelte';
  import { ChevronLeft } from 'carbon-icons-svelte';
  import InfoCardForm from '$lib/components/Card/InfoCardForm.svelte';
  import { regexDomain, regexPrefix } from '$lib/utils/regexPatterns';
  import { goto } from '$app/navigation';

  const client = new Client();
  const requiredMessage = 'This field is required';

  export let id: number = undefined;

  let rssTypes: RssType[] = [];
  let loading = false;

  $: getRssTypes($currentOrganizationId, $currentModule);
  $: id && getRssId($currentOrganizationId, $currentModule, id);

  const schema = yup.object({
    name: yup.string().required(requiredMessage),
    url: yup
      .string()
      .required(requiredMessage)
      .test('valid-url', 'This url is invalid', (val) => !!val.match(regexDomain))
      .test('valid-path', 'Url must start with http://, https:// or ftp://', (val) => !!val.match(regexPrefix)),
    rssFeedTypeId: yup.string().required(requiredMessage)
  });

  const { form, isValid, errors, isSubmitting, setData, data } = createForm<yup.InferType<typeof schema>>({
    extend: validator({ schema }),
    onSubmit: async (values) => {
      const payload = {
        name: values.name,
        url: values.url,
        rssFeedTypeId: +values.rssFeedTypeId
      };
      if (id) {
        await client.settings.editRss($currentOrganizationId, $currentModule, payload, id);
      } else {
        await client.settings.createRss($currentOrganizationId, $currentModule, payload);
      }
      await goto(`/dashboard/organizations/${$currentOrganizationId}/modules/${$currentModule.id}/settings/rss`);
    }
  });

  async function getRssTypes(orgId: number, module: Module) {
    rssTypes = await client.settings.getRssTypes(orgId, module);
  }

  async function getRssId(orgId: number, module: Module, id: number) {
    loading = true;
    const response = await client.settings.getRssId(orgId, module, id);
    setData({
      name: response.name,
      rssFeedTypeId: String(response.rssFeedTypeId),
      url: response.url
    });
    loading = false;
  }
</script>

<form use:form>
  <InfoCardForm title={id ? 'Edit RSS' : 'Add RSS'}>
    <svelte:fragment slot="action">
      <GenericButton href="/dashboard/organizations/{$currentOrganizationId}/modules/{$currentModule.id}/settings/rss">
        <ChevronLeft /><span class="ml-1">Back to list</span>
      </GenericButton>
    </svelte:fragment>

    <div class="grid grid-cols-3 w-full gap-8 justify-between p-4">
      <FormGroup>
        {#if loading}
          <TextInputSkeleton />
        {:else}
          <TextInput
            size="sm"
            data-test="name"
            labelText="Name"
            placeholder="Write here the name"
            name="name"
            bind:value={$data.name}
            invalidText={$errors.name?.[0]}
            invalid={!!$errors.name}
          />
        {/if}
      </FormGroup>
      <FormGroup>
        {#if loading}
          <TextInputSkeleton />
        {:else}
          <TextInput
            size="sm"
            data-test="url"
            labelText="Url"
            placeholder="Write here the url"
            name="url"
            bind:value={$data.url}
            invalidText={$errors.url?.[0]}
            invalid={!!$errors.url}
          />
        {/if}
      </FormGroup>
      <FormGroup>
        {#if loading}
          <TextInputSkeleton />
        {:else}
          <Select
            id="rss-type"
            size="sm"
            labelText="RSS Type"
            name="rssFeedTypeId"
            selected={$data.rssFeedTypeId}
            invalidText={$errors.rssFeedTypeId?.[0]}
            invalid={!!$errors.rssFeedTypeId}
          >
            <SelectItem disabled hidden />
            {#each rssTypes as rssType}
              <SelectItem value={String(rssType.id)} text={rssType.name} />
            {/each}
          </Select>
        {/if}
      </FormGroup>
    </div>

    <svelte:fragment slot="actions-form">
      <GenericButton type="submit" disabled={!$isValid || $isSubmitting} kind="primary">
        {#if id}
          Update
        {:else}
          Create
        {/if}
      </GenericButton>
    </svelte:fragment>
  </InfoCardForm>
</form>
