<script lang="ts">
  import EmptyData from '$lib/components/EmptyData/EmptyData.svelte';
  import type { Band, Customer, CustomerModule } from '$lib/types/admin';
  import VirtualList from '@sveltejs/svelte-virtual-list';
  import { TooltipDefinition } from 'carbon-components-svelte';
  import { Checkmark, Close } from 'carbon-icons-svelte';
  import { onMount } from 'svelte';

  export let changedInvoices: Record<number, boolean> = {};
  export let customer: Customer;
  export let moduleTypes: string[] = [];
  export let readonly = false;
  export let band: Band;

  onMount(() => (windowHeight = window.innerHeight));

  let windowHeight = 1000;
  $: height = `${Math.max(Math.min(virtualList.length * 50, windowHeight - 350), 200)}px`;
  $: virtualList = generateVirtualList(customer, band);

  function isContractedModule(moduleType: string) {
    return moduleTypes.some((mod) => mod.toLocaleLowerCase() === moduleType.toLowerCase());
  }

  function groupModulesByType(customerModules: CustomerModule[]) {
    const modules: Record<string, CustomerModule[]> = {};
    customerModules?.forEach((module) => {
      modules[module.moduleType] ??= [];
      modules[module.moduleType].push(module);
    });
    return Object.entries(modules);
  }

  function setInvoicing(moduleId: number, value: boolean) {
    changedInvoices[moduleId] = value;
  }

  function getModuleLink(link: string) {
    const noHttp = link.replace('https://', '');
    const values = noHttp.split('/');
    return `https://${values[0]}/dashboard/organizations/${values[4]}/modules/${values[6]}`;
  }

  function generateVirtualList(customer: Customer, band: Band) {
    const rows = [];

    const moduleByType = groupModulesByType(customer?.customerModules ?? []);

    moduleByType.forEach(([moduleType, customerModules]) => {
      const nonDeletedModules = customerModules.filter((mod) => !mod.deleted);
      const modulesCount = nonDeletedModules.length;
      const center = Math.floor(modulesCount / 2);
      const lastIndex = modulesCount - 1;
      const isEven = modulesCount % 2 == 0;
      const isContracted = isContractedModule(moduleType);

      nonDeletedModules.forEach((customerModule, index) => {
        rows.push({
          id: customerModule.id,
          moduleType: moduleType.replace('_', ' '),
          isContracted,
          isCenter: center === index,
          isLast: lastIndex === index,
          isEven,
          link: customerModule.link,
          invoicing: customerModule.invoicing,
          trial: customerModule.trial,
          rootDomains: customerModule.moduleValues?.rootDomains,
          ips: customerModule.moduleValues?.ips,
          keywords: customerModule.moduleValues?.keywords,
          binCodes: customerModule.moduleValues?.binCodes,
          creditCardsPerYear: customerModule.moduleValues?.creditCardsPerYear,
          emails: customerModule.moduleValues?.emails,
          cpes: customerModule.moduleValues?.cpes,
          storage: customerModule.moduleValues?.storage
        });
      });

      if (isContracted && modulesCount > 0) {
        const contract = customer.contract.contractsModules.find((mod) => mod.moduleType === moduleType);
        if (contract) {
          rows.push({
            isModuleTotal: true,
            moduleType: 'MODULE TYPE TOTALS',
            isContracted: true,
            isCenter: true,
            isLast: true,
            isEven: false,
            rootDomains: contract?.rootDomains,
            ips: contract?.ips,
            keywords: contract?.keywords,
            binCodes: contract?.binCodes,
            creditCardsPerYear: contract?.creditCardsPerYear,
            emails: contract?.emails,
            cpes: contract?.cpes,
            storage: contract?.storage
          });
        }
      }
    });

    if (rows.length && band) {
      rows.push({
        moduleType: 'BAND',
        bandName: band.name,
        isContracted: true,
        isCenter: true,
        isLast: true,
        isEven: false,
        rootDomains: band.bandValues?.rootDomains,
        ips: band.bandValues?.ips,
        keywords: band.bandValues?.keywords,
        binCodes: band.bandValues?.binCodes,
        creditCardsPerYear: band.bandValues?.creditCardsPerYear,
        emails: band.bandValues?.emails,
        employees: band.bandValues?.employees,
        cpes: band.bandValues?.cpes,
        storage: band.bandValues?.storage
      });
    }

    if (rows.length && customer.total) {
      rows.push({
        moduleType: 'TOTAL',
        isContracted: true,
        isCenter: true,
        isLast: true,
        isEven: false,
        rootDomains: customer.total?.rootDomains,
        ips: customer.total?.ips,
        keywords: customer.total?.keywords,
        binCodes: customer.total?.binCodes,
        creditCardsPerYear: customer.total?.creditCardsPerYear,
        emails: customer.total?.emails,
        cpes: customer.total?.cpes,
        storage: customer.total?.storage
      });
    }

    return rows;
  }
