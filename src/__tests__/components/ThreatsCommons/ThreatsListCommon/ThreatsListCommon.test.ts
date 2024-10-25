// NOTE: jest-dom adds handy assertions to Jest and it is recommended, but not required.
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/svelte';
import { beforeEach, expect, test } from 'vitest';
import { initialize } from '$src/__tests__/testUtils';
import ThreatsListCommon from '$lib/components/ThreatsCommons/ThreatsListCommon/ThreatsListCommon.svelte';

beforeEach(() => {
  initialize();
});

test('Rendering component without data shows a message', () => {
  render(ThreatsListCommon, {});
  const noResources = screen.getByText('There are no resources');
  expect(noResources).toBeInTheDocument();
});

test('There is the export-all feature', async () => {
  render(ThreatsListCommon, {});
  const menu = screen.getByTestId('toolbar-menu');
  await fireEvent.click(menu);
  const exportAll = screen.getByText('Export All');
  expect(exportAll).toBeInTheDocument();
});

test('There is no menu in all threats', () => {
  render(ThreatsListCommon, { isAllThreats: true });
  expect(() => screen.getByTestId('toolbar-menu')).toThrow();
});
