<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import NotificationWrapper from '$lib/components/NotificationWrapper.svelte';
  import TimeOut from '$lib/components/TimeOut.svelte';
  import DashboardToolbar from '$lib/components/layout/DashboardToolbar.svelte';
  import SidebarMenu from '$lib/components/layout/SidebarMenu.svelte';
  import { setRootColors } from '$lib/constants/colors';
  import { darkToken, tokens } from '$lib/constants/theme';
  import { ANGULAR_APP_ID, safeSendEvent, sendEvent, setReady } from '$lib/utils/angularCommunication';
  import { customAssets } from '$lib/utils/customizations';
  import logout from '$lib/utils/logout';
  import angular404 from '$stores/angular404';
  import angularIsLoading from '$stores/angularIsLoading';
  import contentAlertStore from '$stores/contentAlert';
  import darkMode from '$stores/darkMode';
  import { currentModuleId, moduleCacheStore } from '$stores/module';
  import { currentOrganizationId, organizationsStore } from '$stores/organization';
  import preferencesStore from '$stores/preferences';
  import tokenStore from '$stores/token';
  import userStore from '$stores/user';
  import axios from 'axios';
  import { Loading, Theme } from 'carbon-components-svelte';
  import 'carbon-components-svelte/css/all.css';
  import { onMount } from 'svelte';
  import '../api-client.ts';
  import '../app.css';
  import '../setupDayJS.ts';
  import ExternalLinkWarning from './ExternalLinkWarning.svelte';
  import ReleaseNotes from './ReleaseNotes.svelte';
  import getSession from './getSession';
  import ALLOWED_ROUTES_WITHOUT_LOGIN from './non-auth-routes';

  const checkTimeoutMs = 10_000;
  let timeout = false;
  let prevent = false;
  let loading = true;
  let interval;
  let favicon: string;
  let title: string;

  $: inAdmin = $page.url.pathname.startsWith('/admin');
  $: inDashboard = $userStore && !ALLOWED_ROUTES_WITHOUT_LOGIN.includes($page.url.pathname) && !inAdmin;
  $: browser && $page && onPageChange();
  $: inProfile = $page.url.pathname.startsWith('/profile');
  $: browser && $currentOrganizationId && contentAlertStore.getAlertContent($currentOrganizationId);

  onMount(() => {
    const origin = window.__env.origin;
    title = customAssets[origin] ? customAssets[origin].title : customAssets.default.title;
    favicon = customAssets[origin] ? customAssets[origin].favicon : customAssets.default.favicon;

    init();
    // Sync angular-svelte, so we can use safeSendEvent //
    setRootColors();
    document.addEventListener('angular-ready', handleAngularReady, { once: true });
    safeSendEvent('svelte-ready');
    interval = setInterval(() => {
      sendEvent('svelte-ping');
    }, 100);
    ///////////////////////////////////////////////////

    // There are lot of angular empty a tags
    // that are used just to handle click
    // Svelte will try to goto /
    // So we prevent that behaviour on empty a elements inside angular-app
    // Example: (table pagination)
    const angularApp = document.getElementById(ANGULAR_APP_ID);
    angularApp.addEventListener('click', handleClickLink);

    // Communication events between apps
    document.addEventListener('angular-navigation-end', handleAngularNavigationEnd);
    document.addEventListener('angular-not-found', handleAngularNotFound);
    document.addEventListener('angular-found', handleAngularFound);
    document.addEventListener('angular-route-loaded', handleAngularLoaded);
    document.addEventListener('logout', logout);
    document.addEventListener('refresh-organization', organizationsStore.reset);
    document.addEventListener('refresh-modules', moduleCacheStore.reset);
    window.addEventListener('popstate', handleHistoryChange);
    return () => {
      angularApp.removeEventListener('click', handleClickLink);
      document.removeEventListener('angular-ready', handleAngularReady);
      document.removeEventListener('angular-navigation-end', handleAngularNavigationEnd);
      document.removeEventListener('angular-not-found', handleAngularNotFound);
      document.removeEventListener('angular-found', handleAngularFound);
      document.removeEventListener('angular-route-loaded', handleAngularLoaded);
      document.removeEventListener('logout', logout);
      document.removeEventListener('refresh-organization', organizationsStore.reset);
      document.removeEventListener('refresh-modules', moduleCacheStore.reset);
      window.removeEventListener('popstate', handleHistoryChange);
      clearInterval(interval);
    };
  });

  function handleClickLink(e: PointerEvent) {
    const target = e?.target as HTMLElement;
    const anchor = target.closest('a') || target.querySelector('a');
    if (anchor && !anchor.href) {
      e.preventDefault();
    }
  }

  async function check() {
    const url = '/api/v2/health_check';
    try {
      await axios.get(url, { timeout: checkTimeoutMs });
    } catch (error) {
      return false;
    }
    return true;
  }

  async function init() {
    const response = await check();
    if (!response) {
      timeout = true;
      return;
    }
    loading = true;
    try {
      const session = await getSession();

      $userStore = session.user;
      $tokenStore = session.token;
      $organizationsStore = session.organizations;
      $currentOrganizationId = session.organizationId;
      $moduleCacheStore = {
        [session.organizationId]: session.modules
      };
      $currentModuleId = session.moduleId;
      $preferencesStore = session.preferences;

      if (session.timeout) {
        timeout = true;
      }
    } finally {
      loading = false;
    }
  }

  function handleAngularReady() {
    setReady();
    clearInterval(interval);
  }

  function handleHistoryChange(event: PopStateEvent) {
    // Handle angular -> svelte navigation on history.back, not handling correct route

    // if (is history.back)
    if (!event.state || event.state.navigationId) {
      if (event?.target?.location?.href) {
        goto(event.target.location.href, { replaceState: true });
      }
    }
  }

  async function onPageChange() {
    if ($page?.route?.id?.includes('[...catchall]') && !prevent) {
      // Send route to Angular
      $angularIsLoading = true;
      safeSendEvent('svelteNavitagionEnd', { url: $page.url.pathname + $page.url.search + $page.url.hash });
    }
  }

  async function handleAngularNavigationEnd(event: CustomEvent) {
    prevent = true;
    if ($page.url.pathname !== event.detail.url) {
      await goto(event.detail.url, { replaceState: true });
    }
    prevent = false;
  }

  function handleAngularNotFound() {
    $angular404 = true;
  }

  function handleAngularFound() {
    $angular404 = false;
  }

  function handleAngularLoaded() {
    $angularIsLoading = false;
  }
</script>

<svelte:head>
  {#if favicon}
    <link rel="icon" type="image/x-icon" href="/assets/favicon/{favicon}" />
  {/if}
  {#if title}
    <title>{title}</title>
  {/if}
</svelte:head>

<Theme theme={$darkMode ? 'g90' : 'white'} tokens={$darkMode ? darkToken : tokens} />
<NotificationWrapper />
<ExternalLinkWarning />

<!-- Elements could be moved here by src/lib/actions/modalTeleport.ts -->
<div id="modalTeleport" />

{#if timeout}
  <TimeOut />
{:else if loading}
  <Loading />
{:else}
  <div class:hidden={!inDashboard}>
    <DashboardToolbar on:logout={logout} />
    <SidebarMenu />
  </div>
  <slot />
  {#if inDashboard}
    <ReleaseNotes />
  {/if}
{/if}
