import { Component, EventEmitter, Input, OnInit, Output, ViewChild, OnDestroy } from '@angular/core';
import {
  AbstractControl,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators
} from '@angular/forms';
import { Subject } from 'rxjs';
import { finalize, switchMap, takeUntil, filter, debounceTime } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { CommonAdmin } from '../../shared/common-admin';
import { TableConfig } from '../../shared/table-config';
import { UsersService } from '../../users/users.service';
import { OrganizationService } from '../organization.service';
import { Grants } from '../../../services/grants/grants';
import { TableComponent } from 'app/admin/shared/table/table.component';
import { instanceHeaderMin } from 'app/admin/shared/utils';

@Component({
  selector: 'app-edit-organization',
  templateUrl: './edit-organization.component.html',
  styleUrls: ['./edit-organization.component.scss']
})
export class EditOrganizationComponent extends CommonAdmin implements OnInit, OnDestroy {
  @ViewChild('adminTable') adminTable: TableComponent;

  @Input() isModal = true;
  @Output() closeEmit = new EventEmitter();
  @Output() successEmit = new EventEmitter();

  selectedOrganization: any;
  canEnableOrganization: boolean;
  tableUser = new TableConfig();
  tableUserSelected = new TableConfig();
  tableModules = new TableConfig();
  tableBlackList = new TableConfig();
  form: UntypedFormGroup;
  formBlacklist: UntypedFormGroup;
  view = {} as any;
  confirmation = {} as any;
  itemSelected: any;
  modules = [];
  showUsers: boolean;
  showAddBlackList: boolean;
  editionMode: boolean;
  isLoading = false;
  canSave = false;
  userSelected = [];
  arrayTabs = ['Info', 'Blacklist', 'Filter Templates', 'Labels', 'Grants'];
  tabActive: any = this.arrayTabs[0];
  trialHasExpired = false;
  timer: any;
  listCountry = [];
  checkboxTouched = false;
  isUpdating = false;
  loadingUser = {
    loadingAdd: false,
    loadingDelete: false,
    user: null
  };
  userQuery: string;
  customerList = [];
  openDropdown = false;
  selectedCustomer = '';
  customerError = false;
  isLoadingUser = true;
  noCustomerValidation = false;
  existUsers = false;
  searchCustomers$ = new Subject();
  MAX_ORG_NAME_LENGTH = 45;
  private readonly destroy$ = new Subject<void>();

