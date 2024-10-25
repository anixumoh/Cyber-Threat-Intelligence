<script>
  import { Breadcrumb, BreadcrumbItem, OverflowMenu, OverflowMenuItem } from 'carbon-components-svelte';
  import { currentModuleId } from '$stores/module';
  import { currentOrganizationId } from '$stores/organization';
  import breadcrumbs from './breadcrumbs';
  import { page } from '$app/stores';

  $: breadcrumbs.reset('Threat Context', '');
</script>

<div class="relative">
  <Breadcrumb noTrailingSlash>
    {#if $breadcrumbs.length > 5}
      {#each $breadcrumbs.slice(0, 2) as breadcrumb}
        {@const href = `/dashboard/organizations/${$currentOrganizationId}/modules/${$currentModuleId}/tcx${breadcrumb.url}`}
        <BreadcrumbItem {href}>
          {breadcrumb.name}
        </BreadcrumbItem>
      {/each}

      <BreadcrumbItem>
        <OverflowMenu>
          {#each $breadcrumbs.slice(2, -2) as breadcrumb}
            {@const href = `/dashboard/organizations/${$currentOrganizationId}/modules/${$currentModuleId}/tcx${breadcrumb.url}`}
            <OverflowMenuItem {href} text={breadcrumb.name} />
          {/each}
        </OverflowMenu>
      </BreadcrumbItem>

      {#each $breadcrumbs.slice(-2) as breadcrumb}
        {@const href = `/dashboard/organizations/${$currentOrganizationId}/modules/${$currentModuleId}/tcx${breadcrumb.url}`}
        {@const isCurrentPage = href === $page.url.pathname}
        <BreadcrumbItem {isCurrentPage} {href}>
          {breadcrumb.name}
        </BreadcrumbItem>
      {/each}
    {:else}
      {#each $breadcrumbs as breadcrumb}
        {@const href = `/dashboard/organizations/${$currentOrganizationId}/modules/${$currentModuleId}/tcx${breadcrumb.url}`}
        {@const isCurrentPage = href === $page.url.pathname}
        <BreadcrumbItem {isCurrentPage} {href}>
          {breadcrumb.name}
        </BreadcrumbItem>
      {/each}
    {/if}
  </Breadcrumb>

  <div class="pt-2">
    <slot />
  </div>
</div>
