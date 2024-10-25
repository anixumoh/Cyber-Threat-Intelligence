import { Component, OnInit, Input, Output, EventEmitter, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { MAT_CHECKBOX_DEFAULT_OPTIONS } from '@angular/material/checkbox';

import { REGEX_VALIDATIONS } from '../validations';

@Component({
  selector: 'app-asset-discovery-box',
  templateUrl: './asset-discovery-box.component.html',
  styleUrls: ['./asset-discovery-box.component.scss'],
  providers: [{ provide: MAT_CHECKBOX_DEFAULT_OPTIONS, useValue: { clickAction: 'noop' } }]
})
export class AssetDiscoveryBoxComponent implements OnInit, OnChanges {
  @ViewChild('matSelectAssets') matSelectAssets: MatSelect;

  @Input()
  set loadingItems(its) {
    this._loadingItems = its;
  }

  get loadingItems() {
    return this._loadingItems;
  }

  @Input()
  set items(its) {
    this._items = its;
  }

  get items() {
    return this._items;
  }

  @Input()
  set allowedModules(its) {
    if (its) {
      this.filteredModules.ip = its.filter((mod) => {
        return this.settingsByModule.ip.some((f) => {
          return f === mod.type;
        });
      });

      this.filteredModules.subdomain = its.filter((mod) => {
        return this.settingsByModule.domain.some((f) => {
          return f === mod.type;
        });
      });
      this._allowedModules = its;
    }
  }

  get allowedModules() {
    return this._allowedModules;
  }

  @Input() itemsType;
  @Input() label;
  @Input() sortByOptions;
  @Input() filterByOptions;
  @Input() canSearch;
  @Input() canAdd;
  @Input() deleteType;

  @Output() changeParamsEvent = new EventEmitter();
  @Output() deleteEvent = new EventEmitter();
  @Output() discardEvent = new EventEmitter();
  @Output() addSettingEvent = new EventEmitter();
  @Output() addToSettingsBulkEvent = new EventEmitter();

  regexValidations = REGEX_VALIDATIONS;

  dataToAdd: UntypedFormGroup;
  addError;

  openSort = false;
  openFilter = false;
  isOpenSearch = false;
  isAdding = false;

  selectedFilter;
  selectedSort;
  searchTerm;

  filteredModules = {
    ip: [],
    subdomain: []
  };

  settingsByModule = {
    domain: ['CREDENTIALS', 'DARK_WEB', 'DOMAIN_PROTECTION', 'MALWARE', 'HACKTIVISM'],
    ip: ['CREDENTIALS', 'MALWARE', 'HACKTIVISM', 'DARK_WEB']
  };

  selectedItems = [];
  isSelectOptionsOpen = false;
  optionsStopper = false;
  selectOptions = [
    {
      value: 'New',
      selected: true,
      id: 'new'
    },
    {
      value: 'Updated',
      selected: true,
      id: 'updated'
    },
    {
      value: 'Deleted',
      selected: false,
      id: 'deleted'
    },
    {
      value: 'Discarded',
      selected: false,
      id: 'discarded'
    }
  ];

  exportOptionsForm: UntypedFormGroup;
  isExportModalOpen = false;
  exportOptions = [
    { value: 'Csv', id: 'csv' },
    { value: 'Global settings', id: 'settings' }
  ];
  exportStatus = [
    {
      value: 'New',
      id: 'new'
    },
    { value: 'Updated', id: 'updated' },
    { value: 'Deleted', id: 'deleted' },
    { value: 'Discarded', id: 'discarded' }
  ];

  _loadingItems = true;

  private _items: any;
  private _allowedModules: any;

  constructor() {}

  ngOnInit() {
    this.dataToAdd = new UntypedFormGroup({
      data: new UntypedFormControl('', Validators.required),
      modules: new UntypedFormControl([]),
      tag: new UntypedFormControl('')
    });

    if (!this.canAdd) {
      this.dataToAdd.controls['modules'].setValidators([Validators.required]);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes.items &&
      changes.items.previousValue &&
      changes.items.previousValue.length &&
      changes.items.currentValue &&
      !changes.items.currentValue.length
    ) {
      this.loadingItems = false;
    }
  }

  toggleFilter() {
    this.openSort = false;
    this.openFilter = !this.openFilter;
  }

  toggleSort() {
    this.openFilter = false;
    this.openSort = !this.openSort;
  }

  toggleSearch() {
    this.isOpenSearch = !this.isOpenSearch;
    this.openSort = this.openFilter = false;
  }

  selectSort(event) {
    this.selectedSort = event;
    this.toggleSort();
    this.loadingItems = true;
    this.changeParamsEvent.emit({ value: this.selectedSort, type: 'sortBy', asset: this.itemsType });
  }
  selectFilter(event) {
    this.selectedFilter = this.selectedFilter === event ? '' : event;
    this.toggleFilter();
    this.loadingItems = true;
    this.changeParamsEvent.emit({ value: this.selectedFilter, type: 'filterBy', asset: this.itemsType });
  }

  search() {
    this.isOpenSearch = false;
    this.loadingItems = true;
    this.changeParamsEvent.emit({ value: this.searchTerm, type: 'search', asset: this.itemsType });
  }

  deleteMany() {
    if (this.canAdd) {
      const deletedItems = this.selectedItems.map((a) => a.value.id);
      this.deleteEvent.emit({ deletedItems, type: this.itemsType });
    } else {
      this.discardEvent.emit({ items: this.selectedItems, type: this.itemsType });
    }
  }

  deleteOne(item) {
    if (this.canAdd) {
      this.deleteEvent.emit({ items: [item.id], type: this.itemsType });
    } else {
      this.discardEvent.emit({ items: [item], type: this.itemsType });
    }
  }

  add() {
    const splitValues = this.dataToAdd.getRawValue().data.trim().split('\n');

    if (this.canAdd) {
      this.addSettingEvent.emit({ values: splitValues, type: this.itemsType });
      this.isAdding = false;
      this.dataToAdd.reset();
    } else {
      const data = {
        values: [],
        modules: this.dataToAdd.getRawValue().modules,
        tag: this.dataToAdd.getRawValue().tag,
        type: this.itemsType === 'subdomain' ? 'domain' : this.itemsType
      };

      splitValues.forEach((value) => {
        data.values.push({
          value
        });
      });
      this.addToSettingsBulkEvent.emit(data);
      this.isAdding = false;
      this.dataToAdd.reset();
    }
  }

  isDataValid() {
    if (this.dataToAdd.controls['data'].value) {
      const split = this.dataToAdd.controls['data'].value.split('\n');
      if (split.length > 5) {
        this.addError = 'You can only add up to 5 items';
      } else if (split.length + this.items.length > 5) {
        this.addError = `You already have ${this.items.length} ${this.itemsType}s configured, you can only add ${
          5 - this.items.length
        } more`;
      } else if (this.itemsType === 'domain') {
        for (let element of split) {
          element = element.trim();
          if (element && !element.match(this.regexValidations.domainRegex)) {
            this.addError = 'Invalid format';
            break;
          } else {
            this.addError = '';
          }
        }
      } else if (this.itemsType === 'ip') {
        for (let element of split) {
          element = element.trim();
          if (
            element &&
            !element.match(this.regexValidations.ipRegex1) &&
            !element.match(this.regexValidations.ipRegex2) &&
            !element.match(this.regexValidations.ipRegex2)
          ) {
            this.addError = 'Invalid format';
            break;
          } else {
            this.addError = '';
          }
        }
      } else {
        this.addError = '';
      }
    } else {
      this.addError = '';
    }
  }

  getClass(item) {
    return item && item.assetStatus ? `list-item__${item.assetStatus.toLowerCase()}` : '';
  }

  getBadgeClass(item) {
    return item && item.assetStatus ? `badge__${item.assetStatus.toLowerCase()}` : '';
  }

  openCloseAdd() {
    this.isAdding = !this.isAdding;

    if (!this.canAdd && this.isAdding) {
      const items = this.selectedItems.map((a) => a.value);
      this.dataToAdd.controls['data'].setValue(items.join('\n'));
    } else if (!this.isAdding) {
      this.dataToAdd.reset();
    }
  }

  onCloseMatSelectAssets() {
    this.matSelectAssets.close();
  }

  getDeleteClass(item) {
    if (this.canAdd) {
      return 'icon-delete text-danger';
    } else if (!this.canAdd && item.assetStatus === 'DISCARDED') {
      return 'icon-eye text-primary';
    } else if (!this.canAdd && item.assetStatus !== 'DISCARDED') {
      return 'icon-eye-slash text-danger';
    }
  }

  getTooltipText(item) {
    if (this.canAdd) {
      return 'Delete';
    } else if (!this.canAdd && item.assetStatus === 'DISCARDED') {
      return 'Undo discard';
    } else if (!this.canAdd && item.assetStatus !== 'DISCARDED') {
      return 'Discard';
    }
  }

  showSelectOptions() {
    this.isSelectOptionsOpen = !this.isSelectOptionsOpen;

    if (this.isSelectOptionsOpen && !this.optionsStopper) {
      this.selectOptions[0].selected = true;
      this.selectOptions[1].selected = true;
      const defaultSelected = ['new', 'updated'];
      this.selectedItems = this.items.filter((item) => defaultSelected.includes(item.assetStatus.toLowerCase()));
    }
  }

  isAllSelected(selected) {
    const numSelected = selected.length;
    const numRows = this.items.length;
    return selected.length && numSelected === numRows;
  }

  selectOption(index) {
    this.selectOptions[index].selected = !this.selectOptions[index].selected;
    const selectedOptions = this.selectOptions.map((a) => {
      return a.selected ? a.id : '';
    });

    this.selectedItems = this.items.filter((item) => selectedOptions.includes(item.assetStatus.toLowerCase()));
    this.optionsStopper = !!this.selectedItems.length;
  }

  masterToggle(e) {
    e.checked ? (this.selectedItems = [...this.items]) : (this.selectedItems = []);
  }

  openCloseExportModal() {
    this.isExportModalOpen = !this.isExportModalOpen;
  }

  areThereItems() {
    return this.items && this.items.length;
  }

  areThereSelectedItems() {
    return this.selectedItems && this.selectedItems.length;
  }
}
