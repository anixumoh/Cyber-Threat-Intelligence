import type { Unsubscriber } from 'svelte/store';
import { browser } from '$app/environment';
import angularIsLoading from '$stores/angularIsLoading';

export const ANGULAR_APP_ID = 'angular-app';

let angularAppDiv: HTMLDivElement;

if (browser) {
  angularAppDiv = document.getElementById(ANGULAR_APP_ID) as HTMLDivElement;
}

let setReady: (value?: unknown) => void;
const isReady = new Promise((resolve) => {
  setReady = resolve;
});

function sendEvent<T>(type: string, detail?: T) {
  const e = new CustomEvent(type, { detail });
  document.dispatchEvent(e);
}

async function safeSendEvent<T>(type: string, detail?: T) {
  await isReady;
  sendEvent<T>(type, detail);
}

function showSvelte() {
  angularAppDiv.style.display = 'none';
}

async function waitAngularIsLoaded() {
  return new Promise<void>((resolve) => {
    let unsubscribe: Unsubscriber;
    // eslint-disable-next-line prefer-const
    unsubscribe = angularIsLoading.subscribe((isLoading) => {
      if (!isLoading) {
        unsubscribe?.();
        resolve();
      }
    });
  });
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function showAngular() {
  // Wait until angular is stop loading, or few seconds at most
  await Promise.race([sleep(3000), waitAngularIsLoaded()]);
  angularAppDiv.style.display = 'block';
}

export { setReady, sendEvent, safeSendEvent, showSvelte, showAngular };