</script>

<svelte:window on:resize={() => (windowHeight = window.innerHeight)} />

{#if virtualList?.length}
  <div class="grid bg-ctip-background">
    <div
      class="grid grid-cols-[120px,repeat(12,1fr)] font-bold border-b-2 border-solid border-ctip-primary text-center pt-4 pb-2"
    >
      <div class="w-32">Module Type</div>
      <div>Id</div>
      <div>Invoicing</div>
      <div>Trial</div>
      <div>Domains</div>
      <div>IP</div>
      <div>Keywords</div>
      <div>Bin codes</div>
      <div>Credit Cards</div>
      <div>E-mails</div>
      <div>Employees</div>
      <div>CPEs</div>
      <div>Cloud Storage</div>
    </div>

    <div class="virtual-list-no-overflow" style:height>
      <VirtualList items={virtualList} let:item>
        <div
          class:bg-red-100={!item.isContracted}
          class:hover:bg-red-100={!item.isContracted}
          class:hover:bg-ctip-ui={item.isContracted}
          class="grid grid-cols-[120px,repeat(12,1fr)] text-center items-center
          hover:opacity-80
          [&>div]:border-b [&>div]:border-solid [&>div]:border-ctip-border [&>div]:h-full [&>div]:py-1
          {item.isLast ? 'border-b border-solid border-ctip-border' : ''}
          "
        >
          <div class="relative w-32 font-bold text-center align-middle h-full !border-none" title={item.moduleType}>
            {#if item.isCenter}
              {#if item.isEven}
                <span class="absolute left-0 -mt-4 w-32">
                  {item.moduleType || ''}
                </span>
              {:else}
                {item.moduleType || ''}
              {/if}
            {/if}
          </div>

          <div>
            {#if item.link && item.id}
              <a href={getModuleLink(item.link)} target="_blank">
                {item.id}
              </a>
            {:else if item.bandName}
              <span class="font-bold">{item.bandName}</span>
            {/if}
          </div>

          <div>
            {#if item.invoicing !== undefined}
              <select disabled={readonly} on:change={(e) => setInvoicing(item.id, e.target.value === 'yes')}>
                <option value="yes" selected={item.invoicing}>Yes</option>
                <option value="no" selected={!item.invoicing}>No</option>
              </select>
            {/if}
          </div>

          <div class="text-center align-middle">
            {#if item.trial !== undefined}
              <TooltipDefinition tooltipText={item.trial ? 'Trial module ' : 'Not a trial module'} direction="top">
                {#if item.trial}
                  <Checkmark class="fill-ctip-success" />
                {:else}
                  <Close class="fill-ctip-danger" />
                {/if}
              </TooltipDefinition>
            {/if}
          </div>

          <div class:text-red-500={item.isModuleTotal && item.rootDomains > band?.bandValues?.rootDomains}>
            {item.rootDomains || '-'}
          </div>
          <div class:text-red-500={item.isModuleTotal && item.ips > band?.bandValues?.ips}>{item.ips || '-'}</div>
          <div class:text-red-500={item.isModuleTotal && item.keywords > band?.bandValues?.keywords}>
            {item.keywords || '-'}
          </div>
          <div class:text-red-500={item.isModuleTotal && item.binCodes > band?.bandValues?.binCodes}>
            {item.binCodes || '-'}
          </div>
          <div
            class:text-red-500={item.isModuleTotal && item.creditCardsPerYear > band?.bandValues?.creditCardsPerYear}
          >
            {item.creditCardsPerYear || '-'}
          </div>
          <div class:text-red-500={item.isModuleTotal && item.emails > band?.bandValues?.emails}>
            {item.emails || '-'}
          </div>
          <div class:text-red-500={item.isModuleTotal && item.employees > band?.bandValues?.employees}>
            {item.employees || '-'}
          </div>
          <div class:text-red-500={item.isModuleTotal && item.cpes > band?.bandValues?.cpes}>{item.cpes || '-'}</div>
          <div class:text-red-500={item.isModuleTotal && item.storage > band?.bandValues?.storage}>
            {item.storage || '-'}
          </div>
        </div>
      </VirtualList>
    </div>
  </div>
{:else}
  <EmptyData messageObj={{ msg: 'This customer has not created any module' }} />
{/if}

<style>
  .virtual-list-no-overflow :global(svelte-virtual-list-row) {
    overflow: visible;
  }
</style>
