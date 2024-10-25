<script lang="ts">
  import type { ExtradataKeyTemplate } from '$lib/client/services/modules';
  import { Button, DatePicker, DatePickerInput, InlineNotification, TextArea } from 'carbon-components-svelte';
  import { Checkmark, Close, Edit, InformationFilled, Terminal } from 'carbon-icons-svelte';
  import type { Parser } from 'peggy';
  import { tick } from 'svelte';
  import { VALUE_LESS_OPERATOR, type ConfigQuery } from './constants';
  import getParser from './getParser';
  import { convertQueryToCQL, getWarnings, queryToHTML } from './utils';

  type Location = {
    offset: number;
    line: number;
    column: number;
  };

  type PeggyError = {
    message: string;
    expected: any;
    found: string;
    location: {
      source: any;
      start: Location;
      end: Location;
    };
    name: string;
  };

  export let keyTemplates: ExtradataKeyTemplate[] = [];
  export let query: ConfigQuery;
  export let direction: 'top' | 'bottom' = 'bottom';
  export let isEditting = false;

  const FONT_SIZE = 9.1;

  let width = 200;
  let cql = convertQueryToCQL(query, keyTemplates);
  let previousValue = '';
  let error: PeggyError | null = null;
  let inputEl: HTMLTextAreaElement;
  let menuButtons: HTMLDivElement;
  let dateInputEl: HTMLInputElement;
  let editButtonEl: HTMLButtonElement;
  let lastOffset = 0;
  let showDate = false;

  $: parser = getParser(keyTemplates);

  function parseCQL(parser: Parser, cql: string) {
    try {
      const result = parser.parse(cql);
      error = null;
      return result;
    } catch (e) {
      error = e;
    }
  }

  async function writeToPosition(write: string, pos: number, replace: boolean, focusOffset = 0, focusChars = 0) {
    const lastPart = cql.slice(pos - 1);
    const lastPartIncluded = write.toLowerCase().includes(lastPart.toLowerCase());
    let offset = lastPartIncluded ? -1 : +1;

    let endSpace = true;
    if (VALUE_LESS_OPERATOR.includes(write as any) || isEnterValueError || write === 'KEY') {
      endSpace = false;
    }

    if (replace) offset = -1;
    cql = [cql.slice(0, pos + offset).trim(), `${write}${endSpace ? ' ' : ''}`].filter(Boolean).join(' ');

    await tick();

    const targetPos = cql.length - focusOffset;
    inputEl?.focus();
    inputEl.setSelectionRange(targetPos, targetPos + focusChars);
  }

  function handleKeyDown(e: KeyboardEvent) {
    switch (e.key.toString()) {
      case 'ArrowUp':
        if (document.activeElement.previousElementSibling && document.activeElement !== inputEl) {
          (document.activeElement.previousElementSibling as HTMLElement)?.focus?.();
        } else {
          const buttons = menuButtons.querySelectorAll('button');
          const last = buttons[buttons.length - 1];
          if (last) {
            last?.focus?.();
          }
        }
        e.preventDefault();
        break;
      case 'ArrowDown':
        if (document.activeElement.nextElementSibling && document.activeElement !== inputEl) {
          (document.activeElement.nextElementSibling as HTMLElement)?.focus?.();
        } else {
          menuButtons.querySelectorAll('button')?.[0]?.focus?.();
        }
        e.preventDefault();
        break;
      case 'Escape':
        onCancel();
      default:
        if (
          (document.activeElement?.nodeName !== 'INPUT' &&
            e.key.length === 1 &&
            e.ctrlKey === false &&
            e.altKey === false &&
            e.metaKey === false) ||
          e.key === 'Backspace'
        ) {
          inputEl.focus();
        }
        break;
    }
  }

  function onInputKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      save();
    }
  }

  async function onEdit() {
    isEditting = true;
    cql = convertQueryToCQL(query, keyTemplates);
    previousValue = cql;
    await tick();
    inputEl?.focus();
  }

  async function save() {
    if (error && !isTrimmedQueryOk) return;
    cql = cql.trim();
    await tick();
    isEditting = false;
    await tick();
    editButtonEl?.focus();
  }

  async function onCancel() {
    cql = previousValue;
    isEditting = false;
    await tick();
    editButtonEl?.focus();
  }

  function checkTrimmedQueryOk(value: string) {
    if (!value) return true;
    try {
      parser.parse(value.trim());
      return true;
    } catch (error) {
      return false;
    }
  }

  function getExpectedItems(message: string, value: string) {
    try {
      const removeBut = / but[^]*$/;
      message = message.replace(removeBut, '');

      const replaceItems = {
        QUOTES: '"'
      };
      message = message.replace('"\\""', '"QUOTES"');

      const regex = /"([^"]*)"/g;
      const items = [...message.matchAll(regex)]
        .map((match) => replaceItems[match[1]] || match[1])
        .filter((item) => item !== 'KEY_TEMPLATE');

      const inputs = value.split(' ');
      const lastInput = inputs[inputs.length - 1];

      const filteredItems = items.filter((item) => item.toLowerCase().includes(lastInput.toLowerCase()));
      if (filteredItems.length) {
        return filteredItems;
      }
      return items;
    } catch (error) {}
    return [];
  }

  function getWidth() {
    if (!inputEl) return;
    width = inputEl.getBoundingClientRect().width;
  }

  $: keyTemplateByPath = keyTemplates.reduce((acc, kt) => {
    acc[kt.keyPreset.key.path] = kt;
    return acc;
  }, {}) as Record<string, ExtradataKeyTemplate>;

  $: inputEl && getWidth();
  $: query = parseCQL(parser, cql);
  $: isTrimmedQueryOk = checkTrimmedQueryOk(cql);
  $: expectedItems = getExpectedItems(error?.message, cql) || [];
  $: warnings = getWarnings(query, keyTemplates);

  $: hasToReplace =
    error?.message?.includes('Expected') &&
    error?.message?.includes('but') &&
    error?.message?.includes('found') &&
    !error?.message?.includes('but end of input found');
  $: isOperatorError = error?.message?.includes('Expected "!=", "="');
  $: isEnterValueError = error?.message?.includes('ENTER_VALUE');
  $: enterValueErrorKey = isEnterValueError && error?.message.split('|')?.[1];
  $: enterValueErrorTemplateKeyType = keyTemplateByPath?.[enterValueErrorKey]?.keyPreset?.key?.type;
  $: isExpectedKey = error?.message?.includes('Expected') && error?.message?.includes('KEY');
  $: unknownError =
    error && !(expectedItems.length || isOperatorError || isEnterValueError || isExpectedKey) && !showDate;
  $: lastOffset = error?.location?.end?.offset ?? 0;
  $: showDate = cql ? false : false; // showDate = when cql change hide
  $: lettersThatFitOneLine = Math.ceil(width / FONT_SIZE) + 1;
  $: lastOffsetWithLineJump = lastOffset % lettersThatFitOneLine;
