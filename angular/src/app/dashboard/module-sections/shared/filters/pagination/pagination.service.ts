import { Injectable } from '@angular/core';
import * as _ from 'lodash';

import { Observable, BehaviorSubject } from 'rxjs';

interface PageState {
  currentPage: number;
  numPages: number;
  currentPageUrl: number;
  totalResources: number;
}

interface PaginationItem {
  label: string;
  value: number;
  selected: boolean;
}

interface Pagination extends Array<PaginationItem> {}

export interface PaginationObject {
  pagination: Pagination;
  selectedItem: PaginationItem;
  pageState: PageState;
  paginationComponent: string;
}

@Injectable()
export class PaginationService {
  currentPagination: PaginationObject = {
    pagination: [
      { label: '10', value: 10, selected: true },
      { label: '15', value: 15, selected: false },
      { label: '30', value: 30, selected: false },
      { label: '50', value: 50, selected: false },
      { label: '100', value: 100, selected: false },
    ],
    selectedItem: { label: '10', value: 10, selected: true },
    pageState: { currentPage: 1, numPages: 1, currentPageUrl: 1, totalResources: 0 },
    paginationComponent: '',
  };
  stopper = true;
  pageState$: Observable<any>;
  pagination$: Observable<any>;
  representation$: Observable<any>;
  paginatedResources$: Observable<any[]>;
  private pageStateSubject: BehaviorSubject<any>;
  private paginationSubject: BehaviorSubject<any>;
  private representationSubject: BehaviorSubject<any>;
  private paginatedResourcesSubject: BehaviorSubject<any[]>;

  constructor() {
    this.pageStateSubject = new BehaviorSubject(this.currentPagination);
    this.pageState$ = this.pageStateSubject.asObservable();
    this.paginationSubject = new BehaviorSubject(this.currentPagination);
    this.pagination$ = this.paginationSubject.asObservable();
    this.representationSubject = new BehaviorSubject(this.currentPagination);
    this.representation$ = this.representationSubject.asObservable();
    this.paginatedResourcesSubject = new BehaviorSubject([]);
    this.paginatedResources$ = this.paginatedResourcesSubject.asObservable();
  }

  setCurrentPagination(pagination) {
    this.currentPagination = pagination;
    this.paginationSubject.next(this.currentPagination);
    // return Observable.of(this.currentPagination);
  }

  setDefaultRows(rows) {
    this.currentPagination.selectedItem = { label: rows.toString(), value: rows, selected: true };
    this.currentPagination.pagination.forEach((pag) => {
      if (pag.value === rows) {
        pag.selected = true;
      } else {
        pag.selected = false;
      }
    });
  }

  setTotalResources(totalResources) {
    this.currentPagination.pageState.totalResources = totalResources;
    this.currentPagination.pageState.numPages = Math.ceil(totalResources / this.currentPagination.selectedItem.value);
    this.pageStateSubject.next(this.currentPagination);
  }

  setInitialPage() {
    this.currentPagination.pageState.currentPage = 1;
    this.currentPagination.pageState.totalResources = 0;
    this.currentPagination.pageState.numPages = 1;
    this.pageStateSubject.next(this.currentPagination);
  }

  reloadPage() {
    this.paginationSubject.next(this.currentPagination);
  }

  setCurrentPage(currentPage, paginationComponent) {
    this.currentPagination.pageState.currentPage = currentPage;
    this.currentPagination.paginationComponent = paginationComponent;
    this.paginationSubject.next(this.currentPagination);
  }

  setCurrentPageRepresentationState(currentPage?) {
    if (currentPage) {
      this.currentPagination.pageState.currentPage = currentPage;
    }
    this.representationSubject.next(this.currentPagination);
  }

  resetpaginationOutside() {
    if (!this.stopper) {
      this.currentPagination.pagination[0].selected = true;
      this.currentPagination.pagination[1].selected = false;
      this.currentPagination.pagination[2].selected = false;
      this.currentPagination.pagination[3].selected = false;
      this.currentPagination.pagination[4].selected = false;
      this.currentPagination.selectedItem = this.currentPagination.pagination[0];
      this.currentPagination.pageState.currentPage = 1;
      this.currentPagination.pageState.numPages = 1;
      this.paginationSubject.next(this.currentPagination);
    }
  }

  resetpaginationOutsideWithoutNext() {
    this.currentPagination.pagination[0].selected = true;
    this.currentPagination.pagination[1].selected = false;
    this.currentPagination.pagination[2].selected = false;
    this.currentPagination.pagination[3].selected = false;
    this.currentPagination.pagination[4].selected = false;
    this.currentPagination.selectedItem = this.currentPagination.pagination[0];
    this.currentPagination.pageState.currentPage = 1;
    this.currentPagination.pageState.numPages = 1;
  }

  resetpaginationFromFilters(page) {
    this.currentPagination.pagination.map((pagina, index) => {
      if (page === pagina.value) {
        this.currentPagination.pagination[index].selected = true;
        this.currentPagination.selectedItem = this.currentPagination.pagination[index];
      } else {
        this.currentPagination.pagination[index].selected = false;
      }
    });
    this.currentPagination.pageState.currentPage = 1;
    this.currentPagination.pageState.numPages = 1;
  }

  resetpaginationOutsideStore(index, { currentPage = 0, totalResources = 0 }) {
    this.currentPagination.pagination.forEach((element, indexEl) => {
      element.selected = indexEl === index;
    });
    this.currentPagination.selectedItem = this.currentPagination.pagination[index];
    this.currentPagination.pageState.currentPage = currentPage;
    this.setTotalResources(totalResources);
    this.representationSubject.next(this.currentPagination);
  }

  setPaginatedResources(resources: any[]) {
    this.paginatedResourcesSubject.next(resources);
  }

  // Not used
  clearPaginatedResources() {
    this.paginatedResourcesSubject.next([]);
  }
}
