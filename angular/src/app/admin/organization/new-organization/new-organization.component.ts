import { debounceTime, filter, switchMap } from 'rxjs/operators';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewContainerRef,
  ComponentFactoryResolver,
  ViewChild,
  OnDestroy
} from '@angular/core';
import { CommonAdmin } from '../../shared/common-admin';
import { TableConfig } from '../../shared/table-config';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { OrganizationService } from '../organization.service';
import { OrganizationService as ClientOrganizationService } from '../../../dashboard/organization/organization.service';
import { UsersService } from '../../users/users.service';
import { ToastrService } from 'ngx-toastr';
import { NewEditUsersComponent } from 'app/admin/users/new-edit-users/new-edit-users.component';
import { TableComponent } from 'app/admin/shared/table/table.component';
import { Grants } from 'app/services/grants/grants';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { instanceHeaderMin } from 'app/admin/shared/utils';
import { OrgUsersComponent } from '../org-users/org-users.component';

@Component({
  selector: 'app-new-organization',
  templateUrl: './new-organization.component.html',
  styleUrls: ['./new-organization.component.scss']
})
export class NewOrganizationComponent extends CommonAdmin implements OnInit, OnDestroy {
  @ViewChild('adminTable') adminTable: TableComponent;
  @ViewChild(OrgUsersComponent, { static: true }) orgUserComponent: OrgUsersComponent;
  @Input() isModal = true;
  @Output() closeEmit = new EventEmitter();
  @Output() successEmit = new EventEmitter();
  tableUser = new TableConfig();
  tableUserSelected = new TableConfig();
  form: UntypedFormGroup;
  view = {} as any;
  wizard = 0;
  lastWizard = 1;
  modules = [];
  listCountry = [];
  showUsers: boolean;
  userSelected = [];
  userQuery: string;
  customerList = [];
  openDropdown = false;
  selectedCustomer = '';
  customerError = false;
  noCustomerValidation = false;
  existUsers = false;
  isLoadingCustomer = false;
  isModuleDisabled = false;
  private readonly destroy$ = new Subject<void>();
  searchCustomers$ = new Subject();
  MAX_ORG_NAME_LENGTH = 45;

  get customerId() {
    return this.form.get('customerId').value;
  }

  /**
   * Nombre:                  contact
   * Descripcion:             funcion que retorna el contact para su facil manipulacion en la interfaz
   * @author                  lguzman
   * @since                   9/14/2018 - 5:25 PM
   */
  get contact() {
    return this.form.controls['contact'] as UntypedFormArray;
  }

  /**
   * Nombre:                  firstContact
   * Descripcion:             funcion que retorna el objeto de firstcontact para su facil manipulacion en la interfaz
   * @author                  lguzman
   * @since                   9/14/2018 - 5:26 PM
   */
  get firstContact() {
    return this.contact.controls['firstContact'] as UntypedFormArray;
  }

  /**
   * Nombre:                  invoicingData
   * Descripcion:             funcion que retorna la variable de invoiciData para su facil manipulacion en la interfaz
   * @author                  lguzman
   * @since                   9/14/2018 - 5:26 PM
   */
  get invoicingData(): any {
    return this.contact.controls['invoicingData'] as UntypedFormArray;
  }

  /**
   * Nombre:                  invoicingContact
   * Descripcion:             funcion que retorna la variable de invoicingContact para su facil manipulacion en la
   * interfaz
   * @author                  lguzman
   * @since                   9/14/2018 - 5:29 PM
   */
  get invoicingContact() {
    return this.invoicingData.controls['invoicingContact'] as UntypedFormArray;
  }

