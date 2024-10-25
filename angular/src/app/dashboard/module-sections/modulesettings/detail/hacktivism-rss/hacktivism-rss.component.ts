import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as _ from 'lodash';
import { SettingDetailAbstract } from 'app/dashboard/module-sections/modulesettings/detail/settings-detail-abstract';

@Component({
  selector: 'app-hacktivism-rss',
  templateUrl: '../settings-detail-generic.html',
  styleUrls: ['./hacktivism-rss.component.scss'],
})
export class HacktivismRssComponent extends SettingDetailAbstract implements OnDestroy {

  ngOnDestroy() {
    super.ngOnDestroy()
  }

  public addData(): void {
    this.remaining = [];
    this.data.values_to_add = this.data.values_to_add ? this.data.values_to_add : [];
    if (this.newdata) {
      this.newdata.split('\n').forEach((item_inserted) => {
        item_inserted = item_inserted.trim();
        let item_inserted_temp = item_inserted;
        this.checkElement(item_inserted, item_inserted_temp);
      });
      this.newdata = this.remaining.join('\n');
      if (this.data.values_to_add.length) {
        this.sendData();
      }
    }
  }

  checkElement(item_inserted, item_inserted_temp) {
    if (this.data.validator(item_inserted)) {
      let isElement: boolean = false;
      this.values.forEach((element) => {
        if (element.title === item_inserted_temp) {
          isElement = true;
        }
      });
      if (!isElement) {
        this.values.unshift(this.data.adder(item_inserted_temp));
        this.data.values_to_add.push(this.data.adder(item_inserted_temp));
      } else {
        this.remaining.push(item_inserted);
      }
    } else {
      this.remaining.push(item_inserted);
    }
  }

  deleteData() {
    this.data.values_to_delete = [];
    this.selectedItems.forEach((el) => {
      this.data.values_to_delete.push({ title: el.title, url: el.url });
    });
    this.selectedItems = [];
    this.checks.fill(false);

    this.settings
      .deleteSettingData(this.settingId, this.data)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {});
  }
}
