import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { TableConfig } from 'app/admin/shared/table-config';
import { instanceHeaderMin } from 'app/admin/shared/utils';
import { UsersService } from 'app/admin/users/users.service';
import { UserAccountService } from 'app/dashboard/user/account.service';
import { cloneDeep } from 'lodash';
import { Subject } from 'rxjs';
import { debounceTime, filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-org-users',
  templateUrl: './org-users.component.html',
  styleUrls: ['./org-users.component.scss']
})
export class OrgUsersComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Input() userSelected = [];
  @Input() isEdit = true;

  @Output() closeModal = new EventEmitter();
  @Output() addUserToOrg = new EventEmitter();
  @Output() removeUser = new EventEmitter();
  @Output() existUsers = new EventEmitter();

  searchUsers$ = new Subject();
  private readonly destroy$ = new Subject<void>();

  userQuery: string;
  tableUser = new TableConfig();

  constructor(protected userService: UsersService, private userAccountService: UserAccountService) {}

  ngOnInit(): void {
    this.initUserAccountService();
    this.initSubject();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get header() {
    const retorno = [];
    retorno.push(instanceHeaderMin('Users', 'Users', false, true));
    return retorno;
  }

  initUserAccountService() {
    this.userAccountService
      .getState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ defaultRows = 10 }: any) => this.reloadData(true, defaultRows));
  }

  initSubject() {
    this.searchUsers$
      .pipe(
        takeUntil(this.destroy$),
        filter((term: string) => term === '' || term?.length >= 3),
        debounceTime(1500)
      )
      .subscribe(() => this.filterUsers());
  }

  inSelectedUser(elementId) {
    return this.userSelected.some(({ userId, id }: any) => userId === elementId || id === elementId);
  }

  selectedUser(org) {
    this.addUserToOrg.next(org);
  }

  removeUserFromList(user: any) {
    const index = this.userSelected.findIndex((e) => e.id === user.id || e.userId === user.id);
    if (index !== -1) {
      this.removeUser.next({ user, index });
    }
  }

  debounceSearch(event: any) {
    const { value } = event.target;
    this.searchUsers$.next(value);
  }

  filterUsers() {
    const paginationQueryFromTable = this.tableUser.queryPagination.split('&');
    let usersPagination = '';
    paginationQueryFromTable.forEach((s) => {
      if (!s.includes('page')) {
        usersPagination += s;
      }
    });
    this.updateTableUser(usersPagination, true);
  }

  reloadData(isLoading = true, initMaxRows?: any) {
    if (initMaxRows) {
      this.tableUser.pagination.num_regs = initMaxRows;
    }
    this.tableUser.header = this.header;
    this.tableUser.isLoading = isLoading;
    const { queryPagination } = this.tableUser;
    this.updateTableUser(queryPagination);
  }

  getUserPagination(paginationQuery, isFilter = false) {
    let usersPagination = paginationQuery.replace('num_regs', 'maxRows');
    if (isFilter) {
      usersPagination = usersPagination.replace('orderBy', 'o').replace('sort', 's');
    }

    usersPagination = `${usersPagination}${this.userQuery ? `&q=${this.userQuery}` : ''}`;
    return usersPagination;
  }

  updateTableUser(usersPagination: any, isFilter = false) {
    const paginationQuery = this.getUserPagination(usersPagination, isFilter);
    this.userService
      .getUsers(paginationQuery)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (a) => {
          const tableUserTmp = cloneDeep(this.tableUser);
          const { pagination: oldPagination, header, isLoading, queryParam } = tableUserTmp;
          const pagination = {
            ...tableUserTmp.pagination,
            ...(oldPagination?.page ? { page: oldPagination.page } : { page: 1 }),
            ...(isFilter ? { page: 1 } : {})
          };
          const newData = new TableConfig(pagination, a, header, isLoading, queryParam);
          this.tableUser = newData;
          this.tableUser.isLoading = false;
          this.existUsers.next(this.tableUser.results.list.length);
        },
        () => {
          this.tableUser.isLoading = false;
        }
      );
  }

  onCloseModal() {
    this.closeModal.emit(false);
  }
}
