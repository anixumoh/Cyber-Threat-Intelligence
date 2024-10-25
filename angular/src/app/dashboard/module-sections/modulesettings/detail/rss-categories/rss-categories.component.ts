import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { SettingDetailAbstract } from 'app/dashboard/module-sections/modulesettings/detail/settings-detail-abstract';

@Component({
  selector: 'rss-categories',
  templateUrl: './rss-categories.component.html',
  styleUrls: ['./rss-categories.component.scss'],
})
export class RssCategoriesComponent extends SettingDetailAbstract implements OnInit {
  formatedValues: any = [];

  initContext() {
    super.initContext();
    this.transformNames();
  }

  transformNames() {
    this.formatedValues = JSON.parse(JSON.stringify(this.values));
    this.formatedValues.forEach((element: any) => {
      element.formated = element.name.replace(/_/g, ' ');
    });
  }

  sendStatus() {
    this.values = this.formatedValues.map((element) => {
      return {
        name: element.name,
        value: element.value,
      };
    });
    let objectToSend = {
      values: this.values,
      type: this.data.id.toUpperCase(),
    };
    this.sendData(objectToSend);
  }
}
