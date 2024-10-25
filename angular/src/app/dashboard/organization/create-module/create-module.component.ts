import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatStepper } from '@angular/material/stepper';

import { ToastrService } from 'ngx-toastr';

import { getModulesType, ModuleType } from 'app/dashboard/modules-types';
import { OrganizationService } from '../organization.service';
import { ModuleModel } from '../models';

@Component({
  selector: 'app-create-module',
  templateUrl: './create-module.component.html',
  styleUrls: ['./create-module.component.scss']
})
export class CreateModuleComponent implements OnInit, OnDestroy {
  @ViewChild('stepper', { static: false }) private stepper: MatStepper;

  shortNameToSend: string;
  maxShortNameLengthPrefix: number;
  typesList: ModuleType[];
  maxShortNameLength = 8;
  selected: ModuleType;
  subTypesList: ModuleType[];
  subTypeSelected: ModuleType;
  key: string;
  showSubtypeDescription = false;
  hideGlobalDescription = false;
  currentModules: ModuleModel[];
  showForm = false;
  errors: any = {};
  description: string;
  prefix: string;
  organizationType;
  availableModules: any[];
  loading = true;
  placeholder = '';
  loadingCreate = false;
  sources = [];
  stepIndex = 0;

  private _shortName: string;
  private _name: string;
  private readonly destroy$ = new Subject<void>();

  get name() {
    return this._name;
  }
  set name(v) {
    this._name = v;
    this.checkName();
  }

  get shortName() {
    return this._shortName;
  }

  set shortName(v) {
    this._shortName = v;
    this.checkShortName();
  }

  get hasErrors() {
    return Object.keys(this.errors).filter((e) => !!this.errors[e]).length > 0;
  }

  constructor(
    private organizationService: OrganizationService,
    private router: Router,
    private toastrService: ToastrService
  ) {}

