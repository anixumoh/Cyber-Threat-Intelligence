import { of as observableOf } from 'rxjs';
import { switchMap, delay, takeUntil } from 'rxjs/operators';
import { Component, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import { SettingDetailAbstract } from 'app/dashboard/module-sections/modulesettings/detail/settings-detail-abstract';

@Component({
  selector: 'typosquatting-distance',
  templateUrl: '../settings-detail-generic.html',
  styleUrls: ['./typosquatting-distance.component.scss'],
})
export class TyposquattingDistanceComponent extends SettingDetailAbstract implements OnDestroy {
  activeElement: any;
  isLoading = false;

  ngOnDestroy() {
    super.ngOnDestroy();
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

  distanceChanged() {
    this.currentFilterObservable = observableOf(this.distanceUpdate).pipe(delay(450));
    let isElement = false;
    let itemToUpdate = `${this.activeElement.value.split('~')[0]}~${this.distanceUpdate}`;
    this.values.forEach((element) => {
      if (element.value === itemToUpdate) {
        isElement = true;
      }
    });

    if (this.maxDistance(this.activeElement.value.split('~')[0].length / 2) >= this.distanceUpdate && !isElement) {
      this.currentFilterObservable
        .pipe(
          takeUntil(this.destroy$),
          switchMap(() => {
            this.itemToUpdate = `${this.activeElement.value.split('~')[0]}~${this.distanceUpdate}`;
            this.data.values_to_delete = [];
            this.disableInputs = true;
            this.activeElement.isLoading = true;
            this.data.values_to_delete.push({ value: this.activeElement.value, id: this.activeElement.id });
            return this.settings.phishingDistanceDelete(this.settingId, this.data);
          }),
          switchMap((res) => {
            this.data.values_to_delete = [];
            this.data.values_to_add = [];
            this.data.values_to_add.push(this.data.adder(this.itemToUpdate));
            return this.settings.phishingDistanceCreate(this.settingId, this.data);
          })
        )
        .subscribe((res) => {
          this.activeElement.value = this.itemToUpdate;
          this.disableInputs = false;
          this.activeElement.isLoading = false;
          this.data.values_to_add = [];
        });
    }
  }

  maxDistance(distance) {
    if (distance) {
      return Math.floor(distance);
    }
  }

  setDistanceUpdate(element, event) {
    this.distanceUpdate = event.target.value;
    this.activeElement = element;
    this.distanceChanged();
  }
}
