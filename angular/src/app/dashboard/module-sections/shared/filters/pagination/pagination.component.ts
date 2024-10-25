import { Component, OnInit, Input, EventEmitter, Output, OnDestroy, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  PaginationObject,
  PaginationService
} from 'app/dashboard/module-sections/shared/filters/pagination/pagination.service';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
  host: { '(document:click)': 'onClickOutside($event)' }
})
export class PaginationComponent implements OnInit, OnDestroy {
  @Input()
  set dropPosition(p) {
    if (p === 'left') {
      this._position = 'left-position';
    } else if (p === 'right') {
      this._position = 'right-position';
    }
  }

  @Input()
  set totalResources(its) {
    this._totalResources = its;
    if (this._totalResources && this._totalResources !== 0) {
      this.paginationService.setTotalResources(this._totalResources);
    } else if (this._totalResources === 0) {
      this._totalResources = 0;
      this.paginationService.setTotalResources(this._totalResources);
    }
  }

  @Input() paginationComponent: string;
  @Input() favorite: boolean;
  @Input() hasLimitPagination = false;
  @Output() paginationChange = new EventEmitter<any>();

  selectedPagination;
  currentPage: string;
  numPages: number;
  maxRows = 1;
  isMenuOpened = false;
  _position = 'left-position';
  pagination: any;
  page: any = {
    valid: false,
    touched: false
  };
  firstTime = true;
  maxVisor = 10;
  lastIndex = this.maxVisor;
  pages = [];
  private _totalResources: number;
  private readonly destroy$ = new Subject<void>();

  get dropPosition() {
    return this._position;
  }

  get totalResources() {
    return this._totalResources;
  }

  /**
   * @description 10 is max pages to show
   */
  get hasNextPages() {
    return 10 * this.paginationService.currentPagination.selectedItem.value < this.totalResources;
  }

  constructor(private el: ElementRef, private paginationService: PaginationService) {}

  ngOnInit() {
    this.initActiveState();
    this.representationState();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  checkPag() {
    const filter = this.pagination.filter((p) => p.selected);
    this.selectedPagination = filter[0].label;
    return filter[0].label;
  }

  initActiveState() {
    this.paginationService.pagination$.pipe(takeUntil(this.destroy$)).subscribe((paginationObject) => {
      this.pagination = paginationObject.pagination;
      this.selectedPagination = paginationObject.selectedItem.label;
      this.currentPage = paginationObject.pageState.currentPage.toString();
      this.numPages = paginationObject.pageState.numPages;
      this.setLastIndex();
      this.setPages();
    });

    this.paginationService.pageState$.pipe(takeUntil(this.destroy$)).subscribe((paginationObject) => {
      this.numPages = paginationObject.pageState.numPages;
      this.currentPage = paginationObject.pageState.currentPage.toString();
      this.setLastIndex();
      this.setPages();
    });
  }

  representationState() {
    this.paginationService.representation$.pipe(takeUntil(this.destroy$)).subscribe((paginationObject) => {
      if (this.firstTime) {
        this.firstTime = false;
      } else {
        this.pagination = paginationObject.pagination;
        this.selectedPagination = paginationObject.selectedItem.label;
        this.currentPage = paginationObject.pageState.currentPage.toString();
        this.numPages = paginationObject.pageState.numPages;
        this.setLastIndex();
        this.setPages();
      }
    });
  }

  toggleMenu(e) {
    this.isMenuOpened = !this.isMenuOpened;
  }

  onClickOutside(event) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.isMenuOpened = false;
    }
  }

  clickOnItem(e, index) {
    const tempArray = this.pagination.map((element) => {
      const tempElement = Object.assign({}, element);
      tempElement.selected = false;
      return tempElement;
    });
    tempArray[index].selected = !tempArray[index].selected;
    this.numPages = Math.ceil(this.totalResources / tempArray[index].value);
    const tempObject: PaginationObject = {
      pagination: tempArray,
      selectedItem: tempArray[index],
      pageState: {
        currentPage: 1,
        numPages: this.numPages,
        currentPageUrl: 1,
        totalResources: this.totalResources
      },
      paginationComponent: this.paginationComponent
    };
    this.paginationService.setCurrentPagination(tempObject);
  }

  selectPage(quantity = 0) {
    const sign = quantity ? Math.sign(quantity) : quantity;
    if (this.rangePageValidator(Math.sign(sign))) {
      this.currentPage = this.pageChange(this.currentPage, quantity);
      this.paginationService.setCurrentPage(this.pageFormat(this.currentPage), this.paginationComponent);
      this.resetPageValidationObject();
    }
  }

  selectConcretepage(page, isActual = false) {
    if (!isActual) {
      this.currentPage = page.toString();
      this.paginationService.setCurrentPage(this.pageFormat(this.currentPage), this.paginationComponent);
      this.resetPageValidationObject();
    }
  }

  rangePageValidator(sign = 0) {
    if (sign > 0) {
      return this.pageFormat(this.currentPage) + 1 <= this.numPages;
    } else if (sign < 0) {
      return this.pageFormat(this.currentPage) - 1 >= 1;
    } else {
      return this.pageFormat(this.currentPage) >= 1 && this.pageFormat(this.currentPage) <= this.numPages;
    }
  }

  resetPageValidationObject() {
    this.page = {
      valid: false,
      touched: false
    };
  }

  pageFormat(page) {
    return parseInt(page, 10);
  }

  pageChange(page, quantity) {
    return (this.pageFormat(page) + quantity).toString();
  }

  setPages(): void {
    const pages = [];
    if (this.lastIndex <= this.maxVisor) {
      for (let i = 1; i <= this.lastIndex; i++) {
        pages.push(i);
      }
    } else {
      const current = this.pageFormat(this.currentPage);
      let left = 1;
      let right = this.maxVisor;
      if (current > Math.ceil(this.maxVisor / 2)) {
        left = current - Math.ceil(this.maxVisor / 2);
        if (current + Math.ceil(this.maxVisor / 2) - 1 <= this.numPages) {
          right = current + Math.ceil(this.maxVisor / 2) - 1;
        } else {
          right = this.numPages;
        }
      }
      for (let i = left; i <= right; i++) {
        pages.push(i);
      }
    }

    if (this.hasNextPages) {
      pages.push(-1);
    }
    this.pages = pages;
  }

  setLastIndex(): void {
    if (this.maxVisor - this.pageFormat(this.currentPage) >= Math.ceil(this.maxVisor / 2)) {
      if (this.maxVisor <= this.numPages) {
        this.lastIndex = this.maxVisor;
      } else {
        this.lastIndex = this.numPages;
      }
    } else {
      if (this.pageFormat(this.currentPage) + Math.ceil(this.maxVisor / 2) <= this.numPages) {
        this.lastIndex = this.pageFormat(this.currentPage) + Math.ceil(this.maxVisor / 2);
      } else {
        this.lastIndex = this.numPages;
      }
    }
  }

  goFirstPage() {
    this.selectConcretepage(1);
  }

  goLastPage() {
    this.selectConcretepage(this.numPages);
  }

  isGoFirst() {
    return this.currentPage === '1';
  }

  isGoLast() {
    return this.currentPage === this.numPages.toString();
  }
}
