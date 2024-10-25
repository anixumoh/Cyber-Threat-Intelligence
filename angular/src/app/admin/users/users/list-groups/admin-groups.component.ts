import { Component, ComponentFactoryResolver, OnInit, ViewContainerRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { UsersService } from '../../users.service';
import { TableConfig } from '../../../shared/table-config';
import { NewEditGroupsComponent } from '../../new-edit-groups/new-edit-groups.component';
import { GroupDetailComponent } from '../../group-detail/group-detail.component';

@Component({
  selector: 'app-admin-groups',
  templateUrl: './admin-groups.component.html',
  styleUrls: ['./admin-groups.component.scss']
})
export class AdminGroupsComponent implements OnInit {
  table = new TableConfig();
  itemSelected: any;
  confirmation = <any>{};
  private readonly destroy$ = new Subject<void>();

  get header() {
    const retorno = [];
    retorno.push(this.instanceHeader('name', 'Name', false, false, true));
    return retorno;
  }

  constructor(
    protected userService: UsersService,
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
    this.userService
      .getGroups(this.table.queryPagination)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (a) => {
          this.table.results.list = a;
          this.table.isLoading = false;
        },
        (e) => (this.table.isLoading = false)
      );
  }

  instanceHeader(key: string, title = '', hidden = false, isTemplate = false, hasDetail = false, width = undefined) {
    return {
      title,
      key,
      hidden,
      hasDetail,
      isTemplate,
      ...(width ? { width } : {})
    };
  }

  clickOnARow(event) {
    const resolver = this.fr.resolveComponentFactory(GroupDetailComponent);
    const ref: any = this.view.createComponent(resolver);
    ref.instance.groupSelected = event.data;
    ref.changeDetectorRef.detectChanges();
    ref.instance.onCloseEmit.pipe(takeUntil(this.destroy$)).subscribe((e) => this.view.clear());
    ref.instance.onSuccess.pipe(takeUntil(this.destroy$)).subscribe((e) => {
      this.view.clear();
      this.createEdit(event.data);
    });
  }

  createEdit(obj = null) {
    const resolver = this.fr.resolveComponentFactory(NewEditGroupsComponent);
    const ref: any = this.view.createComponent(resolver);
    ref.changeDetectorRef.detectChanges();
    ref.instance.closeEmit.pipe(takeUntil(this.destroy$)).subscribe((e) => this.view.clear());
    ref.instance.successEmit.pipe(takeUntil(this.destroy$)).subscribe((e) => {
      this.view.clear();
      this.reloadData();
    });
    if (obj) {
      ref.instance.instanceForm(obj);
      ref.changeDetectorRef.detectChanges();
    }
  }

  delete(item) {
    this.userService
      .deleteUserGroup(item)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (a) => {
          this.table.isLoading = false;
          this.reloadData(false);
          this.itemSelected = null;
          this.confirmation = <any>{};
        },
        (e) => (this.table.isLoading = false)
      );
  }
}
