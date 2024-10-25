import { Component, ComponentFactoryResolver, OnInit, ViewContainerRef, ViewChild, OnDestroy } from '@angular/core';
import { Subject, Observable, BehaviorSubject, forkJoin } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import * as FileSaver from 'file-saver';
import { ToastrService } from 'ngx-toastr';

import { TableConfig } from '../../shared/table-config';
import { OrganizationService } from '../organization.service';
import { EditOrganizationComponent } from '../edit-organization/edit-organization.component';
import { NewOrganizationComponent } from '../new-organization/new-organization.component';
import { Grants } from '../../../services/grants/grants';
import { TableComponent } from 'app/admin/shared/table/table.component';
import { CommonAdmin } from '../../shared/common-admin';
import { UserAccountService } from 'app/dashboard/user/account.service';
import { instanceHeader } from 'app/admin/shared/utils';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-list-organizations',
  templateUrl: './list-organizations.component.html',
  styleUrls: ['./list-organizations.component.scss']
})
export class ListOrganizationsComponent extends CommonAdmin implements OnInit, OnDestroy {
  @ViewChild('adminTable') adminTable: TableComponent;
  table = new TableConfig();
  selected: any;
  confirmation = {};
  viewMod = {};
  canCreateNewOrganization = true;
  deleteMultipleConfirmation = false;
  orderBy = { key: '', direction: true };
  orgQuery: string;
  initMaxRows: number;
  switchIsDisabled = false;
  showMonitoredAssets = false;
  searchedText = '';
  searchFilter$: Observable<any>;
  instanceSetings;
  loadingAssets = true;
  isDisableByAction = false;
  isModuleDisabled = false;
  private searchFilterSubject: BehaviorSubject<string>;
  private readonly destroy$ = new Subject<void>();

  monitoredAssetsList = [
    { name: 'IPs', type: 'IP' },
    { name: 'IP ranges', type: 'IP_RANGE' },
    { name: 'Domains', type: 'DOMAIN' },
    { name: 'Subdomains', type: 'SUBDOMAIN' },
    { name: 'Keywords', type: 'KEYWORD' },
    { name: 'Bincodes', type: 'BINCODES' }
  ];

  get rows() {
    let retorno = [];
    if (this.table && this.table.results && this.table.results.list) {
      retorno = this.table.results.list;
    }
    return retorno;
  }

  get header() {
    return [
      instanceHeader('name', 'Name', false, false, true, null, 'icon-sort'),
      instanceHeader('enabled', 'Status', false, true, false, 'justify-content-center text-center td-60', false),
      instanceHeader('show', 'show', true, true, false, 'justify-content-center text-center td-30', false),
      instanceHeader('permiss', 'permiss', true, true, false, 'justify-content-center text-center td-30', false),
      instanceHeader('edit', 'edit', true, true, false, 'justify-content-center text-center td-30', false),
      instanceHeader('delete', 'delete', true, true, false, 'justify-content-center text-center td-30', false)
    ];
  }

  get itemsSelected() {
    let retorno = [];
    if (this.table?.results?.list?.length) {
      retorno = this.table.results.list.filter((e) => e.isSelected) || [];
    }
    return retorno;
  }

  get allItemsSelected() {
    return this.table?.results?.list?.length === this.itemsSelected.length;
  }

  constructor(
    protected orgService: OrganizationService,
    protected fr: ComponentFactoryResolver,
    private grants: Grants,
    protected view: ViewContainerRef,
    private userAccountService: UserAccountService,
    private toastrService: ToastrService
  ) {
    super();
    this.searchFilterSubject = new BehaviorSubject<string>('null');
    this.searchFilter$ = this.searchFilterSubject.asObservable();
  }

