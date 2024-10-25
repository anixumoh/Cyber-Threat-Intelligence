import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';

import { UsersService } from '../users.service';
import { CommonAdmin } from '../../shared/common-admin';
import { TableConfig } from '../../shared/table-config';
import { UserAccountService } from '../../../dashboard/user/account.service';
import { instanceHeaderMin } from 'app/admin/shared/utils';

@Component({
  selector: 'app-new-edit-groups',
  templateUrl: './new-edit-groups.component.html',
  styleUrls: ['./new-edit-groups.component.scss']
})
export class NewEditGroupsComponent extends CommonAdmin implements OnInit {
  @Output() closeEmit = new EventEmitter();
  @Output() successEmit = new EventEmitter();
  tableUser = new TableConfig();
  form: UntypedFormGroup;
  groupDetail: any;
  loadInit: boolean;
  usersSelected = [];
  previousList = [];
  viewSelected = false;
  private readonly destroy$ = new Subject<void>();

  get header() {
    const retorno = [];
    retorno.push(instanceHeaderMin('name', 'First Name'));
    retorno.push(instanceHeaderMin('username', 'Username'));
    retorno.push(instanceHeaderMin('addRemove', '', true, true, ' text-right'));
    return retorno;
  }

  get values() {
    return this.form.getRawValue();
  }

  get users() {
    return this.form.controls['users'] as UntypedFormArray;
  }

  constructor(
    protected userService: UsersService,
    protected fb: UntypedFormBuilder,
    private userAccountService: UserAccountService
  ) {
    super();
  }

  ngOnInit() {
    this.instanceForm();
    this.userAccountService
      .getState()
      .pipe(takeUntil(this.destroy$), take(1))
      .subscribe((state) => {
        this.tableUser.pagination.num_regs = state?.defaultRows || 10;
        this.tableUser.pagination.page = 1;
        this.getUsers();
      });
  }

  instanceForm(data = null, isNew = false) {
    this.form = this.fb.group({
      id: [data && data.id ? data.id : ''],
      name: [data && data.name ? data.name : '', Validators.required],
      users: this.fb.array([])
    });

    this.isNew = isNew ? isNew : !data;
    if (!this.isNew && !this.loadInit && data && data.id) {
      this.loadInit = true;
      this.getGroupDetail(data.id);
    }
  }

  addUsers(a: number) {
    this.users.push(new UntypedFormControl(a, Validators.required));
  }

  createEdit() {
    if (!this.form.valid) {
      this.markFormGroupTouched(this.form);
      return;
    }

    this.isNew ? this.create() : this.edit();
  }

  create() {
    this.userService
      .createGroup(this.values)
      .pipe(takeUntil(this.destroy$))
      .subscribe((tz) => this.successEmit.emit(tz));
  }

  edit() {
    this.userService
      .editUserGroup(this.values)
      .pipe(takeUntil(this.destroy$))
      .subscribe((tz) => this.successEmit.emit(tz));
  }

  closeModal() {
    this.closeEmit.emit(null);
  }

  getUsers() {
    if (!this.viewSelected) {
      this.tableUser.header = this.header;
      this.tableUser.isLoading = true;
      const pagination = this.tableUser.queryPagination.replace('num_regs', 'maxRows');
      this.userService
        .getUsers(pagination)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (a) => {
            this.tableUser.results = a;
            this.tableUser.isLoading = false;
          },
          () => {
            this.tableUser.isLoading = false;
          }
        );
    }
  }

  getGroupDetail(id) {
    this.userService
      .getGroupDetail(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((a) => {
        if (a.userMap) {
          const ids = Object.keys(a.userMap);
          for (const s of ids) {
            a.userMap[s].id = Number(s);
            this.addUser(a.userMap[s]);
          }
        }
      });
  }

  removeUser(index, item) {
    if (item && item.id) {
      const pos = this.usersSelected.findIndex((e) => e.id === item.id);
      if (pos !== -1) {
        this.usersSelected.splice(pos, 1);
      }
    }
    this.users.removeAt(index);
  }

  addUser(item) {
    this.usersSelected.push(item);
    this.addUsers(Number(item.id));
  }

  getIndex(user) {
    const id = Number(user.id);
    return this.values.users.indexOf(id);
  }

  viewOnlySelected() {
    this.viewSelected = !this.viewSelected;
    if (this.viewSelected) {
      this.previousList = [...this.tableUser.results.list];
      this.tableUser.results.list = this.usersSelected;
    } else {
      this.tableUser.results.list = [...this.previousList];
    }
  }
}
