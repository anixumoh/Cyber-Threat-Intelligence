import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import * as _ from 'lodash';

import { SettingDetailAbstract } from 'app/dashboard/module-sections/modulesettings/detail/settings-detail-abstract';

@Component({
  selector: 'bank',
  templateUrl: './bank.component.html',
  styleUrls: ['./bank.component.scss'],
  host: {
    '(document:click)': 'onClickOutside($event)',
  },
})
export class BankComponent extends SettingDetailAbstract implements OnInit, OnDestroy {
  @ViewChild('dropdownBanksButton', { read: ElementRef }) dropdownBanksButton: ElementRef;
  @ViewChild('dropdownBanksInput', { read: ElementRef }) dropdownBanksInput: ElementRef;
  @ViewChild('dropdownBincodes', { read: ElementRef }) dropdownBincodes: ElementRef;

  arrayOfDefaultBinCodes: any[];
  addedBincodes: any[];
  actualBank: any;
  isOpenBinCodeModal = false;
  isSelectOpenBanks = false;
  isSelectOpenBincodes = false;
  bankSelected_showBinCodes = false;
  binCodes: any[];
  bank: any;
  allBanks: any[];
  searchBanks: any;
  sendBinCodes: any[];
  binCode: any;
  buttonDisabled = false;
  banks: any[];
  inputBinCode = '';
  binCodesToBeDeleted: any[] = [];
  binCodesToBeAdded: any[] = [];
  isShowInfo = false;

  ngOnInit() {
    super.ngOnInit();
    this.sendBinCodes = [];
  }

  ngOnDestroy() {
    this.addedBincodes = null;
    this.actualBank = null;
    this.isOpenBinCodeModal = null;
    this.isSelectOpenBanks = null;
    this.isSelectOpenBincodes = null;
    this.binCodes = null;
    this.bank = null;
    this.allBanks = null;
    this.searchBanks = null;
    this.sendBinCodes = null;
    this.binCode = null;
    this.buttonDisabled = null;
    this.banks = null;
    this.inputBinCode = null;
    this.binCodesToBeDeleted = null;
    this.binCodesToBeAdded = null;
    super.ngOnDestroy();
  }

  onClickOutside(event) {
    if (
      this.isSelectOpenBanks &&
      this.dropdownBanksButton &&
      this.dropdownBanksInput &&
      !this.dropdownBanksButton.nativeElement.contains(event.target) &&
      !this.dropdownBanksInput.nativeElement.contains(event.target)
    ) {
      this.toggleSelectBanks();
    }
  }

  toggleSelectBanks() {
    this.binCodes = [];
    this.isSelectOpenBanks = !this.isSelectOpenBanks;
    this.sendBinCodes = [];
    this.inputBinCode = '';
    this.searchBanks = '';
    this.dropdownBanksInput.nativeElement.value = '';
    if (this.bank && this.isSelectOpenBanks) {
      this.bank = '';
      this.allBanks = null;
      this.bankSelected_showBinCodes = false;
      this.dropdownBanksInput.nativeElement.value = '';
    } else {
      this.bankSelected_showBinCodes = true;
    }
  }

  toggleSelectBinCodes(event) {
    this.isSelectOpenBincodes = !this.isSelectOpenBincodes;
    if (this.isSelectOpenBincodes) {
      this.showBinCodes(this.bank);
      this.buttonDisabled = true;
    } else {
      this.buttonDisabled = false;
    }
  }

  filterBanks(event) {
    this.searchBanks = event.target.value.trim();
    if (this.searchBanks.length > 3) {
      this.bankService
        .getBanks(this.searchBanks)
        .pipe(takeUntil(this.destroy$))
        .subscribe((res) => {
          this.banks = res.bankNames;
          this.allBanks = this.banks;
          if (!this.cd.detectChanges['destroyed']) {
            this.cd.detectChanges();
          }
        });
    }
  }

  changeBank(bank) {
    if (!this.grants.isCustomerOrOperator()) {
      this.bank = bank;
      this.showBinCodes(this.bank);
      this.toggleSelectBanks();
      this.banks = this.allBanks;
      if (this.searchBanks) {
        this.searchBanks = [];
      }
    }
  }

