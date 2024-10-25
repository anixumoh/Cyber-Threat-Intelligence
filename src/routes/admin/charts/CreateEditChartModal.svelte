<script lang="ts">
  import Client from '$lib/client';
  import type { ModuleTypeSimple } from '$lib/client/services/modules';
  import type { ChartDataGen, ChartDataGenParamResponse, ChartListItem, StyleCompatibility } from '$lib/types/admin';
  import { moduleCacheStore } from '$stores/module';
  import notifications from '$stores/notification';
  import { organizationsStore } from '$stores/organization';
  import { validator } from '@felte/validator-yup';
  import {
    FormGroup,
    InlineLoading,
    Modal,
    MultiSelect,
    Select,
    SelectItem,
    SkeletonPlaceholder,
    TextInput,
    Toggle,
    TooltipDefinition
  } from 'carbon-components-svelte';
  import { InformationFilled } from 'carbon-icons-svelte';
  import { createForm } from 'felte';
  import { createEventDispatcher } from 'svelte';
  import { chartForm, type ChartFormType } from './constants';

  const dispatch = createEventDispatcher<{ save: void }>();
  const client = new Client();

  export let open = false;
  export let selectedChart: ChartListItem = null;
  export let datagen: ChartDataGen[];

  const paramTypes = {
    'java.lang.String': 'String',
    '[Ljava.lang.String;': 'String Array',
    'java.lang.Integer': 'Integer',
    '[Ljava.lang.Integer;': 'Integer Array',
    'java.lang.Long': 'Long',
    '[Ljava.lang.Long;': 'Long Array',
    'java.lang.Boolean': 'Boolean',
    '[Ljava.lang.Boolean;': 'Boolean Array',
    'java.lang.Object': 'Object',
    '[Ljava.lang.Object;': 'Object Array'
  } as const;

  const { form, errors, isSubmitting, reset, handleSubmit, data, setInitialValues } = createForm<ChartFormType>({
    extend: validator({ schema: chartForm }),
    onSubmit: async (values) => {
      try {
        await client.admin.saveChart(values);
        open = false;
        dispatch('save');
      } catch (error) {
        notifications.notify({ kind: 'error', title: 'Error', subtitle: 'Some error has ocurred' });
      }
    }
  });

  let loading = false;
  let paramsLoading = false;
  let paramsCache: Record<number, ChartDataGenParamResponse[]> = {};
  let moduleTypes: ModuleTypeSimple[] = [];

  $: open && init(selectedChart);
  $: open && getModuleTypes();
  $: fetchModules($data.organizationId);
  $: selectedDataGen = datagen?.find((gen) => gen.id === $data.graphicDataGenId);
  $: getChartDatagenParams(selectedDataGen);
  $: selectedStyle = selectedDataGen?.styleCompatibilities?.find((sty) => sty.id === $data.graphicStyleId);
  $: currentParams = processParams(paramsCache, selectedDataGen, selectedStyle);

  async function init(chartItem: ChartListItem) {
    if (chartItem) {
      loading = true;
      const chartInfo = await client.admin.getChart(chartItem.id);
      loading = false;
      setInitialValues({
        id: chartItem.id,
        title: chartItem.title,
        isPrivate: chartItem.isPrivate,
        organizationId: chartItem.organizationId ?? -1,
        moduleId: chartItem.moduleId ?? -1,
        type: chartItem.organizationId ? -1 : chartItem.type ?? -1,
        graphicDataGenId: chartItem.graphicDataGenId,
        graphicStyleId: chartItem.graphicStyleId,
        values: chartInfo.values
      });
    } else {
      setInitialValues({
        id: null,
        title: '',
        isPrivate: false,
        organizationId: -1,
        moduleId: -1,
        type: -1
      });
    }
    reset();
  }

  async function getModuleTypes() {
    if (moduleTypes.length) return;
    moduleTypes = await client.modules.getModuleTypes();
  }

  function fetchModules(organizationId: number) {
    if (!organizationId || organizationId === -1) return;
    if ($moduleCacheStore[organizationId]) return;
    moduleCacheStore.fetchModules(organizationId);
  }

  async function getChartDatagenParams(selectedDataGen: ChartDataGen) {
    if (!selectedDataGen) return;
    if (paramsCache[selectedDataGen.id]) return;
    paramsLoading = true;
    paramsCache[selectedDataGen.id] = [];
    paramsCache[selectedDataGen.id] = await client.admin.getChartDatagenParams(selectedDataGen.id);
    paramsLoading = false;
  }

  function getName(name: string) {
    return name.replace(/([_])/g, ' ').replace(/^./, (str) => str.toUpperCase());
  }

  function processParams(
    paramsCache: Record<number, ChartDataGenParamResponse[]>,
    selectedDataGen: ChartDataGen,
    selectedStyle: StyleCompatibility
  ) {
    if (!selectedDataGen) return;
    if (!selectedStyle) return;
    const params = paramsCache[selectedDataGen.id];
    if (!params) return;
    return params.filter((param) => !param.param.optional);
  }

  function setParamValue(paramId: number, value: string) {
    const paramIndex = $data.values.findIndex((val) => val.paramId === paramId);
    if (paramIndex === -1) {
      $data.values = [...$data.values, { key: String(paramId), paramId, value }];
    } else {
      $data.values[paramIndex].value = value;
    }
  }
</script>