</script>

<svelte:window on:resize={getWidth} />

<div class="relative" on:keydown|stopPropagation={handleKeyDown} role="searchbox" tabindex="0">
  {#if isEditting}
    <TextArea
      placeholder="KEY CONTAINS VALUE"
      rows={6}
      bind:ref={inputEl}
      bind:value={cql}
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      class="font-mono !text-sm resize-none {error && !isTrimmedQueryOk ? '' : 'border-green-400'}"
      invalid={!!unknownError}
      invalidText={error?.message}
      on:keydown={onInputKeydown}
    />

    <div class="absolute right-0 mt-1">
      <Button kind="danger-tertiary" class="px-3" size="small" on:click={onCancel}>
        <Close />
      </Button>
      <Button disabled={!!error && !isTrimmedQueryOk} kind="tertiary" class="px-3" size="small" on:click={save}>
        <Checkmark />
      </Button>
    </div>

    <div
      bind:this={menuButtons}
      class="absolute bg-ctip-ui grid border-[1px] border-ctip-border border-solid z-10
      {direction === 'top' ? 'top-auto bottom-[140px]' : ''}"
      style:margin-left="{Math.min(FONT_SIZE * lastOffsetWithLineJump + 20, width - 200)}px"
    >
      {#if isExpectedKey}
        <Button on:click={() => writeToPosition('KEY', lastOffset - 1, hasToReplace, 3, 3)} size="small" kind="ghost">
          KEY
        </Button>
      {/if}

      {#if expectedItems.length}
        {#each expectedItems as expectedItem}
          {@const keyTemplate = keyTemplateByPath[expectedItem]}
          {#if !keyTemplate || keyTemplate.enabled}
            <Button
              on:click={() => writeToPosition(expectedItem, lastOffset, hasToReplace)}
              size="small"
              kind="ghost"
              class="w-full group"
            >
              {expectedItem}
              {#if keyTemplate}
                <div
                  class="absolute whitespace-nowrap left-full hidden group-focus:flex group-active:flex group-hover:flex items-center bg-ctip-ui border w-fit p-2 gap-2"
                >
                  <InformationFilled />
                  {keyTemplate.description}
                </div>
              {/if}
            </Button>
          {/if}
        {/each}
      {/if}

      {#if isEnterValueError}
        {#if !enterValueErrorTemplateKeyType || enterValueErrorTemplateKeyType === 'TEXT'}
          <Button
            on:click={() => writeToPosition('"STRING"', lastOffset - 1, hasToReplace, 7, 6)}
            size="small"
            kind="ghost"
          >
            "STRING"
          </Button>
        {/if}
        {#if !enterValueErrorTemplateKeyType || enterValueErrorTemplateKeyType === 'NUMBER'}
          <Button on:click={() => writeToPosition('0', lastOffset - 1, hasToReplace, 1, 1)} size="small" kind="ghost">
            Number
          </Button>
        {/if}
        {#if !enterValueErrorTemplateKeyType || enterValueErrorTemplateKeyType === 'BOOLEAN'}
          <Button on:click={() => writeToPosition('TRUE', lastOffset - 1, hasToReplace)} size="small" kind="ghost">
            TRUE
          </Button>
          <Button on:click={() => writeToPosition('FALSE', lastOffset - 1, hasToReplace)} size="small" kind="ghost">
            FALSE
          </Button>
        {/if}
      {/if}
    </div>

    <div
      class="absolute bg-ctip-ui grid
      {direction === 'top' ? 'top-auto bottom-[160px]' : ''}"
    >
      {#if showDate}
        <DatePicker
          dateFormat="d/m/Y"
          datePickerType="single"
          on:change={(e) => (cql = cql.replace('DD/MM/YYYY', e.detail.dateStr))}
        >
          <DatePickerInput bind:ref={dateInputEl} placeholder="dd/mm/yyyy" />
        </DatePicker>
      {/if}
    </div>
  {:else}
    <Button
      bind:ref={editButtonEl}
      kind="ghost"
      class="min-w-full w-fit bg-ctip-ui max-w-none flex gap-2 justify-between"
      on:click={onEdit}
    >
      <div class="flex items-center flex-wrap gap-1">
        <Terminal />
        {#if query}
          {@html queryToHTML(query, keyTemplates)}
        {:else}
          Click here to enter the query
        {/if}
      </div>
      <div>
        <Edit />
      </div>
    </Button>
  {/if}
  {#if warnings.length}
    <InlineNotification hideCloseButton lowContrast>
      {#each warnings as warning}
        <div>{warning}</div>
      {/each}
    </InlineNotification>
  {/if}
</div>
