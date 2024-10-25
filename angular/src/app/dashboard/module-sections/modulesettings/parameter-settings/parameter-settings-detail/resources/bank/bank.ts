import { Subject, Subscription } from 'rxjs';
import { ElementRef } from '@angular/core';

import { GenericParameter } from '../generic-parameter/generic-parameter';
import { BankService } from './bank.service';
import { ModuleSettingsDetailService } from 'app/dashboard/module-sections/modulesettings/detail/module-settings-detail.service';

export class Bank {
  addedBincodes: any[];
  actualBank: any;
  editBank: boolean;
  inputBankPlaceholder: string;
  isOpenBinCodeModal = false;
  isSelectOpenBanks = false;
  isSelectOpenBincodes = false;
  bankSelected_showBinCodes = false;
  binCodes: any[];
  bank: any;
  allBanks: any[];
  searchBanks: any;
  sendBinCodes: any[];
  buttonDisabled = false;
  banks: any[];
  inputBinCode = '';
  inputBank = '';
  errorBin = '';
  isShowInfo = false;
  dropdownBanksButton: ElementRef;
  dropdownBanksInput: ElementRef;
  dropdownBincodes: ElementRef;
  dropdownBincodesButton: ElementRef;
  bankSubject = new Subject();
  bankSubjectSubscription: Subscription;

  constructor(
    protected bankService: BankService,
    public parameterObject: GenericParameter,
    protected moduleSettingsDetailService: ModuleSettingsDetailService
  ) {}

  subscribeBankSubject(cb) {
    this.bankSubjectSubscription = this.bankSubject.subscribe(() => {
      if (cb) {
        cb();
      }
    });
  }

  unsubscribeBankSubject() {
    if (this.bankSubjectSubscription) {
      this.bankSubjectSubscription.unsubscribe();
    }
  }

  showBinCodes(bankName) {
    this.bankService.getBinCodes().subscribe((res) => {
      const bincodes = res.values.find((v) => v.value === bankName).bincodes;
      if (bincodes) {
        this.binCodes = [...bincodes];
        this.bankSubject.next();
        this.openCloseModal();
      }
    });
  }

  addBinCode() {
    const binCode = this.inputBinCode.trim().split(',');
    const wrongBincodes = [];
    const rightBincodes = [];
    if (binCode) {
      for (let i = 0; i < binCode.length; i++) {
        if (binCode[i].length !== 6 && binCode[i].length !== 8) {
          wrongBincodes.push(binCode[i]);
        } else {
          rightBincodes.push(binCode[i]);
        }
      }

      const duplicatedBincodes = [];
      rightBincodes.forEach((el) => {
        const indexBinCodes = this.binCodes.indexOf(el);
        if (indexBinCodes === -1) {
          this.binCodes.unshift(el);
        } else {
          duplicatedBincodes.push(el);
        }
      });

      if (duplicatedBincodes.length) {
        const domainString = duplicatedBincodes.join(', ');
        this.bankService.showError(domainString, 'Duplicated and not added');
      }

      if (wrongBincodes.length > 0) {
        this.bankService.showError(wrongBincodes.join(', '), 'Bincodes must be 6 or 8 digits length');
      }
    }

    this.inputBinCode = '';
  }

  checkElement(item_inserted) {
    return this.parameterObject.parameterData.find((element) => {
      return element.value === item_inserted;
    });
  }

  openCloseBincodesModal(value) {
    this.binCodes = [];
    this.inputBank = '';
    this.inputBinCode = '';
    this.editBank = false;
    this.inputBankPlaceholder = 'Bank Name';

    if (value && value !== 'close' && value !== 'addBank') {
      this.editBank = false;
      if (value.value) {
        this.inputBankPlaceholder = value.value;
        this.showBinCodes(value.value);
        this.actualBank = value.value;
      } else {
        this.actualBank = '';
      }
    } else {
      this.editBank = true;
      this.actualBank = '';
      this.openCloseModal();
    }
  }

  deleteBincode(binCodeToDelete) {
    const index = this.binCodes.indexOf(binCodeToDelete);
    if (index > -1) {
      this.binCodes.splice(index, 1);
    }
  }

  openCloseModal() {
    this.isOpenBinCodeModal = !this.isOpenBinCodeModal;
  }

  applySaveOrDeleteBincodes() {
    if (this.editBank) {
      this.editNewBank();
    }
    this.saveBincodes();
    this.openCloseModal();
  }

  editNewBank() {
    if (this.actualBank) {
      const bankToDelete = this.createDeleteBankObject();
      this.bankService.deleteBincodes(bankToDelete).subscribe(() => {
        this.parameterObject.parameterData = this.parameterObject.parameterData.filter((elem) => {
          return elem.value !== bankToDelete.values[0].value;
        });
      });
    }
  }

  saveBincodes() {
    if (this.inputBank && !this.checkElement(this.inputBank)) {
      this.actualBank = this.inputBank;
      if (this.binCodes.length) {
        const objectBinCodesAdded = this.createAddObject();
        this.bankService.postNewBank(objectBinCodesAdded).subscribe(
          () => {
            if (this.inputBank && !this.checkElement(this.inputBank)) {
              const bankName_binCodes = { value: `${this.actualBank}`, bincodes: this.binCodes };
              this.parameterObject.parameterData = [bankName_binCodes, ...this.parameterObject.parameterData];
            }
            this.binCodes = [];
          },
          (e) => {
            this.handleError(e);
          }
        );
      }
    } else if (!this.inputBank) {
      if (this.binCodes.length) {
        const objectBinCodesAdded = this.createAddObject();
        this.bankService.postNewBank(objectBinCodesAdded).subscribe(
          () => {
            this.binCodes = [];
          },
          (e) => {
            this.handleError(e);
          }
        );
      }
    }
  }

  handleError(e) {
    const errorType = e && e.error && e.error.message ? e.error.message : '';
    switch (errorType) {
      case 'error.customer_not_assigned':
        this.moduleSettingsDetailService.showError(`Organization doesn't have a customer assigned`, '', 'error');
        break;

      case 'error.band_exceed_total':
        this.moduleSettingsDetailService.showError(
          `The Licensed limit has been reached. Please contact your Account Manager`,
          '',
          'error'
        );
        break;

      case 'error.module_not_contracted':
        this.moduleSettingsDetailService.showError(
          `To set up this module, review your License and reach to your Account Manager `,
          '',
          'error'
        );
        break;

      case 'error.contract_expired':
        this.moduleSettingsDetailService.showError(
          `Contract has expired. Please contact your Account Manager`,
          '',
          'error'
        );
        break;

      default:
        this.moduleSettingsDetailService.showError('An error has occured. Term not added', '', 'error');
        break;
    }
  }

  createAddObject() {
    return {
      values: [
        {
          value: `${this.actualBank}`,
          bincodes: this.binCodes
        }
      ],
      type: 'BANK'
    };
  }

  createDeleteBankObject() {
    return {
      values: [
        {
          value: `${this.actualBank}`
        }
      ],
      type: 'BANK'
    };
  }
}
