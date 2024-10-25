import { Injectable } from '@angular/core';
import { ModuleSettingsDetailService } from '../../../../detail/module-settings-detail.service';
import { GenericParameter } from '../generic-parameter/generic-parameter';
import * as md5 from 'js-md5';
@Injectable()
export class CreditCart extends GenericParameter {
  constructor(protected moduleSettingsDetailService: ModuleSettingsDetailService) {
    super(moduleSettingsDetailService);
  }

  addData() {
    this.remaining = [];
    const invalid = [];
    this.data.values_to_add = this.data.values_to_add ? this.data.values_to_add : [];
    if (this.newData) {
      this.newData.split('\n').forEach((card_inserted) => {
        if (!this.parameter.validator(card_inserted)) {
          invalid.push(card_inserted);
        } else {
          if (card_inserted.length !== 32) {
            card_inserted = md5(card_inserted);
          }
          if (this.existsInList(card_inserted)) {
            this.remaining.push(card_inserted);
          } else {
            this.parameterData.unshift(this.parameter.adder(card_inserted));
            this.data.values_to_add.push(this.parameter.adder(card_inserted));
          }
        }
      });
      this.newData = this.remaining.join('\n');
      if (this.data.values_to_add.length) {
        this.sendData();
      }

      if (this.remaining.length) {
        const duplicated = this.remaining.join('\n');
        this.moduleSettingsDetailService.showError('Duplicated and not added', duplicated, 'info');
      }

      if (invalid.length) {
        const invalidCC = invalid.join('\n');
        this.moduleSettingsDetailService.showError('Invalid credit cards', invalidCC, 'error');
      }
    }
  }

  private existsInList(itemToCheck: string) {
    if (this.parameter.validator(itemToCheck)) {
      let existsCard = false;
      this.parameterData.forEach((element) => {
        if (element.value === itemToCheck) {
          existsCard = true;
        }
      });
      return existsCard;
    }
  }
}
