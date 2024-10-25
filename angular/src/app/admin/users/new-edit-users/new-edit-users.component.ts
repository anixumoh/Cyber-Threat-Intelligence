import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, switchMap, filter, debounceTime } from 'rxjs/operators';
import {
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CommonAdmin } from '../../shared/common-admin';
import { UsersService } from '../users.service';
import { UserAccountService } from '../../../dashboard/user/account.service';
import { OrganizationService } from '../../organization/organization.service';
import { dateFromMiliseconds } from '../../../utils/functions';
import { DateValidator } from './date.validator';
import { Grants } from '../../../services/grants/grants';

@Component({
  selector: 'app-new-edit-users',
  templateUrl: './new-edit-users.component.html',
  styleUrls: ['./new-edit-users.component.scss']
})
export class NewEditUsersComponent extends CommonAdmin implements OnInit, OnDestroy {
  @Output() closeEmit = new EventEmitter();
  @Output() successEmit = new EventEmitter();

  form: UntypedFormGroup;
  selectedUser: any;
  listTimeZone = [];
  listGroups = [];
  listOrg = [];
  listMod = {} as any;
  showOrg: boolean;
  orgSelected: any;
  loadedGrant: boolean;
  actualDate: any;
  defaultTimeZone = 408;
  usernameError;
  usermailError;
  isSuperAdmin = false;
  loading = false;
  userList = [];
  companyList = [];
  openDropdown = false;
  selectedCompany = '';
  companyError = false;
  noCustomerValidation = false;
  isLoadingCustomer = false;
  private readonly destroy$ = new Subject<void>();
  searchCustomers$ = new Subject();

  constructor(
    protected userService: UsersService,
    private cd: ChangeDetectorRef,
    protected accountService: UserAccountService,
    protected orgService: OrganizationService,
    protected fb: UntypedFormBuilder,
    public userGrants: Grants,
    private toastrService: ToastrService
  ) {
    super();
  }

  get values() {
    return this.form.getRawValue();
  }

  get listOrganizations() {
    let retorno: any;
    const idSelected = this.values.grants.superSearchGrants.map((e) => e.itemId) || [];
    if (this.listOrg && this.listOrg.length) {
      retorno = this.listOrg.filter((e) => idSelected.indexOf(e.id) === -1);
    }
    return retorno;
  }

  get grants() {
    return this.form.controls['grants'] as UntypedFormArray;
  }

  get superSearchGrants(): any {
    return this.grants.controls['superSearchGrants'] as UntypedFormArray;
  }

