import { of as observableOf, Subscription, Observable } from 'rxjs';

import { delay } from 'rxjs/operators';
import { Component, OnDestroy } from '@angular/core';
import { LabelsService } from 'app/dashboard/module-sections/shared/labels/labels.service';

@Component({
  selector: 'app-local-filter',
  templateUrl: './local-filter.component.html',
  styleUrls: ['./local-filter.component.scss'],
})
export class LocalFilterComponent implements OnDestroy {
  textToSeach: string = '';
  currentFilterSubscripton: Subscription;
  currentFilterObservable: Observable<any>;
  subscriptionList: Subscription[] = [];
  labelsList: any;

  constructor(private labelsService: LabelsService) {}

  ngOnDestroy() {
    this.unsubscribe();
  }

  unsubscribe() {
    if (this.currentFilterSubscripton) {
      this.currentFilterSubscripton.unsubscribe();
    }
  }

  onSearch() {
    this.unsubscribe();
    this.currentFilterObservable = observableOf(null).pipe(delay(750));
    this.currentFilterSubscripton = this.currentFilterObservable.subscribe(() => {
      this.labelsService.onSearchLabel(this.textToSeach);
    });
  }
}
