<script lang="ts">
  import Client from '$lib/client';
  import type { Customers } from '$lib/types/admin';
  import { ComboBox, InlineLoading } from 'carbon-components-svelte';

  const client = new Client();

  export let customerId: number;
  export let initialCustomerId: number = undefined;

  const cacheCustomerName: Record<number, string> = {};

  let value = '';
  let timeout: ReturnType<typeof setTimeout>;
  let customers: Customers[] = [];
  let loading = false;
  let loadingInitial = false;
  let lastSearch = '';
  let open = false;

  $: selectedName = customers.find((customer) => customer.id === customerId)?.name || '';
  $: searchWithTimeout(value);
  $: setInitialCustomer(initialCustomerId);

  function searchWithTimeout(value: string) {
    if (!value || selectedName === value || loadingInitial) return;
    customers = [];
    loading = true;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      searchCustomer(value);
    }, 1000);
  }

  async function searchCustomer(value: string) {
    lastSearch = value;
    const data = await client.admin.getCustomers({
      page: 1,
      maxRows: 5,
      search: value
    });
    customers = data.content;
    loading = false;
    if (!open) {
      if (customers?.[0]) {
        customerId = customers[0].id;
      }
    }
  }

  async function setInitialCustomer(initialCustomerId: number) {
    if (!initialCustomerId) return;
    loadingInitial = true;
    customers = [{ id: initialCustomerId, name: ' ' }];
    customerId = initialCustomerId;
    try {
      const customerName = await getCustomerName(initialCustomerId);
      customers = [{ id: initialCustomerId, name: customerName }];
    } catch (error) {
      customers = [{ id: initialCustomerId, name: '?' }];
    } finally {
      loadingInitial = false;
    }
  }

  async function getCustomerName(id: number) {
    let name = cacheCustomerName[id];
    if (!name) {
      try {
        const customer = await client.admin.getCustomer(id);
        name = customer.name;
        cacheCustomerName[id] = name;
      } catch (error) {
        name = '?';
      }
    }
    return name;
  }
</script>

<div class="relative">
  {#key customers}
    <ComboBox
      bind:open
      bind:selectedId={customerId}
      bind:value
      on:select
      on:blur
      on:clear
      on:clear={() => (lastSearch = '')}
      placeholder={lastSearch ? `Searching ${lastSearch}...` : 'Search customer...'}
      items={customers.map((customer) => ({ id: customer.id, text: customer.name }))}
      titleText="Customer (*)"
      data-testid="customer"
      {...$$restProps}
    />
  {/key}
  {#if loading || loadingInitial}
    <InlineLoading class="absolute w-0 flex top-0 left-full -ml-24 mt-7 pointer-events-none" />
  {/if}
</div>
