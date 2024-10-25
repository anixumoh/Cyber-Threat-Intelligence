import { Directive, OnChanges, Input, HostListener, SimpleChanges, OnInit, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Directive({
  exportAs: 'appInfiniteScrollProvider',
  selector: '[appInfiniteScrollProvider]',
})
export class InfiniteScrollProviderDirective implements OnInit, OnDestroy, OnChanges {
  @HostListener('scroll', ['$event'])
  onScroll(event) {
    this.infiniteScroll(event);
  }

  @Input('infiniteCompleteArray') set completeArray(its) {
    this._partialArray = its;
  }
  @Input('infiniteScrollPercent') scrollPercent: number;
  @Input('infiniteNum') num = 10;
  @Input('infinitePage') page = 0;
  @Input('infiniteAttribute') attribute = '';

  actualIndex = 0;
  isDataChange = new BehaviorSubject<any>(null);
  isDataChangeFromConsumers = new BehaviorSubject<any>(null);
  isSelectedAll = false;
  private _partialArray: any[] = [];
  private readonly destroy$ = new Subject<void>();

  constructor() {}

  ngOnInit() {
    this.isDataChangeFromConsumers.pipe(takeUntil(this.destroy$), filter(Boolean)).subscribe(({ partialArray }) => {
      this._partialArray = partialArray;
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.limitRender();
  }

  limitRender() {
    this.strategyRender();
  }

  strategyRender() {
    this.actualIndex = this.num * (this.page + 1) - 1;
    this.isSelectedAll = false;
    if (this._partialArray && this.num) {
      let index = 0;
      let idIndex = 0;
      let tempActualIndex = this._partialArray.length;
      this._partialArray = this._partialArray.map((element) => {
        idIndex += 1;
        if (!element[this.attribute] && index <= this.actualIndex) {
          tempActualIndex = idIndex - 1;
          index += 1;
          return { ...element, index: idIndex - 1, isInfinite: true };
        } else {
          return { ...element, index: idIndex - 1, isInfinite: false };
        }
      });
      this.actualIndex = tempActualIndex;
    }
    this.isDataChange.next({ partialArray: this._partialArray, isSelectedAll: this.isSelectedAll });
  }

  infiniteScroll(event) {
    this.infiniteScrollStrategy(event);
  }

  infiniteScrollStrategy(event) {
    if (this.actualIndex < this._partialArray.length) {
      let max = event.target.scrollHeight - event.target.offsetHeight;
      let actual = event.target.scrollTop;
      let percent = (1 - actual / max) * 100;
      if (percent < this.scrollPercent) {
        let previousIndex = 0;
        const startIndex = this.actualIndex + 1;
        let index = startIndex;
        this.actualIndex = this.num + this.actualIndex;
        let tempActualIndex = this._partialArray.length;
        this._partialArray = this._partialArray.map((element, elementIndex) => {
          previousIndex += 1;
          if (!element[this.attribute] && index <= this.actualIndex && startIndex <= elementIndex) {
            tempActualIndex = previousIndex - 1;
            index += 1;
            return { ...element, isInfinite: true };
          } else {
            return { ...element };
          }
        });
        this.actualIndex = tempActualIndex;
        this.isDataChange.next({ partialArray: this._partialArray, isSelectedAll: this.isSelectedAll });
      }
    }
  }
}
