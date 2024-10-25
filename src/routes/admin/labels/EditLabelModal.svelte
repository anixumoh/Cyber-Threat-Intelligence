<script lang="ts">
  import Client from '$lib/client';
  import { labelColors } from '$lib/constants/colors';
  import type { Label } from '$lib/types/admin';
  import { moduleCacheStore } from '$stores/module';
  import notifications from '$stores/notification';
  import { organizationsStore } from '$stores/organization';
  import roleStore from '$stores/role';
  import { validator } from '@felte/validator-yup';
  import {
    Checkbox,
    FormGroup,
    InlineLoading,
    Modal,
    Select,
    SelectItem,
    TextInput,
    TextInputSkeleton
  } from 'carbon-components-svelte';
  import { Checkmark } from 'carbon-icons-svelte';
  import { createForm } from 'felte';
  import { createEventDispatcher } from 'svelte';
  import * as yup from 'yup';

  export let open = false;
  export let label: Label;
  export let predefinedOrganizationId: number = undefined;
  const client = new Client();
  const dispatch = createEventDispatcher<{ save: void }>();
  let colors = labelColors;

  $: open && initForm(label);
  $: canEditProtected = $roleStore.master || $roleStore.superadmin;

  const schema = yup.object({
    id: yup.number(),
    label: yup.string().required(),
    organizationId: yup.number(),
    moduleId: yup.number(),
    labelTypeId: yup.number().nullable(),
    bgColorHex: yup.string(),
    textColorHex: yup.string(),
    labelProtected: yup.boolean(),
    prioritized: yup.boolean()
  });

  $: if ($data.organizationId && !$moduleCacheStore[$data.organizationId]) {
    moduleCacheStore.fetchModules($data.organizationId);
  }

  const { form, errors, isSubmitting, isValid, reset, handleSubmit, data, setInitialValues } = createForm<
    yup.InferType<typeof schema>
  >({
    extend: validator({ schema }),
    onSubmit: async (values) => {
      try {
        const payload = Object.fromEntries(Object.entries(values).filter(([_, val]) => val !== 0));

        if (label?.id) {
          await client.admin.editLabel(payload);
        } else {
          await client.admin.createLabel(payload);
        }
        open = false;
        dispatch('save');
      } catch (error) {
        notifications.notify({
          kind: 'error',
          title: 'Error',
          subtitle: `There was an error while ${label?.id ? 'editing' : 'creating'} the label.`
        });
      }
    }
  });

  function initForm(label: Label) {
    if (label) {
      setInitialValues({
        id: label.id,
        bgColorHex: label.bgColorHex,
        moduleId: label.moduleId,
        label: label.label,
        organizationId: predefinedOrganizationId ? predefinedOrganizationId : label.organizationId,
        prioritized: label.prioritized,
        labelProtected: label.labelProtected,
        labelTypeId: label.labelTypeId,
        textColorHex: label.textColorHex
      });
    } else {
      setInitialValues({
        id: undefined,
        bgColorHex: '#ffffff',
        moduleId: undefined,
        label: '',
        organizationId: predefinedOrganizationId ? predefinedOrganizationId : undefined,
        prioritized: false,
        labelProtected: false,
        labelTypeId: undefined,
        textColorHex: '#000000'
      });
    }
    colors = getLabelColors(label?.bgColorHex);
    reset();
  }

  function getLabelColors(currentColor?: string) {
    //
    let colors = [...labelColors];
    if (currentColor) {
      colors = colors.filter((c) => c !== currentColor);
      colors = [currentColor, ...colors];
    }
    return colors;
  }
</script>

<Modal
  class="h-full w-full"
  bind:open
  modalHeading={label ? 'Edit Label' : 'Create Label'}
  on:click:button--primary={handleSubmit}
  on:click:button--secondary={() => (open = false)}
  secondaryButtonText="Close"
  primaryButtonText="Save"
  primaryButtonDisabled={$isSubmitting || !$isValid}
  primaryButtonIcon={$isSubmitting ? InlineLoading : undefined}
>
  <form use:form>
    <div class="grid md:grid-cols-2 gap-x-8 px-4">
      <div>
        <FormGroup>
          <TextInput
            bind:value={$data.label}
            name="label"
            labelText="Name"
            invalidText={$errors?.label?.join(', ')}
            invalid={!!$errors.label}
          />
        </FormGroup>

        <FormGroup>
          <Select
            id="label-organization-id"
            labelText="Organization"
            bind:selected={$data.organizationId}
            disabled={!!label || !isNaN(predefinedOrganizationId)}
          >
            <SelectItem value={0} text="Global" />
            {#each $organizationsStore as org}
              <SelectItem value={org.id} text={org.name} />
            {/each}
          </Select>
        </FormGroup>

        <FormGroup>
          <Select
            id="label-module-id"
            labelText="Module"
            bind:selected={$data.moduleId}
            disabled={!$data.organizationId || !!label}
          >
            <SelectItem text="NONE" value={0} />
            {#if $data.organizationId}
              {#each $moduleCacheStore[$data.organizationId] ?? [] as org}
                <SelectItem value={org.id} text={org.name} />
              {/each}
            {/if}
          </Select>
        </FormGroup>

        <FormGroup>
          {#await client.admin.getLabelTypes()}
            <TextInputSkeleton />
          {:then types}
            <Select id="label-type-id" labelText="Type" bind:selected={$data.labelTypeId}>
              <SelectItem hidden disabled text="-" value={0} />
              {#each types as type}
                <SelectItem value={type.id} text={type.name} />
              {/each}
            </Select>
          {/await}
        </FormGroup>
      </div>

      <div class="grid grid-rows-[1fr_auto]">
        <div class="-mt-2.5 w-full h-full">
          <span class="bx--label text-base">Border Color</span>
          <ul class="bg-ctip-background overflow-y-auto h-[320px]">
            {#each colors as color}
              <li
                style:--label-color={color}
                style:--label-color-transparent="{color}55"
                class="border-solid border-2 border-[var(--label-color)]
                  {$data.bgColorHex === color
                  ? `hover:bg-[var(--label-color)] bg-[var(--label-color-transparent)]`
                  : 'hover:bg-ctip-ui'}"
              >
                <label class="flex justify-between items-center m-0 p-2 cursor-pointer">
                  <input
                    class="peer hidden"
                    type="radio"
                    value={color}
                    name="bgColorHex"
                    bind:group={$data.bgColorHex}
                  />
                  <div class="peer-checked:text-ctip-interactive">{color}</div>
                  <div class="hidden peer-checked:block">
                    <Checkmark class="text-ctip-interactive" />
                  </div>
                </label>
              </li>
            {/each}
          </ul>
        </div>
      </div>

      {#if canEditProtected}
        <FormGroup>
          <Checkbox name="labelProtected" bind:checked={$data.labelProtected} labelText="Protected Label" />
        </FormGroup>
      {/if}

      <FormGroup>
        <Checkbox name="prioritized" bind:checked={$data.prioritized} labelText="Proprity Label" />
      </FormGroup>
    </div>
  </form>
</Modal>
