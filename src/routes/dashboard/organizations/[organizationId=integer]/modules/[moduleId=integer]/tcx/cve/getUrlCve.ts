import { currentModuleId } from '$stores/module';
import { currentOrganizationId } from '$stores/organization';
import { get } from 'svelte/store';
import type { CVESearchParams } from './cvePaginationStore';

export default function getUrlCVE(cve: string, searchParams: CVESearchParams) {
  const params: Record<string, any> = {
    page: searchParams?.page || 1,
    pageSize: searchParams?.pageSize || 10
  };
  if (searchParams.dork) params.dork = searchParams.dork;
  if (searchParams.sortKey && searchParams.sortDirection) {
    params.sortKey = searchParams.sortKey;
    params.sortDirection = searchParams.sortDirection;
  }
  const queryParams = new URLSearchParams(params);

  const orgId = get(currentOrganizationId);
  const modId = get(currentModuleId);

  return `/dashboard/organizations/${orgId}/modules/${modId}/tcx/cve/${cve}?${queryParams}`;
}
