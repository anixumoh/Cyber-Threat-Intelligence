<script lang="ts">
  import type { TCXOptions } from '$lib/types/tcx';
  import {
    Button,
    ComboBox,
    DatePicker,
    DatePickerInput,
    Dropdown,
    NumberInput,
    SkeletonPlaceholder,
    Tag,
    TextInput
  } from 'carbon-components-svelte';
  import { Subtract } from 'carbon-icons-svelte';
  import { createEventDispatcher } from 'svelte';
  import { FIELD_TYPE, OPERATORS } from './utils';

  const dispatch = createEventDispatcher<{ remove: void }>();

  export let tcxOptions: TCXOptions;
  export let field: string = undefined;
  export let operator: string = '=';
  export let value: string | number = '';
  export let invalid = false;
  export let aggregator: 'AND' | 'OR' | undefined;

  $: selectedFieldType = tcxOptions?.dork_fields?.[field]?.type.toUpperCase() as FIELD_TYPE;
  $: allowedOperators = OPERATORS.filter((op) => op.type.includes(selectedFieldType));

  function onChangeField() {
    operator = '=';
    resetValue();
  }

  function resetValue() {
    if (selectedFieldType === FIELD_TYPE.INTEGER) {
      value = '1';
    } else {
      value = '';
    }
  }

  function toggleAggregator() {
    if (aggregator === 'AND') {
      aggregator = 'OR';
    } else if (aggregator === 'OR') {
      aggregator = 'AND';
    }
  }
</script>

<div class="flex gap-4">
  {#if !tcxOptions}
    <SkeletonPlaceholder class="w-full" />
  {:else}
    <div class="w-12">
      {#if aggregator}
        <Tag
          type={aggregator === 'AND' ? 'high-contrast' : 'outline'}
          interactive
          on:click={toggleAggregator}
          class="w-12"
        >
          {aggregator}
        </Tag>
      {/if}
    </div>

    <ComboBox
      placeholder="Field"
      class="min-w-[200px]"
      bind:selectedId={field}
      on:select={onChangeField}
      on:clear={onChangeField}
      shouldFilterItem={(item, value) => item.text.toLocaleLowerCase().includes(value.toLowerCase())}
      items={Object.keys(tcxOptions.dork_fields).map((key) => ({ id: key, text: key }))}
      invalid={invalid && !field}
      invalidText="Please, select a field"
    />
    <Dropdown
      class="min-w-[200px]"
      disabled={!selectedFieldType}
      bind:selectedId={operator}
      items={allowedOperators}
      let:item
    >
      <div class="flex justify-between">
        <div>{item.text}</div>
        <div><pre>{item.id}</pre></div>
      </div>
    </Dropdown>

    {#if selectedFieldType === FIELD_TYPE.DATETIME}
      <DatePicker bind:value datePickerType="single" dateFormat="Y-m-d">
        <DatePickerInput placeholder="yyyy-mm-dd" invalid={invalid && !value} invalidText="This field is required" />
      </DatePicker>
    {:else if selectedFieldType === FIELD_TYPE.FLOAT}
      <NumberInput step={0.1} bind:value invalid={invalid && !value} invalidText="This field is required" />
    {:else if selectedFieldType === FIELD_TYPE.INTEGER}
      <NumberInput bind:value invalid={invalid && !value} invalidText="This field is required" />
    {:else if selectedFieldType === FIELD_TYPE.BOOLEAN}
      <Dropdown
        bind:selectedId={value}
        items={[
          { id: '1', text: 'TRUE' },
          { id: '0', text: 'FALSE' }
        ]}
        invalid={invalid && !value}
        invalidText="This field is required"
      />
    {:else}
      <!-- TODO: CHOICE ? -->
      <TextInput
        disabled={!selectedFieldType}
        placeholder="Value"
        bind:value
        invalid={invalid && !value}
        invalidText="This field is required"
      />
    {/if}

    <div>
      <Button
        size="field"
        on:click={() => dispatch('remove')}
        icon={Subtract}
        iconDescription="Remove"
        tooltipPosition="left"
      />
    </div>
  {/if}
</div>
