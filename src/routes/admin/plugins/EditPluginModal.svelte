<script lang="ts">
  import Client from '$lib/client';
  import MonacoEditor from '$lib/components/MonacoEditor/MonacoEditor.svelte';
  import type { Plugin } from '$lib/types/admin';
  import getMultiselectLabel from '$lib/utils/getMultiselectLabel';
  import notifications from '$stores/notification';
  import { validator } from '@felte/validator-yup';
  import {
    Button,
    Checkbox,
    FormGroup,
    Modal,
    MultiSelect,
    Select,
    SelectItem,
    SkeletonPlaceholder,
    TextInput,
    TextInputSkeleton
  } from 'carbon-components-svelte';
  import { Information } from 'carbon-icons-svelte';
  import { createForm } from 'felte';
  import { createEventDispatcher } from 'svelte';
  import * as yup from 'yup';

  export let open = false;
  export let name: string = '';

  const dispatch = createEventDispatcher<{ save: void }>();

  const schema = yup.object({
    name: yup.string().required(),
    inputs: yup.array().of(yup.string()),
    type: yup.string().required(),
    outputs: yup.array().of(yup.string()),
    language: yup.string().required(),
    enabled: yup.boolean(),
    contentData: yup.string().required(),
    // Transform
    globalExecution: yup.boolean(),
    afapi: yup.boolean(),
    visionEnabled: yup.boolean(), // Enabled to analysis
    visionSchedExpression: yup.string(),
    minExecutionDelay: yup.number()
  });

  const { form, errors, isSubmitting, reset, handleSubmit, data, setInitialValues } = createForm<
    yup.InferType<typeof schema>
  >({
    extend: validator({ schema }),
    onSubmit: async (values) => {
      try {
        const payload = await schema.validate(values, { stripUnknown: true });
        if (name) {
          await client.admin.editPlugin(payload);
        } else {
          await client.admin.createPlugin(payload);
        }
        open = false;
        dispatch('save');
      } catch (error) {
        notifications.notify({
          kind: 'error',
          title: 'Error',
          subtitle: 'There was an error while editing the plugin'
        });
      }
    }
  });

  const client = new Client();

  const ENTITIES = [
    'ALL',
    'DOMAIN',
    'SUBDOMAIN',
    'URL',
    'IP',
    'NETMASK',
    'EMAIL',
    'PERSON',
    'PROFILE',
    'TEXT',
    'SUBDOMAIN_WILDCARD'
  ];

  let plugin: Plugin;
  let languages: string[] = [];
  let types: string[] = [];
  let showExpressionModal = false;
  let loading = false;

  $: getPluginLanguages();
  $: getPluginTypes();
  $: getPlugin(name);

  async function getPluginLanguages() {
    languages = await client.admin.getPluginLanguages();
  }

  async function getPluginTypes() {
    types = await client.admin.getPluginTypes();
  }

  async function getPlugin(name: string) {
    loading = true;
    if (name) {
      plugin = await client.admin.getPlugin(name);
      setInitialValues({
        enabled: plugin.enabled,
        inputs: plugin.inputs,
        language: plugin.language,
        name: plugin.name,
        outputs: plugin.outputs,
        type: plugin.type,
        contentData: plugin.contentData,
        afapi: plugin.afapi,
        globalExecution: plugin.globalExecution,
        minExecutionDelay: plugin?.minExecutionDelay || 0,
        visionEnabled: plugin.visionEnabled,
        visionSchedExpression: plugin?.visionSchedExpression || ''
      });
    } else {
      setInitialValues({
        enabled: false,
        inputs: [],
        language: '',
        name: '',
        outputs: [],
        type: '',
        contentData: '',
        afapi: false,
        globalExecution: false,
        minExecutionDelay: 0,
        visionEnabled: false,
        visionSchedExpression: ''
      });
    }
    reset();
    loading = false;
  }
</script>

<Modal
  bind:open
  size="lg"
  modalHeading={name ? 'Edit plugin' : 'Add plugin'}
  primaryButtonText="Submit"
  secondaryButtonText="Cancel"
  primaryButtonDisabled={$isSubmitting}
  on:click:button--secondary={() => (open = false)}
  on:click:button--primary={handleSubmit}
  on:transitionend={(event) => {
    if (!event.detail.open) {
      name = undefined;
    }
  }}
