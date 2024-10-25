import { Injectable } from '@angular/core';
import * as _ from 'lodash';

@Injectable()
export class AccountFactory {
  deleteState(dataSet, context) {
    const organizationId = context.currentOrganization.id;
    const moduleId = context.currentModule.id;
    const state = JSON.parse(JSON.stringify(dataSet));
    if (_.has(state.modules, [organizationId, moduleId])) {
      if (state.modules[organizationId][moduleId].filters) {
        for (const key of Object.keys(state.modules[organizationId][moduleId].filters)) {
          if (key !== 'byDate') {
            delete state.modules[organizationId][moduleId].filters[key];
          }
        }
      }
    }
    return state;
  }

  setRoles(dataSet, user) {
    if (!dataSet) {
      const orgGrants = user.grants.superSearchGrantsMap;
      const organizations = Object.keys(orgGrants);
      let grants = [];
      const globalOrgs = [];
      organizations.forEach((org) => {
        globalOrgs.push(orgGrants[org]);
        grants = grants.concat(orgGrants[org].reputationalSearchGrants);
      });
      const roleList = {
        master: user.grants.master,
        superadmin: user.grants.superadmin,
        admin: user.grants.mssp_admin,
        sales: user.grants.sales,
        trial: user.grants.trial,
        sessionTimeout: user.sessionTimeout,
        customerId: user.customerId,
        timezone: user.timezone,
        grants: {
          operator: grants
            .map((g) => {
              if (g.operator) {
                return g.itemId;
              }
            })
            .filter((g) => g),
          analyst: grants
            .map((g) => {
              if (g.analyst) {
                return g.itemId;
              }
            })
            .filter((g) => g),
          customer: grants
            .map((g) => {
              if (g.mssp_customer) {
                return g.itemId;
              }
            })
            .filter((g) => g),
          modules: grants
            .map((g) => {
              return g.itemId;
            })
            .filter((g) => g),
          organizations: organizations,
          globalAnalyst: this.getGlobalOrganizations(globalOrgs, 'analyst'),
          globalOperator: this.getGlobalOrganizations(globalOrgs, 'operator'),
          globalCustomer: this.getGlobalOrganizations(globalOrgs, 'mssp_customer')
        }
      };
      return roleList;
    } else {
      return dataSet;
    }
  }

  getGlobalOrganizations(organizations, role) {
    return organizations
      .map((org) => {
        if (org[role]) {
          return org.itemId;
        }
      })
      .filter((org) => org);
  }

  newModule(dataSet, module) {
    dataSet.grants.modules.push(module.id);
    return dataSet;
  }
}
