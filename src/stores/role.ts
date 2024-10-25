import { derived } from 'svelte/store';
import { currentModuleId } from './module';
import { currentOrganizationId } from './organization';
import userStore from './user';

/**
 * TODO All roles
 */

const roleStore = derived([userStore, currentOrganizationId, currentModuleId], ([user, organizationId, moduleId]) => {
  const globalOperator: number[] = [];
  const globalAnalyst: number[] = [];
  const globalCustomer: number[] = [];
  const organizations: number[] = [];

  const operator: number[] = [];
  const analyst: number[] = [];
  const customer: number[] = [];
  const modules: number[] = [];

  if (user?.grants?.superSearchGrants) {
    for (const orgGrant of user.grants.superSearchGrants) {
      if (orgGrant.operator) globalOperator.push(orgGrant.itemId);
      if (orgGrant.analyst) globalAnalyst.push(orgGrant.itemId);
      if (orgGrant.mssp_customer) globalCustomer.push(orgGrant.itemId);
      organizations.push(orgGrant.itemId);

      for (const modGrant of orgGrant.reputationalSearchGrants) {
        if (modGrant.operator) operator.push(modGrant.itemId);
        if (modGrant.analyst) analyst.push(modGrant.itemId);
        if (modGrant.mssp_customer) customer.push(modGrant.itemId);
        modules.push(modGrant.itemId);
      }
    }
  }

  function isMaster() {
    return user?.grants?.master;
  }

  function isSuperAdmin() {
    return user?.grants?.superadmin;
  }

  function isAdminSuperAdmin() {
    return isSuperAdmin() || user?.grants?.mssp_admin;
  }

  function isCustomer(): boolean {
    return (
      (!isMaster() && !isAdminSuperAdmin() && globalCustomer.includes(organizationId)) || customer.includes(moduleId)
    );
  }

  function isOperator(): boolean {
    return (
      (!isMaster() && !isAdminSuperAdmin() && globalOperator.includes(organizationId)) || operator.includes(moduleId)
    );
  }

  function isAnalyst() {
    return (
      (!isMaster() && !isAdminSuperAdmin() && globalAnalyst.includes(organizationId)) || analyst.includes(moduleId)
    );
  }

  return {
    master: isMaster(),
    /** Is analyst in the current organization/module */
    analyst: isAnalyst(),
    /** Is operator in the current organization/module */
    operator: isOperator(),
    /** Is customer in the current organization/module */
    customer: isCustomer(),
    superadmin: user?.grants?.superadmin,
    admin: user?.grants?.mssp_admin,
    sales: user?.grants?.sales,
    trial: user?.grants?.trial,
    sessionTimeout: user?.sessionTimeout,
    customerId: user?.customerId,
    timezone: user?.timezone,
    globalAnalyst: globalAnalyst.includes(organizationId),
    globalOperator: globalOperator.includes(organizationId),
    globalCustomer: globalCustomer.includes(organizationId),
    grants: {
      globalOperator,
      globalAnalyst,
      globalCustomer,
      organizations,
      operator,
      analyst,
      customer,
      modules,
      isAnyModuleAnalyst: analyst.length || globalAnalyst.length
    }
  };
});

export default roleStore;
