import type { MultiSelectItem } from 'carbon-components-svelte/types/MultiSelect/MultiSelect.svelte';

export default function getMultiselectLabel(items: MultiSelectItem[], selectedIds: any[], placeholder: string) {
  if (!selectedIds?.length) return placeholder;
  const itemStrings = selectedIds?.map((id) => items.find((it) => it.id === id)?.text || '').filter(Boolean);
  return itemStrings?.join(', ');
}
