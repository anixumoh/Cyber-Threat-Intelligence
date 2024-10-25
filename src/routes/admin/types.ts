import type { CarbonIcon } from 'carbon-icons-svelte';

export type MenuItem = {
  href: string;
  icon: typeof CarbonIcon;
  name: string;
  canAccess: () => boolean;
};