  get regexPassword(): any {
    const pwdRegex = /(?=^.{10,}$)((?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^A-Za-z0-9]))^.*$/;
    return pwdRegex;
  }

  ngOnInit() {
    this.isSuperAdmin = this.userGrants.isMaster() || this.userGrants.isSuperAdmin();

    if (this.selectedUser) {
      this.getSelectedUser(this.selectedUser.id);
    }
    this.getActualDate();
    this.instanceForm();
    this.getTimesZone();
    this.getGroups();
    this.getOrg();

    this.initSubject();
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
      .subscribe((value) => this.searchCompany(value));
  }

  debounceSearch(event: any) {
    const { value } = event.target;
    this.searchCustomers$.next(value);
  }

  instanceForm(data = null, isNew = false) {
    this.form = this.fb.group(
      {
        id: [data && data.id ? data.id : ''],
        name: [data && data.name ? data.name : '', Validators.required],
        firstSurname: [data && data.firstSurname ? data.firstSurname : '', Validators.required],
        secondSurname: [data && data.secondSurname ? data.secondSurname : ''],
        address: [data && data.address ? data.address : ''],
        email: [data && data.email ? data.email : '', [Validators.required, Validators.pattern(this.regexEmail)]],
        username: [
          data && data.username ? data.username : '',
          [Validators.required, usernameValidator(/^[^\]!?#^\"'%&;()<>/={}|*+~`\[/\s]*$/)]
        ],
        password: [data && data.password ? data.password : ''],
        telephone: [data && data.telephone ? data.telephone : null],
        cellphone: [data && data.cellphone ? data.cellphone : null, [Validators.pattern(this.regexPhone)]],
        job: [data && data.job ? data.job : ''],
        customerId: [data && data.customerId ? data.customerId : ''],
        expirationTime: [data && data.expirationTime ? dateFromMiliseconds(data.expirationTime) : ''],
        timezone: [data && data.timezone ? data.timezone : 'Europe/Madrid', Validators.required],
        api: [data && data.api ? data.api : false],
        grants: this.fb.group({
          master: [data && data.grants && data.grants.master ? data.grants.master : false],
          superadmin: [data && data.grants && data.grants.superadmin ? data.grants.superadmin : false],
          mssp_admin: [data && data.grants && data.grants.mssp_admin ? data.grants.mssp_admin : false],
          sales: [data && data.grants && data.grants.sales ? data.grants.sales : false],
          superSearchGrants: this.fb.array([])
        })
      },
      { validator: DateValidator.IsvalidDate }
    );

    if (data && data.grants && data.grants.superSearchGrants && data.grants.superSearchGrants.length) {
      for (const sg of data.grants.superSearchGrants) {
        this.addSuperSearchGrants(sg);
      }
    }

    this.isNew = isNew ? isNew : !data;
    if (!this.isNew && data.id && !this.loadedGrant) {
      this.loadedGrant = true;
      this.loadGrants(data.id);
    }

    if (!this.isNew) {
      this.form.controls['password'].setValidators([Validators.required]);
    } else {
      this.form.controls['password'].setValidators([Validators.required, Validators.pattern(this.regexPassword)]);
    }
  }

  dateB_minus_dateA(dayActual, inputDay) {
    if (
      Number(dayActual[0]) < Number(inputDay[0]) ||
      Number(dayActual[1]) < Number(inputDay[1]) ||
      Number(dayActual[2]) < Number(inputDay[2])
    ) {
      return true;
    }

    return false;
  }

  loadGrants(id) {
    this.userService
      .getGrants(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((tz) => {
        const obj = this.values;
        obj.grants = tz;
        this.instanceForm(obj, this.isNew);
      });
  }

  addSuperSearchGrants(obj = null) {
    this.superSearchGrants.push(this.instanceSuperSearchGrants(obj));
  }

  instanceSuperSearchGrants(data) {
    const form = this.fb.group({
      itemId: [data && data.itemId ? data.itemId : ''],
      analyst: [data && data.analyst ? data.analyst : false],
      operator: [data && data.operator ? data.operator : false],
      mssp_customer: [data && data.mssp_customer ? data.mssp_customer : false],
      reputationalSearchGrants: this.fb.array([])
    });

    for (const key of ['analyst', 'operator', 'mssp_customer']) {
      form.controls[key].valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
        setTimeout(() => {
          this.validateFormAll(form);
        }, 500);
      });
    }
    if (data && data.reputationalSearchGrants && data.reputationalSearchGrants.length) {
      for (const i of data.reputationalSearchGrants) {
        this.addReputationalSearchGrants(form, i);
      }
    }

    if (data.itemId) {
      this.getMod(data.itemId);
    }
    return form;
  }

  validateFormAll(form) {
    const enable = !this.activeOption(form);
    this.reputationalSearchGrants(form).controls.forEach((e: any) => {
      if (!enable) {
        e.controls['mssp_customer'].setValue(false);
        e.controls['analyst'].setValue(false);
        e.controls['operator'].setValue(false);
      }
    });
  }

  reputationalSearchGrants(form) {
    return form.controls['reputationalSearchGrants'];
  }

  removeSuperSearchGrant(index) {
    this.superSearchGrants.removeAt(index);
    this.orgSelected = null;
  }

  addReputationalSearchGrants(form, obj = null) {
    this.reputationalSearchGrants(form).push(this.instanceReputationalSearchGrants(obj));
  }

  instanceReputationalSearchGrants(data = null) {
    const group = this.fb.group({
      itemId: [data && data.itemId ? data.itemId : ''],
      analyst: [!!data.analyst],
      operator: [!!data.operator],
      mssp_customer: [!!data.mssp_customer]
    });

    return group;
  }

  closeModal() {
    this.closeEmit.emit(null);
  }

  getActualDate() {
    this.actualDate = new Date();
    let dd = this.actualDate.getDate();
    let mm = this.actualDate.getMonth() + 1; // January is 0!

    const yyyy = this.actualDate.getFullYear();
    if (dd < 10) {
      dd = '0' + dd;
    }
    if (mm < 10) {
      mm = '0' + mm;
    }
    this.actualDate = dd + '.' + mm + '.' + yyyy;
  }

  getTimesZone() {
    this.accountService
      .getTimesZones()
      .pipe(takeUntil(this.destroy$))
      .subscribe((tz) => (this.listTimeZone = tz));
  }

  getGroups() {
    this.userService
      .getGroups()
      .pipe(takeUntil(this.destroy$))
      .subscribe((tz) => (this.listGroups = tz));
  }

  getOrg() {
    this.orgService
      .getOrganizations()
      .pipe(takeUntil(this.destroy$))
      .subscribe((tz) => {
        this.listOrg = tz;
        this.cd.detectChanges();
      });
  }

  getMod(idOrg) {
    if (!this.listMod[idOrg]) {
      this.orgService
        .getModulesByOrg(idOrg)
        .pipe(takeUntil(this.destroy$))
        .subscribe((tz) => {
          this.listMod[idOrg] = tz;
          this.reloadModules(idOrg);
        });
    }
  }

  reloadModules(idOrg) {
    this.superSearchGrants.controls.forEach((control) => {
      if (control.controls['itemId'].value === idOrg) {
        for (const i of this.listMod[idOrg]) {
          const reputationalSearchGrants = control.value.reputationalSearchGrants;
          const filterRSG = reputationalSearchGrants.filter((e) => e.itemId === i.id)[0];
          if (!filterRSG) {
            this.addReputationalSearchGrants(control, { itemId: i.id });
          }
        }
      }
    });
  }

  selectedOrg(org) {
    this.addSuperSearchGrants({ itemId: org.id });
  }

  getSelectedUser(id) {
    this.userService
      .getUserById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        if (this.isSuperAdmin && user.customerId) {
          this.getCompanyName(user.customerId);
        }
        this.instanceForm(user);
      });
  }

  getCompanyName(id) {
    this.userService
      .getCompanyName(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.selectedCompany = res.name;
      });
  }

  module(idOrg, idMod) {
    if (!(this.listMod && this.listMod[idOrg] && this.listMod[idOrg].length)) {
      return {} as any;
    }
    return this.listMod[idOrg].filter((e) => e.id === idMod)[0];
  }

  organization(id) {
    return this.listOrg.filter((e) => e.id === id)[0] || ({} as any);
  }

  disableOperatorModule(form, key) {
    const values = form.value;
    const retorno = this.activeOption(form);
    return retorno && !values[key];
  }

  createEdit() {
    this.loading = true;
    if (!this.form.valid) {
      this.markFormGroupTouched(this.form);
      if (!this.form.controls['customerId'].value && (this.userGrants.isMaster() || this.userGrants.isSuperAdmin())) {
        this.noCustomerValidation = true;
      }
      this.loading = false;
      if (this.openDropdown) {
        this.companyError = true;
      }
      return;
    } else if (this.openDropdown) {
      this.companyError = true;
      this.loading = false;
      return;
    } else if (
      !this.form.controls['customerId'].value &&
      (this.userGrants.isMaster() || this.userGrants.isSuperAdmin())
    ) {
      this.loading = false;
      this.noCustomerValidation = true;
      return;
    } else if (
      !this.isChecked('master') &&
      !this.isChecked('superadmin') &&
      !this.isChecked('mssp_admin') &&
      !this.values.grants.superSearchGrants.length
    ) {
      this.toastrService.error(
        'To save the modifications or create a new user it is necessary to assign a role, an organization and module permissions',
        'Error'
      );
      this.loading = false;
      return;
    }

    this.isNew ? this.create() : this.edit();
  }

  create() {
    this.userService
      .create(this.values)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (tz) => {
          this.successEmit.emit(tz);
          this.loading = false;
        },
        (error) => this.handleErrorMessages(error)
      );
  }

  resetCustomer() {
    this.form.controls['customerId'].setValue('');
    this.selectedCompany = '';
    this.companyError = false;
    this.openDropdown = false;
    this.noCustomerValidation = false;
  }

  edit() {
    this.reformatDateForBackend(this.values);
    this.userService
      .edit(this.values, this.selectedUser.id)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.userService.putGrant(this.selectedUser.id, this.values.grants))
      )
      .subscribe(
        (tz) => {
          this.successEmit.emit(tz);
          this.loading = false;
        },
        (error) => this.handleErrorMessages(error)
      );
  }

  reformatDateForBackend(object) {
    if (object.expirationTime.indexOf('.') > 0) {
      object.expirationTime = object.expirationTime.replace(/\./g, '/');
      this.instanceForm(object);
    } else {
      return object;
    }
  }

  rowsSpan(form) {
    if (this.activeOption(form)) {
      return 1;
    }
    return this.reputationalSearchGrants(form).controls.length + 1;
  }

  activeOption(form) {
    if (form.controls['mssp_customer'].value) {
      return 'mssp_customer';
    }
    if (form.controls['operator'].value) {
      return 'operator';
    }
    if (form.controls['analyst'].value) {
      return 'analyst';
    }
    return null;
  }

  searchCompany(e: string) {
    this.isLoadingCustomer = true;
    if (e.length) {
      this.userService
        .getCompany(e, 5)
        .pipe(takeUntil(this.destroy$))
        .subscribe((res: any) => {
          this.companyList = res.content;
          this.openDropdown = true;
          this.checkCompanyName(e, res.content);
          this.isLoadingCustomer = false;
        });
    } else {
      this.isLoadingCustomer = false;
      this.resetCustomer();
    }
    {
      this.companyList = [];
      this.openDropdown = false;
    }
  }

  checkCompanyName(value: string, companies: any[]) {
    const match = companies.filter((company) => company.name.toLowerCase() === value.toLowerCase());
    if (match.length) {
      this.selectedCompany = match[0].name;
      this.companyError = false;
      this.noCustomerValidation = false;
      this.form.controls['customerId'].setValue(match[0].id);
      this.openDropdown = false;
    }
  }

  handleErrorMessages({ error }) {
    this.loading = false;
    if (error.field === 'Username already exists') {
      this.usernameError = 'This username is already in use.';
      this.usermailError = '';
    } else if (error.field === 'Email already exists') {
      this.usermailError = 'This e-mail is already in use';
      this.usernameError = '';
    } else {
      this.toastrService.error(error.field, 'Error', {
        timeOut: 5000
      });
    }
  }

  checkUsername() {
    if (this.form.controls['username'].errors?.forbiddenName) {
      return 'Username must not contain white spaces or invalid characters';
    }
  }

  changeCheckbox(ev, type) {
    const rawValue = this.grants.getRawValue();

    const obj = {
      master: type === 'master',
      superadmin: type === 'superadmin',
      mssp_admin: type === 'mssp_admin',
      sales: false
    };

    rawValue['superSearchGrants'].map((el, index) => {
      this.removeSuperSearchGrant(index);
    });

    this.form.controls.grants.patchValue(obj);
  }

  isChecked(type) {
    return this.form.controls.grants.value[type];
  }
}

export function usernameValidator(regex: RegExp): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const nameTest = !regex.test(control.value);
    return nameTest ? { forbiddenName: { value: control.value } } : null;
  };
}
