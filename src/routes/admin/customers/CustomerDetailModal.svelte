<script lang="ts">
  import Client from '$lib/client';
  import type { Band, Customer, CustomerType } from '$lib/types/admin';
  import notifications from '$stores/notification';
  import { validator } from '@felte/validator-yup';
  import {
    Button,
    DatePicker,
    DatePickerInput,
    InlineLoading,
    Modal,
    RadioButton,
    RadioButtonGroup,
    Select,
    SelectItem,
    SkeletonPlaceholder,
    TextInput,
    TextInputSkeleton,
    Toggle
  } from 'carbon-components-svelte';
  import { Checkmark, Edit } from 'carbon-icons-svelte';
  import dayjs from 'dayjs';
  import { createForm } from 'felte';
  import { createEventDispatcher, tick } from 'svelte';
  import type * as yup from 'yup';
  import BandLimitsModal from './BandLimitsModal.svelte';
  import CustomerModulesTable from './CustomerModulesTable.svelte';
  import customerSchema from './customerSchema';

  export let customerId: number = undefined;
  export let readonly = false;
  export let open = false;

  const MODULE_TYPES = [
    { type: 'CUSTOM', name: 'Custom' },
    { type: 'DOMAIN_PROTECTION', name: 'Domain Protection' },
    { type: 'CREDIT_CARDS', name: 'Credit Cards' },
    { type: 'MOBILE_APPS', name: 'Mobile Apps' },
    { type: 'CREDENTIALS', name: 'Credentials' },
    { type: 'DATA_LEAKAGE', name: 'Data Leakage' },
    { type: 'SOCIAL_MEDIA', name: 'Social Media' },
    { type: 'HACKTIVISM', name: 'Hacktivism' },
    { type: 'MEDIA_TRACKER', name: 'Media Tracker' },
    { type: 'DARK_WEB', name: 'Dark Web' },
    { type: 'EXPLORER', name: 'Explorer' },
    { type: 'THREAT_CONTEXT', name: 'Threat Context' }
  ] as const;

  const client = new Client();
  const dispatch = createEventDispatcher<{ save: void }>();

  const { data, errors, handleSubmit, setTouched, isSubmitting, reset } = createForm<
    yup.InferType<typeof customerSchema>
  >({
    extend: validator({ schema: customerSchema }),
    async onSubmit(values) {
      try {
        await client.admin.saveCustomer(customerId, values, customBand, changedInvoices);
        notifications.notify({ kind: 'success', title: 'Success', subtitle: 'Customer saved' });
      } catch (error) {
        notifications.notify({ kind: 'error', title: 'Error', subtitle: 'An error has ocurred saving customer' });
      }
      dispatch('save');
      open = false;
    }
  });

  const SERVER_DATE_FORMAT = 'YYYY-MM-DD';

  let customer: Customer;
  let loading = false;
  let bandsLoading = false;
  let typesLoading = false;
  let bands: Band[] = [];
  let types: CustomerType[] = [];
  let firstOpen = false;
  let bandDetailModalOpen = false;
  let customBand: Band;
  let changedInvoices: Record<number, boolean> = {};

  $: if (open && !firstOpen) firstOpen = true;
  $: open && getCustomer();
  $: firstOpen && getCustomerTypes();
  $: firstOpen && getCustomerBands();
  $: selectedType = types.find((type) => type.id === $data.customerTypeId);
  $: selectedBand = bands.find((band) => band.id === $data.bandId);
  $: $data.moduleTypes && onChangeModules();
  $: creditCardModuleSelected = $data.moduleTypes?.some((m) => m === 'CREDIT_CARDS');
  $: errorModuleTypes = $errors?.moduleTypes && !$data?.moduleTypes.length;

  async function getCustomer() {
    customBand = undefined;
    changedInvoices = {};

    if (customerId) {
      try {
        loading = true;
        customer = await client.admin.getCustomer(customerId);
        $data = {
          name: customer.name,
          customerTypeId: customer.customerTypeId,
          moduleTypes: customer.contract?.contractsModules.map((mod) => mod.moduleType) ?? [],
          isBincodes: customer.contract?.isBincodes,
          startAt: customer.contract?.startAt && dayjs(customer.contract.startAt, SERVER_DATE_FORMAT).toDate(),
          endAt: customer.contract?.endAt && dayjs(customer.contract.endAt, SERVER_DATE_FORMAT).toDate(),
          bandId: customer.contract?.bandId ?? -1,
          active: customer.active,
          enforcing: customer.enforcing
        };
        if (customer.contract?.bandValues) {
          customBand = {
            id: customer.contract.band.id,
            name: customer.contract.band.name,
            bandValues: customer.contract.bandValues
          };
        }
      } catch (error) {
        notifications.notify({ kind: 'error', title: 'Error', subtitle: 'Error getting customer' });
      }
    } else {
      loading = true;
      await tick();
      reset();
      $data = {
        name: '',
        customerTypeId: -1,
        moduleTypes: [],
        isBincodes: true,
        startAt: dayjs().toDate(),
        endAt: dayjs().add(1, 'year').toDate(),
        bandId: -1,
        active: true,
        enforcing: false
      };
      customBand = undefined;
    }
    loading = false;
  }

  async function getCustomerTypes() {
    typesLoading = true;
    types = await client.admin.getCustomerTypes();
    typesLoading = false;
  }

  async function getCustomerBands() {
    bandsLoading = true;
    bands = await client.admin.getCustomerBands();
    bandsLoading = false;
  }

  function selectAllModules() {
    $data.moduleTypes = MODULE_TYPES.map((m) => m.type);
  }

  function onChangeModules() {
    if ($data.moduleTypes?.includes('THREAT_CONTEXT') && !$data.moduleTypes?.includes('EXPLORER')) {
      $data.moduleTypes = [...($data.moduleTypes || []), 'EXPLORER'];
    }
  }

  function handleBandsSave(isCustom: boolean, band: Band) {
    if (isCustom) {
      customBand = band;
    } else {
      customBand = undefined;
    }
  }

  function handleChangeDate(event: CustomEvent) {
    if (event.detail.selectedDates?.length === 2) {
      $data.startAt = event.detail.selectedDates[0];
      $data.endAt = event.detail.selectedDates[1];
    } else {
      $data.startAt = undefined;
      $data.endAt = undefined;
    }
  }
