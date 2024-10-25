import type { Actor, Campaign, Tool } from '$lib/client/services/actors';

export type TCXSearch = TCXSimpleSearch | TCXAdvancedSearch;

export type TCXSimpleSearch = {
  type: 'simple';
  name: string;
  search: {
    actorsByName: Actor[];
    regions: string[];
    industries: string[];
    campaignsByName: Campaign[];
    toolsByName: Tool[];
    platforms: string[];
  };
};

export type TCXAdvancedSearch = {
  type: 'advanced';
  value: string;
  name: string;
};
