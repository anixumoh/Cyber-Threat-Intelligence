import type { TCXOptions } from '$lib/types/tcx';
import { expect, it } from 'vitest';
import { dorkFiltersToDork, dorkToDorkFilters, type DorkFilter } from './utils';

const tcxOptions: TCXOptions = {
  allowed_methods: [],
  description: '',
  name: '',
  parses: [],
  renders: [],
  dork_fields: {
    active: {
      description: '',
      type: 'Boolean'
    },
    name: {
      description: '',
      type: 'String'
    },
    score: {
      description: '',
      type: 'Integer'
    }
  }
};

it('simple check "active:1"', () => {
  const result = dorkToDorkFilters('active:1', tcxOptions);
  const expected: DorkFilter[] = [{ field: 'active', operator: '=', value: '1' }];
  expect(result).toEqual(expected);
});

it('Simple check "active: 1" with space', () => {
  const result = dorkToDorkFilters('active: 1', tcxOptions);
  const expected: DorkFilter[] = [{ field: 'active', operator: '=', value: '1' }];
  expect(result).toEqual(expected);
});

it('Simple check "name: "Jordi"" with space', () => {
  const result = dorkToDorkFilters('name:"Jordi"', tcxOptions);
  const expected: DorkFilter[] = [{ field: 'name', operator: '=', value: 'Jordi' }];
  expect(result).toEqual(expected);
});

it('Contains check "name:~"Jordi""', () => {
  const result = dorkToDorkFilters('name:~"Jordi"', tcxOptions);
  const expected: DorkFilter[] = [{ field: 'name', operator: '~', value: 'Jordi' }];
  expect(result).toEqual(expected);
});

it('Score greater than "score:>10', () => {
  const result = dorkToDorkFilters('score:>10', tcxOptions);
  const expected: DorkFilter[] = [{ field: 'score', operator: '>', value: 10 }];
  expect(result).toEqual(expected);
});

it('Score less than or equal "score:<= 22', () => {
  const result = dorkToDorkFilters('score:<= 22', tcxOptions);
  const expected: DorkFilter[] = [{ field: 'score', operator: '<=', value: 22 }];
  expect(result).toEqual(expected);
});

it('Non existing field "nonexisting:1" returns empty array', () => {
  const result = dorkToDorkFilters('nonexisting:1', tcxOptions);
  const expected: DorkFilter[] = [];
  expect(result).toEqual(expected);
});

it('Test AND unions "name:~"Jordi" AND score:>5"', () => {
  const result = dorkToDorkFilters('name:~"Jordi" AND score:>5', tcxOptions);
  const expected: DorkFilter[] = [
    { field: 'name', operator: '~', value: 'Jordi' },
    { aggregator: 'AND', field: 'score', operator: '>', value: 5 }
  ];
  expect(result).toEqual(expected);
});

it('Mix AND and OR', () => {
  const result = dorkToDorkFilters('name:~"12" AND name:~"CVE" OR score:>5', tcxOptions);
  const expected: DorkFilter[] = [
    { field: 'name', operator: '~', value: '12' },
    { aggregator: 'AND', field: 'name', operator: '~', value: 'CVE' },
    { aggregator: 'OR', field: 'score', operator: '>', value: 5 }
  ];
  expect(result).toEqual(expected);
});

it('DorksFitlers to string with mixed results', () => {
  const filters: DorkFilter[] = [
    { field: 'name', operator: '~', value: '12' },
    { aggregator: 'AND', field: 'name', operator: '~', value: 'CVE' },
    { aggregator: 'OR', field: 'score', operator: '>', value: 5 }
  ];
  const result = dorkFiltersToDork(filters, tcxOptions);
  const expected = 'name:~"12" AND name:~"CVE" OR score:>5';
  expect(result).toEqual(expected);
});
