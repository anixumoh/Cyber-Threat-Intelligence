import { Component, Injector, OnInit, ChangeDetectorRef, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { DragulaService } from 'ng2-dragula';

import { UsersService } from 'app/services/users.service';
import { ModuleSettingsDetailService } from 'app/dashboard/module-sections/modulesettings/detail/module-settings-detail.service';
import { ModuleModel, OrganizationModel } from 'app/dashboard/organization/models';
import { ClassifyService } from 'app/dashboard/module-sections/modulesettings/detail/classify/classify.service';
import { BankService } from 'app/dashboard/module-sections/modulesettings/detail/bank/bank.service';
import { FeedsService } from 'app/dashboard/module-sections/modulesettings/detail/feeds/feeds.service';
import { OrganizationService } from 'app/dashboard/organization/organization.service';
import { TechProductService } from 'app/dashboard/module-sections/modulesettings/detail/tech-product/tech-product.service';
import { PaginationService } from 'app/dashboard/module-sections/shared/filters/pagination/pagination.service';
import { Store } from 'app/services/store/store';
import { Grants } from 'app/services/grants/grants';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-settings-detail',
  template: '<div></div>'
})
export class SettingDetailAbstract implements OnInit, OnDestroy {
  @ViewChild('inputAll', { read: ElementRef }) inputAll: ElementRef;

  roles: any;
  currentPage: number;
  maxRows: number;
  itemToUpdate: string;
  currentFilterObservable: Observable<any>;
  selectedAll: any;
  anyChecked = false;
  data: any;
  usersList: any;
  values = [];
  deleteConfirmation = false;
  loading = false;
  newdata;
  selectedItems: any = [];
  activeModule: ModuleModel;
  activeOrganization: OrganizationModel;
  checkboxValues: any = [];
  modules;
  statefeeds;
  booleans;
  new_value: string;
  distanceUpdate;
  disableInputs = false;
  remaining = [];
  listTemplates;
  isShowInfo = false;
  isShowForm = false;
  isShowSearch = false;
  isShowDropdown = false;

  constructor(
    protected injector: Injector,
    protected usersService: UsersService,
    protected settings: ModuleSettingsDetailService,
    protected router: Router,
    protected techProductService: TechProductService,
    protected dragulaService: DragulaService,
    protected classifyService: ClassifyService,
    protected bankService: BankService,
    protected feedsService: FeedsService,
    protected cd: ChangeDetectorRef,
    protected organizationService: OrganizationService,
    protected paginationService: PaginationService,
    protected store: Store,
    public grants: Grants,
    protected toastrService: ToastrService
  ) {}

  protected checks;
  protected settingId: any;
  protected readonly destroy$ = new Subject<void>();