</script>

<Modal
  bind:open
  size={customerId ? 'lg' : undefined}
  modalHeading={customerId ? (readonly ? 'Customer Details' : 'Edit Customer') : 'Create Customer'}
  on:click:button--primary={readonly ? () => (open = false) : handleSubmit}
  on:click:button--secondary={() => (open = false)}
  primaryButtonDisabled={$isSubmitting}
  primaryButtonIcon={$isSubmitting ? InlineLoading : undefined}
  secondaryButtonText={readonly ? undefined : 'Cancel'}
  primaryButtonText={readonly ? 'Close' : 'Save'}
>
  <form class="px-4 pt-2 grid gap-4" class:pb-40={!customerId}>
    {#if readonly}
      <div class="-mt-2">
        <Button on:click={() => (readonly = false)} kind="ghost" icon={Edit}>Edit</Button>
      </div>
    {/if}

    <div class="max-w-2xl">
      {#if loading}
        <TextInputSkeleton hideLabel />
      {:else}
        <TextInput
          inline
          {readonly}
          bind:value={$data.name}
          labelText="Customer"
          placeholder="Name"
          name="name"
          on:blur={() => setTouched('name', true)}
          invalid={!!$errors.name}
          invalidText={$errors.name?.[0]}
        />
      {/if}
    </div>

    <div class="max-w-2xl">
      {#if loading || typesLoading}
        <TextInputSkeleton hideLabel />
      {:else if readonly}
        <TextInput inline readonly labelText="Type" value={selectedType?.name || ''} />
      {:else}
        <div class="flex items-center">
          <div class="flex-[2] max-w-[8rem] mr-6 text-base">Type</div>
          <div class="flex-[8]">
            <Select
              bind:selected={$data.customerTypeId}
              invalid={!!$errors.customerTypeId}
              invalidText={$errors.customerTypeId?.[0]}
            >
              <SelectItem disabled value={-1} text="-- Select --" />
              {#each types as type}
                <SelectItem value={type.id} text={type.name} />
              {/each}
            </Select>
          </div>
        </div>
      {/if}
    </div>

    <div class="flex items-center max-w-2xl">
      <div class="flex-[2] max-w-[8rem] mr-6 text-base">Allowed Modules</div>
      <div class="flex-[8]">
        {#if loading}
          <SkeletonPlaceholder class="w-48 h-48" />
        {:else}
          <div class="bg-ctip-background overflow-y-scroll w-fit h-48">
            <ul
              class="grid m-0"
              class:border-2={errorModuleTypes}
              class:border-ctip-danger={errorModuleTypes}
              class:border-solid={errorModuleTypes}
            >
              <li class="w-full">
                <label class="cursor-pointer flex p-2 m-0 pr-5 relative">
                  <input
                    disabled={readonly}
                    class="peer hidden"
                    type="checkbox"
                    on:click={(e) => {
                      e.target.checked = false;
                      selectAllModules();
                    }}
                  />
                  <div class="peer-checked:text-ctip-interactive" class:opacity-50={readonly}>Any</div>
                  <div class="hidden peer-checked:block absolute right-5">
                    <Checkmark class="text-ctip-interactive" />
                  </div>
                </label>
              </li>

              {#each MODULE_TYPES as moduleType}
                {@const disabled =
                  moduleType.type === 'EXPLORER' && $data.moduleTypes?.some((m) => m === 'THREAT_CONTEXT')}
                <li class="w-full">
                  <label class="cursor-pointer flex p-2 m-0 pr-5 relative select-none">
                    <input
                      class="peer hidden"
                      type="checkbox"
                      value={moduleType.type}
                      disabled={readonly || disabled}
                      bind:group={$data.moduleTypes}
                    />
                    <div
                      class="peer-checked:text-ctip-interactive"
                      class:opacity-20={disabled}
                      class:opacity-50={readonly}
                    >
                      {moduleType.name}
                    </div>
                    <div class="hidden peer-checked:block absolute right-5">
                      <Checkmark class="text-ctip-interactive" />
                    </div>
                  </label>
                </li>
              {/each}
            </ul>
          </div>
          {#if errorModuleTypes}
            <small class="text-ctip-danger">You need to select at least one module</small>
          {/if}

          {#if creditCardModuleSelected}
            <RadioButtonGroup disabled={readonly} class="mt-2" bind:selected={$data.isBincodes}>
              <RadioButton labelText="Bincodes" value={true} />
              <RadioButton labelText="Credit Cards" value={false} />
            </RadioButtonGroup>
          {/if}
        {/if}
      </div>
    </div>

    <div class="max-w-2xl">
      {#if loading}
        <TextInputSkeleton hideLabel />
      {:else if readonly}
        <TextInput
          inline
          readonly
          labelText="Contract Dates"
          value="{$data.startAt ? dayjs($data.startAt).format('DD/MM/YY') : ''} -
          {$data.endAt ? dayjs($data.endAt).format('DD/MM/YY') : ''}"
        />
      {:else}
        <div class="flex items-center">
          <div class="flex-[2] max-w-[8rem] mr-6 text-base">Contract Dates</div>
          <div class="flex-[8]">
            <DatePicker
              dateFormat="d/m/y"
              datePickerType="range"
              valueFrom={$data.startAt ? dayjs($data.startAt).format('DD/MM/YY') : null}
              valueTo={$data.endAt ? dayjs($data.endAt).format('DD/MM/YY') : null}
              on:change={handleChangeDate}
            >
              <DatePickerInput invalid={!!$errors.startAt} invalidText={$errors.startAt?.[0]} placeholder="dd/mm/yy" />
              <DatePickerInput invalid={!!$errors.endAt} invalidText={$errors.endAt?.[0]} placeholder="dd/mm/yy" />
            </DatePicker>
          </div>
        </div>
      {/if}
    </div>

    <div class="max-w-2xl">
      {#if loading || bandsLoading}
        <TextInputSkeleton hideLabel />
      {:else}
        <div class="flex items-center">
          <div class="flex-[2] max-w-[8rem] mr-6 text-base">Band</div>
          <div class="flex-[8] flex gap-4 items-center">
            {#if readonly}
              <TextInput readonly value={selectedBand?.name || ''} />
            {:else}
              <Select
                class="max-w-xs"
                bind:selected={$data.bandId}
                invalid={!!$errors.bandId}
                invalidText={$errors.bandId?.[0]}
              >
                <SelectItem disabled value={-1} text="-- Select --" />
                {#each bands as band}
                  <SelectItem
                    value={band.id}
                    text={band.id === customBand?.id ? `${band.name} (Custom values)` : `${band.name}`}
                  />
                {/each}
              </Select>
            {/if}
            {#if $data.bandId !== -1}
              <Button
                on:click={() => (bandDetailModalOpen = true)}
                kind="ghost"
                icon={Edit}
                iconDescription="Customize band"
              />
            {/if}
          </div>
        </div>
      {/if}
    </div>

    <div class="flex items-center">
      <div class="flex-[2] max-w-[8rem] mr-6 text-base">Active</div>
      <div class="flex-[8]">
        {#if loading}
          <SkeletonPlaceholder class="h-12" />
        {:else}
          <Toggle disabled={readonly} bind:toggled={$data.active} />
        {/if}
      </div>
    </div>

    <div class="flex items-center">
      <div class="flex-[2] max-w-[8rem] mr-6 text-base">Apply contract</div>
      <div class="flex-[8]">
        {#if loading}
          <SkeletonPlaceholder class="h-12" />
        {:else}
          <Toggle disabled={readonly} bind:toggled={$data.enforcing} />
        {/if}
      </div>
    </div>

    {#if customerId}
      {#if loading}
        <SkeletonPlaceholder class="w-full h-96" />
      {:else}
        <CustomerModulesTable
          bind:changedInvoices
          {customer}
          moduleTypes={$data.moduleTypes}
          {readonly}
          band={customBand || selectedBand}
        />
      {/if}
    {/if}
  </form>
</Modal>

<BandLimitsModal
  bind:open={bandDetailModalOpen}
  {customBand}
  on:save={(e) => handleBandsSave(e.detail.isCustom, e.detail.band)}
  {readonly}
  band={selectedBand}
  {creditCardModuleSelected}
  isBincodes={$data.isBincodes}
/>
