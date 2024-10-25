import { Component, Injector, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin as observableForkJoin } from 'rxjs';
import { take, finalize, takeUntil } from 'rxjs/operators';
import { DragulaService } from 'ng2-dragula';
import { moveItemInArray } from '@angular/cdk/drag-drop';

import { SettingDetailBrandAbuseAbstract } from 'app/dashboard/module-sections/modulesettings/detail/settings-detail-brand-abuse-abstract';
import { Grants } from 'app/services/grants/grants';
import { UsersService } from 'app/services/users.service';
import { ModuleSettingsDetailService } from 'app/dashboard/module-sections/modulesettings/detail/module-settings-detail.service';
import { TechProductService } from 'app/dashboard/module-sections/modulesettings/detail/tech-product/tech-product.service';
import { ClassifyService } from 'app/dashboard/module-sections/modulesettings/detail/classify/classify.service';
import { BankService } from 'app/dashboard/module-sections/modulesettings/detail/bank/bank.service';
import { FeedsService } from 'app/dashboard/module-sections/modulesettings/detail/feeds/feeds.service';
import { OrganizationService } from 'app/dashboard/organization/organization.service';
import { PaginationService } from 'app/dashboard/module-sections/shared/filters/pagination/pagination.service';
import { Store } from 'app/services/store/store';
import { AsideService } from '../../../../../aside/aside.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-filters-settings',
  templateUrl: './filters-settings.component.html',
  styleUrls: ['./filters-settings.component.scss']
})
export class FiltersSettingsComponent extends SettingDetailBrandAbuseAbstract implements OnInit, OnDestroy {
  selectedAll: any;
  anyChecked = false;
  totalResources: number;
  isOpened = false;
  searchTerm;
  tableHeader = [
    { value: 'Filter Name' },
    { value: 'Enabled', isChart: true, class: 'text-center th-70' },
    { value: 'Generated', isChart: true, class: 'text-center th-70' },
    { value: 'Edit', isChart: true, class: 'text-center th-70' },
    { value: 'Delete', isChart: true, class: 'text-center th-70' },
    { value: '', isChart: true, class: 'text-center th-30' }
  ];

  tableHeaderCustomer = [
    { value: 'Filter Name' },
    { value: 'Enabled', isChart: true, class: 'text-center th-70' },
    { value: 'Generated', isChart: true, class: 'text-center th-70' },
    { value: 'Edit', isChart: true, class: 'text-center th-70' },
    { value: 'Delete', isChart: true, class: 'text-center th-70' }
  ];
  items = [
    { name: 'op1', link: 'dashboard' },
    { name: 'op2', link: 'summary' }
  ];

  numberToSearch = {
    2: 'enabled',
    3: 'generated'
  };

  createModal = false;

  filterTemplates;
  selectedTemplate;

  filterToDeleteId;
  filterToDeleteIndex;
  deleteAllConfirmation;

