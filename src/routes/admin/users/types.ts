export type Grant = {
  master: boolean;
  superadmin: boolean;
  mssp_admin: boolean;
  sales: boolean;
  superSearchGrants: OrganizationSearchGrant[];
};

export type OrganizationSearchGrant = {
  itemId: number;
  analyst: boolean;
  operator: boolean;
  mssp_customer: boolean;
  reputationalSearchGrants?: ModuleSearchGrant[];
};

export type ModuleSearchGrant = {
  itemId: number;
  analyst: boolean;
  operator: boolean;
  mssp_customer: boolean;
};