  get values() {
    return this.form.getRawValue();
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
      instanceHeaderMin('Users', 'Users', false, false, 'ml-2'),
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
      instanceHeaderMin('download', 'download', true, false, 'text-center'),
      instanceHeaderMin('edit', 'edit', true, false, 'text-center'),
      instanceHeaderMin('delete', 'delete', true, false, 'text-center')
    ];
  }

  get headerBlackList() {
    return [
      instanceHeaderMin('url', 'Ulr/Ip/Domain', false, false),
      instanceHeaderMin('createdAt', 'Created At', false, true, 'text-center')
    ];
  }

  constructor(
    protected orgService: OrganizationService,
    protected userService: UsersService,
    protected grants: Grants,
    protected fb: UntypedFormBuilder,
    private toastrService: ToastrService
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
    if (this.grants.isGlobalAnalyst()) {
      this.arrayTabs = ['Info', 'Blacklist', 'Filter Templates', 'Labels'];
    }
    this.canEnableOrganization = this.grants.roles.master || this.grants.roles.admin || this.grants.roles.superadmin;
    this.tableUserSelected.header = this.headerUserSelected;
    this.tableModules.header = this.headerModule;
    this.tableBlackList.header = this.headerBlackList;
    this.getCountry();
    this.instanceForm();
    this.initSubject();

    if (this.selectedOrganization) {
      this.reloadBlacklistData();
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
      name: [data && data.name ? data.name : '', Validators.required],
      trial: [data && data.trial ? data.trial : false],
      customerId: [data && data.customerId ? data.customerId : ''],
      enabledMfa: [data && data.enabledMfa ? data.enabledMfa : false],
      trialExpirationDate: [data && data.trialExpirationDate ? data.trialExpirationDate : ''],
      created_at: [data && data.created_at ? data.created_at : ''],
      enabled: [data && data.enabled ? data.enabled : false],
      userWorkedOn: [data && data.userWorkedOn ? data.userWorkedOn : false],
      contact: this.fb.group({
        firstContact: this.instanceContact(data && data.contact ? data.contact.firstContact : null),
        alias: [''],
        invoicingData: this.fb.group({})
      })
    });
    this.form
      .get('enabled')
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.checkboxTouched = true;
      });
    this.form
      .get('customerId')
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.checkboxTouched = true;
      });
    this.form
      .get('trial')
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.checkboxTouched = true;
      });
    this.form
      .get('enabledMfa')
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.checkboxTouched = true;
      });
    this.form
      .get('userWorkedOn')
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.checkboxTouched = true;
      });
    if (!this.grants.isGlobalAnalyst()) {
      this.getGrantsOrg(this.values.id);
    }
    this.trialExpired();
    if (data?.customerId && (this.grants.isMaster() || this.grants.isSuperAdmin())) {
      this.getCompanyName(data.customerId);
    }
  }

  trialExpired() {
    const today = new Date();
    const hour = today.getTime();

    if (this.values.trial && hour > this.values.trialExpirationDate) {
      this.trialHasExpired = true;
    }
  }

  /**
   * Nombre:                  getGrantsOrg
   * Descripcion:             funcion que obtiene los grants de una organizacion
   * @author                  lguzman
   * @since                   9/14/2018 - 5:24 PM
   * @param idOrg
   */
  getGrantsOrg(idOrg) {
    if (idOrg) {
      this.orgService
        .getModulesByOrg(idOrg)
        .pipe(
          takeUntil(this.destroy$),
          switchMap((arg) => {
            this.modules = arg;
            return this.orgService.getGrantByOrg(idOrg);
          })
        )
        .subscribe((e) => {
          this.userSelected = e.map((h) => this.transfUsers(h));
          this.loadingUser = {
            loadingAdd: false,
            loadingDelete: false,
            user: null
          };
        });
    }
  }

  transfUsers(e) {
    !e.superSearchGrants
      ? this.perms(e)
      : (e.superSearchGrants = e.superSearchGrants.find((h) => h.itemId === this.values.id));
    const auxArray = [];
    this.modules.forEach((a) => {
      const inLive = e.superSearchGrants.reputationalSearchGrants.find((h) => h.itemId === a.id);
      if (inLive) {
        auxArray.push(inLive);
      } else {
        auxArray.push({
          itemId: a.id,
          analyst: false,
          operator: false,
          mssp_customer: false
        });
      }
    });
    e.superSearchGrants.reputationalSearchGrants = auxArray;
    return e;
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
      firstName: [data && data.firstName ? data.firstName : '', Validators.required],
      lastName: [data && data.lastName ? data.lastName : '', Validators.required],
      email: [data && data.email ? data.email : '', [Validators.required, Validators.pattern(this.regexEmail)]],
      phone: [data && data.phone ? data.phone : '', [Validators.pattern(this.regexPhone)]],
      country: [data && data.country ? data.country : '', Validators.required],
      state: [data && data.state ? data.state : ''],
      address1: [data && data.address1 ? data.address1 : ''],
      address2: [data && data.address2 ? data.address2 : ''],
      department: [data && data.department ? data.department : '']
    });
  }

  instanceBlacklist(data = null) {
    this.formBlacklist = this.fb.group(
      {
        id: [data && data.id ? data.id : ''],
        url: [data && data.url ? data.url : '']
      },
      { validator: IpDomainUrlValidator.IsvalidInput }
    );
  }

  getCountry() {
    this.orgService
      .getCountry()
      .pipe(takeUntil(this.destroy$))
      .subscribe((tz) => (this.listCountry = tz));
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
   * Nombre:                  createModule
   * Descripcion:             metodo que hace la llamada al web service para crear el modulo
   * @author                  lguzman
   * @since                   9/14/2018 - 5:32 PM
   * @param idOrg id de la organizacion a la que se le crean los modules
   * @param module modulo que se creara
   * @param last boolean opcional que determina si es el ultimo en crearse
   */
  createModule(module, last = false) {
    const idOrg = this.values.id;
    if (module.id) {
      this.addUserMod(module.id, last);
    } else {
      this.orgService
        .createModule(idOrg, this.removeEmpty(module))
        .pipe(takeUntil(this.destroy$))
        .subscribe((tz) => this.addUserMod(tz, last));
    }
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
  addUserMod(module, last = false) {
    const idOrg = this.values.id;
    this.addIdMod(module, module.id, idOrg);
    this.addUsers();
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
   */
  addUsers() {
    const idOrg = this.values.id;
    this.userSelected.forEach(({ userId, id, superSearchGrants }: any) => {
      this.userService
        .getGrants(userId || id)
        .pipe(
          takeUntil(this.destroy$),
          switchMap((h) => {
            const index = h.superSearchGrants.findIndex((x) => x.itemId === idOrg);
            if (index !== -1) {
              h.superSearchGrants.splice(index, 1);
            }
            h.superSearchGrants.push(superSearchGrants);
            return this.userService.putGrant(h.userId, h);
          })
        )
        .subscribe(() => {});
    });
  }

  /**
   * Nombre:                  edit
   * Descripcion:             metodo cuando el flujo entra en edicion
   * @author                  lguzman
   * @since                   9/14/2018 - 5:43 PM
   */
  edit(reload = false) {
    this.addUsers();
  }

  addUserToOrg(user) {
    this.loadingUser = {
      loadingDelete: false,
      loadingAdd: true,
      user: user.userId || user.id
    };

    const grant = {
      analyst: true,
      itemId: this.values.id,
      mssp_customer: false,
      operator: false,
      reputationalSearchGrants: []
    };

    this.userService
      .getGrants(user.id)
      .pipe(
        takeUntil(this.destroy$),
        switchMap((res) => {
          const userGrants = res;
          userGrants.superSearchGrants.push(grant);
          return this.userService.putGrant(res.userId, userGrants);
        })
      )
      .subscribe(
        () => {
          const message = `User ${user.username} was added successfully to organization ${this.values.name}.`;
          this.toastrService.success(message, '');
          this.userSelected.push(this.transfUsers(user));
          this.getGrantsOrg(this.values.id);
        },
        () => {
          const message = `There was a problem trying to add User ${user.username} to Organization ${this.values.name}, please try again and in case of failure contact support team.`;
          this.toastrService.error(message, '');
        }
      );
  }

  removeUser(param: any) {
    const { user, index } = param;
    this.loadingUser = {
      loadingDelete: true,
      loadingAdd: false,
      user: user.userId || user.id
    };
    this.userService
      .getGrants(user.userId || user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((h) => {
        const userGrants = h;

        userGrants.superSearchGrants.map((grant, i) => {
          if (grant.itemId === this.values.id) {
            userGrants.superSearchGrants.splice(i, 1);
          }
        });
        this.userService.putGrant(user.userId || user.id, userGrants).subscribe(() => {
          this.getGrantsOrg(this.values.id);
          this.userSelected.splice(index, 1);
        });
      });
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
        analyst: false,
        itemId: this.values.id,
        reputationalSearchGrants: []
      } as any;
      for (const i of this.modules) {
        const obj = {
          itemId: i.id,
          analyst: false,
          operator: false,
          mssp_customer: false
        } as any;
        mod.superSearchGrants.reputationalSearchGrants.push(obj);
      }
    }
    return mod || ({} as any);
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
  onClickSSG(item, key, user = null) {
    if (user) {
      this.clearAll(user.superSearchGrants.reputationalSearchGrants);
    }
    if (item === null || typeof item === 'undefined') {
      item = {} as any;
    }
    item[key] = !item[key];

    this.edit();
  }

  /**
   * Nombre:                  onClickSSG
   * Descripcion:             metodo que se ejecuta desde la interfaz al click de checbok de rsg
   * @author                  lguzman
   * @since                   9/14/2018 - 5:55 PM
   */
  onClickRSG(ssg, key, index) {
    if (!ssg) {
      ssg = {} as any;
    }
    if (!ssg.reputationalSearchGrants) {
      ssg.reputationalSearchGrants = [];
    }
    if (!ssg.reputationalSearchGrants[index]) {
      ssg.reputationalSearchGrants[index] = {
        analyst: true,
        operator: false,
        mssp_customer: false,
        itemId: this.modules[index].id,
        name: this.modules[index].name
      };
    }
    ssg.reputationalSearchGrants[index][key] = !ssg.reputationalSearchGrants[index][key];
    this.edit();
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
    return form.reputationalSearchGrants.length + 1;
  }

  reloadBlacklistData(isLoading = true) {
    this.tableBlackList.header = this.headerBlackList;
    this.tableBlackList.isLoading = isLoading;

    if (!this.tableBlackList.pagination.num_regs) {
      this.tableBlackList.pagination.num_regs = 10;
    }
    if (!this.tableBlackList.pagination.page) {
      this.tableBlackList.pagination.page = 1;
    }

    const params = {
      p: true,
      page: this.tableBlackList.pagination.page,
      maxRows: this.tableBlackList.pagination.num_regs
    };

    this.orgService
      .getBlacklistList(this.selectedOrganization.id, params)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.tableBlackList.results.total_resources = data.totalRegistres;
          this.tableBlackList.results.list = data.blacklist;
          if (this.adminTable) {
            this.adminTable.setLastIndex();
            this.adminTable.setPages();
          }
          this.tableBlackList.isLoading = false;
        },
        () => {
          this.tableUser.isLoading = false;
        }
      );
  }

  /**
   * Nombre:                  inSelectedUser
   * Descripcion:             metodo que valida para la interfaz si un usuario fue seleccioado
   * @author                  lguzman
   * @since                   9/14/2018 - 5:58 PM
   * @param id
   */
  inSelectedUser(id) {
    return this.userSelected.findIndex((e) => e.userId === id) !== -1;
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

  activeChange(option) {
    if (option === this.arrayTabs[5]) {
      this.getGrantsOrg(this.values.id);
    }
  }

  getModuleList(rsg) {
    return this.modules.find((e) => e.id === rsg.itemId) || ({} as any);
  }

  newUpdate() {
    const values = this.form.getRawValue();

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

    this.isUpdating = true;
    this.orgService
      .editOrganization(this.removeEmpty(values))
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
          this.isUpdating = false;
        })
      )
      .subscribe(
        () => this.toastrService.success('Organization succesfully updated', 'Updated'),
        (error) => this.toastrService.error(error, 'Error', { timeOut: 5000 })
      );
  }

  openEditBlacklist(event, editionMode) {
    this.itemSelected = event;
    this.showAddBlackList = true;
    this.editionMode = editionMode;
    this.instanceBlacklist(this.itemSelected);
  }

  createEditBlacklist(item) {
    if (this.formBlacklist.valid) {
      if (item.id) {
        this.orgService
          .editBlacklist(this.selectedOrganization.id, item)
          .pipe(takeUntil(this.destroy$))
          .subscribe(() => {
            this.tableBlackList.isLoading = false;
            this.reloadBlacklistData();
            this.itemSelected = null;
            this.showAddBlackList = false;
            this.formBlacklist.reset();
          });
      } else {
        this.orgService
          .addElementBlacklist(this.selectedOrganization.id, item)
          .pipe(takeUntil(this.destroy$))
          .subscribe(() => {
            this.tableBlackList.isLoading = false;
            this.reloadBlacklistData();
            this.itemSelected = null;
            this.showAddBlackList = false;
            this.formBlacklist.reset();
          });
      }
    }
  }

  deleteConfirmationBacklist(item) {
    this.orgService
      .deleteBlacklistElement(this.selectedOrganization.id, item)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        () => {
          this.tableBlackList.isLoading = false;
          this.reloadBlacklistData();
          this.itemSelected = null;
          this.confirmation = {} as any;
        },
        () => {
          this.tableBlackList.isLoading = false;
        }
      );
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
    this.openDropdown = false;
  }

  searchCustomer(e) {
    if (e.length > 1) {
      this.userService
        .getCompany(e, 5)
        .pipe(takeUntil(this.destroy$))
        .subscribe((res: any) => {
          this.customerList = res.content;
          this.openDropdown = true;
          this.checkCustomerName(e, res.content);
        });
    } else if (e.length === 0) {
      this.customerList = [];
      this.openDropdown = false;
      this.form.controls['customerId'].setValue('');
    }
    {
      this.customerList = [];
      this.openDropdown = false;
    }
  }

  checkCustomerName(value, customers) {
    const match = customers.filter((customer) => {
      return customer.name.toLowerCase() === value.toLowerCase();
    });
    if (match.length) {
      this.selectedCustomer = match[0].name;
      this.customerError = false;
      this.form.controls['customerId'].setValue(match[0].id);
      this.openDropdown = false;
    }
  }

  onCloseModal(event) {
    this.showUsers = event;
  }
}

export class IpDomainUrlValidator {
  static IsvalidInput(AC: AbstractControl) {
    let inputValue = '';
    if (AC.get('url').value) {
      inputValue = AC.get('url').value;
    }

    function checkAllCasuistics(input) {
      return IpValidator(input) || domainValidator(input) || urlValidator(input);
    }

    function IpValidator(value) {
      return !!value.match(
        /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/
      );
    }

    function urlValidator(value) {
      return !!value.match(/(?=^.{4,253}$)(^((?!-)[a-zA-Z0-9-]{0,62}[a-zA-Z0-9]\.)+[a-zA-Z]{2,63}$)/);
    }

    function domainValidator(value) {
      return !!value.match(/[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+/);
    }

    const isValid = checkAllCasuistics(inputValue);
    if (!isValid) {
      AC.get('url').setErrors({ IsvalidInput: true });
    }
  }
}