  ngOnInit() {
    this.userAccountService
      .getState()
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        this.initMaxRows = state && state.defaultRows ? state.defaultRows : 10;
        this.setOrderBy('name');
        this.reloadData(true, this.initMaxRows);
        this.canCreateNewOrganization =
          this.grants.roles.master || this.grants.roles.admin || this.grants.roles.superadmin;
      });
    this.searchFilter$
      .pipe(takeUntil(this.destroy$), debounceTime(1500), distinctUntilChanged())
      .subscribe((searchTerm) => {
        if (searchTerm !== 'null') {
          this.orgQuery = searchTerm;
          this.reloadData(true);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  changeDisableModules(event) {
    this.isModuleDisabled = event;
  }

  isUserUnableDownloadSettings() {
    return this?.grants.isGlobalAnalyst() || this.grants.isAnalyst();
  }

  reloadData(firstPage = false, initMaxRows?: any) {
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
    let orgsPagination = 'p=true';
    if (initMaxRows) {
      paginationQuery += '&page=1';
    }
    orgsPagination += paginationQuery.replace('num_regs', '&maxRows');
    orgsPagination = orgsPagination.replace('orderBy', 'o');
    orgsPagination = orgsPagination.replace('sort', 's');
    orgsPagination =
      orgsPagination.includes('&page') && this.orgQuery ? orgsPagination + `&q=${this.orgQuery}` : orgsPagination;
    orgsPagination = firstPage ? orgsPagination.replace(/&page=[0-9]+/, '&page=1') : orgsPagination;

    this.orgService
      .getOrganizations(orgsPagination)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (a: any[]) => {
          this.table.results = a;

          if (firstPage && this.adminTable) {
            this.adminTable.changePageWithoutReload(1);
          }
          if (this.adminTable) {
            this.adminTable.setLastIndex();
            this.adminTable.setPages();
          }
          this.table.isLoading = false;
        },
        () => {
          this.table.isLoading = false;
        }
      );
  }

  createEdit(obj = null, viewDefault = '') {
    const comp: any = obj ? EditOrganizationComponent : NewOrganizationComponent;
    const resolver = this.fr.resolveComponentFactory(comp);
    const ref: any = this.view.createComponent(resolver);
    ref.instance.selectedOrganization = obj;
    ref.changeDetectorRef.detectChanges();
    ref.instance.closeEmit.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.view.clear();
      this.reloadData();
    });
    ref.instance.successEmit.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.view.clear();
      this.reloadData();
    });
    if (obj) {
      ref.instance.instanceForm(obj);
    }

    if (viewDefault) {
      ref.instance.tabActive = viewDefault;
    }

    ref.changeDetectorRef.detectChanges();
  }

  delete(data) {
    this.orgService
      .delete(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        () => {
          this.table.isLoading = false;
          this.reloadData(false);
          this.selected = null;
          this.confirmation = {};
        },
        () => {
          this.table.isLoading = false;
        }
      );
  }

  openDisableModal(event: MatSlideToggleChange, organization) {
    if (organization.enabled) {
      event.source.checked = true;
      this.confirmation['disable'] = true;
      this.selected = organization;
    } else {
      organization.enabled = true;
      this.enable(organization);
    }
  }

  onCloseDisableConfirmationModal() {
    this.confirmation['disable'] = false;
  }

  enable(data) {
    const { id, name, isLoading } = data;

    if (isLoading) {
      return;
    }
    data.isLoading = true;

    const index = this.table.results.list.findIndex((x) => x.id === id);
    this.table.results.list[index].switchIsDisabled = true;
    this.isDisableByAction = true;

    this.orgService
      .enabled(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        () => {
          setTimeout(() => {
            this.reloadData(false);
            const msg = data.enabled
              ? `${name} was succesfully enabled.`
              : `${name} has been successfully disabled. All users assigned only to this organization have also been disabled.`;
            this.toastrService.success(msg, 'Success');
            this.selected = null;
            this.isDisableByAction = false;
            this.confirmation = {};
          }, 1500);
        },
        () => {
          this.table.results.list[index].switchIsDisabled = false;
          this.table.isLoading = false;
          this.isDisableByAction = false;
          this.toastrService.error('We were not able to do your request. Please try again', 'Error');
        }
      );
  }

  enableMultiple(enable = true) {
    const promises = [];

    this.table.isLoading = true;
    for (const item of this.itemsSelected) {
      item.proccesedStatus = true;
      item.enabled = enable;
      if (item.isLoading) {
        return;
      }
      item.isLoading = true;
      promises.push(this.orgService.enabled(item));
    }
    forkJoin(promises)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        () => {
          this.selected = null;
          this.confirmation = {};
          this.reloadData(false);
          const enabled = enable ? 'enabled' : 'disabled';
          this.toastrService.success(`Organizations were succesfully ${enabled}.`, 'Success');
        },
        () => {
          this.table.isLoading = false;
        }
      );
  }

  deleteMultiple() {
    for (const item of this.itemsSelected) {
      this.delete(item);
    }
  }

  getClassTD(header) {
    let retorno = 'align-middle ';
    if (header.class) {
      retorno += header.class;
    }

    retorno += header.hasDetail ? ' cursor-pointer text-primary' : ' cursor-pointer';
    return retorno;
  }

  exportOrganizationSettings() {
    const date = new Date();
    const today = `${date.getFullYear()}${date.getMonth() + 1}${date.getDate()}`;
    this.orgService
      .exportSettings()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res) => {
          const blob = new Blob([res], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          });
          FileSaver.saveAs(blob, `${today}-modules-settings.xlsx`);
        },
        () => {
          this.toastrService.error('There was an issue exporting the settings', 'Error');
        }
      );
  }

  onSort(data) {
    this.setOrderBy(data.key);
    this.reloadData(false);
  }

  search() {
    this.searchFilterSubject.next(this.searchedText);
  }

  isUserWithAnalystRole() {
    return (
      !this.grants.isMaster() &&
      !this.grants.isSuperAdmin() &&
      !this.grants.isAdmin() &&
      this.grants.isAnyModuleAnalyst()
    );
  }

  toggleMonitoredAssets() {
    this.showMonitoredAssets = !this.showMonitoredAssets;

    if (this.showMonitoredAssets && !this.instanceSetings) {
      this.orgService
        .getInstanceSettings()
        .pipe(takeUntil(this.destroy$))
        .subscribe((res) => {
          this.instanceSetings = res;
          this.loadingAssets = false;
        });
    }
  }

  private setOrderBy(key) {
    if (this.orderBy.key === key) {
      this.orderBy.direction = !this.orderBy.direction;
    } else {
      this.orderBy = { key, direction: true };
    }
  }
}
