import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import { filter, takeUntil, distinctUntilChanged, debounceTime, skip } from 'rxjs/operators';
import * as moment from 'moment';

import { ReadFilterTypes } from '../../enums/read-filter-types';
import { StatusFilterTypes } from '../../enums/status-filter-types';
import { ISelectItem } from '../select/select.component';
import { Store } from 'app/services/store/store';
import { ResourcesService } from 'app/services/resources.service';

interface IFilters {
  read?: number;
  favorite?: boolean;
  status?: string[];
  since?: string;
  to?: string;
  incidents?: boolean;
  followed?: boolean;
  labels?: any;
  labelsAnd?: any;
  excludeLabels?: any;
  terms?: any;
}

@Component({
  selector: 'app-list-filter',
  templateUrl: './list-filter.component.html',
  styleUrls: ['./list-filter.component.scss']
})
export class ListFilterComponent implements OnInit, OnDestroy {
  @Input() orgId;
  @Input() modId;
  @Input() modType;
  @Input() activeFilters;
  @Input() showCalendar;
  @Input()
  set isCurrentContextLoading(loading: boolean) {
    this._isCurrentContextLoading = loading;
  }

  get isCurrentContextLoading(): boolean {
    return this._isCurrentContextLoading;
  }

  @Output() filtersChange = new EventEmitter<any>();
  @Output() searchText = new EventEmitter<any>();
  @Output() changeRangeDate = new EventEmitter<any>();
  @ViewChild('searchInput') searchInput: ElementRef;
  searchFilter$: Observable<any>;
  dateFilterEnabled = false;
  isFilterLabelModealOpen = false;
  filters: IFilters;
  since: any;
  to: any;
  roles: any;
  searchWords: any[] = [];
  loadingSearchWords = false;
  searchedText = '';
  isSearchOpen = false;
  isFiltersOpen = false;
  readFilters: ISelectItem[] = [
    { name: 'All', value: ReadFilterTypes.ALL },
    { name: 'Read', value: ReadFilterTypes.READ },
    { name: 'Not Read', value: ReadFilterTypes.NOT_READ }
  ];
  statusFilters: ISelectItem[] = [
    { name: 'Positive', value: StatusFilterTypes.POSITIVE },
    { name: 'Negative', value: StatusFilterTypes.NEGATIVE },
    { name: 'Informative', value: StatusFilterTypes.INFORMATIVE },
    { name: 'Not Important', value: StatusFilterTypes.NOT_IMPORTANT }
  ];
  days: ISelectItem[] = [
    { name: 'Last 15 days', value: 15 },
    { name: 'Last 30 days', value: 30 },
    { name: 'Last 90 days', value: 90 }
  ];

  defaultDay = this.days[0].value;

  error = {
    since: false,
    to: false,
    invalid: false
  };
  private _isCurrentContextLoading = false;
  private searchFilterSubject: BehaviorSubject<string>;
  private readonly destroy$ = new Subject<void>();

  constructor(private store: Store, private resourceService: ResourcesService) {
    this.searchFilterSubject = new BehaviorSubject<string>('');
    this.searchFilter$ = this.searchFilterSubject.asObservable();
    this.store
      .select('roleList')
      .pipe(takeUntil(this.destroy$), filter(Boolean))
      .subscribe((res: any) => {
        this.roles = res;
      });
  }

