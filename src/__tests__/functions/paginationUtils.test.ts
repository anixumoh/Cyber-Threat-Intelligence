import { getPaginationInfo } from '$lib/functions/paginationUtils';
import { expect, it } from 'vitest';

it('Check has no previous page when index = 0 and current page = 1', () => {
  const currentPage = 1;
  const totalPages = 10;
  const currentIndex = 0;
  const pageSize = 10;

  const result = getPaginationInfo(currentPage, totalPages, currentIndex, pageSize);
  expect(result.next).toBe(true);
  expect(result.previous).toBe(false);
  expect(result.previousPage).toBe(currentPage);
  expect(result.nextPage).toBe(currentPage);
  expect(result.nextIndex).toBe(1);
  expect(result.previousIndex).toBe(-1);
});

it('Check has no next page when index is last and current page is last', () => {
  const currentPage = 10;
  const totalPages = 10;
  const currentIndex = 9;
  const pageSize = 10;

  const result = getPaginationInfo(currentPage, totalPages, currentIndex, pageSize);
  expect(result.next).toBe(false);
  expect(result.previous).toBe(true);
  expect(result.previousPage).toBe(currentPage);
  expect(result.nextPage).toBe(currentPage);
  expect(result.nextIndex).toBe(currentIndex + 1);
  expect(result.previousIndex).toBe(currentIndex - 1);
});

it('Check it has to go to previous page because page is 2 and index is 0', () => {
  const currentPage = 2;
  const totalPages = 10;
  const currentIndex = 0;
  const pageSize = 10;

  const result = getPaginationInfo(currentPage, totalPages, currentIndex, pageSize);
  expect(result.next).toBe(true);
  expect(result.previous).toBe(true);
  expect(result.previousPage).toBe(currentPage - 1);
  expect(result.nextPage).toBe(currentPage);
  expect(result.nextIndex).toBe(currentIndex + 1);
  expect(result.previousIndex).toBe(pageSize - 1);
});

it('Check it has to go to next page because page is 2 and index is last', () => {
  const currentPage = 2;
  const totalPages = 10;
  const currentIndex = 9;
  const pageSize = 10;

  const result = getPaginationInfo(currentPage, totalPages, currentIndex, pageSize);
  expect(result.next).toBe(true);
  expect(result.previous).toBe(true);
  expect(result.previousPage).toBe(currentPage);
  expect(result.nextPage).toBe(currentPage + 1);
  expect(result.nextIndex).toBe(0);
  expect(result.previousIndex).toBe(currentIndex - 1);
});
