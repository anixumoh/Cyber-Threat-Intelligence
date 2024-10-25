import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MODULES_TYPES_DICTIONARY } from '../../modules';
import { SETTINGS_DICTIONARY } from '../../settings_dictionary';

type FiltersType = 'settings_type' | 'module_type' | 'tags';

@Component({
  selector: 'app-assets-filters',
  templateUrl: './assets-filters.component.html',
  styleUrls: ['./assets-filters.component.scss']
})
export class AssetsFiltersComponent implements OnInit, OnDestroy {
  @Input() settingTypes = [];
  @Input()
  set allowedModules(its) {
    this._allowedModules = its;
    this.moduleTypes = [...new Set(its.map(({ type }: any) => type))].filter(
      (type: string) => type !== 'THREAT_CONTEXT' && type !== 'CUSTOM'
    );
  }

  get allowedModules() {
    return this._allowedModules;
  }

  @Input()
  set tagsList(its) {
    this._tagsList = its.list;
  }

  get tagsList() {
    return this._tagsList;
  }

  _filteredTag;
  @Input()
  set filteredTag(its) {
    if (its) {
      this.provisionalTags = [];
      this.selectedTags.setValue([its]);
      this.applyFilters();
    }
  }

  get filteredTag() {
    return this._filteredTag;
  }

  @Output() applyAssetFilters = new EventEmitter();
  @Output() applySearch = new EventEmitter();
  @Output() resetAllFilters = new EventEmitter();

  moduleTypesDictionary = MODULES_TYPES_DICTIONARY;
  settingsDictionary = SETTINGS_DICTIONARY;
  moduleTypes = [];
  selectedTags = new UntypedFormControl();
  selectedModuleTypes = new UntypedFormControl();
  selectedSettingTypes = new UntypedFormControl();
  searchQuery = new UntypedFormControl();
  provisionalTags = [];
  provisionalModuleTypes = [];
  provisionalSelectedSettingTypes = [];
  isChangesPending = false;
  isFiltersOpen = false;
  isFiltering = false;
  private _allowedModules: any;
  private _tagsList: any;
  private readonly destroy$ = new Subject<void>();

  constructor() {}

  ngOnInit() {
    this.selectedModuleTypes.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.isChangesPending = true;
    });

    this.selectedTags.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.isChangesPending = true;
    });
    this.selectedSettingTypes.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.isChangesPending = true;
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get isViewResetFilters() {
    return (
      !!this.selectedTags.value?.length ||
      !!this.selectedModuleTypes.value?.length ||
      !!this.selectedSettingTypes.value?.length
    );
  }

  checkSelection($event: any, type: FiltersType) {
    switch (type) {
      case 'settings_type':
        this.provisionalSelectedSettingTypes.push($event);
        break;
      case 'module_type':
        this.provisionalModuleTypes.push($event);
        break;
      case 'tags':
        this.filteredTag = '';
        this.provisionalTags.push($event);
        break;
    }
  }

  isProvisional(item: any, type: FiltersType) {
    let index;
    switch (type) {
      case 'settings_type':
        index = this.provisionalSelectedSettingTypes.indexOf(item);
        return index > -1;
      case 'module_type':
        index = this.provisionalModuleTypes.indexOf(item);
        return index > -1;
      case 'tags':
        index = this.provisionalTags.indexOf(item);
        return index > -1;
    }
  }

  removeItem(item: any, type: FiltersType) {
    let formValue;
    let appliedIndex;
    let provisionalIndex;

    switch (type) {
      case 'settings_type':
        formValue = this.selectedSettingTypes.value;
        appliedIndex = formValue.indexOf(item);
        if (appliedIndex > -1) {
          formValue.splice(appliedIndex, 1);
          this.selectedSettingTypes.setValue(formValue);
        }

        provisionalIndex = this.provisionalSelectedSettingTypes.indexOf(item);
        if (provisionalIndex > -1) {
          this.provisionalSelectedSettingTypes.splice(provisionalIndex, 1);
        }
        break;
      case 'module_type':
        formValue = this.selectedModuleTypes.value;
        appliedIndex = formValue.indexOf(item);
        if (appliedIndex > -1) {
          formValue.splice(appliedIndex, 1);
          this.selectedModuleTypes.setValue(formValue);
        }

        provisionalIndex = this.provisionalModuleTypes.indexOf(item);
        if (provisionalIndex > -1) {
          this.provisionalModuleTypes.splice(provisionalIndex, 1);
        }
        break;
      case 'tags':
        formValue = this.selectedTags.value;
        appliedIndex = formValue.indexOf(item);
        if (appliedIndex > -1) {
          formValue.splice(appliedIndex, 1);
          this.selectedTags.setValue(formValue);
        }

        provisionalIndex = this.provisionalTags.indexOf(item);
        if (provisionalIndex > -1) {
          this.provisionalTags.splice(provisionalIndex, 1);
        }
        break;
    }
  }

  getIsFiltering() {
    return this.isViewResetFilters || this.searchQuery.value !== '';
  }

  search() {
    const query = this.searchQuery.value ? `&q=${this.searchQuery.value}` : ``;
    this.applySearch.emit({ query, isFiltering: this.getIsFiltering() });
  }

  resetQuery() {
    this.searchQuery.setValue('');
    this.search();
  }

  applyFilters() {
    const query = `&tags=${this.selectedTags.value ? this.selectedTags.value.join(',') : ''}&modulesTypes=${
      this.selectedModuleTypes.value ? this.selectedModuleTypes.value.join(',') : ''
    }&types=${this.selectedSettingTypes.value ? this.selectedSettingTypes.value.join(',') : ''}`;
    this.isFiltering =
      (this.selectedTags.value && this.selectedTags.value.length > 0) ||
      (this.selectedModuleTypes.value && this.selectedModuleTypes.value.length > 0) ||
      (this.selectedSettingTypes.value && this.selectedSettingTypes.value.length > 0);

    this.applyAssetFilters.emit({
      query,
      isFiltering: this.isFiltering,
      filters: {
        tags: this.selectedTags.value,
        modules: this.selectedModuleTypes.value,
        settings: this.selectedSettingTypes.value
      }
    });
    this.isChangesPending = false;
    this.provisionalSelectedSettingTypes = [];
    this.provisionalModuleTypes = [];
    this.provisionalTags = [];
  }

  resetFilters() {
    this.selectedTags.reset();
    this.selectedModuleTypes.reset();
    this.selectedSettingTypes.reset();
    this.resetAllFilters.emit();
    this.isFiltering = false;
    this.isChangesPending = false;
    this.search();
  }

  toggleFilters() {
    this.isFiltersOpen = !this.isFiltersOpen;
  }

  getSelectedCount(type) {
    return this[type].value?.length ? `(${this[type].value?.length})` : ``;
  }
}
