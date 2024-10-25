import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';

@Component({
  selector: 'app-pagination-x',
  templateUrl: './pagination-x.component.html',
  styleUrls: ['./pagination-x.component.scss'],
})
export class PaginationXComponent implements OnChanges {
  @Input() page: number;
  @Input() pageSize = 10;
  @Input() count: number;
  @Output() pageChange = new EventEmitter();
  pageCount = 0;
  pages = [];
  maxPages = 10;
  isLastPage: boolean;
  isFirstPage: boolean;

  selectPage(page) {
    this.pageChange.emit({ page });
  }

  first() {
    this.selectPage(0);
  }

  last() {
    this.selectPage(this.pageCount - 1);
  }

  next() {
    this.selectPage(this.page + 1);
  }

  previous() {
    this.selectPage(this.page - 1);
  }

  ngOnChanges(changes: any): void {
    const pageCount = Math.ceil(this.count / this.pageSize);
    this.pageCount = pageCount;
    this.isLastPage = this.page + 1 === pageCount ? true : false;
    this.isFirstPage = this.page === 0 ? true : false;
    this.pages = [];
    const auxPages = [];
    let startPage = this.page - 5;
    startPage = startPage < 0 ? 0 : startPage;
    let endPage;
    if (pageCount > this.maxPages) {
      if (startPage + this.maxPages > pageCount) {
        startPage = pageCount - this.maxPages;
      }
      endPage = this.maxPages;
    } else {
      endPage = pageCount;
    }
    for (let i = 0; i < endPage; i++) {
      if (pageCount > 10 && startPage + i < pageCount) {
        auxPages.push(startPage + i);
      } else if (pageCount <= 10 && i < pageCount) {
        auxPages.push(i);
      }
    }
    this.pages = auxPages;
  }

  pageFormat(page) {
    return parseInt(page, 10);
  }
}
