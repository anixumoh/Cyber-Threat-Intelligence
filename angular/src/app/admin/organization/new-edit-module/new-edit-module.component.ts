import { Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';

import { ModuleTypeAdmin } from '../modules-types-admin';
import { CommonAdmin } from '../../shared/common-admin';
import { OrganizationService } from '../organization.service';
import { Grants } from 'app/services/grants/grants';

@Component({
  selector: 'app-admin-new-edit-module',
  templateUrl: './new-edit-module.component.html',
  styleUrls: ['./new-edit-module.component.scss']
})
export class NewEditModuleComponent extends CommonAdmin implements OnInit, OnDestroy {
  @Input() isModal = true;
  @Input() idOrg;
  @Input() isOrgDisabled = false;
  @Input() isModuleDisabled = false;
  @Input() customerIdForModules = undefined;
  @Input() modules = [];
  @Output() cancelEmit = new EventEmitter();
  @Output() finishEmit = new EventEmitter();

  listTypeMod: ModuleTypeAdmin[];
  listAllowedMods: any[];
  subTypesList_: any[];
  shortname = '';
  moduleStrictTokens = '';
  isLoadingRunSearch = false;
  form: UntypedFormGroup;
  placeholder = '';
  orgService = this.injector.get(OrganizationService);
  keyCreditsCard = 'CREDIT_CARDS';
  maxShortNameLength = 8;
  maxShortNameLengthPrefix: number;
  allowedModules: any[];
  toastrService = this.injector.get(ToastrService);
  loading = true;
  loadingCreateEdit = false;
  sources = [];
  selectedSources = [];
  canSelectSources = false;
  private readonly destroy$ = new Subject<void>();

  get isCreditCard() {
    return this.values.type.includes(this.keyCreditsCard);
  }

  get moduleDetail() {
    let retorno = this.listTypeMod.find((e) => e.type === this.values.type);
    if (this.isCreditCard) {
      retorno = this.subTypesList_.find((e) => e.type === this.values.type);
    }
    return retorno || ({} as any);
  }

  /**
   *  Nombre:                  namePrefix
   * Descripcion:             metodo reutilizado
   * @author                  lguzman
   * @since                   9/14/2018 - 5:48 PM
   */
  get namePrefix() {
    let retorno = this.moduleDetail.prefix;
    if (this.values.shortName && this.values.shortName.indexOf('-') !== -1) {
      retorno = this.values.shortName.split('-')[0] + '-';
    }

    return retorno;
  }

  get values() {
    return this.form.getRawValue();
  }

  constructor(protected fb: UntypedFormBuilder, protected injector: Injector, public grants: Grants) {
    super();
  }

  ngOnInit() {
    this.loadModules(this.modules);
    this.instanceForm();
    this.getAllowedModules();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Nombre:                  instanceFormModule
   * Descripcion:             metodo que instancia el formulario de los modulos
   * @author                  lguzman
   * @since                   9/14/2018 - 5:25 PM
   * @param data variable para la posible recursividad de isntancia
   */
  instanceForm(data = null) {
    this.moduleStrictTokens = data && data.moduleStrictTokens ? data.moduleStrictTokens.join('\n') : '';
    this.form = this.fb.group({
      id: [data && data.id ? data.id : ''],
      moduleStrictTokens: this.moduleStrictTokens,
      name: [data && data.name ? data.name : '', Validators.required],
      shortName: [data && data.shortName ? data.shortName : '', Validators.required],
      type: [data && data.type ? data.type : '', Validators.required],
      enabled: [data && typeof data.enabled === 'boolean' ? data.enabled : true],
      portfolioId: [data && data.portfolioId ? data.portfolioId : ''],
      createdAt: [data && data.createdAt ? data.createdAt : ''],
      demoMode: [data && data.demoMode ? data.demoMode : false],
      organizationId: [data && data.organizationId ? data.organizationId : this.idOrg],
      firstDataLoad: [data?.firstDataLoad ?? false],
      hidePasswords: [data?.hidePasswords ?? false],
      hideCC: [data?.hideCC ?? false]
    });

    if (data && data.type.toLowerCase() === 'custom') {
      this.getPluginsAndAvailable(data);
    }

    if (data && data.shortName) {
      this.shortname = data.shortName.includes('-') ? data.shortName.split('-')[1] : data.shortName;
    }
  }

  /**
   * Nombre:                  setName
   * Descripcion:             metodo reutlizado
   * @author                  lguzman
   * @since                   9/14/2018 - 5:47 PM
   * @param i
   */
  setName(i) {
    const name = i.name.replace(/\([^\(]*?\)/g, '');
    const match = name.match(/\b(\w)/g);
    const num =
      (this.modules && this.modules.length ? this.modules.filter((e) => e.type === i.type).length : 0) +
      this.listTypeMod.length;
    this.shortname = match ? match.join('').substr(0, 3) + num : '';
    this.form.controls['type'].setValue(i.type);
    this.form.controls['shortName'].setValue(i.prefix + this.shortname);
  }

  /**
   * Nombre:                  changeName
   * Descripcion:             metodo que sigue el flujo de la interfaaz para cuando se cambia el nombre
   * @author                  lguzman
   * @since                   9/14/2018 - 5:49 PM
   * @param a nuevo nombre del modulo
   */
  changeName(a) {
    this.form.controls['shortName'].setValue(this.namePrefix + a);
  }

  /**
   * Nombre:                  selectedTypeMod
   * Descripcion:             metodo que valida si el  type modulo seleccionado tiene submodulo
   * @author                  lguzman
   * @since                   9/14/2018 - 5:53 PM
   * @param i type to module
   */
  selectedTypeMod(i) {
    if (i.type === 'CUSTOM') {
      this.getPlugins();
      this.canSelectSources = true;
    }

    this.placeholder = i.name;
    this.form.controls['name'].setValue(this.setDefaultName(i.name));
    this.form.controls['type'].setValue(i.type);
    this.setName(i);
    if (i.type === this.keyCreditsCard) {
      this.selectedTypeMod(this.subTypesList_[0]);
    }

    this.maxShortNameLengthPrefix = this.maxShortNameLength - this.namePrefix.length;
  }

  hasAdminPermissionsAndAbove(grants: Grants): boolean {
    if (!grants) return false;
    return grants?.isMaster() || grants?.isSuperAdmin() || grants?.isAdmin();
  }
  checkFirtsLoad(module) {
    const { firstDataLoad, ...rest } = module;
    return {
      ...rest,
      ...(rest.type === 'CREDENTIALS' ? { firstDataLoad } : {})
    };
  }

  updateModule() {
    this.loadingCreateEdit = true;
    const module: any = this.checkFirtsLoad(this.removeEmpty({ ...this.values }));

    if (module.type === 'CUSTOM') {
      const selectedPlugins = this.sources.filter((source) => source.checked).map((item) => item.name);
      module.plugins = selectedPlugins;
    }

    this.orgService
      .editModule(this.idOrg, module)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        () => {
          this.finishedModule(module);
          this.loadingCreateEdit = false;
        },
        (e) => {
          this.loadingCreateEdit = false;
          this.toastrService.error(e, 'Error', {
            timeOut: 5000
          });
        }
      );
  }

  createModule() {
    this.loadingCreateEdit = true;
    const module: any = this.checkFirtsLoad(this.removeEmpty({ ...this.values }));

    if (module.type === 'CUSTOM') {
      const selectedPlugins = this.sources.filter((source) => source.checked).map((item) => item.name);
      module.plugins = selectedPlugins;
    }

    if (this.isOrgDisabled) {
      module.enabled = false;
    }

    this.orgService
      .createModuleOrg(this.idOrg, module)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        () => {
          this.finishedModule(module);
          this.loadingCreateEdit = false;
        },
        (e) => {
          this.loadingCreateEdit = false;
          this.toastrService.error(e, 'Error', {
            timeOut: 5000
          });
        }
      );
  }

  getModuleList(rsg) {
    return this.modules.find((e) => e.id === rsg.itemId) || ({} as any);
  }

  async getAllowedModules() {
    const id = this.customerIdForModules ? this.customerIdForModules : this.idOrg;
    const isFromCustomer = this.customerIdForModules ? true : false;
    try {
      const result = await this.orgService
        .getAllowedModules(id, isFromCustomer)
        .pipe(takeUntil(this.destroy$))
        .toPromise();
      this.allowedModules = result;
      this.filterAvailableModules();
    } catch (error) {
      const message = error?.error?.field || 'Error getting allowed modules';
      this.toastrService.error(message);
      this.listTypeMod = [];
    } finally {
      this.loading = false;
    }
  }

  filterAvailableModules() {
    this.listTypeMod = this.listTypeMod?.filter?.((mod) => this.allowedModules.includes(mod.type));
  }

  /**
   * Nombre:                  isDuplicateKey
   * Descripcion:             metodo que valida si ya existe un modelo con el atributo seleccionado
   * @author                  lguzman
   * @since                   9/14/2018 - 5:50 PM
   * @param key atributo a validar
   */
  isDuplicateKey(key, id) {
    let retorno = false;
    const array = id && id !== -1 ? this.modules.filter((e) => e.id !== id) : this.modules;
    if (this.modules && this.modules.length) {
      retorno = array.filter((e) => e[key] === this.values[key])[0];
    }
    return !!retorno;
  }

  closeModal() {
    this.cancelEmit.emit(null);
  }

  newUpdate() {
    this.form.controls['shortName'].setValue(this.namePrefix + this.shortname);
    if (this.moduleStrictTokens) {
      this.form.controls['moduleStrictTokens'].setValue(this.moduleStrictTokens.split('\n').filter(Boolean));
    } else {
      this.form.controls['moduleStrictTokens'].setValue('');
    }
    if (this.idOrg && this.values.id) {
      this.updateModule();
    } else if (this.idOrg) {
      this.createModule();
    } else {
      this.finishedModule(this.removeEmpty(this.values));
    }
  }

  finishedModule(mod) {
    this.finishEmit.emit(mod);
  }

  runSearch() {
    const module: any = this.removeEmpty({ ...this.values });
    this.isLoadingRunSearch = true;
    this.orgService
      .runSearch(module.organizationId, module.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        () => {
          this.isLoadingRunSearch = false;
          this.toastrService.success(
            'You can check the jobs section to see the ones scheduled and in execution.',
            'Success'
          );
          this.closeModal();
        },
        () => {
          this.isLoadingRunSearch = false;
          this.toastrService.error('Something went wrong. Please try again.', 'Oops');
        }
      );
  }

  getPluginsAndAvailable(data) {
    this.orgService
      .getPlugins()
      .pipe(
        takeUntil(this.destroy$),
        switchMap((pluginList) => {
          this.sources = pluginList;
          return this.orgService.getModulePlugins(this.idOrg, data.id);
        })
      )
      .subscribe((res) => {
        this.selectedSources = res;
        const sourcesList = [];

        this.sources.forEach((source) => {
          if (this.selectedSources.indexOf(source) > -1) {
            sourcesList.unshift({ name: source, checked: true });
          } else {
            sourcesList.push({ name: source, checked: false });
          }
        });
        this.sources = sourcesList;
      });
  }

  getPlugins() {
    this.orgService
      .getPlugins()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.sources = res.map((source) => ({ name: source, checked: false }));
      });
  }

  private setDefaultName(name: string) {
    if (this.modules) {
      const repeated = this.modules.filter((e) => {
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
}