  selectedItem;
  isMoveModalOpen = false;
  filterOrder;
  maxOrder: number;
  lastGeneratedFilterPosition = { min: 0, max: 0 };
  showAddFilter = false;

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
    private asideService: AsideService,
    public grants: Grants,
    protected toastrService: ToastrService
  ) {
    super(
      injector,
      usersService,
      settings,
      router,
      techProductService,
      dragulaService,
      classifyService,
      bankService,
      feedsService,
      cd,
      organizationService,
      paginationService,
      store,
      grants,
      toastrService
    );
    this.searchTerm = this.settings.searchTerm;
    //get generated filters positions
    this.settings
      .getGeneratedFiltersPositions()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.lastGeneratedFilterPosition = res;
        const { max } = res;
        if (this.grants.isMaster() || max > 0) {
          this.showAddFilter = true;
        }
      });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  setValues() {
    this.totalResources = this.data.totalResources;
    this.values = [];
    this.data.values.forEach(({ id, order, generated, name, enabled }: any) => {
      this.values.push({
        id,
        order,
        values: [
          {
            value: name ?? 'Default',
            elementClass: 'mb-0 text-90 font-weight-normal'
          },
          {
            isEnabled: true,
            booleanEnabled: enabled,
            canEdit: this.canEditFilter(generated),
            searchPlace: 2,
            class: 'td-center',
            elementClass: `mb-0 text-90 font-weight-normal${this.canEditFilter(generated) ? '' : ' cursor-not-allowed'}`
          },
          {
            isGenerated: true,
            booleanGenerated: generated,
            searchPlace: 3,
            class: 'td-center',
            elementClass: 'mb-0 text-90 font-weight-normal cursor-not-allowed'
          },
          {
            edit: true,
            canEdit: this.canEditFilter(generated),
            iconClass: 'icon-pencil-square',
            booleanGenerated: generated,
            class: 'td-center',
            elementClass: `mb-0 text-90 font-weight-normal${this.canEditFilter(generated) ? '' : ' cursor-not-allowed'}`
          },
          {
            delete: true,
            canDelete: this.canDeleteFilter(generated),
            iconClass: 'icon-delete',
            class: 'td-center',
            elementClass: `mb-0 text-90 font-weight-normal${
              this.canDeleteFilter(generated) ? '' : ' cursor-not-allowed'
            }`
          }
        ],
        selected: false
      });
    });
    this.sortValues();
  }

  sortValues() {
    this.values.sort((a, b) => {
      return a.order - b.order;
    });
  }

  canEditFilter(generated) {
    if (generated) {
      return this.grants.isMasterSuperAdmin();
    } else {
      return !this.grants.isCustomerOrOperator();
    }
  }

  canDeleteFilter(generated) {
    if (generated) {
      return this.grants.isMaster();
    } else {
      return !this.grants.isCustomerOrOperator();
    }
  }

  openAddFilter() {
    this.isOpened = !this.isOpened;
    this.router.navigate([
      `/dashboard/organizations/${this.activeModule.organizationId}/modules/${this.activeModule.id}/settings/filters/new`
    ]);
  }

  openAddFromTemplate() {
    this.createModal = true;
    this.settings
      .getTemplateList()
      .pipe(takeUntil(this.destroy$))
      .subscribe((templates) => {
        this.listTemplates = templates;
      });
  }

  closeAddFromTemplate() {
    this.createModal = false;
  }

  setStatus(status, index, searchPlace) {
    this.values[index].values[searchPlace].booleanEnabled = status;
    const tempSettingObject = {};
    tempSettingObject[this.numberToSearch[searchPlace]] = this.values[index].values[searchPlace].booleanEnabled;
    this.settings
      .saveSettingsPatch(this.settingId, this.values[index].id, tempSettingObject)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  selectAll() {
    this.values.forEach((item) => {
      item.selected = this.selectedAll;
    });
    this.checkIfAnySelected();
  }

  checkIfAllSelected() {
    this.selectedAll = this.values.every(({ selected }: any) => selected === true);
    this.checkIfAnySelected();
  }

  reloadFilterList(): void {
    this.paginationService[this.values.length ? 'reloadPage' : 'resetpaginationOutside']();
  }

  changeDeletedConfirmation() {
    this.deleteConfirmation = false;
    this.deleteAllConfirmation = false;
  }

  deleteSelected() {
    const request$ = [];
    this.values = this.values.filter((value) => {
      if (value.selected === true) {
        request$.push(this.settings.deleteSelectedFilters(value.id));
        return false;
      }
      return true;
    });
    observableForkJoin(request$)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.paginationService.reloadPage()),
        take(1)
      )
      .subscribe();
    this.changeDeletedConfirmation();
  }

  checkIfAnySelected() {
    this.anyChecked = this.values.some(({ selected }: any) => selected === true);
  }

  deleteSetting(id, index) {
    this.settings
      .deleteSelectedFilters(id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.paginationService.reloadPage()),
        take(1)
      )
      .subscribe(() => {
        this.values.splice(index, 1);
      });
    this.changeDeletedConfirmation();
  }

  changeOrder(value, up = false) {
    const position = up ? value.order - 1 : value.order + 1;
    this.settings
      .changeOrder(value.id, position)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.paginationService.reloadPage();
      });
  }

  itemIs(obj, key) {
    for (const a of obj) {
      if (typeof a === 'object') {
        for (const i of Object.keys(a)) {
          if (i === key) {
            return a[key];
          }
        }
      }
    }
    return null;
  }

  selectTemplate(e) {
    this.selectedTemplate = e;
  }

  createFromTemplate() {
    const id = this.selectedTemplate;

    this.settings
      .createFilterFromTemplate(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.router.navigate([
          `/dashboard/organizations/${this.activeModule.organizationId}/modules/${this.activeModule.id}/settings/filters/${res.id}/edit`
        ]);
      });

    this.createModal = false;
  }

  openMenu(data, id) {
    this.asideService.setShowAsideSubject(data, id);
  }

  modifyCommonsProperties(filterToDeleteId, filterToDeleteIndex, deleteConfirmation) {
    this.filterToDeleteId = filterToDeleteId;
    this.filterToDeleteIndex = filterToDeleteIndex;
    this.deleteConfirmation = deleteConfirmation;
  }

  openConfirmationModal(id, index) {
    this.modifyCommonsProperties(id, index, true);
  }

  closeConfirmation() {
    this.modifyCommonsProperties(null, null, false);
    this.deleteAllConfirmation = false;
  }

  openDeleteAllConfirmationModal() {
    this.deleteAllConfirmation = true;
  }

  searchTerms(term) {
    this.settings.searchTerm = term;

    setTimeout(() => {
      this.settings
        .getSettingsData(this.settingId, 1, this.maxRows)
        .pipe(takeUntil(this.destroy$))
        .subscribe((res) => {
          this.data.values = res.values;
          this.setValues();
          this.totalResources = res.totalResources;
        });
    }, 1500);
  }

  onListDrop(e) {
    const id = this.values[e.previousIndex].id;
    const order = this.values[e.previousIndex].order;
    const positions = e.currentIndex - e.previousIndex;
    const newOrder = order + positions;
    if (!this.canBeMoved(newOrder)) {
      this.settings.showError('Error', 'Cannot move above generated filters', 'error');
    } else {
      moveItemInArray(this.values, e.previousIndex, e.currentIndex);
      this.moveFilter(id, newOrder);
    }
  }

  changeFilterOrder() {
    const id = this.selectedItem.id;
    const order = this.filterOrder > this.maxOrder ? this.maxOrder : this.filterOrder;
    if (!this.canBeMoved(order)) {
      this.settings.showError('Error', 'Cannot move above generated filters', 'error');
    } else {
      this.moveFilter(id, order);
    }
  }

  canBeMoved(position) {
    if (this.grants.isMaster()) {
      return position <= this.lastGeneratedFilterPosition.min || position >= this.lastGeneratedFilterPosition.max;
    } else if (this.grants.isSuperAdmin()) {
      return position > this.lastGeneratedFilterPosition.max;
    } else if (this.grants.isAdmin() || this.grants.isAnalyst()) {
      return true;
    } else {
      return false;
    }
  }

  moveFilter(id, order) {
    this.settings
      .changeOrder(id, order)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        () => {
          this.paginationService.reloadPage();
        },
        () => {
          this.settings.showError('Error', 'There was a problem while moving the filter', 'error');
          this.paginationService.reloadPage();
        }
      );
  }

  openCloseMoveDialog(value?) {
    this.isMoveModalOpen = !this.isMoveModalOpen;
    this.selectedItem = value ? value : null;
    this.maxOrder = this.totalResources;
  }
}