>
  <form use:form class="px-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-6">
      <FormGroup>
        {#if loading}
          <TextInputSkeleton />
        {:else}
          <TextInput
            name="name"
            labelText="Name"
            bind:value={$data.name}
            invalidText={$errors?.name?.join(', ')}
            invalid={!!$errors.name}
            readonly={!!name}
          />
        {/if}
      </FormGroup>

      <FormGroup>
        {#if loading}
          <TextInputSkeleton />
        {:else}
          <MultiSelect
            bind:selectedIds={$data.inputs}
            name="inputs"
            titleText="Incoming entities"
            items={ENTITIES.map((entity) => ({ id: entity, text: entity }))}
            invalidText={$errors?.inputs?.join(', ')}
            invalid={!!$errors.inputs}
            label={getMultiselectLabel(
              ENTITIES.map((entity) => ({ id: entity, text: entity })),
              $data.inputs,
              'Select entities...'
            )}
          />
        {/if}
      </FormGroup>

      <FormGroup>
        {#if loading}
          <TextInputSkeleton />
        {:else}
          <Select
            name="type"
            bind:selected={$data.type}
            labelText="Type"
            invalidText={$errors?.type?.join(', ')}
            invalid={!!$errors.type}
          >
            <SelectItem value="" hidden />
            {#each types as type}
              <SelectItem value={type} text={type} />
            {/each}
          </Select>
        {/if}
      </FormGroup>

      <FormGroup>
        {#if loading}
          <TextInputSkeleton />
        {:else}
          <MultiSelect
            bind:selectedIds={$data.outputs}
            name="outputs"
            titleText="Outgoing"
            items={ENTITIES.map((entity) => ({ id: entity, text: entity }))}
            invalidText={$errors?.outputs?.join(', ')}
            invalid={!!$errors.outputs}
            label={getMultiselectLabel(
              ENTITIES.map((entity) => ({ id: entity, text: entity })),
              $data.outputs,
              'Select entities...'
            )}
          />
        {/if}
      </FormGroup>

      <FormGroup>
        {#if loading}
          <TextInputSkeleton />
        {:else}
          <Select
            name="language"
            bind:selected={$data.language}
            labelText="Languages"
            invalidText={$errors?.language?.join(', ')}
            invalid={!!$errors.language}
          >
            <SelectItem value="" hidden />
            {#each languages as language}
              <SelectItem value={language} text={language} />
            {/each}
          </Select>
        {/if}
      </FormGroup>

      <FormGroup class="flex items-center justify-center">
        <Checkbox
          skeleton={loading}
          name="enabled"
          bind:checked={$data.enabled}
          class="lg:mt-7"
          labelText="Enabled"
          invalidText={$errors?.enabled?.join(', ')}
          invalid={!!$errors.enabled}
        />
      </FormGroup>
    </div>

    {#if !loading && $data.type === 'TRANSFORM'}
      <FormGroup>
        <Checkbox name="globalExecution" bind:checked={$data.globalExecution} labelText="Global Execution" />
        <Checkbox skeleton={loading} name="afapi" bind:checked={$data.afapi} labelText="Call to AFAPI" />
        <Checkbox name="visionEnabled" bind:checked={$data.visionEnabled} labelText="Enabled to Analysis" />
      </FormGroup>

      <FormGroup>
        <TextInput
          name="visionSchedExpression"
          bind:value={$data.visionSchedExpression}
          labelText="Expression of programming analysis"
        >
          <svelte:fragment slot="labelText">
            <div class="flex justify-between gap-5 items-center">
              <div>Expression of programming analysis</div>
              <Button
                on:click={() => (showExpressionModal = true)}
                size="small"
                kind="ghost"
                iconDescription="See information"
                icon={Information}
              />
            </div>
          </svelte:fragment>
        </TextInput>
      </FormGroup>
      <FormGroup>
        <TextInput
          type="number"
          name="minExecutionDelay"
          bind:value={$data.minExecutionDelay}
          labelText="Minium time between executions (seg)"
        />
      </FormGroup>
    {/if}

    <div class="border-2 border-solid border-transparent" class:!border-ctip-danger={!!$errors.contentData}>
      {#if loading}
        <SkeletonPlaceholder class="h-80 w-full" />
      {:else}
        <MonacoEditor language={$data?.language?.toLowerCase() || ''} bind:value={$data.contentData} />
      {/if}
    </div>
    {#if !!$errors.contentData}
      <span class="text-ctip-dangerThreat">
        {$errors?.contentData?.join(', ')}
      </span>
    {/if}
  </form>
</Modal>

<Modal
  bind:open={showExpressionModal}
  modalHeading="Info"
  primaryButtonText="Close"
  on:click:button--primary={() => (showExpressionModal = false)}
>
  <div>
    <div>
      <pre>
      Formato:
        * * * * * *
        ┬ ┬ ┬ ┬ ┬ ┬
        │ │ │ │ │ └─── día de la semana (0 - 6) (0 es Domingo)
        │ │ │ │ └────── mes (1 - 12)
        │ │ │ └───────── día del mes (1 - 31)
        │ │ └──────────── hora (0 - 23)
        │ └─────────────── minuto (0 - 59)
        └────────────────── segundo (0 - 59)
      </pre>
      <h3>Ejemplos:</h3>
      <div class="flex justify-center">
        <ul>
          <li>0 0 * * * ? : Cada hora</li>
          <li>0 0/5 * * * ? : Cada 5 minutos</li>
          <li>0 0 12 * * ? : Cada día a las 12h</li>
          <li>0 0 8 1 * ? : Cada día 1 del mes a las 8h</li>
          <li>0 0 8 * * 1-5? : De lunes a viernes a las 8h</li>
        </ul>
      </div>
    </div>
  </div>
</Modal>
