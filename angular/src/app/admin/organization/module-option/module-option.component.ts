import {
  Component,
  ComponentFactoryResolver,
  EventEmitter,
  Injector,
  Input,
  OnInit,
  Output,
  ViewContainerRef,
  OnDestroy,
  ViewChild,
  ElementRef
} from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import * as FileSaver from 'file-saver';

import { CommonAdmin } from '../../shared/common-admin';
import { OrganizationService } from '../organization.service';
import { Grants } from '../../../services/grants/grants';
import { NewEditModuleComponent } from '../new-edit-module/new-edit-module.component';
import { CustomerService } from 'app/admin/customer/customer.service';

@Component({
  selector: 'app-admin-module-option',
  templateUrl: './module-option.component.html',
  styleUrls: ['./module-option.component.scss']
})
export class ModuleOptionComponent extends CommonAdmin implements OnInit, OnDestroy {
  @Input() idOrg: any;
  @Input() customerId: any;
  @Input() customerIdForModules = undefined;
  @Input() modules = [];
  @Input() isOrgDisabled;
  @Input() isModuleDisabled = false;
  @Output() modulesChange = new EventEmitter();
  @Output() changeDisableModule = new EventEmitter();
  @ViewChild('loadFileModule', { static: false })
  InputVar: ElementRef;

  orgService = this.injector.get(OrganizationService);
  orgServiceThreats = this.injector.get(OrganizationService);
  messageFile: any = {};
  timerTime: any;
  extension = 'json';
  fileAny = [];
  zip: any;
  deleteConfirmation;
  modToDelete;
  deleteDisabled;
  assignModal = false;
  selectedCustomer = null;
  customers = [];
  loadingCustomers = false;
  customerError = false;
  loadingSync = false;
  modulesWithError;
  customerOverviewModal = false;
  importingModule = false;
  private readonly destroy$ = new Subject<void>();

  constructor(
    protected injector: Injector,
    protected fr: ComponentFactoryResolver,
    protected router: Router,
    protected view: ViewContainerRef,
    protected grants: Grants,
    private toastrService: ToastrService,
    private customerService: CustomerService
  ) {
    super();
  }

