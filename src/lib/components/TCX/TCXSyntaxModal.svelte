<script lang="ts">
  import type { TCXOptions } from '$lib/types/tcx';
  import { Modal, SkeletonPlaceholder } from 'carbon-components-svelte';
  import { createEventDispatcher } from 'svelte';

  export let key: 'cve';
  export let open: boolean = false;
  export let tcxOptions: TCXOptions;

  const dispatch = createEventDispatcher<{ search: string }>();

  function handleClick(e: Event) {
    const target = e.target as HTMLElement;
    if (target?.classList?.contains('set-dork-example')) {
      open = false;
      dispatch('search', target.innerText);
    }
  }
</script>

<Modal
  on:click:button--primary={() => (open = false)}
  primaryButtonText="Close"
  bind:open
  modalHeading="Advanced Search: Available Dorks"
  size="lg"
  hasScrollingContent
>
  <div class="[&_p]:text-base">
    <div class="m-4">
      <p class="mb-1">
        {#if key === 'cve'}
          In order to filter results in an advanced way Threat Context provides a list of dorks to find specific
          information. In the CVEs section
          <span class="font-bold">if no dork is used the default search is an exact search of the CVE name.</span>
          This is the list of all dorks available in this section:
        {/if}
      </p>
    </div>

    <div class="m-4">
      {#if !tcxOptions}
        <SkeletonPlaceholder class="w-full h-80" />
      {:else}
        <table>
          <thead>
            <tr>
              <th>DORK</th>
              <th>EXAMPLES</th>
              <th>DESCRIPTION</th>
            </tr>
          </thead>
          <tbody>
            {#each Object.entries(tcxOptions.dork_fields) as [field, details]}
              <tr>
                <td>{field}</td>
                <td>{details.type}</td>
                <td on:click={handleClick}>{@html details.description}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}

      <h5 class="mt-5">Available operations</h5>
      <table class="table border-top">
        <thead>
          <tr>
            <th>Type</th>
            <th>Operator</th>
            <th style="width: 430px">Description</th>
            <th style="width: 250px">Example</th>
          </tr>
        </thead>
        <tbody class="text-secondary">
          <tr>
            <td>String / Relationship / Choice</td>
            <td>{'field:[^,$,~]"value"'}</td>
            <td>
              {'- By default the field must exactly match "value".'}<br />
              {'- If "^" is specified the field must start with "value".'}<br />
              {'- If "$" is specified the field must end with "value".'}<br />
              {'- If "~" is specified the field must contain "value".'}
            </td>
            <td>{'name:^"CVE-2020"'}</td>
          </tr>
          <tr>
            <td>Integer / Float</td>
            <td>{'field:[<,<=,>,>=]value'}</td>
            <td>
              {'- By default field equals value.'}<br />
              {'- If ">" is specified the field must be greater than value.'}<br />
              {'- If "<" is specified the field must be less than value.'}<br />
              {'- If ">=" or “<=" is specified the field might be greater/less or equal to value.'}
            </td>
            <td>
              {'blueliv_score:>=9.2'}
              {'num_malware:>100'}
            </td>
          </tr>
          <tr>
            <td>Date</td>
            <td>{'field:[<,<=,>,>=]yyyy[-mm-dd]'}</td>
            <td>
              {'- By default Field equals the date.'}<br />
              {'- If ">" is specified the field must be greater.'}<br />
              {'- If "<" is specified the field must be less.'}<br />
              {'- if ">=" or "<=" is specified the field might be greater/less or equal to value.'}
            </td>
            <td>{'first_seen:>=2017-01-05'}</td>
          </tr>
          <tr>
            <td>Boolean</td>
            <td>{'field:[0,1]'}</td>
            <td>{'Field is false (0) or true (1).'}</td>
            <td>active:0</td>
          </tr>
          <tr>
            <td>List</td>
            <td>{'field:"value"'}</td>
            <td>
              List has an item which equals to "value". No operators are available, with exception of aliases in Actors.
            </td>
            <td>
              {'types:"hacker"'}
              <br />
              {'aliases:~"panda"'}
            </td>
          </tr>
          <tr>
            <td>Generic</td>
            <td>{'field.subfield:[^,$,~]"value"'}</td>
            <td>
              The GenericField type gives access to an element with JSON format which can be navigated using dots.
              <br />
              {'Most of the times the "value" is a String so the available operators are the same as the String type: ^, $ and ~.'}
              <br />
              The word “keyword" can be added at the end to avoid tokenization by the backend.
            </td>
            <td>{'ioa.url.keyword:~".php"'}</td>
          </tr>
          <tr>
            <td>Logical Operators</td>
            <td>AND, OR</td>
            <td>
              - AND: Returns true if both operands are true.<br />
              - OR: Returns true if either operand is true
            </td>
            <td>active:1 AND targets:~"financial"</td>
          </tr>
          <tr>
            <td>Negation Operator</td>
            <td>NOT field:0</td>
            <td>Returns false if its single operand can be converted to true; otherwise, returns true.</td>
            <td>NOT active:0</td>
          </tr>
          <tr>
            <td>Grouping Operator</td>
            <td>()</td>
            <td>Grouping operator</td>
            <td>(active:0 AND targets:"Italy") OR name:~"Lazarus"</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</Modal>

<style lang="scss">
  :global(.set-dork-example) {
    @apply text-ctip-interactive cursor-pointer;
  }
  table {
    @apply border-[1px] border-solid border-ctip-borderTable w-full;
    th,
    td {
      @apply border-[0.5px] border-solid border-ctip-borderTable;
    }
    th {
      @apply p-[0.3rem];
    }
    td {
      @apply p-1;
    }
    thead {
      @apply bg-ctip-ui border-b-2 border-b-ctip-interactive border-solid;
    }
    tbody {
      @apply text-ctip-text;
    }
  }
</style>