<Modal
  size="sm"
  class="[&>div]:max-h-screen"
  modalHeading="Graph Detail"
  bind:open
  primaryButtonText="Save"
  secondaryButtonText="Close"
  on:click:button--primary={async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    handleSubmit();
  }}
  on:click:button--secondary={() => (open = false)}
  primaryButtonIcon={$isSubmitting ? InlineLoading : undefined}
  primaryButtonDisabled={$isSubmitting}
>
  {#if loading}
    <SkeletonPlaceholder class="w-full h-96" />
  {:else}
    <form class="px-8 [&>fieldset]:mb-6" use:form>
      <FormGroup>
        <TextInput labelText="Title" name="title" invalid={!!$errors?.title} invalidText={$errors?.title?.[0]} />
      </FormGroup>

      <FormGroup>
        <Toggle labelText="Only SuperAdmin" bind:toggled={$data.isPrivate} />
      </FormGroup>

      <FormGroup>
        <Select bind:selected={$data.organizationId} on:change={() => ($data.type = -1)}>
          <div class="flex items-center gap-1" slot="labelText">
            Organizations
            <TooltipDefinition
              direction="top"
              align="start"
              tooltipText="You can only select an organization and a module OR a module type"
            >
              <InformationFilled />
            </TooltipDefinition>
          </div>
          <SelectItem disabled value={-1} text="-- Select --" />
          {#each $organizationsStore ?? [] as org}
            <SelectItem value={org.id} text={org.name} />
          {/each}
        </Select>
      </FormGroup>

      <FormGroup>
        <Select
          disabled={$data.organizationId === -1}
          bind:selected={$data.moduleId}
          labelText="Module"
          on:change={() => ($data.type = -1)}
        >
          <SelectItem disabled value={-1} text="-- Select --" />
          {#if $data.organizationId}
            {#each $moduleCacheStore[$data.organizationId] ?? [] as module}
              <SelectItem value={module.id} text={module.name} />
            {/each}
          {/if}
        </Select>
      </FormGroup>

      <FormGroup>
        <Select
          bind:selected={$data.type}
          labelText="Module Type"
          on:change={() => {
            $data.organizationId = -1;
            $data.moduleId = -1;
          }}
        >
          <SelectItem disabled value={-1} text="-- Select --" />

          {#each moduleTypes as moduleType}
            <SelectItem value={moduleType.value} text={moduleType.name} />
          {/each}
        </Select>
      </FormGroup>

      <FormGroup>
        <Select
          bind:selected={$data.graphicDataGenId}
          labelText="Graph Generator"
          on:change={() => ($data.values = [])}
        >
          <SelectItem disabled value={-1} text="-- Select --" />
          {#each datagen as gen}
            <SelectItem value={gen.id} text={gen.name} />
          {/each}
        </Select>
      </FormGroup>

      <FormGroup>
        <Select disabled={$data.graphicDataGenId === -1} bind:selected={$data.graphicStyleId} labelText="Style Graph">
          <SelectItem disabled value={-1} text="-- Select --" />
          {#each selectedDataGen?.styleCompatibilities ?? [] as style}
            <SelectItem value={style.id} text={style.name} />
          {/each}
        </Select>
      </FormGroup>

      {#if paramsLoading}
        <SkeletonPlaceholder class="w-full h-48" />
      {:else if currentParams}
        <div class="text-base">Graph Values</div>
        <table class="table">
          <thead>
            <tr>
              <th>DESCRIPTION</th>
              <th>TYPE</th>
              <th>VALUE</th>
            </tr>
          </thead>

          <tbody>
            {#each currentParams as param}
              {@const type = paramTypes[param.param.type]}
              <tr>
                <td class="text-ctip-text align-middle">{getName(param.param.name)}</td>
                <td class="text-ctip-text align-middle">{type}</td>
                <td>
                  {#if type === 'Boolean'}
                    <Toggle
                      class="flex justify-center [&>label>span]:mt-0.5 [&>label]:mb-0.5"
                      size="sm"
                      toggled={$data?.values?.find((val) => val.paramId === param.param.id)?.value === 'true'}
                      on:toggle={(e) => setParamValue(param.param.id, e.detail.toggled ? 'true' : 'false')}
                    />
                  {:else if type === 'Long'}
                    <Select
                      size="sm"
                      selected={$data?.values?.find((val) => val.paramId === param.param.id)?.value}
                      on:change={(e) => setParamValue(param.param.id, e.target.value)}
                    >
                      {#each param.paramOptions as option}
                        <SelectItem text={option.key} value={option.value} />
                      {/each}
                    </Select>
                  {:else if type === 'Integer Array'}
                    <MultiSelect
                      direction="top"
                      size="sm"
                      items={param.paramOptions.map((option) => ({
                        id: option.value,
                        text: option.key.split('.').at(-1)
                      }))}
                      selectedIds={JSON.parse(
                        $data?.values?.find((val) => val.paramId === param.param.id)?.value ?? '[]'
                      )}
                      on:select={(e) => setParamValue(param.param.id, JSON.stringify(e.detail.selectedIds))}
                    />
                  {:else if type === 'String'}
                    <input
                      class="w-full"
                      type="text"
                      value={$data?.values?.find((val) => val.paramId === param.param.id)?.value ?? ''}
                      on:change={(e) => setParamValue(param.param.id, e.target.value)}
                    />
                  {:else if type === 'Integer'}
                    <input
                      class="w-full"
                      type="number"
                      value={$data?.values?.find((val) => val.paramId === param.param.id)?.value}
                      on:change={(e) => setParamValue(param.param.id, e.target.value)}
                    />
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </form>
  {/if}
</Modal>
