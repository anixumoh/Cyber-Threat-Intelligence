import type { ComboBoxItem } from 'carbon-components-svelte/types/ComboBox/ComboBox.svelte';

export default function shouldFilterItem(item: ComboBoxItem, value: string) {
  if (!value) return true;
  return item.text.toLowerCase().includes(value.toLowerCase());
}
