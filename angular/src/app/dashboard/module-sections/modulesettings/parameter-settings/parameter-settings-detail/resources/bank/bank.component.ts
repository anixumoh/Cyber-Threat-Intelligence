import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { Bank } from './bank';
import { GenericParameter } from '../generic-parameter/generic-parameter';
import { BankService } from './bank.service';
import { Grants } from '../../../../../../../services/grants/grants';
import { ModuleSettingsDetailService } from 'app/dashboard/module-sections/modulesettings/detail/module-settings-detail.service';

export function bankFactory(
  bankService: BankService,
  parameterObject: GenericParameter,
  moduleSettingsDetailService: ModuleSettingsDetailService
) {
  return new Bank(bankService, parameterObject, moduleSettingsDetailService);
}

@Component({
  selector: 'app-bank',
  templateUrl: './bank.component.html',
  styleUrls: ['./bank.component.scss'],
  providers: [
    GenericParameter,
    BankService,
    {
      provide: Bank,
      useFactory: bankFactory,
      deps: [BankService, GenericParameter, ModuleSettingsDetailService]
    }
  ]
})
export class BankComponent implements OnDestroy, AfterViewInit {
  @ViewChild('dropdownBanksButton', { read: ElementRef }) dropdownBanksButton: ElementRef;
  @ViewChild('dropdownBanksInput', { read: ElementRef }) dropdownBanksInput: ElementRef;
  @ViewChild('dropdownBincodes', { read: ElementRef }) dropdownBincodes: ElementRef;
  @ViewChild('dropdownBincodesButton', { read: ElementRef }) dropdownBincodesButton: ElementRef;

  @Input() set parameter(its) {
    this.parameterObject.setParameter(its);
    this.parameterObject.setParameterData(its);
    this.bankObject.sendBinCodes = [];
  }

  addedBincodes: any[];
  isOpenBinCodeModal = false;
  isSelectOpenBanks = false;
  isSelectOpenBincodes = false;
  bankSelected_showBinCodes = false;
  binCodes: any[];
  bank: any;
  allBanks: any[];
  searchBanks: any;
  buttonDisabled = false;
  inputBinCode = '';
  inputBank = '';
  bincodesError = false;
  nameBank = '';
  isShowInfo = false;
  deleteConfirmation = false;
  deleteAllConfirmation = false;
  bankIndex = null;
  selectedBincodes = [];

  constructor(
    public parameterObject: GenericParameter,
    public bankObject: Bank,
    public grants: Grants,
    protected cd: ChangeDetectorRef
  ) {}

  ngOnDestroy() {
    this.bankObject.unsubscribeBankSubject();
  }

  ngAfterViewInit() {
    this.bankObject.dropdownBanksButton = this.dropdownBanksButton;
    this.bankObject.dropdownBanksInput = this.dropdownBanksInput;
    this.bankObject.dropdownBincodes = this.dropdownBincodes;
    this.bankObject.dropdownBincodesButton = this.dropdownBincodesButton;
    this.bankObject.subscribeBankSubject(() => {
      if (!this.cd.detectChanges['destroyed']) {
        this.cd.detectChanges();
      }
    });
  }

  addBinCode() {
    this.bankObject.addBinCode();
  }

  editBankName() {
    this.nameBank = '';
    this.bankObject.editBank = true;
  }

  checkBinCodes() {
    const match = /,/g;
    const replaced = this.bankObject.inputBinCode.replace(match, '');
    const regex = /^[0-9]+$/g;
    const correct = replaced.match(regex);
    this.bincodesError = correct || this.bankObject.inputBinCode === '' ? false : true;
  }

  onInputChange(value: string) {
    this.nameBank = value;
  }

  openCloseBincodesModal(value: any) {
    this.bankObject.openCloseBincodesModal(value);
  }

  deleteBincode(binCodeToDelete) {
    this.bankObject.deleteBincode(binCodeToDelete);
  }

  applySaveOrDeleteBincodes() {
    this.bankObject.applySaveOrDeleteBincodes();
  }

  delete() {
    this.parameterObject.delete();
    this.deleteAllConfirmation = false;
    this.deleteConfirmation = false;
    this.searchInList('');
    this.checkIfAnySelected();
  }

  searchInList(event): void {
    this.parameterObject.searchInList(event);
  }

  deleteMultipleBincodes() {
    this.selectedBincodes.forEach((bincode) => {
      this.bankObject.deleteBincode(bincode);
    });
    this.selectedBincodes = [];
  }

  checkIfAnySelected() {
    this.parameterObject.checkIfAnySelected();
  }

  renderValue(item) {
    return item && item.value ? item.value : '-';
  }

  deleteOne(index) {
    this.parameterObject.deleteOne(index);
    this.deleteAllConfirmation = false;
    this.deleteConfirmation = false;
    this.searchInList('');
    this.checkIfAnySelected();
  }

  checkedBincode(bincode) {
    const index = this.selectedBincodes.findIndex((e) => e === bincode);
    if (index > -1) {
      this.selectedBincodes.splice(index, 1);
    } else {
      this.selectedBincodes.unshift(bincode);
    }
  }

  updateElement(obj) {
    this.parameterObject.updateElement(obj);
  }

  updateSelectAll(value) {
    this.parameterObject.updateSelectAll(value);
  }

  openConfirmationModal(index) {
    this.deleteConfirmation = true;
    this.bankIndex = index;
  }

  closeConfirmation() {
    this.deleteConfirmation = false;
    this.deleteAllConfirmation = false;
    this.bankIndex = null;
    this.searchInList('');
    this.checkIfAnySelected();
  }

  openCloseSearch(e) {
    if (!e) {
      this.searchInList('');
      if (this.parameterObject.anyChecked) {
        this.parameterObject.anyChecked = false;
      }
    }
  }

  openDeleteAllConfirmationModal() {
    this.deleteAllConfirmation = true;
  }
}
