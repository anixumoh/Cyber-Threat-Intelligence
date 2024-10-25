import {
  Component,
  ComponentFactoryResolver,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';

import { TableComponent } from 'app/admin/shared/table/table.component';
import { instanceHeader } from 'app/admin/shared/utils';
import { UserAccountService } from 'app/dashboard/user/account.service';
import { SvelteService } from 'app/services/svelte.service';
import { OrganizationService } from '../../organization/organization.service';
import { TableConfig } from '../../shared/table-config';
import { FiltersService } from '../filters.service';

@Component({
  selector: 'app-list-filters',
  templateUrl: './list-filters.component.html',
  styleUrls: ['./list-filters.component.scss']
})
export class ListFiltersComponent implements OnInit, OnChanges, OnDestroy {
  @Input() idOrg;
  @ViewChild('adminTable') adminTable: TableComponent;

  table = new TableConfig();
  selected: any;
  confirmation = <any>{};
  listOrg: any[] = [];
  initMaxRows: number;
  searchFilter$: Observable<string>;
  templateQuery: string;
  searchedText = '';
  orderBy = { key: '', direction: true };
  private searchFilterSubject: BehaviorSubject<string>;
  private readonly destroy$ = new Subject<void>();

  get header() {
    const retorno = [];
    retorno.push(instanceHeader('name', 'Name', false, false, false, null, 'icon-sort'));
    retorno.push(instanceHeader('superSearchName', 'Organization', false, false, false, null, 'icon-sort'));
    return retorno;
  }

  constructor(
    protected filtersService: FiltersService,
    protected fr: ComponentFactoryResolver,
    protected orgService: OrganizationService,
    protected view: ViewContainerRef,
    private userAccountService: UserAccountService,
    private toastrService: ToastrService,
    private svelteService: SvelteService
  ) {
    this.searchFilterSubject = new BehaviorSubject<string>('null');
    this.searchFilter$ = this.searchFilterSubject.asObservable();
  }

  ngOnInit() {
    this.getOrganizations();
    this.userAccountService
      .getState()
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        this.initMaxRows = state && state.defaultRows ? state.defaultRows : 10;
        this.setOrderBy('name');
        this.reloadData(true, this.initMaxRows);
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
          this.templateQuery = searchTerm;
          this.reloadData(true);
        }
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.idOrg && this.table.queryParam['ss'] !== this.idOrg) {
      this.table.queryParam['ss'] = this.idOrg;
      this.reloadData(true);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  reloadData(firstPage, initMaxRows?: any) {
    this.table.isLoading = true;
    if (this.table.queryParam['ss'] === '') {
      delete this.table.queryParam['ss'];
    }

    this.table.header = this.header;
    if (initMaxRows) {
      this.table.pagination.num_regs = initMaxRows;
      // paginationQuery += '&num_regs=' + initMaxRows + '&page=1';
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
    let templatePagination = 'p=true';
    if (initMaxRows) {
      paginationQuery += '&page=1';
    }
    templatePagination += paginationQuery.replace('num_regs', '&maxRows');
    templatePagination = templatePagination.replace('orderBy', 'o');
    templatePagination =
      templatePagination.includes('&page') && this.templateQuery
        ? templatePagination + `&q=${this.templateQuery}`
        : templatePagination;
    templatePagination = firstPage ? templatePagination.replace(/&page=[0-9]+/, '&page=1') : templatePagination;
    this.filtersService
      .getFilters(templatePagination)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (a: any) => {
          this.table.results = {
            list: a.filterTemplates,
            total_resources: a.totalRegistres
          };
          if (firstPage && this.adminTable) {
            this.adminTable.changePageWithoutReload(1);
          }
          if (this.adminTable) {
            this.adminTable.setLastIndex();
            this.adminTable.setPages();
          }

          this.table.isLoading = false;
        },
        (error) => {
          this.toastrService.error(error, 'Error');
          this.table.isLoading = false;
        }
      );
  }

  @HostListener('document:save-filter-template', ['$event'])
  async onSaveFilterTemplate() {
    this.view.clear();
    this.reloadData(false);
  }

  createEdit(obj = null) {
    const organizationId = this.idOrg || this.table.queryParam['ss'];
    this.svelteService.safeSendEvent('open-filter-template', { ...obj, organizationId });
  }

  delete(data) {
    this.filtersService
      .delete(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (a) => {
          this.table.isLoading = false;
          this.reloadData(false);
          this.selected = null;
          this.confirmation = <any>{};
        },
        (error) => {
          this.toastrService.error(error, 'Error');
          this.table.isLoading = false;
        }
      );
  }

  organization(id) {
    let retorno: any;
    if (this.listOrg && this.listOrg.length) {
      retorno = this.listOrg.filter((e) => e.id === id)[0];
    }
    return retorno || {};
  }

  getOrganizations() {
    this.orgService
      .getOrganizations()
      .pipe(takeUntil(this.destroy$))
      .subscribe((response) => {
        if (response) {
          this.listOrg.push({ id: '', name: 'All' });
          this.listOrg.push(...response);
        }
      });
  }

  search() {
    this.searchFilterSubject.next(this.searchedText);
  }

  onSort(data) {
    this.setOrderBy(data.key);
    this.reloadData(false);
  }

  private setOrderBy(key) {
    if (this.orderBy.key === key) {
      this.orderBy.direction = !this.orderBy.direction;
    } else {
      this.orderBy = { key, direction: true };
    }
  }
}
