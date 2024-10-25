<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import AdminDashboardToolbar from '$lib/components/layout/AdminDashboardToolbar.svelte';
  import AdminMenu from '$lib/components/layout/AdminMenu.svelte';
  import menuExpandedStore from '$stores/menuExpanded';
  import roleStore from '$stores/role';
  import {
    BareMetalServer,
    ChartClusterBar,
    Cloud,
    Filter,
    Folder,
    License,
    Network_2,
    Partnership,
    Plug,
    Rss,
    SettingsServices,
    TagGroup,
    ToolBox,
    User,
    Wifi
  } from 'carbon-icons-svelte';
  import type { MenuItem } from './types';

  const MENU: MenuItem[] = [
    {
      href: '/admin/orgs',
      icon: Network_2,
      name: 'ORGANIZATIONS',
      canAccess: () => $roleStore.master || $roleStore.superadmin || $roleStore.admin || $roleStore.analyst
    },
    {
      href: '/admin/users',
      icon: User,
      name: 'USERS',
      canAccess: () => $roleStore.master || $roleStore.superadmin || $roleStore.admin
    },
    {
      href: '/admin/online',
      icon: Wifi,
      name: 'ONLINE',
      canAccess: () => $roleStore.master || $roleStore.superadmin || $roleStore.admin
    },
    {
      href: '/admin/filters',
      icon: Filter,
      name: 'FILTERS TEMPLATE',
      canAccess: () => $roleStore.master || $roleStore.superadmin || $roleStore.admin
    },
    {
      href: '/admin/charts',
      icon: ChartClusterBar,
      name: 'CHARTS',
      canAccess: () => $roleStore.master || $roleStore.superadmin || $roleStore.admin
    },
    {
      href: '/admin/jobs',
      icon: ToolBox,
      name: 'JOBS',
      canAccess: () => $roleStore.master || $roleStore.superadmin
    },
    {
      href: '/admin/labels',
      icon: TagGroup,
      name: 'LABELS',
      canAccess: () => $roleStore.master || $roleStore.superadmin || $roleStore.admin
    },
    {
      href: '/admin/plugins',
      icon: Plug,
      name: 'PLUGINS',
      canAccess: () => $roleStore.master || $roleStore.superadmin
    },
    {
      href: '/admin/configuration-properties',
      icon: SettingsServices,
      name: 'CONFIGURATION PROPERTIES',
      canAccess: () => $roleStore.master || $roleStore.superadmin
    },
    {
      href: '/admin/logs',
      icon: License,
      name: 'LOGS',
      canAccess: () => $roleStore.master || $roleStore.superadmin || $roleStore.admin
    },
    {
      href: '/admin/catalog',
      icon: Folder,
      name: 'INCIDENTS CATALOG',
      canAccess: () => $roleStore.master || $roleStore.superadmin || $roleStore.admin
    },
    {
      href: '/admin/customers',
      icon: Partnership,
      name: 'CUSTOMERS',
      canAccess: () => $roleStore.master || $roleStore.superadmin
    },
    {
      href: '/admin/supportedTld',
      icon: Cloud,
      name: 'SUPPORTED TLD',
      canAccess: () => $roleStore.master || $roleStore.superadmin
    },
    {
      href: '/admin/rss',
      icon: Rss,
      name: 'RSS',
      canAccess: () => $roleStore.master || $roleStore.superadmin
    },
    {
      href: '/admin/systemInfo',
      icon: BareMetalServer,
      name: 'SYSTEM INFO',
      canAccess: () => $roleStore.master || $roleStore.superadmin
    }
  ];

  $: menuItems = MENU.filter((menuItem) => menuItem.canAccess());
  $: activeItem = MENU.find((menuItems) => $page.url.pathname.startsWith(menuItems.href));
  $: if (activeItem && !activeItem.canAccess()) goto('/admin');
</script>

<AdminDashboardToolbar />

<!--
  When all migrated to Angular:
    - Change AdminDashboardToolbar and AdminMenu from fixed to sticky
    - Remove dynamic classes class:[dynamic]={$menuExpandedStore} from here
-->

<div class="flex gap-4 mt-14" class:ml-[275px]={$menuExpandedStore} class:ml-[55px]={!$menuExpandedStore}>
  <AdminMenu {menuItems} />
  <div class="w-full p-4">
    <slot />
  </div>
</div>