  ngOnInit() {
    this.dragulaService
      .drop()
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: any) => {
        this.onDrop(value);
      });
    this.initContext();
    this.organizationService
      .getCurrentContext()
      .pipe(takeUntil(this.destroy$))
      .subscribe((context: any) => {
        if (context.currentModule && context.currentOrganization) {
          this.activeModule = context.currentModule;
          this.activeOrganization = context.currentOrganization;
          this.loadUsers();
        }
      });
    this.paginationService.pagination$.pipe(takeUntil(this.destroy$)).subscribe((paginationObject) => {
      this.maxRows = paginationObject.selectedItem.value;
      this.currentPage = paginationObject.pageState.currentPage;
    });
    this.store
      .select('roleList')
      .pipe(takeUntil(this.destroy$), filter(Boolean))
      .subscribe((res: any) => {
        this.roles = res;
      });
    this.settings
      .getTemplateList()
      .pipe(takeUntil(this.destroy$))
      .subscribe((templates) => {
        this.listTemplates = templates;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initContext() {
    this.data = this.injector.get('data');
    this.checks = this.data.values ? new Array(this.data.values.length) : [];
    this.settingId = this.injector.get('settingId');
    this.setValues();
  }

  setValues() {
    this.values = this.data.values;
  }

  // TODO: Please review use of this methods
  onDrag(args: any): void {
    const [e] = args;
  }

  onDrop(args: any): void {
    const [e] = args;
  }

  onOver(args: any): void {
    const [el] = args;
  }

  onOut(args: any): void {
    const [el] = args;
  }

  onDropModel(args) {
    // let [el, target, source] = args;
    // do something else
  }

  loadUsers() {
    if (!this.grants.isCustomer()) {
      this.usersService
        .getUsersList()
        .pipe(takeUntil(this.destroy$))
        .subscribe((users) => {
          this.usersList = users.list;
        });
    }
  }

  addData(): void {
    this.remaining = [];
    this.data.values_to_add = this.data.values_to_add ? this.data.values_to_add : [];
    if (this.newdata) {
      this.newdata.split('\n').forEach((item_inserted) => {
        item_inserted = item_inserted.trim();
        const item_inserted_temp = item_inserted;
        this.checkElement(item_inserted, item_inserted_temp);
      });
      this.newdata = this.remaining.join('\n');
      if (this.data.values_to_add.length) {
        this.sendData();
      }
    }
  }

  checkElement(item_inserted, item_inserted_temp) {
    if (this.data.validator(item_inserted)) {
      let isElement = false;
      this.values.forEach((element) => {
        if (element.value === item_inserted_temp) {
          isElement = true;
        }
      });
      if (!isElement) {
        this.values.unshift(this.data.adder(item_inserted_temp));
        this.data.values_to_add.push(this.data.adder(item_inserted_temp));
      } else {
        this.remaining.push(item_inserted);
      }
    } else {
      this.remaining.push(item_inserted);
    }
  }

  delete() {
    this.values = this.values.filter((value) => {
      if (value.selected === true) {
        this.selectedItems.push(value);
        return false;
      }
      return true;
    });
    this.deteleDataFromDataValues();
    this.deleteData();
  }

  searchInList(event): void {
    const word = event.target.value.toLowerCase();
    if (word.length > 0) {
      this.values = this.data.values;
      const temp = [];
      this.values.forEach((value) => {
        if (value.value.toLowerCase().indexOf(word) >= 0) {
          temp.push(value);
        }
      });
      this.values = temp;
    } else {
      this.values = this.data.values;
    }
  }

  renderValue(value) {
    return value.value ? value.value.split('~')[0] : value.title;
  }

  sendData(valuesFromCategories?) {
    if (this.settingId === 'booleans') {
      this.settingId = 'alert';
    } else if (this.settingId === 'extra_categories') {
      this.settings
        .saveRssCategoriesSetting(this.settingId, valuesFromCategories)
        .pipe(takeUntil(this.destroy$))
        .subscribe();
    }
    this.settings.saveSettingsData(this.settingId, this.data).pipe(takeUntil(this.destroy$)).subscribe();
    this.data.values_to_add = [];
  }

  sendFeedData() {
    this.settings.saveFeedSettingsDataCarding(this.modules, this.statefeeds).pipe(takeUntil(this.destroy$)).subscribe();
  }

  deteleDataFromDataValues() {
    this.data.values = this.data.values.filter((value) => {
      return (
        this.selectedItems.findIndex((item) => {
          return item.value !== value.value;
        }) > -1
      );
    });
  }

  deleteData() {
    this.data.values_to_delete = [];
    this.selectedItems.forEach((el) => {
      if (this.settingId === 'alert' || this.settingId === 'booleans') {
        this.data.values_to_delete.push({ value: el.id });
      } else {
        this.data.values_to_delete.push({ value: el.value });
      }
    });
    this.selectedItems = [];
    this.checks.fill(false);
    if (this.settingId === 'booleans') {
      this.settingId = 'alert';
    }

    this.settings.deleteSettingData(this.settingId, this.data).pipe(takeUntil(this.destroy$)).subscribe();
  }

  resetInputSelectAll() {
    if (this.inputAll) {
      this.inputAll.nativeElement.checked = false;
    }
  }

  toggleShowInfo() {
    this.isShowInfo = !this.isShowInfo;
  }

  toggleShowForm() {
    this.isShowForm = !this.isShowForm;
  }

  toggleShowSearch() {
    this.isShowSearch = !this.isShowSearch;
  }

  toggleShowDropdown() {
    this.isShowDropdown = !this.isShowDropdown;
  }

  protected selectAll() {
    this.values.forEach((item) => {
      item.selected = this.selectedAll;
    });
    this.checkIfAnySelected();
  }

  protected checkIfAllSelected() {
    this.selectedAll = this.values.every((item: any) => {
      return item.selected === true;
    });
    this.checkIfAnySelected();
  }

  protected checkIfAnySelected() {
    this.anyChecked = this.values.some((item: any) => {
      return item.selected === true;
    });
  }
}
