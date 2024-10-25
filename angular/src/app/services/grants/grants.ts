import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

import { Store } from 'app/services/store/store';
import { OrganizationService } from 'app/dashboard/organization/organization.service';

@Injectable()
export class Grants {
  allowedOrganizations: any[];
  organizations: any;
  modules: any;
  roles: any;
  activeOrganization: any;
  activeModule: any;
  allowedOrganizations$: Observable<any>;
  grants$: Observable<any>;
  organizationSetted$: Observable<any>;
  private organizationSettedSubject: BehaviorSubject<any>;
  private grantsSubject: BehaviorSubject<any>;
  private allowedOrganizationsSubject: BehaviorSubject<any>;

  constructor(private store: Store, private organizationService: OrganizationService) {
    this.grantsSubject = new BehaviorSubject<any>(null);
    this.grants$ = this.grantsSubject.asObservable();

    this.organizationSettedSubject = new BehaviorSubject<any>(false);
    this.organizationSetted$ = this.organizationSettedSubject.asObservable();

    this.allowedOrganizationsSubject = new BehaviorSubject<any>(null);
    this.allowedOrganizations$ = this.allowedOrganizationsSubject.asObservable();

    this.store.select('roleList').subscribe((roles) => {
      this.roles = roles;
      this.grantsSubject.next(true);
      if (this.isAllowedOrganizationsDeclared()) {
        this.allowedOrganizationsSubject.next(true);
      }
    });

    this.organizationService.getCurrentContext().subscribe((context) => {
      if (context.currentOrganization && (!context.currentModule || !context.currentModule.id)) {
        this.activeOrganization = context.currentOrganization;
        this.organizationSettedSubject.next(true);
        if (this.isPartialDeclared()) {
          this.grantsSubject.next(true);
        }
      } else if (context.currentOrganization && context.currentModule && context.currentModule.id) {
        this.activeOrganization = context.currentOrganization;
        this.activeModule = context.currentModule;
      }
    });

    this.organizationService
      .getCurrentModules()
      .pipe(filter(Boolean))
      .subscribe((res) => {
        this.modules = res;
        if (this.isPartialDeclared()) {
          this.grantsSubject.next(true);
        }
      });

    this.organizationService
      .getOrganizations()
      .pipe(filter(Boolean))
      .subscribe((res) => {
        this.organizations = res;
        if (this.isAllowedOrganizationsDeclared()) {
          this.allowedOrganizationsSubject.next(true);
        }
      });
  }

  getGrantsSubject(): Observable<any> {
    return this.grants$;
  }

  getAllowedOrganizationsSubject(): Observable<any> {
    return this.allowedOrganizations$;
  }

  isAllowedOrganizationsDeclared() {
    return this.roles && this.organizations && this.organizations.length > 0;
  }

  isPartialDeclared() {
    return this.activeOrganization && this.roles && this.modules;
  }

  isAllDeclared() {
    return this.activeOrganization && this.activeModule && this.roles && this.modules;
  }

  setOrganizationExists(orgId) {
    return (
      this.isAllowedOrganizationsDeclared() &&
      this.organizations.find((organization) => {
        return organization.id === orgId;
      })
    );
  }

  setAllowedOrganization(orgId) {
    return (
      this.isAllowedOrganizationsDeclared() &&
      (this.roles.master || this.roles.admin || this.roles.superadmin || this.roles.trial
        ? true
        : this.roles.grants.organizations.indexOf(orgId) >= 0)
    );
  }

  isAnalyst() {
    if (this.isAllDeclared()) {
      const grs = this.roles?.grants;
      const mId = this.activeModule.id;
      return (
        !this.isMaster() && !this.isAdminSuperAdmin() && (this.isModuleAnalyst(mId, grs) || this.isGlobalAnalyst())
      );
    } else {
      return false;
    }
  }

  isModuleAnalyst(moduleId: number, grants: any) {
    return grants?.analyst.indexOf(moduleId) >= 0;
  }

  isGlobalAnalyst() {
    if (this.activeOrganization) {
      const grants = this?.roles?.grants;
      const orgId = this.activeOrganization.id;

      return grants?.globalAnalyst?.indexOf?.(orgId) >= 0;
    } else {
      return false;
    }
  }

  isAnyModuleAnalyst() {
    const grants = this.roles.grants;
    return grants?.analyst.length > 0 || grants.globalAnalyst.length > 0;
  }

  isCustomerOrOperator() {
    return this.isCustomer() || this.isOperator();
  }

  isAnalystOrOperator() {
    return this.isAnalyst() || this.isOperator();
  }

  isAnalystOrCustomerOrOperator() {
    return this.isAnalyst() || this.isOperator() || this.isCustomer();
  }