  showBinCodes(bank) {
    let bankDirection = encodeURIComponent(<string>bank);
    this.bankService
      .getBinCodes(bankDirection)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.binCodes = [...res];
        this.sendBinCodes = [...res];
      });
  }

  addBinCode() {
    this.binCode = this.inputBinCode.trim();
    if (this.binCode && this.binCode.length) {
      let indexBinCodes = this.binCodes.indexOf(this.binCode);
      let indexSendBinCodes = this.sendBinCodes.indexOf(this.binCode);
      if (indexBinCodes === -1 && indexSendBinCodes === -1) {
        this.binCodes.unshift(this.binCode);
        this.sendBinCodes.unshift(this.binCode);
        this.addedBincodes.unshift(this.binCode);

        this.binCodesToBeAdded.push(this.binCode);
      }
    }
    this.inputBinCode = '';
  }

  addDataBanks() {
    if (!this.checkElement(this.bank)) {
      let bankName_binCodes = { value: `${this.bank}`, bincodes: this.sendBinCodes };
      let sendObject = { values: [bankName_binCodes], type: 'BANK' };
      this.bankService
        .postNewBank(sendObject)
        .pipe(takeUntil(this.destroy$))
        .subscribe((res) => {
          this.values.unshift(bankName_binCodes);
          this.resetViewValues();
        });
    }
  }

  private resetViewValues() {
    this.dropdownBanksInput.nativeElement.value = '';
    this.dropdownBanksButton.nativeElement.value = '';
    this.allBanks = null;
    this.searchBanks = '';
    this.bank = '';
  }

  checkElement(item_inserted) {
    return this.values.find((element) => {
      return element.value === item_inserted;
    });
  }

  openCloseBincodesModal(event, value) {
    this.binCodes = [];
    this.addedBincodes = [];
    this.sendBinCodes = [];
    if (value === 'close') {
      this.binCodesToBeAdded = [];
      this.binCodesToBeDeleted = [];
    } else {
      if (value) {
        this.showBinCodes(value.value);
        this.actualBank = value.value;
        this.binCodes = this.addedBincodes = value.bincodes || value.defaultBincodes || [];
      }
    }
    this.openCloseModal();
  }

  deleteBincode(binCodeToDelete) {
    let index = this.addedBincodes.indexOf(binCodeToDelete);
    if (index > -1) {
      this.addedBincodes.splice(index, 1);
    }
    this.binCodesToBeDeleted.push(binCodeToDelete);
  }

  openCloseModal() {
    this.isOpenBinCodeModal = !this.isOpenBinCodeModal;
  }

  applySaveOrDeleteBincodes() {
    this.saveBincodes();
    this.deleteBincodes();
    this.openCloseModal();
  }

  saveBincodes() {
    if (this.binCodesToBeAdded.length) {
      let objectBinCodesAdded = this.createAddObject();
      this.bankService
        .postNewBank(objectBinCodesAdded)
        .pipe(takeUntil(this.destroy$))
        .subscribe((res) => {
          this.binCodesToBeAdded = [];
          this.deleteBincodes();
        });
    }
  }

  deleteBincodes() {
    if (!this.binCodesToBeAdded.length && this.binCodesToBeDeleted.length) {
      let objectToDelete = this.createDeleteObject();
      this.bankService
        .deleteBincodes(objectToDelete)
        .pipe(takeUntil(this.destroy$))
        .subscribe((res) => {
          this.binCodesToBeDeleted = [];
        });
    }
  }

  createAddObject() {
    return {
      values: [
        {
          value: `${this.actualBank}`,
          bincodes: this.binCodesToBeAdded,
        },
      ],
      type: 'BANK',
    };
  }

  createDeleteObject() {
    return {
      values: [
        {
          value: `${this.actualBank}`,
          bincodes: this.binCodesToBeDeleted,
        },
      ],
      type: 'BANK',
    };
  }

  toggleShowInfo() {
    this.isShowInfo = !this.isShowInfo;
  }
}