  /**
   * Nombre:                  headerUserSelected
   * Descripcion:             header de la tabla de users seleccionados
   * @author                  lguzman
   * @since                   9/14/2018 - 5:45 PM
   */
  get headerUserSelected() {
    return [
      instanceHeaderMin('Users', 'Users', false, false, ''),
      instanceHeaderMin('Module', 'Module', false, false, 'justify-content-center'),
      instanceHeaderMin('Analyst', 'Analyst', false, false, 'justify-content-center'),
      instanceHeaderMin('Operator', 'Operator', false, false, 'justify-content-center'),
      instanceHeaderMin('Customer', 'Customer', false, false, 'justify-content-center')
    ];
  }

  /**
   * Nombre:                  headerModule
   * Descripcion:             header de la tabla de modulos
   * @author                  lguzman
   * @since                   9/14/2018 - 5:45 PM
   */
  get headerModule() {
    return [
      instanceHeaderMin('type', 'Type', false, false, 'text-center'),
      instanceHeaderMin('Name', 'Name', false, false, 'text-center'),
      instanceHeaderMin('Shortname', 'Shortname', false, false, 'text-center'),
      instanceHeaderMin('enable', 'Enable/Disabled', false, false, 'text-center'),
      instanceHeaderMin('edit', 'edit', true, false, 'text-center'),
      instanceHeaderMin('delete', 'delete', true, false, 'text-center')
    ];
  }

  get values() {
    return this.form.getRawValue();
  }

  constructor(
    protected orgService: OrganizationService,
    protected userService: UsersService,
    protected fb: UntypedFormBuilder,
    private clientOrganizationService: ClientOrganizationService,
    private toastrService: ToastrService,
    protected viewContainer: ViewContainerRef,
    protected fr: ComponentFactoryResolver,
    public grants: Grants
  ) {
    super();
  }

