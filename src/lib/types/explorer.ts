import type { SortType } from '.';

export type FilterExplorerType = {
  page: number;
  maxRows: number;
  sortKey: 'scoring' | 'publishedAt';
  sortDirection: SortType;
  read: any;
  q: string;
  selectedTerms: number[];
  selectedRisk: number[];
  startScore: number;
  endScore: number;
  since?: Date;
  to?: Date;
  sinceToShow?: string;
  toToShow?: string;
  sort?: boolean;
  labels: number[];
  labelsAnd: number[];
  excludeLabels: number[];
};

export type GetCVEFilters = {
  page: number;
  maxRows: number;
  sort?: boolean;
  read: 0 | 1 | 2;
  o?: 'scoring' | 'publishedAt';
  q?: string;
  terms?: string; //id,id
  priority?: string; //id,id
  startScore?: number;
  endScore?: number;
  since?: number;
  to?: number;
  labels?: string;
  labelsAnd?: string;
  excludeLabels?: string;
};