  ngOnInit() {
    this.filters = this.defaultFilters();

    this.searchFilter$
      .pipe(
        skip(1),
        takeUntil(this.destroy$),
        filter((term) => term === '' || term.length >= 3),
        debounceTime(1500),
        distinctUntilChanged()
      )
      .subscribe((serchTerm) => {
        this.searchText.emit(serchTerm);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.searchFilterSubject.complete();
    this.filters = this.defaultFilters();
  }

  stop($event) {
    $event.preventDefault();
    $event.stopPropagation();
  }

  openLabelFilterModal() {
    this.isFilterLabelModealOpen = true;
  }

  closeLabelFilterModal() {
    this.isFilterLabelModealOpen = false;
  }

  onLabelsFilter({ labels, labelsAnd, excludeLabels }) {
    this.closeLabelFilterModal();
    this.setFilters({ labels: labels.join(',') });
    this.setFilters({ labelsAnd: labelsAnd.join(',') });
    this.setFilters({ excludeLabels: excludeLabels.join(',') });
    this.filtersChange.emit(this.getFilters(this.filters));
  }

  onFavoriteFilter() {
    this.setFilters({ favorite: !this.filters.favorite });
    this.filtersChange.emit(this.getFilters(this.filters));
  }

  onIncidentsFilter() {
    this.setFilters({ incidents: !this.filters.incidents });
    this.filtersChange.emit(this.getFilters(this.filters));
  }

  onFollowedFilter() {
    this.setFilters({ followed: !this.filters.followed });
    this.filtersChange.emit(this.getFilters(this.filters));
  }

  onStatusFilter(items) {
    this.setFilters({ status: items });
    this.filtersChange.emit(this.getFilters(this.filters));
  }

  onSearchWordsFilter(items) {
    this.setFilters({ terms: items });
    this.filtersChange.emit(this.getFilters(this.filters));
  }

  onReadFilter(item: ISelectItem) {
    this.setFilters({ read: item.value });
    this.filtersChange.emit(this.getFilters(this.filters));
  }

  onDateFilter(event) {
    this.error.since = false;
    this.error.to = false;

    const sinceNumber = moment.utc(event.dateRange.since).valueOf();
    const toNumber = moment.utc(event.dateRange.to).valueOf();

    this.filters.since = sinceNumber.toString();
    this.filters.to = toNumber.toString();
    this.filtersChange.emit(this.getFilters(this.filters));
  }

  search() {
    this.searchFilterSubject.next(this.searchedText);
  }

  onClearSearchTerm() {
    this.searchedText = '';
    this.isSearchOpen = !this.isSearchOpen;
    this.search();
  }

  isValid() {
    if (!this.since || !this.since.day) {
      this.error.since = true;
    }
    if (!this.to || !this.to.day) {
      this.error.to = true;
    }
  }

  resetSince() {
    if (typeof this.since !== 'function') {
      this.since = {
        day: '',
        month: '',
        year: '',
        formatted: '',
        momentObj: moment()
      };
    }
  }

  resetTo() {
    this.to = {
      day: '',
      month: '',
      year: '',
      formatted: '',
      momentObj: moment()
    };
  }

  resetDates() {
    this.resetSince();
    this.resetTo();
    this.filters.since = '';
    this.filters.to = '';
    this.dateFilterEnabled = false;
    this.filtersChange.emit(this.getFilters(this.filters));
  }

  isStatusFilterDefault() {
    const { status } = this.filters;
    let positive = false;
    let negative = false;
    let informative = false;
    let notImportant = false;
    for (const item of status) {
      switch (item) {
        case StatusFilterTypes.POSITIVE:
          positive = true;
          break;
        case StatusFilterTypes.NEGATIVE:
          negative = true;
          break;
        case StatusFilterTypes.INFORMATIVE:
          informative = true;
          break;
        case StatusFilterTypes.NOT_IMPORTANT:
          notImportant = true;
          break;
      }
    }
    return positive && negative && informative && !notImportant;
  }

  defaultFilters() {
    return {
      read: 0,
      favorite: false,
      status: [StatusFilterTypes.INFORMATIVE, StatusFilterTypes.NEGATIVE, StatusFilterTypes.POSITIVE],
      since: this.filters && this.filters.since ? this.filters.since : '',
      to: this.filters && this.filters.to ? this.filters.to : '',
      incidents: false,
      followed: false,
      terms: [],
      labels: '',
      labelsAnd: '',
      excludeLabels: ''
    };
  }

  resetFilters() {
    this.filters = this.defaultFilters();
    this.filtersChange.emit(this.getFilters(this.filters));
  }

  getFilters(filters) {
    const setFilters: any = {
      read: this.filters.read
    };
    if (filters.status.length > 0) {
      setFilters.analysisCalcResult = filters.status.join(',');
    }
    if (filters.favorite) {
      setFilters.starred = true;
    }
    if (filters.labels) {
      setFilters.labels = filters.labels;
    }
    if (filters.labelsAnd) {
      setFilters.labelsAnd = filters.labelsAnd;
    }
    if (filters.excludeLabels) {
      setFilters.excludeLabels = filters.excludeLabels;
    }
    if (filters.incidents) {
      setFilters.incidents = filters.incidents;
    }
    if (filters.terms.length > 0) {
      setFilters.terms = filters.terms.join(',');
    }
    if (filters.followed) {
      setFilters.followed = filters.followed;
    }
    if (filters.since && filters.to) {
      setFilters.since = filters.since;
      setFilters.to = filters.to;
      this.dateFilterEnabled = true;
    } else {
      this.dateFilterEnabled = false;
    }
    return setFilters;
  }

  setFilters(param) {
    this.filters = { ...this.filters, ...param };
  }

  isSearchBoxActive(): boolean {
    return this.isSearchOpen || this.checkSearch();
  }

  isFilterActive(): boolean {
    return this.isFiltersOpen || this.checkFilters() || !this.isStatusFilterDefault();
  }

  checkSearch() {
    return !!this.searchedText;
  }

  checkFilters() {
    if (
      this.filters.read ||
      this.filters.favorite ||
      this.filters.labels ||
      this.filters.labelsAnd ||
      this.filters.excludeLabels ||
      this.filters.incidents ||
      this.filters.terms.length > 0 ||
      this.filters.followed
    ) {
      return true;
    }
  }

  onSearchWords() {
    this.loadingSearchWords = true;
    this.resourceService
      .getAllThreatsSearchWords(this.orgId, this.defaultDay)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.searchWords = res;
        this.searchWords.forEach((word) => {
          word.name = `${word.term} (${word.total})`;
          word.value = word.id;
        });
        this.loadingSearchWords = false;
      });
  }

  onCallSearchWords() {
    if (this.isFiltersOpen) {
      if (!this.searchWords?.length) {
        this.onSearchWords();
      }
    }
  }

  openFilters() {
    this.isFiltersOpen = !this.isFiltersOpen;
    this.onCallSearchWords();
    this.isSearchOpen = this.isFiltersOpen ? false : this.isFiltersOpen;
  }

  openSearch() {
    this.isSearchOpen = !this.isSearchOpen;
    this.isFiltersOpen = this.isSearchOpen ? false : this.isFiltersOpen;
  }

  onChangeRangeDays(item: ISelectItem) {
    this.defaultDay = item.value;
    this.changeRangeDate.emit(this.defaultDay);
    if (this.isFiltersOpen) {
      this.onSearchWords();
    } else {
      this.searchWords = [];
    }
  }
}
