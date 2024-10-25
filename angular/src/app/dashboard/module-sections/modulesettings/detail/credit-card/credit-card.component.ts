import { Component } from '@angular/core';
import * as md5 from 'js-md5';
import { SettingDetailAbstract } from "app/dashboard/module-sections/modulesettings/detail/settings-detail-abstract";

@Component({
  selector: 'credit-card',
  templateUrl: './credit-card.component.html',
  styleUrls: ['./credit-card.component.scss']
})
export class CreditCardComponent extends SettingDetailAbstract {

  isShowInfo = false;

  addDataCreditCard(): void {
    this.remaining = [];
    this.data.values_to_add = this.data.values_to_add ? this.data.values_to_add : [];
    if (this.newdata) {
      this.newdata
        .split('\n')
        .map(card_inserted => {
          if (card_inserted.length !== 32) {
            card_inserted = md5(card_inserted);
          }
          if (this.existsInList(card_inserted)) {
            this.remaining.push(card_inserted);
          } else {
            this.values.unshift(this.data.adder(card_inserted));
            this.data.values_to_add.push(this.data.adder(card_inserted));
          }
        })
      this.newdata = this.remaining.join('\n');
      if (this.data.values_to_add.length) {
        this.sendData();
      }
    }
  }

  existsInList(itemToCheck: string) {
    if (this.data.validator(itemToCheck)) {
      let existsCard = false;
      this.values.forEach((element) => {
        if (element.value === itemToCheck) {
          existsCard = true;
        }
      });
      return existsCard;
    }
  }

  toggleShowInfo() {
    this.isShowInfo = !this.isShowInfo;
  }
  
}
