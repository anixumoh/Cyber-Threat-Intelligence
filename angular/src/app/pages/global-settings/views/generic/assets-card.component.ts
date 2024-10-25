import { Component, OnDestroy, OnInit, Input, ChangeDetectorRef, Output, EventEmitter, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { Subject } from 'rxjs';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import * as md5 from 'js-md5';
import { debounceTime, filter, takeUntil, skip } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';
import { MatSelect } from '@angular/material/select';
import { SETTINGS } from '../../settings';
import { SETTINGS_PER_MODULE } from '../../modules';
import { SETTINGS_DICTIONARY } from '../../settings_dictionary';
import { ASSETS_LISTS } from '../../lists';
import { Grants } from 'app/services/grants/grants';
import { AssetsService } from '../../assets.service';
import { NewTabService } from 'app/services/new-tab.service';

const VALUES_TO_CHECK = ['CONFIDENTIAL', 'RSS', 'EXTRA_CATEGORIES', 'FILE_EXTENSION'];
const CHECK = [
  'KEYWORD',
  'DOMAIN',
  'EMAIL',
  'IP',
  'CREDIT_CARD',
  'RSS',
  'TWITTER_PROFILE',
  'TYPOSQUATTING',
  'TYPO_KEYWORD_REGEX',
  'TYPO_KEYWORD_DISTANCE',
  'CONFIDENTIAL',
  'FILENAME',
  'TWEETS_FROM_PROFILE'
];

@Component({
  selector: 'app-assets-card',
  templateUrl: './assets-card.component.html',
  styleUrls: ['./assets-card.component.scss']
})
export class AssetsCardComponent implements OnInit, OnDestroy {
  settings = SETTINGS;
  moduleSettings = SETTINGS_PER_MODULE;
  settingsDictionary = SETTINGS_DICTIONARY;
  lists = ASSETS_LISTS;

  settingType;
  displayedColumns: string[] = ['select', 'term', 'modules', 'tags', 'delete', 'edit'];
  displayedErrorColumns: string[] = ['term', 'valid', 'delete'];
  initialSelection = [];
  allowMultiSelect = true;
  isExpandedModalOpen = false;
  infoModal = false;
  errorsModal = false;
  moduleSelectionModal = false;
  deleteConfirmationModal = false;
  deleteMultipleConfirmation = false;
  isAdding = false;
  selectedItem;
  selectedModules;
  selection = new SelectionModel<any>(this.allowMultiSelect, this.initialSelection);
  dataToAdd: UntypedFormGroup;
  dataError = new MatTableDataSource([]);
  addError;
  modules = new UntypedFormControl();
  modulesList;

  bincodeError = false;

  selectedVendor;
  selectedProduct;
  selectedVersion;
  techVendorSearch = undefined as any;
  techProductSearch;
  techVersionSearch;
  techDeprecated = false;
  isVendorDropdownOpen = false;
  isProductDropdownOpen = false;
  isVersionDropdownOpen = false;
  loadingVendors = false;
  loadingProducts = false;
  loadingVersions = false;

  uploadedImage = {
    touched: false,
    valid: false,
    image: null,
    imageFile: null
  };
  isEditingItem = {
    editing: false,
    item: null,
    tag: '',
    modules: {
      original: [],
      toAdd: [],
      toDelete: []
    }
  };
  isAddingModule = false;
  _items: any;
  its: any;
  @Input()
  set items(its) {
    this.its = its;
    this.settingType = its.type;
    if (VALUES_TO_CHECK.includes(this.settingType)) {
      this.displayedColumns = ['select', 'term', 'modules', 'delete', 'edit'];
    }

    if (this.settingType === 'BANK' && this.dataToAdd) {
      this.dataToAdd.controls['bincodes'].setValidators(Validators.required);
    }
    this.modulesList = this.moduleSettings[its.type];
    this._items = new MatTableDataSource(its.values);
  }

  get items() {
    return this._items;
  }

  _allowedModules: any;
  @Input()
  set allowedModules(its) {
    this._allowedModules = its.filter((mod) => this.moduleSettings[this.settingType].includes(mod.type));
  }

  get allowedModules() {
    return this._allowedModules;
  }

  _companies: any;
  @Input()
  set companies(its) {
    this.loadingVendors = false;
    this._companies = its;
  }

  get companies() {
    return this._companies;
  }

  _products: any;
  @Input()
  set products(its) {
    this.loadingProducts = false;
    this._products = its;
  }

  get products() {
    return this._products;
  }

  _versions: any;
  @Input()
  set versions(its) {
    this.loadingVersions = false;
    this._versions = its;
  }

  get versions() {
    return this._versions;
  }

  get disableAcceptButton() {
    return !this.selectedModules?.length;
  }

  @Input() orgId;

  @Output() editElement = new EventEmitter();
  @Output() addNewSetting = new EventEmitter();
  @Output() deleteOneSetting = new EventEmitter();
  @Output() deleteMultipleSettings = new EventEmitter();
  @Output() searchTech = new EventEmitter();
  @Output() addImage = new EventEmitter();
  @Output() filterByTag = new EventEmitter();
  @ViewChild('matSelectAssets') matSelectAssets: MatSelect;
  @ViewChild('searchInput') searchInput;
  searchNotifier$ = new Subject();
  validatorNotifier$ = new Subject();

  private readonly destroy$ = new Subject<any>();

  constructor(
    private cd: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    public grants: Grants,
    private assetsService: AssetsService,
    private newTabService: NewTabService
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.searchNotifier$
      .pipe(
        takeUntil(this.destroy$),
        filter((term: string) => term === '' || term?.length >= 3),
        debounceTime(1500)
      )
      .subscribe((searchText) => this.applyFilter(searchText));

    this.assetsService.errorNotifier$.pipe(skip(1), takeUntil(this.destroy$)).subscribe((res) => {
      if (res.type && res.type === this.settingType) {
        switch (res.action) {
          case 'reset':
            this.isAdding = false;
            this.dataToAdd.reset();
            this.resetImage();
            this.resetVendorsTech();
            break;

          case 'edit':
            this.dataToAdd.controls['data'].setValue(res.data.terms.join('\n'));
            this.dataToAdd.controls['modules'].setValue(res.data.modules);
            this.dataToAdd.controls['tags'].setValue(res.data.tag);
            this.isAdding = true;

            break;
        }
      }
    });
    this.validatorNotifier$.pipe(takeUntil(this.destroy$), debounceTime(1000)).subscribe(() => this.isDataValid());
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onCloseMatSelectAssets() {
    this.matSelectAssets.close();
  }

  initForm() {
    this.dataToAdd = new UntypedFormGroup({
      modules: new UntypedFormControl([], Validators.required),
      data: new UntypedFormControl('', Validators.required),
      bincodes: new UntypedFormControl(''),
      tags: new UntypedFormControl('')
    });
    if (this.settingType === 'BANKS') {
      this.dataToAdd.controls['bincodes'].setValidators(Validators.required);
    }
  }

  openCloseExpandedModal() {
    this.isExpandedModalOpen = !this.isExpandedModalOpen;
  }

  debounceSearch(event: any) {
    const { value } = event.target;
    this.searchNotifier$.next(value);
  }

  debounceValidator() {
    this.validatorNotifier$.next();
  }

  applyFilter(searchText: string) {
    this.items.filter = searchText.trim().toLowerCase();
  }

  resetQuery() {
    this.items.filter = '';
    this.searchInput.nativeElement.value = '';
  }

  closeExpandModal() {
    this.items.filter = '';
    this.isExpandedModalOpen = false;
    this._items = new MatTableDataSource(this.its.values);
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.items.data.length;
    return numSelected === numRows;
  }

  deleteMultipleOption() {
    if (this.selection.selected.length > 1) {
      this.deleteMultipleConfirmation = true;
    } else if (this.selection.selected.length === 1) {
      this.deleteOptions(this.selection.selected[0]);
    }
  }

  deleteMultiple() {
    this.deleteMultipleSettings.emit({ data: this.selection.selected, settingType: this.settingType });
  }

  isMultipleSelected() {
    return this.selection.selected.length > 0;
  }

  masterToggle() {
    this.isAllSelected() ? this.selection.clear() : this.items.data.forEach((row) => this.selection.select(row));
  }

  deleteOptions(item) {
    this.selectedItem = item;
    if (item.modules.length > 1) {
      this.moduleSelectionModal = true;
    } else {
      this.deleteConfirmationModal = true;
    }
  }

  deleteTerm() {
    const data = {
      term: this.selectedItem.searchPhrase,
      cpe: this.selectedItem.cpe,
      modules: this.selectedModules,
      settingType: this.settingType
    };
    this.deleteOneSetting.emit(data);
    this.moduleSelectionModal = false;
  }

  deleteTermSingleModule() {
    const data = {
      term: this.selectedItem.searchPhrase,
      cpe: this.selectedItem.cpe,
      modules: this.selectedItem.modules.map((x) => x.moduleId),
      settingType: this.settingType
    };
    this.deleteOneSetting.emit(data);
    this.deleteConfirmationModal = false;
  }

  addSetting() {
    const newSettingValues = this.dataToAdd.getRawValue();

    const commonData = {
      modules: newSettingValues.modules,
      settingType: this.settingType.startsWith('credit') ? 'credit_card' : this.settingType,
      tag: newSettingValues.tags,
      data: []
    };
    let dataToSend = {};
    switch (this.settingType) {
      case 'FILE_EXTENSION': {
        const { tag, ...rest } = commonData;
        dataToSend = { ...rest };
        newSettingValues.data.forEach((term: string) => {
          dataToSend['data'].push({
            value: term.trim()
          });
        });
        break;
      }
      case 'EXTRA_CATEGORIES': {
        dataToSend = { ...commonData };

        newSettingValues.data.forEach((term: string) => {
          dataToSend['data'].push({
            value: term
          });
        });
        break;
      }
      case 'TYPO_KEYWORD_DISTANCE': {
        newSettingValues.data = newSettingValues.data
          .trim()
          .split('\n')
          .filter((n) => n);
        dataToSend = { ...commonData };
        newSettingValues.data.forEach((term: string) => {
          dataToSend['data'].push({
            value: term.trim() + '~' + this.maxDistance(term.length / 2)
          });
        });
        break;
      }
      case 'IMAGE': {
        dataToSend = {
          ...commonData,
          searchPhrase: [],
          image: this.uploadedImage.imageFile
        };
        newSettingValues.data
          .trim()
          .split('\n')
          .forEach((term: string) => {
            dataToSend['searchPhrase'].push({
              value: term.trim()
            });
          });
        break;
      }
      case 'CPE_TECH': {
        dataToSend = {
          ...commonData,
          data: []
        };

        if (this.selectedVendor && this.selectedProduct && this.selectedVersion) {
          dataToSend['data'].push({ version: this.selectedVersion.cpeName, title: this.selectedVersion.title });
        } else if (this.selectedVendor && this.selectedProduct && !this.selectedVersion) {
          dataToSend['data'].push({
            vendor: this.selectedVendor.value,
            product: this.selectedProduct.value,
            title: this.selectedProduct.label
          });
        } else if (this.selectedVendor && !this.selectedProduct && !this.selectedVersion) {
          dataToSend['data'].push({ vendor: this.selectedVendor.value, title: this.selectedVendor.label });
        }
        break;
      }
      case 'BANK': {
        dataToSend = {
          ...commonData,
          data: [
            {
              value: newSettingValues.data,
              bincodes: newSettingValues.bincodes.split(',').filter((n) => n)
            }
          ]
        };
        break;
      }
      case 'CREDIT_CARD': {
        newSettingValues.data = newSettingValues.data
          .trim()
          .split('\n')
          .filter((n) => n);
        dataToSend = { ...commonData };
        newSettingValues.data.forEach((term: string) => {
          dataToSend['data'].push({
            value: term.length !== 32 ? md5(term.trim()) : term
          });
        });
        break;
      }
      case 'RSS': {
        newSettingValues.data = newSettingValues.data
          .trim()
          .split('\n')
          .filter((n) => n);
        dataToSend = { ...commonData };
        newSettingValues.data.forEach((term: string) => {
          dataToSend['data'].push({
            title: term,
            url: term
          });
        });
        break;
      }
      default: {
        newSettingValues.data = newSettingValues.data
          .trim()
          .split('\n')
          .filter((n) => n);
        dataToSend = {
          ...commonData,
          tag: newSettingValues.tags
        };
        newSettingValues.data.forEach((term: string) => {
          dataToSend['data'].push({
            value: term.trim()
          });
        });
        break;
      }
    }

    this.addNewSetting.emit(dataToSend);
  }

  openCloseInfoModal() {
    this.infoModal = !this.infoModal;
  }

  showAdd() {
    this.isAdding = !this.isAdding;

    if (!this.isAdding) {
      this.dataToAdd.reset();
      this.resetImage();

      if (this.settingType === 'CPE_TECH') {
        this.techDeprecated = false;
        this.techVendorSearch = undefined;
        this.resetVendorsTech();
      }
    }
  }

  editItem(index, element) {
    if (this.isEditingItem.editing) {
      this.saveItem(element);
    } else {
      this.isEditingItem = {
        editing: true,
        item: index,
        tag: element.tag,
        modules: { original: element.modules.map((el) => el.moduleId), toAdd: [], toDelete: [] }
      };
    }
  }

  deleteOrRestoreModule(moduleId) {
    const wasOriginal = this.isEditingItem.modules.original.indexOf(moduleId);
    const canBeRestored = this.isEditingItem.modules.toDelete.indexOf(moduleId);
    if (canBeRestored > -1) {
      this.isEditingItem.modules.toDelete.splice(canBeRestored, 1);
    } else if (wasOriginal > -1) {
      this.isEditingItem.modules.toDelete.push(moduleId);
    }
  }

  canBeRestored(moduleId, index) {
    const moduleIndex = this.isEditingItem.modules.toDelete.indexOf(moduleId);
    return this.isBeingEdited(index) && moduleIndex > -1;
  }

  isBeingEdited(index) {
    return this.isEditingItem.editing && this.isEditingItem.item === index;
  }

  getModuleTooltip(id, index) {
    if (!this.isBeingEdited(index)) {
      return 'Navigate to module';
    } else if (this.isBeingEdited(index) && this.canBeRestored(id, index)) {
      return 'This module was deleted';
    } else {
      return 'This module was already added to this term';
    }
  }

  openCloseAddModule() {
    this.isAddingModule = !this.isAddingModule;
  }

  getModuleName(id) {
    return this.allowedModules.find((x) => x.id === id).name;
  }

  addModule(id) {
    this.isEditingItem.modules.toAdd.push(+id);
  }

  removeProvisional(id) {
    const index = this.isEditingItem.modules.toAdd.indexOf(id);
    this.isEditingItem.modules.toAdd.splice(index, 1);
  }

  moduleIsNotConfigured(id) {
    return (
      this.isEditingItem.modules.original.indexOf(id) === -1 &&
      this.isEditingItem.modules.toAdd.indexOf(id) === -1 &&
      this.isEditingItem.modules.toDelete.indexOf(id) === -1
    );
  }

  saveItem(element) {
    const wordIds = element.modules.map((a) => a.wordId);

    const modulesToAdd = this.isEditingItem.modules.original
      .filter((el) => !this.isEditingItem.modules.toDelete.includes(el))
      .concat(this.isEditingItem.modules.toAdd);
    const commonData = {
      type: this.settingType,
      values: [],
      tag: element.tag,
      modulesToDelete: this.isEditingItem.modules.toDelete,
      modules: modulesToAdd,
      wordIds
    };
    let dataToSend = {};

    switch (this.settingType) {
      case 'CPE_TECH': {
        dataToSend = {
          ...commonData,
          values: [
            {
              title: element.searchPhrase,
              cpe: element.cpe
            }
          ]
        };
        break;
      }
      case 'BANK': {
        dataToSend = {
          ...commonData,
          values: [
            {
              value: element.searchPhrase,
              bincodes: element.bincodes
            }
          ]
        };
        break;
      }
      case 'RSS': {
        dataToSend = {
          ...commonData,
          values: [
            {
              title: element.searchPhrase,
              url: element.bincodes
            }
          ]
        };
        break;
      }
      default: {
        dataToSend = {
          ...commonData,
          values: [
            {
              value: element.searchPhrase
            }
          ]
        };
        break;
      }
    }
    this.editElement.emit(dataToSend);
  }

  cancelOrDelete(element) {
    if (this.isEditingItem.editing) {
      this.canceleditItem();
    } else {
      this.deleteOptions(element);
    }
  }

  canceleditItem() {
    const data = this.items.data;
    data[this.isEditingItem.item].tag = this.isEditingItem.tag;
    this.isEditingItem = {
      editing: false,
      item: null,
      tag: '',
      modules: {
        original: [],
        toAdd: [],
        toDelete: []
      }
    };
  }

  areModulesEmpty(i) {
    return (
      this.isBeingEdited(i) &&
      this.isEditingItem.modules.original.length === this.isEditingItem.modules.toDelete.length &&
      this.isEditingItem.modules.toAdd.length === 0
    );
  }

  checkData() {
    this.dataError = new MatTableDataSource([]);
    if (this.dataToAdd.controls['data'].value.trim()) {
      const items = [];
      this.dataToAdd.controls['data'].value
        .trim()
        .split('\n')
        .forEach((item) => {
          if (item) {
            let termObj;
            item = item.trim();
            if (this.settingType === 'KEYWORD') {
              const modules = this.dataToAdd.controls['modules'].value;
              const index = modules.findIndex((mod) => mod.type === 'DOMAIN_PROTECTION');
              const isPhishing = index !== -1;
              termObj = {
                term: item,
                error: this.settings[this.settingType].validator(item, isPhishing)
              };
            } else {
              termObj = {
                term: item,
                error: this.settings[this.settingType].validator(item)
              };
            }
            items.push(termObj);
          }
        });
      this.dataError = new MatTableDataSource(items);
    }
  }

  isDataValid() {
    if (this.dataToAdd.controls['data'].value) {
      const split = this.dataToAdd.controls['data'].value.trim().split('\n');

      for (const element of split) {
        if (element && this.settingType === 'KEYWORD') {
          const modules = this.dataToAdd.controls['modules'].value;
          const index = modules?.findIndex?.(({ type }: any) => type === 'DOMAIN_PROTECTION');
          const isPhishing = index !== -1;
          this.addError = this.settings[this.settingType].validator(element.trim(), isPhishing);
          if (this.addError) {
            break;
          }
        } else if (element && this.settings[this.settingType].validator(element.trim())) {
          this.addError = this.settings[this.settingType].validator(element.trim());
          if (this.addError) {
            break;
          }
        } else {
          this.addError = '';
        }
      }
    } else {
      this.addError = '';
    }
  }

  openManageErrors() {
    this.checkData();
    this.errorsModal = !this.errorsModal;
  }

  checkTerm(e, index) {
    this.dataError.data[index].error = this.settings[this.settingType].validator(this.dataError.data[index].term);
  }

  deleteTermFromErrorModal(index) {
    const items = this.dataError.data;
    items.splice(index, 1);
    this.dataError = new MatTableDataSource(items);
  }

  addTermsFromErrorModal() {
    const items = this.dataError.data.map((item) => {
      return item['term'];
    });
    // tslint:disable-next-line: quotemark
    this.dataToAdd.controls['data'].setValue(items.join('\n'));
    this.dataError = new MatTableDataSource([]);
    this.errorsModal = false;
  }

  moduleContainsSetting(type) {
    const index = this.moduleSettings[this.settingType].findIndex((x) => x === type);
    return index > -1;
  }

  maxDistance(distance) {
    if (distance) {
      return Math.floor(distance);
    }
  }

  renderTyposquatting(value, type) {
    const split = value.split('~');
    return split[type === 'value' ? 0 : 1];
  }

  isGenericSetting() {
    return CHECK.includes(this.settingType);
  }

  uploadFile(filesArg) {
    this.uploadedImage.touched = true;
    const files = Array.prototype.slice.call(filesArg);
    this.uploadedImage.imageFile = files[0];
    const imageType = this.uploadedImage.imageFile.type;
    const reader = new FileReader();
    reader.readAsBinaryString(this.uploadedImage.imageFile);
    reader.onload = () => {
      this.uploadedImage.image = this.sanitizer.bypassSecurityTrustResourceUrl(
        `data:${imageType};base64,${btoa(reader.result as string)}`
      );
      this.uploadedImage.valid = true;
    };
  }

  changeDeprecated() {
    if (this.selectedVendor && this.selectedProduct && this.techVersionSearch) {
      this.searchTech.emit({ type: 'version', text: this.selectedProduct, deprecated: this.techDeprecated });
    }
  }

  resetVendorsTech() {
    this.isVendorDropdownOpen = false;
    this.selectedVendor = null;
    this.selectedProduct = null;
    this.companies = [];
  }

  searchVendor() {
    this.selectedVendor = null;
    this.isProductDropdownOpen = false;
    this.products = [];
    this.techProductSearch = '';
    if (this.techVendorSearch) {
      this.loadingVendors = true;
      this.isVendorDropdownOpen = true;
      this.searchTech.emit({ type: 'vendor', text: this.techVendorSearch, deprecated: this.techDeprecated });
    } else {
      this.resetVendorsTech();
    }
  }

  searchProducts() {
    if (this.techProductSearch) {
      this.loadingProducts = true;
      this.isProductDropdownOpen = true;
      this.searchTech.emit({
        type: 'product',
        text: this.techProductSearch,
        deprecated: this.techDeprecated,
        vendor: this.selectedVendor.value
      });
    } else {
      this.selectedProduct = null;
      this.products = [];
    }
  }

  searchVersions() {
    if (this.techVersionSearch) {
      this.loadingVersions = true;
      this.isVersionDropdownOpen = true;
      this.searchTech.emit({
        type: 'version',
        text: this.techVersionSearch,
        product: this.selectedProduct.value,
        vendor: this.selectedVendor.value,
        deprecated: this.techDeprecated
      });
    } else {
      this.selectedVersion = null;
      this.versions = [];
    }
  }

  companyChange(company) {
    this.techVendorSearch = company.label;
    this.selectedVendor = company;
    this.isVendorDropdownOpen = false;
    this.techVersionSearch = '';
    this.selectedVersion = '';
    this.isVersionDropdownOpen = false;
  }

  productChange(product) {
    this.techProductSearch = product.label;
    this.techVersionSearch = '';
    this.selectedVersion = '';
    this.isVersionDropdownOpen = false;
    this.selectedProduct = product;
    this.isProductDropdownOpen = false;
  }

  versionChange(version) {
    this.techVersionSearch = version.title;
    this.selectedVersion = version;
    this.isVersionDropdownOpen = false;
  }

  checkBincodes() {
    const { bincodes } = this.dataToAdd.getRawValue();
    if (bincodes) {
      const splitBincodes = bincodes.split(',');
      splitBincodes.forEach((bincode) => {
        if (bincode?.length !== 6 && bincode?.length !== 8) {
          return (this.bincodeError = true);
        } else {
          this.bincodeError = false;
        }
      });
    }
  }

  clickOnTag(e) {
    this.filterByTag.emit(e);
  }

  resetImage() {
    this.uploadedImage = {
      touched: false,
      valid: false,
      image: null,
      imageFile: null
    };
  }

  navigateToModule(e, id, editing) {
    const url = `/dashboard/organizations/${this.orgId}/modules/${id}`;
    if (!editing) {
      this.newTabService.openNewTab(e, url);
    }
  }

  getSettingNameClass(setting) {
    return setting === 'IP' ? 'text-lowercase' : 'text-upercase';
  }

  isImage() {
    return this.settingType === 'IMAGE';
  }

  areThereModulesToAdd(modules) {
    return modules.length !== this.allowedModules.length;
  }

  canEditTag() {
    return !VALUES_TO_CHECK.includes(this.settingType);
  }
}
