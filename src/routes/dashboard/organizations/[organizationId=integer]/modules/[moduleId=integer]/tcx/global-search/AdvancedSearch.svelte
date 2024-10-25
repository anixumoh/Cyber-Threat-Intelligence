<script lang="ts">
  import Client from '$lib/client';
  import type { Actor, Campaign, Tool } from '$lib/client/services/actors';
  import globalSearchParser from '$lib/tcx-global-search/globalSearchParser';
  import { queryToDorks, queryToHTML } from '$lib/tcx-global-search/utils';
  import preferencesStore from '$stores/preferences';
  import { Button, DatePicker, DatePickerInput, TextArea } from 'carbon-components-svelte';
  import { Checkmark, Close, Terminal } from 'carbon-icons-svelte';
  import { createEventDispatcher, onDestroy, tick } from 'svelte';
  import type { TCXAdvancedSearch } from './types';

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

  const FONT_SIZE = 10;
  const client = new Client();
  const dispatch = createEventDispatcher<{
    search: { actors: Actor[]; campaigns: Campaign[]; tools: Tool[] };
  }>();

  onDestroy(() => client.abort());

  let value = '';
  let previousValue = '';
  let error: PeggyError | null = null;
  let inputEl: HTMLTextAreaElement;
  let menuButtons: HTMLDivElement;
  let dateInputEl: HTMLInputElement;
  let editButtonEl: HTMLButtonElement;
  let lastOffset = 0;
  let showDate = false;
  let isEditting = false;

  export async function searchAdvancedSearch(advancedSearch: TCXAdvancedSearch) {
    value = advancedSearch.value;
    await tick();
    await searchDorks(advancedSearch.name);
  }

  function saveAdvacedSearch(name: string) {
    const advancedSearch: TCXAdvancedSearch = {
      type: 'advanced',
      value,
      name
    };
    $preferencesStore.tcx_recent_searches.push(advancedSearch);
    $preferencesStore.tcx_recent_searches = $preferencesStore.tcx_recent_searches.slice(-5);
    preferencesStore.setAndSave($preferencesStore);
  }

  function parseCQL(value: string) {
    try {
      const result = globalSearchParser(value);
      error = null;
      return result;
    } catch (e) {
      error = e;
    }
  }

  async function pickDate() {
    writeToPosition('DD/MM/YYYY', lastOffset - 1, 5, 5);
    await tick();
    showDate = true;
    await tick();
    dateInputEl?.focus();
  }

  async function writeToPosition(write: string, pos: number, focusOffset = 0, focusChars = 0) {
    value = [value.slice(0, pos).trim(), write].filter((x) => x).join(' ');

    await tick();

    const targetPos = value.length - focusOffset;
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
          inputEl?.focus();
        }
        break;
    }
  }

  function onInputKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSave();
    }
  }

  async function onEdit() {
    isEditting = true;
    previousValue = value;
    await tick();
    inputEl?.focus();
  }

  async function onSave() {
    if (error && !isTrimmedQueryOk) return;
    value = value.trim();
    await tick();
    isEditting = false;
    await tick();
    editButtonEl?.focus();
    if (value) {
      searchDorks();
    }
  }

  async function searchDorks(name = '') {
    const dorks = queryToDorks(query);

    const [actors, campaigns, tools] = await Promise.all([
      getActors(dorks.actor),
      getCampaigns(dorks.campaign),
      getTools(dorks.tool)
    ]);

    dispatch('search', {
      actors,
      campaigns,
      tools
    });
    saveAdvacedSearch(name);
  }

  async function getActors(dork: string) {
    if (!dork) return [];
    return await client.actors.getActors(100, '-last_seen', { dork });
  }

  async function getCampaigns(dork: string) {
    if (!dork) return [];
    return await client.actors.getCampaigns({ dork });
  }

  async function getTools(dork: string) {
    if (!dork) return [];
    return await client.actors.getTools({ dork });
  }

  async function onCancel() {
    value = previousValue;
    isEditting = false;
    await tick();
    editButtonEl?.focus();
  }

  function getExpectedItems(message: string, value: string) {
    try {
      const removeBut = / but[^]*$/;
      const msg = message.replace(removeBut, '');
      const regex = /"([^"]*)"/g;
      const items = [...msg.matchAll(regex)].map((match) => match[1]);

      const inputs = value.split(' ');
      const lastInput = inputs[inputs.length - 1];

      const filteredItems = items.filter((item) => item.includes(lastInput));
      if (filteredItems.length) {
        return filteredItems;
      }
      return items;
    } catch (error) {}
    return [];
  }

  function checkTrimmedQueryOk(value: string) {
    try {
      globalSearchParser(value.trim());
      return true;
    } catch (error) {
      return false;
    }
  }

  $: query = parseCQL(value);
  $: isTrimmedQueryOk = checkTrimmedQueryOk(value);
  $: isMixingOperators = error?.message === 'MIXING_OPERATORS';
  $: expectedItems = getExpectedItems(error?.message, value) || [];
  $: isExpectedString = error?.message.includes('Expected STRING or whitespace');
  $: isExpectedDate = error?.message.includes('Expected DATE');
  $: unknownError = error && !expectedItems.length && !isExpectedDate && !isExpectedString && !showDate;
  $: if (error?.location?.end?.offset !== undefined) lastOffset = error.location.end.offset;
  $: showDate = value ? false : false; // showDate = when cql change hide