  /**
   * Nombre:                  ngOnInit
   * Descripcion:
   * @author                  lguzman
   * @since                   9/14/2018 - 5:14 PM
   */
  ngOnInit() {
    this.tableUserSelected.header = this.headerUserSelected;

    this.instanceForm();
    this.getCountry();
    this.validatorStep();
    this.loadModules();
    this.initSubject();
    if (!this.grants.isMaster() && !this.grants.isSuperAdmin()) {
      const { customerId } = this.grants.roles;
      this.form.controls['customerId'].setValue(customerId);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initSubject() {
    this.searchCustomers$
      .pipe(
        takeUntil(this.destroy$),
        filter((term: string) => term === '' || term?.length >= 3),
        debounceTime(1500)
      )
      .subscribe((value) => this.searchCustomer(value));
  }

  debounceSearch(event: any) {
    const { value } = event.target;
    this.searchCustomers$.next(value);
  }

  getExistUsers($event) {
    this.existUsers = $event;
  }

  changeDisableModules(event) {
    this.isModuleDisabled = event;
  }

  onCloseModal(event) {
    this.showUsers = event;
  }

  /**
   * Nombre:                  instanceForm
   * Descripcion:             metodo que instancia el formulario inicial de la aplicacion
   * @author                  lguzman
   * @since                   9/14/2018 - 5:12 PM
   * @param data recursividad para dato
   */
  instanceForm(data = null) {
    this.form = this.fb.group({
      id: [data && data.id ? data.id : ''],
      name: [data && data.name ? data.name : ''],
      trial: [data && data.trial ? data.trial : false],
      created_at: [data && data.created_at ? data.created_at : ''],
      customerId: [data && data.customerId ? data.customerId : ''],
      enabledMfa: [data && data.enabledMfa ? data.enabledMfa : false],
      userWorkedOn: [data && data.userWorkedOn ? data.userWorkedOn : ''],
      contact: this.fb.group({
        firstContact: this.instanceContact(data?.contact?.firstContact ? data.contact.firstContact : null),
        alias: [''],
        invoicingData: this.fb.group({})
      })
    });

    this.addInvoicingContact(data?.contact?.firstContact ? data.contact.invoicingData : null);
  }

  /**
   * Nombre:                  addInvoicingContact
   * Descripcion:             metodo que agrega contactos y var al invoicingContact existente
   * @author                  lguzman
   * @since                   9/14/2018 - 5:28 PM
   * @param invocingData variable para la posible recursividad de isntancia
   */
  addInvoicingContact(invocingData = null) {
    const data = invocingData ? invocingData.invoicingContact : null;
    const data2 = invocingData ? invocingData.vat : '';
    this.invoicingData.addControl('invoicingContact', this.instanceContact(data));
    this.invoicingData.addControl('vat', new UntypedFormControl(data2));
  }

  /**
   * Nombre:                  instanceContact
   * Descripcion:             metodo que instancia un objecto de tipo contacto
   * @author                  lguzman
   * @since                   9/14/2018 - 5:30 PM
   * @param data posible valores que llena el objeto
   */
  instanceContact(data = null) {
    return this.fb.group({
      title: [data && data.title ? data.title : ''],
      firstName: [data && data.firstName ? data.firstName : ''],
      lastName: [data && data.lastName ? data.lastName : ''],
      email: [data && data.email ? data.email : ''],
      phone: [data && data.phone ? data.phone : ''],
      country: [data && data.country ? data.country : ''],
      state: [data && data.state ? data.state : ''],
      address1: [data && data.address1 ? data.address1 : ''],
      address2: [data && data.address2 ? data.address2 : ''],
      department: [data && data.department ? data.department : '']
    });
  }

  /**
   * Nombre:                  closeModal
   * Descripcion:             metodo que cierra la edicion o creacion
   * @author                  lguzman
   * @since                   9/14/2018 - 5:31 PM
   */
  closeModal() {
    this.closeEmit.emit(null);
  }

  /**
   * Nombre:                  createEdit
   * Descripcion:             metodo final que ejecuta la creacion o edicion del la organizacion
   * @author                  lguzman
   * @since                   9/14/2018 - 5:31 PM
   */
  createEdit() {
    if (!this.form.valid) {
      this.markFormGroupTouched(this.form);
      if (this.openDropdown) {
        this.customerError = true;
      }
      return;
    } else if (this.openDropdown) {
      this.customerError = true;
      return;
    }
    this.create();
  }

  /**
   * Nombre:                  create
   * Descripcion:             metodo que crea la organizacion
   * @author                  lguzman
   * @since                   9/14/2018 - 5:31 PM
   */
  create() {
    this.orgService
      .create(this.removeEmpty(this.values))
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (tz) => {
          this.modules.length ? this.forCreateModules(tz.id) : this.toFinishedSucces(tz);
          this.clientOrganizationService.updateOrganizationList();
        },
        (error) => this.toastrService.error(error, 'Error', { timeOut: 5000 })
      );
  }

  /**
   * Nombre:                  forCreateModules
   * Descripcion:             metodo que recorreo los modulos seleccionados para su creacion
   * @author                  lguzman
   * @since                   9/14/2018 - 5:32 PM
   * @param idOrg id de la orgnazacion  a la que se le crean los modulos
   */
  forCreateModules(idOrg) {
    this.modules.forEach((module, i) => this.createModule(idOrg, module, this.modules.length - 1 === i));
  }

  /**
   * Nombre:                  createModule
   * Descripcion:             metodo que hace la llamada al web service para crear el modulo
   * @author                  lguzman
   * @since                   9/14/2018 - 5:32 PM
   * @param idOrg id de la organizacion a la que se le crean los modules
   * @param module modulo que se creara
   * @param last boolean opcional que determina si es el ultimo en crearse
   */
  createModule(idOrg, module, last = false) {
    const error = [];
    module.organizationId = idOrg;
    this.orgService
      .createModule(idOrg, this.removeEmpty(module))
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (tz) => this.addUserMod(idOrg, tz, last, error),
        () => {
          error.push(module);
          if (last) {
            this.handleModuleError(error, idOrg);
          }
        }
      );
  }

