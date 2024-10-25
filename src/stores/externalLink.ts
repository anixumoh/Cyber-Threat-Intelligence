import { writable } from 'svelte/store';

function createExternalLinkStore() {
  const store = writable<string>();

  function handleClick(e: MouseEvent) {
    e.preventDefault();
    const target = e?.target as HTMLElement;
    const anchor = target.closest('a') || target.querySelector('a');
    if (anchor?.href) {
      store.set(anchor.href);
    }
  }

  return { ...store, handleClick };
}

const externalLinkStore = createExternalLinkStore();
export default externalLinkStore;