  ngOnInit() {
    this.organizationType = this.organizationService.currentOrganization;

    getModulesType()
      .pipe(takeUntil(this.destroy$))
      .subscribe((typesHash) => {
        this.typesList = Object.keys(typesHash).map((e) => {
          const type = typesHash[e];
          type.key = e;
          return type;
        });
        if (this.currentModules) {
          this.checkUniqueModulesPresence();
        }
      });

    this.organizationService
      .getCurrentModules()
      .pipe(takeUntil(this.destroy$))
      .subscribe((d) => {
        this.currentModules = d;
        if (this.typesList) {
          this.checkUniqueModulesPresence();
        }
      });

    this.organizationService
      .getAllowedModules(this.organizationType.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.availableModules = res;
        this.checkAvailableModules();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  checkUniqueModulesPresence() {
    const intelligence = this.currentModules?.filter?.((m) => m.moduleName === 'threat_context');
    const explorer = this.currentModules?.filter?.((m) => m.moduleName === 'explorer');
    this.removeUniqueModulesFromListOfTypes(intelligence, explorer);
  }

  removeUniqueModulesFromListOfTypes(threat_context, explorer) {
    if (threat_context?.length) {
      this.typesList = this.typesList.filter((m) => m.type !== 'threat_context');
    }

    if (explorer?.length) {
      this.typesList = this.typesList.filter((m) => m.type !== 'explorer');
    }
  }

  checkAvailableModules() {
    this.typesList = this.typesList?.filter?.(
      (mod) => this.availableModules.includes(mod.key.toUpperCase()) || mod.key === 'credit_card_25'
    );
    this.loading = false;
  }

  selectType(i: ModuleType) {
    this.selected = i;
    this.showForm = false;
    if (i.type === 'credit_card') {
      this.selected.key = 'credit_cards_full';
      this.selected.prefix = 'CC-';
      this.selected.name = 'Credit cards';
      this.key = this.selected.key;
      this.showForm = true;
      this.subTypesList = null;
      this.subTypeSelected = null;
      this.showSubtypeDescription = false;
      this.hideGlobalDescription = false;
    } else if (i.type === 'custom') {
      this.organizationService
        .getPlugins()
        .pipe(takeUntil(this.destroy$))
        .subscribe((res) => {
          this.sources = res.map((source) => ({ name: source, checked: false }));
          this.key = i.key;
          this.subTypesList = null;
          this.subTypeSelected = null;
          this.showSubtypeDescription = false;
          this.hideGlobalDescription = false;
          this.showForm = true;
        });
    } else {
      this.key = i.key;
      this.showForm = true;
      this.subTypesList = null;
      this.subTypeSelected = null;
      this.showSubtypeDescription = false;
      this.hideGlobalDescription = false;
    }
    this.autoComplete(i);
  }

  selectSubType(i: ModuleType) {
    this.subTypeSelected = i;
    this.showSubtypeDescription = true;
    this.showForm = true;
    this.key = i.key;
    this.autoComplete(i);
  }

  autoComplete(selected: ModuleType) {
    const name = selected.name;
    const namePrefix = name.replace(/\([^\(]*?\)/g, '');
    this.placeholder = namePrefix;
    this._name = this.setDefaultName(name);
    const match = namePrefix.match(/\b(\w)/g);
    this.prefix = selected.prefix;
    let i = this.currentModules.length;
    this.maxShortNameLengthPrefix = this.maxShortNameLength - this.prefix.length;
    this.shortName = match ? match.join('').substr(0, 3) + i : '';
    while (this.checkShortName()) {
      i++;
      this.shortName = match ? match.join('').substr(0, 3) + i : '';
    }
    this.description = selected.description;
  }

  setDefaultName(name: string) {
    if (this.currentModules) {
      const repeated = this.currentModules.filter((e) => {
        return e.name.toLowerCase() === name.toLowerCase();
      }).length;

      if (repeated === 1) {
        const number = name.replace(/[^0-9]/g, '') || '0';
        const count = parseInt(number, 10);
        if (count > 0) {
          name = name.replace(/[0-9]/g, '');
        }
        return this.setDefaultName(`${name}${count + 1}`);
      }
      return name;
    }
  }

  checkName() {
    if (this.currentModules?.filter?.((e) => e.name === this._name).length) {
      this.errors.name = 'There is another module with this name.';
    } else if (this._name.length > 45) {
      this.errors.name = 'Max length is 45 characters.';
    } else if (this._name.length < 6) {
      this.errors.name = 'Min length is 6 characters.';
    } else {
      this.errors.name = null;
    }
  }

  checkShortName() {
    if (this.currentModules?.filter?.((e) => e.shortName === `${this.prefix}${this._shortName}`).length) {
      this.errors.shortName = 'Shortname already in use';
      return true;
    } else if (this.shortName.length > this.maxShortNameLengthPrefix) {
      this.errors.shortName = `This shortname is too long: max ${this.maxShortNameLengthPrefix} characters allowed`;
      return false;
    } else {
      this.errors.shortName = null;
      return false;
    }
  }

  save() {
    if (!this.hasErrors) {
      this.loading = true;
      const organizationId = this.organizationService.currentOrganization.id;
      const organizationEnabled = this.organizationService.currentOrganization.enabled;
      this.shortNameToSend = this.prefix + this.shortName;
      const data = new ModuleModel(
        organizationId,
        this.key.toUpperCase(),
        this.name,
        this.shortNameToSend,
        organizationEnabled
      );
      if (this.key.toLowerCase() === 'custom') {
        const selectedPlugins = this.sources.filter((source) => source.checked).map((item) => item.name);
        data.plugins = selectedPlugins;
      }
      this.organizationService.createModule(organizationId, data).subscribe(
        (data) => {
          const m = data as ModuleModel;
          const url = this.getRedirectUrl(m, organizationId);
          this.organizationService.refreshCacheModules(true, m);
          this.organizationService.setCurrentModule(m);
          this.organizationService.setCreateModuleMessageSubject(this.name);
          this.loading = false;
          this.router.navigate([url]);
        },
        (err) => {
          this.loading = false;
          this.toastrService.error(
            err.error.message === 'error.module_create_contract'
              ? 'To create the module you should review your product agreement with Customer Succes'
              : err.error.field,
            'Error'
          );
        }
      );
    }
  }

  getRedirectUrl(module, organizationId) {
    const url =
      module.moduleName === 'threat_context' || module.type === 'THREAT_CONTEXT' ? 'threat_context/actors' : 'settings';
    return `/dashboard/organizations/${organizationId}/modules/${module.id}/${url}`;
  }

  goBack(stepper: MatStepper) {
    this.stepper.previous();
  }

  goForward(stepper: MatStepper) {
    this.stepper.next();
  }

  onStepChange(event: any) {
    this.stepIndex = event.selectedIndex;
  }

  canMoveToNameStep() {
    const selected = this.sources.filter((s) => s.checked);
    return selected.length > 0;
  }

  canMoveToSummaryStep() {
    return this.name && this.shortName;
  }

  getNextTooltip() {
    if (this.stepIndex === 0 && !this.canMoveToNameStep()) {
      return 'You need to select at least one';
    } else if (this.stepIndex === 1 && !this.canMoveToSummaryStep()) {
      return 'Please provide a valid name and short-name';
    } else {
      return '';
    }
  }
}