  /**
   * Nombre:                  addUserMod
   * Descripcion:             metodo que valida si existen usuarios que agregar a la organizacion o
   *                          al modulo , o si el proceso esta completo
   * @author                  lguzman
   * @since                   9/14/2018 - 5:38 PM
   * @param idOrg id de la organizacion a la que los usuarios se agregarian
   * @param module modulo a los que se le agregaria permisos al usuario
   * @param last boolean opcional que determina si es posible cerrar el flujo
   */
  addUserMod(idOrg, module, last = false, error) {
    this.addIdMod(module, module.id, idOrg);
    if (last && error.length === 0) {
      this.userSelected && this.userSelected.length ? this.addUsers(idOrg) : this.toFinishedSucces(module);
    } else if (last && error.length > 0) {
      this.handleModuleError(error, idOrg);
    }
  }

  handleModuleError(modules, idOrg) {
    const moduleNames = [];
    modules.forEach((mod) => {
      moduleNames.push(mod.name);
    });
    const body = moduleNames.join('\n') + '\nClick here to retry.';
    this.toastrService
      .error(body, 'The following modules could not be added:')
      .onTap.pipe(takeUntil(this.destroy$))
      .subscribe(() => this.retryAddModules(modules, idOrg));
  }

  retryAddModules(modules, idOrg) {
    modules.forEach((mod, i) => {
      this.createModule(idOrg, mod, modules.length - 1 === i);
    });
  }

  /**
   * Nombre:                  addIdMod
   * Descripcion:             metodo que agrega los id del modulo creado a los modulos preseleccionados por el usuario
   * @author                  lguzman
   * @since                   9/14/2018 - 5:40 PM
   * @param module modulo preselccionado
   * @param idMod id del modulo
   * @param idOrg organizacion a la que pertence el modulo
   */
  addIdMod(module, idMod, idOrg) {
    this.userSelected.forEach((e) => {
      e.superSearchGrants.itemId = idOrg;
      if (e?.superSearchGrants?.reputationalSearchGrants?.length) {
        for (const md of e.superSearchGrants.reputationalSearchGrants) {
          if (md.name === module.name) {
            md.itemId = idMod;
            delete md.name;
          }
        }
      }
    });
  }

  /**
   * Nombre:                  addUsers
   * Descripcion:             metodo que agrega o edita los permisos preseleccionados
   * @author                  lguzman
   * @since                   9/14/2018 - 5:43 PM
   * @param idOrg organzacion con la que se esta tratando los permisos
   */
  addUsers(idOrg) {
    const error = [];
    const usernames = [];
    let userCache = {};
    this.userSelected.forEach((e, i) => {
      this.userService
        .getGrants(e.userId || e.id)
        .pipe(
          takeUntil(this.destroy$),
          switchMap((h) => {
            const index = h.superSearchGrants.findIndex((x) => x.itemId === idOrg);
            if (index !== -1) {
              h.superSearchGrants.splice(index, 1);
            }
            h.superSearchGrants.push(e.superSearchGrants);
            userCache = {
              id: h.userId,
              grant: h,
              username: h.username
            };
            return this.userService.putGrant(h.userId, h);
          })
        )
        .subscribe(
          (h) => {
            if (i === this.userSelected.length - 1 && error.length === 0) {
              this.toFinishedSucces(h);
            } else if (i === this.userSelected.length - 1 && error.length > 0) {
              this.handleUserError(error, usernames);
            }
          },
          () => {
            usernames.push(userCache['username']);
            error.push({
              id: userCache['id'],
              grant: userCache['grant']
            });
            if (i === this.userSelected.length - 1 && error.length > 0) {
              this.handleUserError(error, usernames);
            }
          }
        );
    });
  }

  handleUserError(users, usernames) {
    const body = usernames.join('\n') + '\nClick here to retry.';
    this.toastrService
      .error(body, 'The following usernames could not be added:')
      .onTap.pipe(takeUntil(this.destroy$))
      .subscribe(() => this.retryAddUsers(users));
  }

