import { Component, ComponentFactoryResolver, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { LabelsService } from '../../labels.service';
import { TableConfig } from '../../../shared/table-config';
import { NewEditTypeLabelsComponent } from '../../new-edit-type-labels/new-edit-type-labels.component';
import { instanceHeaderMin } from 'app/admin/shared/utils';

@Component({
  selector: 'app-list-type-labels',
  templateUrl: './list-type-labels.component.html',
  styleUrls: ['./list-type-labels.component.scss']
})
export class ListTypeLabelsComponent implements OnInit, OnDestroy {
  table = new TableConfig();
  selected: any;
  confirmation = <any>{};
  private readonly destroy$ = new Subject<void>();

  constructor(
    protected labelService: LabelsService,
    protected fr: ComponentFactoryResolver,
    protected view: ViewContainerRef
  ) {}

  ngOnInit() {
    this.reloadData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  reloadData(isLoading = true) {
    this.table.header = this.header;
    this.table.isLoading = isLoading;
    this.labelService
      .getType(this.table.queryPagination)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (a) => {
          this.table.results.list = a;
          this.table.isLoading = false;
        },
        () => {
          this.table.isLoading = false;
        }
      );
  }

  get header() {
    return [instanceHeaderMin('name', 'Name', false, false)];
  }

  createEdit(obj = null) {
    const resolver = this.fr.resolveComponentFactory(NewEditTypeLabelsComponent);
    const ref: any = this.view.createComponent(resolver);
    ref.changeDetectorRef.detectChanges();
    ref.instance.onCloseEmit.pipe(takeUntil(this.destroy$)).subscribe(() => this.view.clear());
    ref.instance.onSuccess.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.view.clear();
      this.reloadData();
    });
    if (obj) {
      ref.instance.instanceForm(obj);
      ref.changeDetectorRef.detectChanges();
    }
  }

  clickOnARow(event) {
    const resolver = this.fr.resolveComponentFactory(NewEditTypeLabelsComponent);
    const ref: any = this.view.createComponent(resolver);
    ref.changeDetectorRef.detectChanges();
    ref.instance.onCloseEmit.pipe(takeUntil(this.destroy$)).subscribe(() => this.view.clear());
    ref.instance.onSuccess.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.view.clear();
      this.reloadData();
    });
    if (event) {
      ref.instance.instanceForm(event.data);
      ref.changeDetectorRef.detectChanges();
    }
  }

  delete(data) {
    this.labelService
      .deleteType(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        () => {
          this.reloadData(false);
          this.selected = null;
          this.confirmation = <any>{};
        },
        () => {
          this.table.isLoading = false;
        }
      );
  }
}
