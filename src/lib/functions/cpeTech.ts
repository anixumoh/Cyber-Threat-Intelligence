import type { ComboBoxItem } from 'carbon-components-svelte/types/ComboBox/ComboBox.svelte';

type ArgumentTypes<F extends Function> = F extends (...args: infer A) => any ? A : never;

export const itemsLoading: ComboBoxItem[] = [{ id: '-', text: 'Loading...', disabled: true }];
export const itemsNoResults: ComboBoxItem[] = [{ id: 'no-items', text: 'No results', disabled: true }];

export function createDebounceSearch<F extends Function>(callback: F, ms: number, init?: Function) {
  let timeout: NodeJS.Timeout;
  return (...args: ArgumentTypes<F>) => {
    init?.();
    clearTimeout(timeout);
    timeout = setTimeout(() => callback(...args), ms);
  };
}

export function handleItems(items: ComboBoxItem[], isLoading: boolean, input: string) {
  if (isLoading) return itemsLoading;
  if (input && !items.length) return itemsNoResults;
  return items;
}
