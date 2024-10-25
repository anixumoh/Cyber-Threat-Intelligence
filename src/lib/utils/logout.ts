import { goto } from '$app/navigation';
import { currentModuleId, moduleCacheStore } from '$stores/module';
import { currentOrganizationId, organizationsStore } from '$stores/organization';
import preferencesStore from '$stores/preferences';
import tokenStore from '$stores/token';
import userStore from '$stores/user';
import axios from 'axios';
import { safeSendEvent } from './angularCommunication';

let loggingOut = false;

async function logout() {
  localStorage.removeItem('TOKEN');
  if (loggingOut) return;
  loggingOut = true;

  userStore.set(null);

  await goto('/login');
  organizationsStore.set(null);
  currentOrganizationId.set(null);
  moduleCacheStore.set({});
  currentModuleId.set(null);
  preferencesStore.set(null);
  await safeSendEvent('svelte-logout');
  try {
    await axios.get('/api/v2/logout');
  } catch (e) {
    console.error(e);
  }
  tokenStore.set(null);
  loggingOut = false;
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

export default logout;