  isOperator() {
    if (this.isAllDeclared()) {
      const grs = this.roles.grants;
      const mId = this.activeModule.id;
      const orgId = this.activeOrganization.id;
      return (
        !this.isMaster() &&
        !this.isAdminSuperAdmin() &&
        !this.isAnalyst() &&
        (grs.operator.indexOf(mId) >= 0 || grs.globalOperator.indexOf(orgId) >= 0)
      );
    } else {
      return this.isGlobalOperator();
    }
  }

  isGlobalOperator() {
    if (this.activeOrganization) {
      const grants = this.roles.grants;
      const organizationId = this.activeOrganization.id;

      return grants.globalOperator.indexOf(organizationId) >= 0;
    } else {
      return false;
    }
  }

  isCustomer(): boolean {
    if (this.isAllDeclared()) {
      const grs = this.roles.grants;
      const mId = this.activeModule.id;
      return (
        !this.isMaster() &&
        !this.isAdminSuperAdmin() &&
        !this.isAnalystOrOperator() &&
        (grs.customer.indexOf(mId) >= 0 || this.isGlobalCustomer())
      );
    } else {
      return this.isGlobalCustomer();
    }
  }

  isGlobalCustomer() {
    if (this.activeOrganization) {
      const grants = this.roles.grants;
      const orgId = this.activeOrganization.id;

      return grants.globalCustomer.indexOf(orgId) >= 0;
    } else {
      return false;
    }
  }

  isCustomerOrOperatorPartial(mId) {
    return this.isOperatorPartial(mId) || this.isCustomerPartial(mId);
  }

  isAnalystOrOperatorPartial(mId) {
    return this.isAnalystPartial(mId) || this.isOperatorPartial(mId);
  }

  isCustomerPartial(mId) {
    if (this.isPartialDeclared()) {
      const grs = this.roles.grants;
      return (
        !this.isPartialAdminSuperAdmin() &&
        !this.isAnalystOrOperatorPartial(mId) &&
        (grs.customer.indexOf(mId) >= 0 || this.isGlobalCustomer())
      );
    } else {
      return false;
    }
  }

  isOperatorPartial(mId) {
    if (this.isPartialDeclared()) {
      const grs = this.roles.grants;
      return (
        !this.isPartialAdminSuperAdmin() &&
        !this.isAnalystPartial(mId) &&
        (grs.operator.indexOf(mId) >= 0 || this.isGlobalOperator())
      );
    } else {
      return false;
    }
  }

  isAnalystPartial(mId) {
    if (this.isPartialDeclared()) {
      const grs = this.roles.grants;
      return !this.isPartialAdminSuperAdmin() && (this.isModuleAnalyst(mId, grs) || this.isGlobalAnalyst());
    } else {
      return false;
    }
  }

  isLowRole() {
    if (this.isAllDeclared()) {
      const grs = this.roles.grants;
      const mId = this.activeModule.id;
      return (
        !this.isMaster() &&
        !this.isAdminSuperAdmin() &&
        (grs.analyst.indexOf(mId) >= 0 ||
          grs.operator.indexOf(mId) >= 0 ||
          grs.customer.indexOf(mId) >= 0 ||
          this.isGlobalResearcher())
      );
    } else {
      return false;
    }
  }

  isGlobalResearcher() {
    if (this.isAllDeclared()) {
      return this.isGlobalAnalyst() || this.isGlobalOperator() || this.isGlobalCustomer();
    } else {
      return false;
    }
  }

  isAdminSuperAdmin() {
    return this.isAllDeclared() && (this.isSuperAdmin() || this.isAdmin());
  }

  isAdminSuperAdminMaster() {
    return this.isSuperAdmin() || this.isAdmin() || this.isMaster();
  }

  isMasterSuperAdmin() {
    return this.isSuperAdmin() || this.isMaster()
  }

  isMaster() {
    return this.roles.master;
  }

  isSuperAdmin() {
    return this.roles.superadmin;
  }

  isAdmin() {
    return this.roles.admin;
  }

  isPartialAdminSuperAdmin() {
    return this.isPartialDeclared() && (this.isSuperAdmin() || this.isAdmin());
  }

  getRole() {
    if (this.isMaster()) {
      return 'Master';
    } else if (this.isSuperAdmin()) {
      return 'Superadmin';
    } else if (this.isAdmin()) {
      return 'Admin';
    } else if (this.isGlobalAnalyst()) {
      return 'Analyst';
    } else if (this.isGlobalOperator()) {
      return 'Operator';
    } else if (this.isGlobalCustomer()) {
      return 'Customer';
    } else if (this.roles.sales) {
      return 'Sales';
    } else {
      return '-';
    }
  }
}
