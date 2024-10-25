import { Component, ComponentFactoryResolver, OnInit, ViewContainerRef, ViewChild, OnDestroy } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Subject, BehaviorSubject, Observable, of } from 'rxjs';
import { filter, mergeMap, switchMap, takeUntil, distinctUntilChanged, debounceTime, finalize } from 'rxjs/operators';

import { UsersService } from '../../users.service';
import { TableConfig } from '../../../shared/table-config';
import { NewEditUsersComponent } from '../../new-edit-users/new-edit-users.component';
import { UserDetailComponent } from '../../user-detail/user-detail.component';
import { CommonAdmin } from '../../../shared/common-admin';
import { TableComponent } from 'app/admin/shared/table/table.component';
import { UserAccountService } from 'app/dashboard/user/account.service';
import { from } from 'rxjs';
import { Grants } from 'app/services/grants/grants';
import { instanceHeader } from 'app/admin/shared/utils';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent extends CommonAdmin implements OnInit, OnDestroy {
  @ViewChild('adminTable') adminTable: TableComponent;

  form: UntypedFormGroup;
  table = new TableConfig();
  userSelected: any;
  confirmation = {} as any;
  changeTrue: boolean;
  orderBy = { key: '', direction: true };
  deleteMultipleConfirmation = false;
  isSearchOpen = false;
  userQuery: string;
  initMaxRows: number;
  searchedText = '';
  searchFilter$: Observable<any>;
  isOpenUserChangeStatus = false;
  private searchFilterSubject: BehaviorSubject<string>;
  private readonly destroy$ = new Subject<void>();

  get isSuperadmin() {
    return this.grants.isMaster() || this.grants.isSuperAdmin();
  }

  get rows() {
    let retorno = [];
    if (this.table && this.table.results && this.table.results.list) {
      retorno = this.table.results.list;
    }
    return retorno;
  }

  get header() {
    const retorno = [];
    retorno.push(instanceHeader('name', 'First Name', false, false, true, 'td-100', 'icon-sort'));
    retorno.push(instanceHeader('firstSurname', 'Surname', false, false, false, 'td-80', 'icon-sort'));
    retorno.push(instanceHeader('username', 'Username', false, false, false, 'td-80', 'icon-sort'));
    retorno.push(instanceHeader('job', 'Company', false, false, false, 'td-100', 'icon-sort'));
    retorno.push(instanceHeader('lastLoginAt', 'Last Login', false, true, false, 'td-100', 'icon-sort'));
    retorno.push(
      instanceHeader('status', 'status', false, true, false, 'justify-content-center text-center td-40', false)
    );
    retorno.push(
      instanceHeader('masterGrant', 'rol', false, false, false, 'justify-content-center text-center td-70', 'icon-sort')
    );
    if (this.isSuperadmin) {
      retorno.push(
        instanceHeader('resetMfa', 'resetMfa', true, true, false, 'justify-content-center text-center td-15', false)
      );
    }
    retorno.push(
      instanceHeader('keypass', 'Passw', true, true, false, 'justify-content-center text-center td-15', false)
    );
    retorno.push(instanceHeader('edit', 'Passw', true, true, false, 'justify-content-center text-center td-15', false));
    retorno.push(
      instanceHeader('delete', 'Passw', true, true, false, 'justify-content-center text-center td-15', false)
    );

    return retorno;
  }

  get itemsSelected() {
    let retorno = [];
    if (this.table?.results?.list?.length) {
      retorno = this.table.results.list.filter((e) => e.isSelected) || [];
    }
    return retorno;
  }

  get values() {
    return this.form.getRawValue();
  }

  constructor(
    protected userService: UsersService,
    protected fr: ComponentFactoryResolver,
    protected fb: UntypedFormBuilder,
    protected view: ViewContainerRef,
    private userAccountService: UserAccountService,
    private grants: Grants
  ) {
    super();
    this.searchFilterSubject = new BehaviorSubject<string>('null');
    this.searchFilter$ = this.searchFilterSubject.asObservable();
  }

  ngOnInit() {
    this.userAccountService
      .getState()
      .pipe(
        takeUntil(this.destroy$),
        switchMap((state) => {
          if (state) {
            this.initMaxRows = state && state.defaultRows ? state.defaultRows : 10;
            return this.grants.getGrantsSubject();
          } else {
            return of(null);
          }
        })
      )
      .subscribe((grants) => {
        if (grants) {
          this.reloadData(true, this.initMaxRows);
        }
      });

    this.searchFilter$
      .pipe(
        takeUntil(this.destroy$),
        filter((term) => term === '' || term.length >= 3),
        debounceTime(1500),
        distinctUntilChanged()
      )
      .subscribe((searchTerm) => {
        if (searchTerm !== 'null') {
          this.userQuery = searchTerm;
          this.reloadData(true);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  reloadData(firstPage, initMaxRows?: any) {
    this.table.isLoading = true;
    this.table.header = this.header;

    if (initMaxRows) {
      this.table.pagination.num_regs = initMaxRows;
    }

    if (this.orderBy.key) {
      this.table.queryParam = { ...this.table.queryParam, ...{ orderBy: this.orderBy.key } };
      this.table.pagination.sort = this.orderBy.direction;
      for (const header of this.table.header) {
        if (header.sort) {
          header.sort =
            this.orderBy.key === header.key
              ? this.orderBy.direction
                ? 'icon-sort-desc'
                : 'icon-sort-asc'
              : 'icon-sort';
        }
      }
    }
    let paginationQuery = this.table.queryPagination;
    let usersPagination = 'p=true';
    if (initMaxRows) {
      paginationQuery += '&page=1';
    }
    usersPagination += paginationQuery.replace('num_regs', '&maxRows');
    usersPagination = usersPagination.replace('orderBy', 'o');
    usersPagination = usersPagination.replace('sort', 's');
    usersPagination =
      usersPagination.includes('&page') && this.userQuery ? usersPagination + `&q=${this.userQuery}` : usersPagination;
    usersPagination = firstPage ? usersPagination.replace(/&page=[0-9]+/, '&page=1') : usersPagination;
    usersPagination = usersPagination + `&extraFields=true`;
    this.userService
      .getUsers(usersPagination)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.table.isLoading = false))
      )
      .subscribe((a) => {
        this.table.results = a;
        this.table.results.list = a.list.map((e) => {
          e.isEnabled = e.status === 'ENABLED';
          if (e.status === 'PASSWORD_EXPIRED') {
            e.statusWarning = 'User password has been expired. Please, reset the password';
          } else if (e.daysToPasswordChange <= 15) {
            e.statusWarning = `The password will expire in ${e.daysToPasswordChange} day(s)`;
          }
          return e;
        });

        if (firstPage && this.adminTable) {
          this.adminTable.changePageWithoutReload(1);
        }
        if (this.adminTable) {
          this.adminTable.setLastIndex();
          this.adminTable.setPages();
        }
      });
  }

  createEdit(obj = null) {
    const resolver = this.fr.resolveComponentFactory(NewEditUsersComponent);
    const ref: any = this.view.createComponent(resolver);
    ref.instance.selectedUser = obj;
    ref.changeDetectorRef.detectChanges();
    ref.instance.closeEmit.pipe(takeUntil(this.destroy$)).subscribe(() => this.view.clear());
    ref.instance.successEmit.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.view.clear();
      this.reloadData(false);
    });
    if (obj) {
      ref.instance.instanceForm(obj);
      ref.changeDetectorRef.detectChanges();
    }
  }

  deleteAdminUser(user) {
    this.userService
      .delete(user)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.table.isLoading = false))
      )
      .subscribe(() => {
        this.reloadData(false);
        this.userSelected = null;
        this.confirmation = {} as any;
      });
  }

  checkPassword() {
    if (!this.regexForPassword(this.values.password1)) {
      return 'Password must contain at least 10 characters, with 1 digit, 1 uppercase letter and 1 special character.';
    } else if (this.values.password1 !== this.values.password2) {
      return 'Passwords do not match';
    } else {
      return '';
    }
  }

  regexForPassword(password) {
    const passwordRegex = /(?=^.{10,}$)((?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^A-Za-z0-9]))^.*/g;
    return password.match(passwordRegex);
  }

  enable(user) {
    if (user.status === 'ENABLED' || user.status === 'DISABLED' || user.status === 'LOCKED') {
      if (user.status === 'LOCKED' || user.status === 'DISABLED') {
        user.status = 'ENABLED';
      } else {
        user.status = 'DISABLED';
      }
      this.userService
        .newStatusUser(user)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => (this.table.isLoading = false))
        )
        .subscribe(() => {
          this.reloadData(false);
          this.userSelected = null;
          this.confirmation = {} as any;
        });
    }
  }

  deleteMultiple() {
    for (const item of this.itemsSelected) {
      this.deleteAdminUser(item);
    }
  }

  enableMultiple(enable = true) {
    from(this.itemsSelected)
      .pipe(
        takeUntil(this.destroy$),
        filter((item) => item.isEnabled !== enable),
        finalize(() => (this.table.isLoading = false)),
        mergeMap((item) => {
          return this.userService.newStatusUser({ ...item, isEnabled: enable });
        })
      )
      .subscribe(() => {
        this.reloadData(false);
        this.userSelected = null;
        this.confirmation = {} as any;
      });
  }

  clickOnARow(event) {
    const resolver = this.fr.resolveComponentFactory(UserDetailComponent);
    const ref: any = this.view.createComponent(resolver);
    ref.instance.userId = event.data.id;
    ref.changeDetectorRef.detectChanges();
    ref.instance.onCloseEmit.pipe(takeUntil(this.destroy$)).subscribe(() => this.view.clear());
    ref.instance.onSuccess.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.createEdit(event.data);
      this.view.clear();
    });
  }

  instanceFormPass(item) {
    this.confirmation['password'] = true;
    this.userSelected = item;
    this.form = this.fb.group(
      {
        id: [item.id],
        password1: ['', Validators.required],
        password2: ['', Validators.required],
        msj: ['']
      },
      {
        validator: PasswordValidation.MatchPassword
      }
    );
  }

  changePass() {
    if (!this.form.valid) {
      this.markFormGroupTouched(this.form);
      return;
    }
    this.userService
      .changePass(this.values.id, this.values.password2)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.changeTrue = true;
        this.reloadData(false);
      });
  }

  getClassTD(header) {
    let retorno = 'align-middle ';
    if (header.class) {
      retorno += header.class;
    }

    retorno += header.hasDetail ? ' cursor-pointer text-primary' : ' cursor-pointer';
    return retorno;
  }

  onSort(data) {
    this.setOrderBy(data.key);
    this.reloadData(false);
  }

  search() {
    this.searchFilterSubject.next(this.searchedText);
  }

  filterUsers() {
    const paginationQuery = this.table.queryPagination;
    let usersPagination = paginationQuery.replace('num_regs', 'maxRows');
    usersPagination = usersPagination.replace('orderBy', 'o');
    usersPagination = usersPagination.replace('sort', 's');
    usersPagination = usersPagination.replace(/&page=[0-9]+/, '&page=1');
    usersPagination = usersPagination + `&q=${this.userQuery}`;
    this.userService
      .getUsers(usersPagination)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.table.isLoading = false))
      )
      .subscribe((a) => {
        this.table.results = a;
        this.table.results.list = a.list.map((e) => {
          e.isEnabled = e.status === 'ENABLED';
          return e;
        });
        this.adminTable.setLastIndex();
        this.adminTable.setPages();
      });
  }

  resetMfa(user: any) {
    this.userAccountService
      .resetTwoFactor(user.id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.table.isLoading = false))
      )
      .subscribe(() => {
        this.reloadData(false);
        this.userSelected = null;
        this.confirmation = {} as any;
      });
  }

  private setOrderBy(key) {
    if (this.orderBy.key === key) {
      this.orderBy.direction = !this.orderBy.direction;
    } else {
      this.orderBy = { key, direction: true };
    }
  }
}

export class PasswordValidation {
  static MatchPassword(AC: AbstractControl) {
    const password = AC.get('password1').value;
    const confirmPassword = AC.get('password2').value;
    const isValid = password.match(/(?=^.{10,}$)((?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^A-Za-z0-9]))^.*/g);

    if (password !== confirmPassword) {
      AC.get('password2').setErrors({ MatchPassword: true });
    }
    if (!isValid) {
      AC.get('password1').setErrors({ MatchPassword: true });
    }
  }
}