  retryAddUsers(users) {
    const error = [];
    const usernames = [];
    users.forEach((user, i) => {
      return this.userService
        .putGrant(user.id, user.grant)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (res) => {
            if (i === users.length - 1 && error.length === 0) {
              this.toFinishedSucces(res);
            } else if (i === users.length - 1 && error.length > 0) {
              this.handleUserError(error, usernames);
            }
          },
          () => {
            usernames.push(user['username']);
            error.push({
              id: user['id'],
              grant: user['grant']
            });
            if (i === this.userSelected.length - 1 && error.length === 0) {
              this.handleUserError(error, usernames);
            }
          }
        );
    });
  }

  toFinishedSucces(a) {
    this.successEmit.emit(a);
  }

  /**
   * Nombre:                  getCountry
   * Descripcion:             metodo que obtiene los paises
   * @author                  lguzman
   * @since                   9/14/2018 - 5:43 PM
   */
  getCountry() {
    this.orgService
      .getCountry()
      .pipe(takeUntil(this.destroy$))
      .subscribe((tz) => (this.listCountry = tz));
  }

  /**
   * Nombre:                  nextFinish
   * Descripcion:             metodo cuando es una organizacion nueva que valida la posicion y ubica en la siguiente
   * del wizard
   * @author                  lguzman
   * @since                   9/14/2018 - 5:44 PM
   */
  nextFinish() {
    if (!this.form.valid) {
      this.markFormGroupTouched(this.form);
      if (!this.form.controls['customerId'].value && (this.grants.isSuperAdmin() || this.grants.isMaster())) {
        this.noCustomerValidation = true;
      }
      if (this.openDropdown) {
        this.customerError = true;
      }
      return;
    } else if (this.openDropdown) {
      this.customerError = true;
      return;
    }

    if (!this.form.controls['customerId'].value && (this.grants.isSuperAdmin() || this.grants.isMaster())) {
      this.noCustomerValidation = true;
      return;
    }

    if (this.wizard === this.lastWizard) {
      this.createEdit();
    }
    if (this.wizard < this.lastWizard) {
      if (this.form.get('trial').value && this.wizard === 0) {
        this.wizard = this.lastWizard;
      } else {
        this.wizard += 1;
      }
      this.validatorStep();
      if (!this.invoicingContact) {
        this.addInvoicingContact();
      }
    }
  }

  /**
   * Nombre:                  validatorStep
   * Descripcion:             metodo que segun la posicion de la interfaz aplica las validaciones de los campos
   * @author                  lguzman
   * @since                   9/14/2018 - 5:45 PM
   */
  validatorStep() {
    this.removeValidators(this.form);
    if (this.wizard === 0) {
      this.form.controls['name'].setValidators(Validators.required);
      this.form.controls['customerId'].setValidators(Validators.required);
      this.firstContact.controls['firstName'].setValidators(Validators.required);
      this.firstContact.controls['lastName'].setValidators(Validators.required);
      this.firstContact.controls['phone'].setValidators([Validators.pattern(this.regexPhone)]);
      this.firstContact.controls['email'].setValidators([Validators.required, Validators.pattern(this.regexEmail)]);
      this.firstContact.controls['country'].setValidators(Validators.required);
    }
    if (this.wizard === 1 && !this.form.get('trial').value) {
      this.invoicingData.controls['vat'].setValidators(Validators.required);
      this.invoicingContact.controls['address1'].setValidators(Validators.required);
      this.invoicingContact.controls['country'].setValidators(Validators.required);
      this.invoicingContact.controls['state'].setValidators(Validators.required);
    }
  }

  /**
   * Nombre:                  selectedUser
   * Descripcion:             metodo que se ejecuta para agregar usuarios al los seleccionados
   * @author                  lguzman
   * @since                   9/14/2018 - 5:52 PM
   * @param org
   */
  selectedUser(org) {
    this.userSelected.push(org);
  }

  removeUser(param: any) {
    const { index } = param;
    this.userSelected.splice(index, 1);
  }

  /**
   * Nombre:                  perms
   * Descripcion:             metodo que obtiene los permisos de usuario por modulo
   * @author                  lguzman
   * @since                   9/14/2018 - 5:54 PM
   * @param mod modulo al que se buscara el permiso
   */
  perms(mod) {
    if (!mod.superSearchGrants) {
      mod.superSearchGrants = {
        operator: false,
        mssp_customer: false,
        analyst: true,
        reputationalSearchGrants: []
      };
      for (const i of this.modules) {
        const obj = {
          analyst: false,
          name: i.name,
          operator: false,
          mssp_customer: false
        };
        mod.superSearchGrants.reputationalSearchGrants.push(obj);
      }
    }
    return mod || ({} as any);
  }

  /**
   * Nombre:                  backWizard
   * Descripcion:             metodo que retorna del wizard
   * @author                  lguzman
   * @since                   9/14/2018 - 5:54 PM
   */
  backWizard() {
    this.wizard = this.form.get('trial').value && this.wizard === this.lastWizard ? 0 : this.wizard - 1;
    this.validatorStep();
  }

  /**
   * Nombre:                  removeValidators
   * Descripcion:             metodo para eliminar todos los validatos de un formulario en especifico}
   * @author                  lguzman
   * @since                   9/14/2018 - 5:55 PM
   * @param form formulario a quitar validaciones
   */
  removeValidators(form: UntypedFormGroup) {
    for (const key in form.controls) {
      const val: any = form.get(key);
      if (val.controls) {
        this.removeValidators(val);
      } else {
        val.clearValidators();
        val.updateValueAndValidity();
      }
    }
  }

  /**
   * Nombre:                  onClickSSG
   * Descripcion:             metodo que se ejecuta desde la interfaz al click de checbok de ssg
   * @author                  lguzman
   * @since                   9/14/2018 - 5:55 PM
   * @param item
   * @param key
   * @param user user involucrado
   */
  onClickSSG(ssg, key) {
    if (ssg) {
      this.clearAll(ssg.superSearchGrants.reputationalSearchGrants);
    }

    this.userSelected.forEach((user) => {
      if (user.id === ssg.id) {
        if (!user.superSearchGrants) {
          user.superSearchGrants = {} as any;
        }
        user.superSearchGrants[key] = !user.superSearchGrants[key];
      }
      return user;
    });
  }

  /**
   * Nombre:                  onClickSSG
   * Descripcion:             metodo que se ejecuta desde la interfaz al click de checbok de rsg
   * @author                  lguzman
   * @since                   9/14/2018 - 5:55 PM
   */
  onClickRSG(usr, key, index) {
    this.userSelected.forEach((user) => {
      if (user.id === usr.id) {
        if (!user.superSearchGrants.reputationalSearchGrants) {
          user.superSearchGrants.reputationalSearchGrants = [];
        }
        if (!user.superSearchGrants.reputationalSearchGrants[index]) {
          user.superSearchGrants.reputationalSearchGrants[index] = {
            analyst: false,
            operator: false,
            mssp_customer: false,
            itemId: this.modules[index].id,
            name: this.modules[index].name
          };
        }
        user.superSearchGrants.reputationalSearchGrants[index][key] =
          !user.superSearchGrants.reputationalSearchGrants[index][key];
      }
      return user;
    });
  }

  /**
   * Nombre:                  isDisableRSG
   * Descripcion:             metodo que deshabilita en la interfaz el check
   * @author                  lguzman
   * @since                   9/14/2018 - 5:56 PM
   * @param form
   * @param key
   */
  isDisableRSG(form, key) {
    return this.activeOption(form) && !form[key];
  }

  /**
   * Nombre:                  activeOption
   * Descripcion:             metodo que valida cual variable es true
   * @author                  lguzman
   * @since                   9/14/2018 - 5:56 PM
   * @param form
   */
  activeOption(form) {
    if (form && form['mssp_customer'] === true) {
      return 'mssp_customer';
    } else if (form && form['operator'] === true) {
      return 'operator';
    } else if (form && form['analyst'] === true) {
      return 'analyst';
    } else {
      return null;
    }
  }

  /**
   * Nombre:                  clearAll
   * Descripcion:             metodo que limpia un array de los valores null
   * @author                  lguzman
   * @since                   9/14/2018 - 5:57 PM
   * @param itim
   */
  clearAll(itim) {
    if (Array.isArray(itim)) {
      for (const itimValue of itim) {
        this.clearAll(itimValue);
      }
    } else {
      for (const a of Object.keys(itim)) {
        if (typeof itim[a] === 'boolean') {
          itim[a] = false;
        } else if (Array.isArray(itim[a])) {
          this.clearAll(itim[a]);
        }
      }
    }
  }

  /**
   * Nombre:                  rowsSpan
   * Descripcion:             metodo para la interfaz de la tabla de usuario para validar  el colspan
   * @author                  lguzman
   * @since                   9/14/2018 - 5:57 PM
   * @param form
   */
  rowsSpan(form) {
    if (this.activeOption(form)) {
      return 1;
    }
    return this.modules.length + 1;
  }

  /**
   * Nombre:                  inSelectedUser
   * Descripcion:             metodo que valida para la interfaz si un usuario fue seleccioado
   * @author                  lguzman
   * @since                   9/14/2018 - 5:58 PM
   * @param id
   */
  inSelectedUser(id) {
    return this.userSelected.filter((e) => e.id === id).length;
  }

  /**
   * Nombre:                  isChecked
   * Descripcion:             metodo que valida si un grant esta seleccionado
   * @author                  lguzman
   * @since                   9/14/2018 - 6:00 PM
   * @param array
   * @param key
   */
  isChecked(array, key) {
    return array && array[key];
  }

  createUserView() {
    const resolver = this.fr.resolveComponentFactory(NewEditUsersComponent);
    const ref: any = this.viewContainer.createComponent(resolver);
    ref.changeDetectorRef.detectChanges();
    ref.instance.closeEmit.pipe(takeUntil(this.destroy$)).subscribe(() => this.viewContainer.clear());
    ref.instance.successEmit.pipe(takeUntil(this.destroy$)).subscribe((e) => {
      this.selectedUser(e);
      this.viewContainer.clear();
      this.orgUserComponent.reloadData();
    });
  }

  getCompanyName(id) {
    this.userService
      .getCompanyName(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.selectedCustomer = res.name;
      });
  }

  resetCustomer() {
    this.form.controls['customerId'].setValue('');
    this.selectedCustomer = '';
    this.customerError = false;
    this.noCustomerValidation = false;
    this.openDropdown = false;
    this.customerList = [];
  }

  searchCustomer(customer: string) {
    this.isLoadingCustomer = true;
    if (customer.length) {
      this.userService
        .getCompany(customer, 5)
        .pipe(takeUntil(this.destroy$))
        .subscribe((res: any) => {
          this.customerList = res.content;
          this.openDropdown = true;
          this.checkCustomerName(customer, res.content);
          this.isLoadingCustomer = false;
        });
    } else {
      this.isLoadingCustomer = false;
      this.resetCustomer();
    }
    {
      this.customerList = [];
      this.openDropdown = false;
    }
  }

  checkCustomerName(value: string, customers: any[]) {
    const match = customers.filter((customer) => customer.name.toLowerCase() === value.toLowerCase());

    if (match.length) {
      this.selectedCustomer = match[0].name;
      this.customerError = false;
      this.noCustomerValidation = false;
      this.form.controls['customerId'].setValue(match[0].id);
      this.openDropdown = false;
    }
  }
}