  ngOnInit() {
    if (this.idOrg) {
      this.getModulesOrg();
    }
    this.loadModules(this.modules);

    this.deleteDisabled = this.grants.roles.master || this.grants.roles.admin || this.grants.roles.superadmin;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Nombre:                  getModulesOrg
   * Descripcion:             Metodo que obtiene los modulos de la organizacion
   * @author                  lguzman
   * @since                   9/14/2018 - 5:22 PM
   * @param idOrg id de la orgnazacion
   */
  getModulesOrg() {
    this.importingModule = true;
    this.orgService
      .getModulesByOrg(this.idOrg, { extraFields: true })
      .pipe(takeUntil(this.destroy$))
      .subscribe((e) => {
        this.modules = e;
        this.importingModule = false;
        this.InputVar.nativeElement.value = '';
      });
  }

  /**
   * Nombre:                  getModule
   * Descripcion:             metodo que obtiene un modulo en especifico
   * @author                  lguzman
   * @since                   9/14/2018 - 5:51 PM
   * @param value valor que se busca
   * @param key key que se busca
   */
  getModule(value, key) {
    let array = this.listTypeMod;
    if (value[key].toLowerCase().includes('credit_cards')) {
      array = this.subTypesList_;
    }
    const retorno = array.find((e) => e[key].toLowerCase() === value[key].toLowerCase());
    return retorno || ({} as any);
  }
  changeCreditCardCVVVisibility(mod) {
    mod.hideCC = !mod.hideCC;
    this.orgService
      .editModule(this.idOrg, mod)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        () => {
          const { name, hideCC } = mod;
          const action = hideCC ? 'hide CVV/Expiration dates' : 'reveal CVV/Expiration dates';
          this.toastrService.success(`${name} was succesfully changed to ${action}.`, 'Success');
        },
        (error) => {
          this.execFinishedUpdate();
          const body = error || '';
          const text =
            body.message === 'error.exceeds_band_limits'
              ? 'Module exceeds bands limits and cannot be enabled.'
              : 'We were not able to process the request. Please try again.';
          this.toastrService.error(text, 'Error');
        }
      );
  }
  changeCredentialsPasswordVisibility(mod) {
    mod.hidePasswords = !mod.hidePasswords;
    this.orgService
      .editModule(this.idOrg, mod)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        () => {
          const { name, hidePasswords } = mod;
          const action = hidePasswords ? 'hide passwords' : 'reveal passwords';
          this.toastrService.success(`${name} was succesfully changed to ${action}.`, 'Success');
        },
        (error) => {
          this.execFinishedUpdate();
          const body = error || '';
          const text =
            body.message === 'error.exceeds_band_limits'
              ? 'Module exceeds bands limits and cannot be enabled.'
              : 'We were not able to process the request. Please try again.';
          this.toastrService.error(text, 'Error');
        }
      );
  }
  execFinishedUpdate() {
    this.getModulesOrg();
    this.changeDisableModule.next(false);
  }

  updateModel(mod) {
    if (mod.id) {
      this.changeDisableModule.next(true);
      this.orgService
        .editModule(this.idOrg, mod)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          () => {
            this.execFinishedUpdate();
            const { name, enabled } = mod;
            const action = enabled ? 'enabled' : 'disabled';
            this.toastrService.success(`${name} was succesfully ${action}.`, 'Success');
          },
          (error) => {
            this.execFinishedUpdate();
            const body = error || '';
            const text =
              body.message === 'error.exceeds_band_limits'
                ? 'Module exceeds bands limits and cannot be enabled.'
                : 'We were not able to process the request. Please try again.';
            this.toastrService.error(text, 'Error');
          }
        );
    }
  }

  getModuleNameById(url) {
    const id = url.replace(/\/organization\/[0-9]+\/module\//g, '');
    const retorno = this.modules.find((e) => e.id.toString() === id);
    return retorno || ({} as any);
  }

  downloadMod(mod, isLast = false, unzip = false) {
    const obj: any = {};
    obj.module = mod;
    this.orgService
      .getModulesByOrg(this.idOrg, mod.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((arg) => {
        obj.grants = arg;
        this.generateFile(obj, isLast, unzip);
      });
  }

  getModuleLink(mod) {
    const path = `/dashboard/organizations/${this.idOrg}/modules/${mod.id}`;
    return mod.type.includes('THREAT_CONTEXT') ? path.concat(`/threat_context/actors`) : path;
  }

  downloadSingleMod(mod, isLast = true, unzip = false) {
    this.orgService
      .getSingleModule(this.idOrg, mod.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.generateFile(res, isLast, unzip);
      });
  }

  generateFile(data, isLast = false, unzip = false) {
    const name = data.module ? data.module.name : data.name;
    const fileName = `${name}_${new Date().getTime()}.${this.extension}`;
    const string = JSON.stringify(data);
    const file = new File([string], fileName, { type: 'application/json' });
    if (!unzip) {
      FileSaver.saveAs(file);
    } else {
      this.zip.file(fileName, file);
      if (isLast) {
        this.zip
          .generateAsync({ type: 'blob' })
          .then((e) => FileSaver.saveAs(e, `Org_${this.idOrg}_${new Date().toString()}.zip`));
      }
    }
  }

  importModule(event) {
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      const file: File = fileList[0];
      const formData: FormData = new FormData();
      formData.append('import_json', file);
      this.importingModule = true;
      this.orgService
        .importModule(this.idOrg, formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (x) => {
            const response = typeof x === 'string' ? JSON.parse(x) : x;
            if (response?.message && response.message !== 'ok.import_module') {
              const warning = JSON.parse(response.message);
              const msg = `Not found plugins: ${warning.notFoundPlugins}`;
              this.toastrService.warning(msg, 'warning');
            }
          },
          (err) => {
            const text =
              JSON.parse(err).message === 'error.exceeds_band_limits'
                ? 'Module exceeds bands limits and cannot be imported.'
                : 'There was an issue importing the module. Please make sure the organization has a customer assigned.';
            this.toastrService.error(text, 'Error');
            this.importingModule = false;
          },
          () => {
            this.toastrService.success('The module was uploaded');
            this.getModulesOrg();
          }
        );
    }
  }

  setMessageFile(msj, success = true) {
    this.messageFile.message = msj;
    this.messageFile.success = success;
    if (this.timerTime) {
      clearTimeout(this.timerTime);
    }
    this.timerTime = setTimeout(() => {
      this.messageFile = {} as any;
    }, 5000);
  }

  hasAdminPermissionsAndAbove(grants: Grants): boolean {
    if (!grants) return false;
    return grants?.isMaster() || grants?.isSuperAdmin() || grants?.isAdmin();
  }
  newEditModule(module = null) {
    this.view.clear();
    if (!this.idOrg && module) {
      const index = this.modules.findIndex((e) => JSON.stringify(e) === JSON.stringify(module));
      if (index !== -1) {
        this.modules.splice(index, 1);
        this.modulesChange.emit(this.modules);
      }
    }
    const resolver = this.fr.resolveComponentFactory(NewEditModuleComponent);
    const ref: any = this.view.createComponent(resolver);
    ref.instance.idOrg = this.idOrg;
    ref.instance.isOrgDisabled = this.isOrgDisabled;
    if (module) ref.instance.isModuleDisabled = !module.enabled;
    ref.instance.modules = this.modules;
    ref.instance.customerIdForModules = this.customerIdForModules;
    ref.changeDetectorRef.detectChanges();
    ref.instance.instanceForm(module);
    ref.instance.cancelEmit.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.view.clear();
    });
    ref.instance.finishEmit.pipe(takeUntil(this.destroy$)).subscribe((e) => {
      this.idOrg ? this.getModulesOrg() : this.modules.push(e);
      this.modulesChange.emit(this.modules);
      this.view.clear();
    });
    ref.changeDetectorRef.detectChanges();
  }

  removeModule(module) {
    this.importingModule = true;
    if (this.idOrg && module.id) {
      this.deleteModuleByid(module);
    } else {
      const index = this.modules.findIndex((e) => JSON.stringify(e) === JSON.stringify(module));
      if (index !== -1) {
        this.modules.splice(index, 1);
        this.modulesChange.emit(this.modules);
        this.importingModule = false;
      }
    }
    this.deleteConfirmation = false;
    this.modToDelete = null;
  }

  openConfirmationModal(mod) {
    this.modToDelete = mod;
    this.deleteConfirmation = true;
  }

  closeConfirmation() {
    this.modToDelete = null;
    this.deleteConfirmation = false;
  }

  deleteModuleByid(mod) {
    this.importingModule = true;
    this.orgService
      .deleteModule(this.idOrg, mod.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.toastrService.success('The module was deleted');
        this.getModulesOrg();
      });
  }

  exportOrg(id) {
    this.orgService
      .downloadOrg(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        const blob = new Blob([res], {
          type: 'application/octet-stream'
        });
        FileSaver.saveAs(blob, `Org_${id}_export.zip`);
      });
  }

  goTo(module) {
    this.router.navigate([`/dashboard/organizations/${this.idOrg}/summary`]);
    setTimeout(() => {
      const url = `/dashboard/organizations/${this.idOrg}/modules/${module.id}`;
      this.router.navigate([url]);
    }, 1500);
  }

  openSyncModal() {
    this.selectedCustomer = this.customerId;
    this.assignModal = true;
    const params: any = { page: 1, size: '300' };
    this.loadingCustomers = true;
    this.customerService
      .getAllCustomers(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.customers = res['content'];
        this.loadingCustomers = false;
      });
  }

  syncOrgToCustomer(orgId, customerId) {
    this.loadingSync = true;
    this.orgService
      .syncOrg(orgId, customerId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res) => {
          this.customerError = false;
          this.loadingSync = false;

          if ((res.failed && res.failed.length > 0) || (res.not_contracted && res.not_contracted.length)) {
            this.modulesWithError = res;
            this.customerOverviewModal = true;
          } else {
            this.toastrService.success('Organization was successfully synchronized with the customer.', 'Success');
            this.assignModal = false;
          }
        },
        () => {
          this.customerError = false;
          this.loadingSync = false;
          this.toastrService.error('There was an issue while processing the request', 'Error');
        }
      );
  }

  closeAssign() {
    this.assignModal = false;
    this.selectedCustomer = null;
    this.customerError = false;
  }

  changeCustomer(e) {
    this.customerError = false;
    this.selectedCustomer = e.target.value;
  }

  assignAndSync() {
    if (this.selectedCustomer) {
      this.syncOrgToCustomer(this.idOrg, this.selectedCustomer);
    } else {
      this.customerError = true;
    }
  }
}
