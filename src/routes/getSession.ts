import type Organization from '$lib/types/organization';
import type User from '$lib/types/user';
import type Module from '$lib/types/module';
import { getModuleTypeName } from '$lib/utils';
import logout from '$lib/utils/logout';
import type { PreferencesType } from '$stores/preferences';
import ALLOWED_ROUTES_WITHOUT_LOGIN from './non-auth-routes';
import { goto } from '$app/navigation';
import { page } from '$app/stores';
import { get } from 'svelte/store';

export default async function getSession() {
  const pathname = window.location.pathname;
  const allowedRouteWithoutLogin = ALLOWED_ROUTES_WITHOUT_LOGIN.includes(pathname);

  if (allowedRouteWithoutLogin) {
    return {};
  }

  const data = await fetchSession();

  if (data.timeout) return data;

  if (data?.user && !data?.user?.licenseAccepted) {
    await goto('/privacityTerms');
    throw new Error('Licence not accepted');
  }

  if (!data.user) {
    await logout();
    throw Error('Not loggued in');
  }

  return data;
}

async function fetchServer(url: string, timeout = 30_000) {
  const controller = new AbortController();
  const abort = setTimeout(() => controller.abort(), timeout);
  const token = localStorage.getItem('TOKEN');

  const headers = {
    'x-cookie': token
  };

  const response = await fetch(url, {
    headers,
    signal: controller.signal,
    credentials: 'include'
  });

  clearTimeout(abort);
  return response;
}

async function getUser(): Promise<User> {
  try {
    const response = await fetchServer('/api/v2/user/account?extraFields=true');
    if (response.status >= 500) {
      throw new Error('server-error');
    }
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    if (error.name === 'AbortError' || error.message === 'server-error') {
      throw error;
    }
    // When we have no user for any reason that is not a server error
    // 401, not json, etc... we won't show the timeout page
    // We only will show timeout if is a 500+ or timeout
    throw new Error('no-user');
  }
}

async function getOrganizations(): Promise<Organization[]> {
  const response = await fetchServer('/api/v2/organization');
  const organizations: Organization[] = await response.json();
  return organizations;
}

async function getModules(organizationId: number): Promise<Module[]> {
  const response = await fetchServer(`/api/v2/organization/${organizationId}/module`);
  const modules = await response.json();
  return modules.map((mod) => ({
    ...mod,
    moduleName: getModuleTypeName(mod)
  }));
}

async function loadPreferences(): Promise<PreferencesType> {
  const url = '/api/v2/user/preferences';
  const response = await fetchServer(url);
  const preferences = await response.json();
  return preferences;
}

function getIdOrFirst(things: (Organization | Module)[], expectedId: number): number {
  if (things.length) {
    if (expectedId) {
      const thing = things.find((item) => item.id === expectedId);
      if (thing) return thing.id;
    }
    const firstEnabledIndex = things.findIndex((item) => item.enabled);
    return things[firstEnabledIndex !== -1 ? firstEnabledIndex : 0].id;
  }
  return null;
}

async function fetchSession() {
  let token = localStorage.getItem('TOKEN');
  if (!token) return {};

  const p = get(page);
  let timeout = false;
  let user: User;
  let preferences: PreferencesType;
  let organizations: Organization[] = [];
  let modules: Module[] = [];

  let organizationId = +p.params.organizationId || null;
  let moduleId = +p.params.moduleId || null;

  try {
    user = await getUser();
    if (!user) return {};
    if (!user.licenseAccepted) {
      return { user };
    }
    [organizations, preferences] = await Promise.all([getOrganizations(), loadPreferences()]);

    organizationId = getIdOrFirst(organizations, organizationId);

    if (organizationId) {
      modules = await getModules(organizationId);
      moduleId = getIdOrFirst(modules, moduleId);
    }
  } catch (error) {
    console.error('ERROR:', error);
    timeout = error.message !== 'no-user';
    token = null;
  }

  if (timeout) return { timeout };
  return {
    user,
    token,
    organizations,
    organizationId,
    modules,
    moduleId,
    preferences,
    timeout
  };
}
