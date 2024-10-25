import { OnDestroy } from '@angular/core';
import { Subject, BehaviorSubject, Observable } from 'rxjs';

import { ISelectItem } from '../components/select/select.component';
import { copyToClipboard } from '../../utils/functions';
import { isDomain, isIp, isURL } from '../utils/hash.utils';
import { IQuickFilter } from '../components/tcx-quick-filters/tcx-quick-filters.component';

export abstract class ServerList implements OnDestroy {
  items: any[] = [];
  loading = false;
  searchText = '';
  dorkFields = [];
  order;
  orderBy = { key: '', direction: true };
  bulk = false;
  page = 0;
  count = 0;
  totalResources = 0;
  limit = 10;
  limits: ISelectItem[] = [
    { name: '10', value: 10 },
    { name: '15', value: 15 },
    { name: '30', value: 30 },
    { name: '50', value: 50 },
    { name: '100', value: 100 }
  ];
  mitreDork;
  quickFilters: IQuickFilter[] = [];
  openModalDorks = false;
  showSaveSearchButton = false;
  sort = '';

  protected searchFilter$: Observable<string>;
  protected readonly destroy$ = new Subject<void>();
  protected searchFilterSubject: BehaviorSubject<string>;

  constructor() {
    this.searchFilterSubject = new BehaviorSubject<string>('null');
    this.searchFilter$ = this.searchFilterSubject.asObservable();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  reload() {
    this.page = 0;
    this.reloadData();
  }

  onChangeLimit(item: ISelectItem) {
    this.limit = item.value;
    this.reload();
  }

  search() {
    this.reload();
    this.showSaveSearchButton = true;
  }

  onPageChange({ page }: any) {
    this.page = page;
    this.reloadData();
  }

  getOrderByIcon(key) {
    if (this.orderBy.key === key) {
      return this.orderBy.direction ? 'icon-sort-desc' : 'icon-sort-asc';
    }
    return 'icon-sort';
  }

  protected setOrderBy(key) {
    if (this.orderBy.key === key) {
      this.orderBy.direction = !this.orderBy.direction;
    } else {
      this.orderBy = { key, direction: true };
    }
  }

  hasSomeChecked() {
    return this.items.some((item) => item.fxSelected);
  }

  setCheckedState(event) {
    this.items = this.items.map((item) => ({ ...item, fxSelected: event.target.checked }));
  }

  setChecked() {
    setTimeout(() => {
      this.bulk = this.getCheckedItems().length === this.items.length;
    });
  }

  isDefangNeededForKey(items, key) {
    for (const item of items) {
      const value = item[key];
      if (value) {
        if (isIp(value) || isDomain(value) || isURL(value)) {
          return true;
        }
      }
    }
    return false;
  }

  copyToClipboard(key = 'value') {
    const items = this.getCheckedItems();
    if (items && items.length > 0) {
      let clipboard = '';
      for (const item of items) {
        clipboard += item[key] + '\r\n';
      }
      copyToClipboard(clipboard);
    }
  }

  checkSearchCriteriaHasDorks() {
    const currentDorks = Object.keys(this.dorkFields);
    return currentDorks.some((dork) => {
      const regex = new RegExp(`\\b(${dork})\\:[0-9"~\\^\\$\\+\\>\\<\\-\\=]+`);
      return regex.test(this.searchText);
    });
  }

  loadSavedSearches() {
    const savedFilters = this.quickFilters.find((quick: IQuickFilter) => quick.title === 'Saved searches');
    if (savedFilters) {
      const defaultFilter = savedFilters?.filters.find((filter) => filter?.markAsDefault);
      if (defaultFilter) {
        this.searchText = defaultFilter?.dork;
      }
    }
  }

  hideSaveSearchButton() {
    const savedFilters = this.quickFilters.find((quick: IQuickFilter) => quick.title === 'Saved searches');
    if (savedFilters) {
      const filter = savedFilters?.filters.find((filter) => filter?.dork === this.searchText);
      if (!filter) {
        this.showSaveSearchButton = false;
      }
    }
  }

  onSetSearchTerm(event) {
    this.searchText = event;
    this.hideSaveSearchButton();
  }

  onClearSearchTerm() {
    this.searchText = '';
    this.search();
  }

  sortBy(value) {
    this.sort = value;
    this.reloadData();
  }

  onChangeQuickFilter(filter) {
    this.searchText = filter.dork;
    this.search();
  }

  setDork(dork) {
    this.openModalDorks = false;
    this.searchText = dork;
    this.search();
  }

  protected getCheckedItems() {
    return this.items.filter((item) => item.fxSelected);
  }

  protected limitDorkToBeSentByHttpGet(str: string) {
    const text = encodeURIComponent(str);
    if (text.length > 2000) {
      let value = text.substr(0, 2008);
      const index = value.lastIndexOf('%20OR%20');
      if (index !== -1) {
        value = value.substr(0, index);
      }
      const newDork = decodeURIComponent(value);
      const elements = newDork.split(' OR ');
      const count = elements.length;
      let lastItem = elements[count - 1];
      lastItem = lastItem.replace(/.*:"(.*)".*/, (match, $1) => $1);
      return { value: newDork, lastItem, count };
    }
    return { value: str, lastItem: '' };
  }

  protected reloadData(config?: any) {}
}
