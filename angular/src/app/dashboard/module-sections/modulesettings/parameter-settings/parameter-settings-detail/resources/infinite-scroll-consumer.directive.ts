import { Directive, Input, TemplateRef, ViewContainerRef, EmbeddedViewRef, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { InfiniteScrollProviderDirective } from './infinite-scroll-provider.directive';

@Directive({
  selector: '[appInfiniteScrollConsumer]',
})
//appInfiniteScrollConsumer
export class InfiniteScrollConsumerDirective {
  isDataChangeSubscription: Subscription;
  isDataChangeFromConsumersSubscription: Subscription;
  view: EmbeddedViewRef<any>;
  _instanceInfinite;
  partialArray;
  isSelectedAll = false;

  @Input() set instanceInfinite(its) {
    this.subscribeToConsumers(its);
  }

  get instanceInfinite() {
    return this._instanceInfinite;
  }

  @Input() set appInfiniteScrollConsumer(its: InfiniteScrollProviderDirective) {
    this.subscribeToProvider(its);
  }

  @Output() updateElement = new EventEmitter();
  @Output() updateSelectAll = new EventEmitter();

  constructor(private templateRef: TemplateRef<any>, private viewContainer: ViewContainerRef) {}

  ngOnDestroy() {
    this.unsubscribeIsDataChangeSubscription();
    this.unsubscribeIsDataChangeFromConsumersSubscription();
  }

  unsubscribeIsDataChangeFromConsumersSubscription() {
    if (this.isDataChangeFromConsumersSubscription) {
      this.isDataChangeFromConsumersSubscription.unsubscribe();
    }
  }

  unsubscribeIsDataChangeSubscription() {
    if (this.isDataChangeSubscription) {
      this.isDataChangeSubscription.unsubscribe();
    }
  }

  subscribeToConsumers(its) {
    if (its) {
      this._instanceInfinite = its;
      this.isDataChangeFromConsumersSubscription = this._instanceInfinite.isDataChangeFromConsumers
        .pipe(filter(Boolean))
        .subscribe((data: any) => {
          if (data && this.view) {
            this.partialArray = data.partialArray;
            this.isSelectedAll = data.isSelectedAll;
            this.updateContext();
          }
        });
    }
  }

  createEmbeddedViewAndAssignContext(its) {
    this.instanceInfinite = its;
    this.viewContainer.clear();
    this.view = this.viewContainer.createEmbeddedView(this.templateRef, {
      $implicit: this.partialArray,
      isSelectedAll: this.isSelectedAll,
      controller: {
        selectAll: ($event) => this.selectAll($event.target.checked),
        selectOne: ($event, item) => this.selectOne($event.target.checked, item),
      },
    });
  }

  updateContext() {
    this.view.context.$implicit = this.partialArray;
    this.view.context.isSelectedAll = this.isSelectedAll;
  }

  subscribeToProvider(its) {
    if (its && !this.isDataChangeSubscription) {
      this.isDataChangeSubscription = its.isDataChange.pipe(filter(Boolean)).subscribe((data: any) => {
        if (data) {
          this.partialArray = data.partialArray;
          this.isSelectedAll = data.isSelectedAll;
          if (this.view) {
            this.updateContext();
          } else {
            this.createEmbeddedViewAndAssignContext(its);
          }
        }
      });
    }
  }

  selectAll(value) {
    this.isSelectedAll = value;
    this.partialArray = this.partialArray.map((element) => {
      if (!element[this.instanceInfinite.attribute]) {
        this.updateElement.emit({ value, item: element });
        return { ...element, selected: value };
      } else {
        return { ...element, selected: false };
      }
    });

    this.updateSelectAll.emit(this.isSelectedAll);
    this.instanceInfinite.isDataChangeFromConsumers.next({
      partialArray: this.partialArray,
      isSelectedAll: this.isSelectedAll,
    });
  }

  selectOne(value, item) {
    this.isSelectedAll = this.partialArray.every((element) => {
      if (!element[this.instanceInfinite.attribute]) {
        if (item.index === element.index) {
          return value;
        } else {
          return element.selected === true;
        }
      } else {
        return true;
      }
    });
    this.updateElement.emit({ value, item });
    this.updateSelectAll.emit(this.isSelectedAll);
    this.instanceInfinite.isDataChangeFromConsumers.next({
      partialArray: this.partialArray,
      isSelectedAll: this.isSelectedAll,
    });
  }
}
