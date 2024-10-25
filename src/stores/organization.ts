import type Organization from '$lib/types/organization';
import axios from 'axios';
import { derived, writable, get } from 'svelte/store';

function createOrganizationStore() {
  const store = writable<Organization[]>();
  async function reset() {
    await fetchOrganizations();
  }

  async function fetchOrganizations() {
    const url = '/api/v2/organization';
    const res = await axios.get<Organization[]>(url);
    store.set(res.data ?? []);
  }

  async function editOrgInfo(orgData) {
    try {
      isLoadingOrg.set(true);
      Object.keys(orgData).forEach((key) => {
        if (orgData[key] === '') {
          delete orgData[key];
        }
      });
      const url = '/api/v2/organization/' + get(orgToEdit).id;
      const contact = {
        firstContact: {
          title: orgData.title,
          firstName: orgData.firstName,
          lastName: orgData.surname,
          phone: orgData.phone,
          email: orgData.email,
          country: orgData.country
        }
      };
      await axios.put<Organization>(url, {
        userWorkedOn: orgData.userWorkedOnLevel,
        enabledMfa: orgData.twoFA,
        trial: orgData.trial,
        enabled: orgData.enabled,
        name: orgData.name,
        customerId: orgData.customerId,
        contact
      });
      await loadOrgInfoForEdit(get(orgToEdit).id);
    } finally {
      isLoadingOrg.set(false);
    }
  }
  async function loadOrgInfoForEdit(orgId: number) {
    isLoadingOrg.set(true);
    const url = '/api/v2/organization/' + orgId + '?extraFields=true';
    const res = await axios.get<Organization>(url);

    if (res.status === 200) {
      orgToEdit.set(res.data);
      store.update((orgs) => {
        const index = orgs.findIndex((org) => org.id === orgId);
        orgs[index] = res.data;
        return orgs;
      });
    }
    isLoadingOrg.set(false);
  }

  return {
    ...store,
    loadOrgInfoForEdit,
    editOrgInfo,
    reset
  };
}

export const organizationsStore = createOrganizationStore();
export const currentOrganizationId = writable<number>();
export const orgToEdit = writable<Organization>();
export const isLoadingOrg = writable<boolean>();

export const currentOrganization = derived(
  [organizationsStore, currentOrganizationId],
  ([$organizationsStore, $currentOrganizationId]) =>
    $organizationsStore?.find((org) => org.id === $currentOrganizationId)
);
