import { filter } from 'rxjs/operators';
import { Component, OnInit, OnDestroy, EventEmitter, Output, Input } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { Store } from 'app/services/store/store';
import { LabelsService } from 'app/dashboard/module-sections/shared/labels/labels.service';

@Component({
  selector: 'app-labels-list',
  templateUrl: './labels-list.component.html',
  styleUrls: ['./labels-list.component.scss']
})
export class LabelsListComponent implements OnInit, OnDestroy {
  subscriptionList: Subscription[] = [];
  labelsList: any;
  _loading = false;
  private readonly destroy$ = new Subject<void>();

  @Output() updateItem = new EventEmitter<any>();
  @Input() filterType;

  @Input()
  set loading(its) {
    this._loading = its;
  }

  get loading() {
    return this._loading;
  }

  constructor(private store: Store, private labelsService: LabelsService) {}

  ngOnInit() {
    const s = this.store
      .select('labelsList')
      .pipe(filter(Boolean))
      .subscribe((res) => {
        this.labelsList = res;
      });
    this.subscriptionList.push(s);
  }

  ngOnDestroy() {
    this.unsubscribeList();
  }

  unsubscribeList() {
    this.subscriptionList.forEach((s) => {
      if (s) {
        s.unsubscribe();
      }
    });
  }

  onToggle(event) {
    this.labelsService.toggle(event);
  }

  update(event) {
    this.updateItem.emit(event);
  }
}
