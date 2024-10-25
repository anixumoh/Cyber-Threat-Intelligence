import { checkHasFilters } from '$lib/functions/cve'; // we will fix to $lib/functions/sve
import { it, expect } from 'vitest';

it('check has filter width All read and not read', () => {
  const result = checkHasFilters(1, [], []);
  expect(result).toBeTruthy();
});

it('check hasn`t filter ', () => {
  const result = checkHasFilters(0, [], []);
  expect(result).toBeFalsy();
});
