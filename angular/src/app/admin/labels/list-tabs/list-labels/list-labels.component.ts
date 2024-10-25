import {
  Component,
  ComponentFactoryResolver,
  Input,
  OnInit,
  ViewContainerRef,
  ViewChild,
  OnDestroy
} from '@angular/core';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { takeUntil, mergeMap, filter, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { TableConfig } from '../../../shared/table-config';
import { LabelsService } from '../../labels.service';
import { NewEditLabelsComponent } from '../../new-edit-labels/new-edit-labels.component';
import { OrganizationService } from '../../../organization/organization.service';
import { LabelDetailComponent } from '../../label-detail/label-detail.component';
import { Store } from '../../../../services/store/store';
import { TableComponent } from 'app/admin/shared/table/table.component';
import { UserAccountService } from 'app/dashboard/user/account.service';
import { instanceHeader } from 'app/admin/shared/utils';

@Component({
  selector: 'app-list-labels',
  templateUrl: './list-labels.component.html',
  styleUrls: ['./list-labels.component.scss']
})
export class ListLabelsComponent implements OnInit, OnDestroy {
  @ViewChild('adminTable') adminTable: TableComponent;

  @Input() idOrg;

  table = new TableConfig();
  selected: any;
  confirmation: any = {};
  listOrg = [];
  listMod = [];
  isSuperAdmin = false;
  orderBy = { key: '', direction: true };
  initMaxRows: number;
  labelsQuery: string;
  searchedText = '';
  searchFilter$: Observable<string>;
  private searchFilterSubject: BehaviorSubject<string>;
  private readonly destroy$ = new Subject<void>();

  constructor(
    protected labelService: LabelsService,
    protected fr: ComponentFactoryResolver,
    protected orgService: OrganizationService,
    protected view: ViewContainerRef,
    protected store: Store,
    private userAccountService: UserAccountService
  ) {
    this.searchFilterSubject = new BehaviorSubject<string>('null');
    this.searchFilter$ = this.searchFilterSubject.asObservable();
    this.store
      .select('roleList')
      .pipe(takeUntil(this.destroy$))
      .subscribe((roles) => {
        if (roles) {
          this.isSuperAdmin = roles['admin'];
        }
      });
  }

  ngOnInit() {
    this.userAccountService
      .getState()
      .pipe(
        takeUntil(this.destroy$),
        mergeMap((state) => {
          this.initMaxRows = state && state.defaultRows ? state.defaultRows : 10;
          return this.orgService.getOrganizations();
        })
      )
      .subscribe((orgs) => {
        this.listOrg = [
          {
            id: '',
            name: 'All'
          },
          ...orgs
        ];
        this.setOrderBy('label');
        if (this.idOrg) {
          this.table.queryParam['ss'] = this.idOrg;
          this.getMod(this.idOrg);
        }
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
          this.labelsQuery = searchTerm;
          this.reloadData(true);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSort(data) {
    this.setOrderBy(data.key);
    this.reloadData(false);
  }

  reloadData(firstPage, initMaxRows?: any) {
    this.table.header = this.header;
    this.table.isLoading = true;
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
    let labelsPagination = 'p=true';
    if (initMaxRows) {
      paginationQuery += '&page=1';
    }
    labelsPagination += paginationQuery.replace('num_regs', '&maxRows');
    labelsPagination = labelsPagination.replace('orderBy', 'o');
    labelsPagination = labelsPagination.replace('sort', 's');
    labelsPagination =
      labelsPagination.includes('&page') && this.labelsQuery
        ? labelsPagination + `&q=${this.labelsQuery}`
        : labelsPagination;
    labelsPagination = firstPage ? labelsPagination.replace(/&page=[0-9]+/, '&page=1') : labelsPagination;

    this.labelService
      .getLabel(labelsPagination)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (a) => {
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

  get header() {
    const retorno = [];

    retorno.push(instanceHeader('labelProtected', '', true, true, false, 'td-30'));
    retorno.push(instanceHeader('label', 'Label Name', false, true, true, null, 'icon-sort'));
    retorno.push(instanceHeader('organizationName', 'Organization', false, false, false, 'td-min-130', 'icon-sort'));
    retorno.push(instanceHeader('moduleName', 'Module', false, false, false, 'td-min-90', 'icon-sort'));
    retorno.push(
      instanceHeader('labelTypeName', 'Type', false, false, false, 'justify-content-center td-150', 'icon-sort')
    );
    retorno.push(
      instanceHeader('prioritized', 'Priority', false, true, false, 'justify-content-center td-min-90', 'icon-sort')
    );
    return retorno;
  }

  clickOnARow(event) {
    const resolver = this.fr.resolveComponentFactory(LabelDetailComponent);
    const ref: any = this.view.createComponent(resolver);
    ref.instance.selectedLabel = event.data;
    ref.changeDetectorRef.detectChanges();
    ref.instance.onCloseEmit.pipe(takeUntil(this.destroy$)).subscribe(() => this.view.clear());
    ref.instance.onSuccess.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.view.clear();
      this.createEdit(event.data);
    });
  }

  createEdit(obj = null) {
    const resolver = this.fr.resolveComponentFactory(NewEditLabelsComponent);
    const ref: any = this.view.createComponent(resolver);
    ref.changeDetectorRef.detectChanges();
    ref.instance.onCloseEmit.pipe(takeUntil(this.destroy$)).subscribe(() => this.view.clear());
    ref.instance.onSuccess.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.view.clear();
      this.reloadData(false);
    });
    if (obj) {
      ref.instance.instanceForm(obj);
      ref.changeDetectorRef.detectChanges();
    }
    const idOrg = this.idOrg || this.table.queryParam['ss'];
    if (idOrg) {
      ref.instance.form.controls['organizationId'].setValue(idOrg);
    }
    if (this.idOrg) {
      ref.instance.form.controls['organizationId'].disable();
    }

    const idMod = this.table.queryParam['rs'];
    if (idMod) {
      ref.instance.form.controls['moduleId'].setValue(idMod);
    }
  }

  delete(data) {
    this.labelService
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

  getOrganizations() {
    this.orgService
      .getOrganizations()
      .pipe(takeUntil(this.destroy$))
      .subscribe((a) => {
        this.listOrg = [
          {
            id: '',
            name: 'All'
          },
          ...a
        ];
      });
  }

  onChangeOrg() {
    this.listMod = [];
    delete this.table.queryParam['rs'];
    if (this.table.queryParam['ss']) {
      this.getMod(this.table.queryParam['ss']);
    }
    this.reloadData(true);
  }

  getMod(idOrg) {
    if (!this.listMod[idOrg]) {
      this.orgService
        .getModulesByOrg(idOrg)
        .pipe(takeUntil(this.destroy$))
        .subscribe((tz) => {
          this.listMod = [
            {
              id: '',
              name: 'All'
            },
            ...tz
          ];
        });
    }
  }

  search() {
    this.searchFilterSubject.next(this.searchedText);
  }

  private setOrderBy(key) {
    if (this.orderBy.key === key) {
      this.orderBy.direction = !this.orderBy.direction;
    } else {
      this.orderBy = { key, direction: true };
    }
  }
}