</script>

<div class="relative" on:keydown={handleKeyDown} role="searchbox" tabindex="0">
  {#if isEditting}
    <TextArea
      placeholder="Use the dropdown below to write the query"
      rows={2}
      bind:ref={inputEl}
      bind:value
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      class="font-mono !text-sm {error && !isTrimmedQueryOk ? '' : 'border-green-400'}"
      invalid={!!unknownError}
      invalidText={error?.message}
      on:keydown={onInputKeydown}
    />

    <div class="absolute right-0 mt-1">
      <Button kind="danger-tertiary" class="px-3" size="small" on:click={onCancel}>
        <Close />
      </Button>
      <Button disabled={!!error && !isTrimmedQueryOk} kind="tertiary" class="px-3" size="small" on:click={onSave}>
        <Checkmark />
      </Button>
    </div>

    <div
      bind:this={menuButtons}
      class="absolute bg-ctip-ui grid z-10 border"
      style:margin-left="{Math.min(FONT_SIZE * lastOffset, 300)}px"
    >
      {#if expectedItems.length}
        {#each expectedItems as expectedItem}
          <Button on:click={() => writeToPosition(expectedItem + ' ', lastOffset - 1)} size="small" kind="ghost">
            {expectedItem}
          </Button>
        {/each}
      {/if}

      {#if isExpectedString}
        <Button on:click={() => writeToPosition('"STRING" ', lastOffset, 8, 6)} size="small" kind="ghost">
          "STRING"
        </Button>
      {/if}

      {#if isExpectedDate}
        <Button on:click={pickDate} size="small" kind="ghost">DD/MM/YYYY</Button>
      {/if}
    </div>

    <div class="absolute bg-ctip-ui grid z-10">
      {#if showDate}
        <DatePicker
          dateFormat="d/m/Y"
          datePickerType="single"
          on:change={(e) => (value = value.replace('DD/MM/YYYY', e.detail.dateStr))}
        >
          <DatePickerInput bind:ref={dateInputEl} placeholder="dd/mm/yyyy" />
        </DatePicker>
      {/if}
    </div>

    {#if isMixingOperators}
      <div class="bg-ctip-ui p-3 text-ctip-warning w-fit">
        <p>Do not mix operators [AND, OR] use (parenthesis) to mix them</p>
        <p>Example:</p>
        <pre class="text-ctip-text">
          actor.name = "something" OR ( actor.campaigns = "campaign name" AND actor.country = "Spain")
        </pre>
      </div>
    {/if}
  {:else}
    <Button
      bind:ref={editButtonEl}
      kind="ghost"
      class="min-w-full w-fit bg-ctip-ui max-w-none flex gap-2 flex-wrap justify-start"
      on:click={onEdit}
    >
      <Terminal />
      {#if query}
        {@html queryToHTML(query)}
      {:else}
        <span>Click here to start writing an advanced query</span>
      {/if}
    </Button>
  {/if}
</div>
