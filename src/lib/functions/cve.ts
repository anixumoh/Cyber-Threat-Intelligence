/**
 * Read:
 * All - 0
 * Read - 1
 * Not Read - 2
 */
export function checkHasFilters(read: number, selectedTerms: number[], selectedRisk: number[]) {
  return !!(read || selectedTerms?.length || selectedRisk?.length);
}
