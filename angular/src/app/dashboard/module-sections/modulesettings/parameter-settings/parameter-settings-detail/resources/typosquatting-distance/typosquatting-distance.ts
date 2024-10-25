import { Injectable } from '@angular/core';
import { of, Subject } from 'rxjs';
import { delay, switchMap, takeUntil } from 'rxjs/operators';

import { ModuleSettingsDetailService } from '../../../../detail/module-settings-detail.service';
import { TyposquattingDistanceParameter } from './typosquatting-distance-parameter';

@Injectable()
export class TyposquattingDistance {
  activeElement: any;
  distanceUpdate;
  currentFilterObservable;
  disableInputs = false;
  itemToUpdate: string;
  isLoading = false;
  private readonly destroy$ = new Subject<void>();

  constructor(
    protected moduleSettingsDetailService: ModuleSettingsDetailService,
    public parameterObject: TyposquattingDistanceParameter
  ) {}

  distanceChanged() {
    this.currentFilterObservable = of(this.distanceUpdate).pipe(delay(450));
    let isElement = false;
    let itemToUpdate = `${this.activeElement.value.split('~')[0]}~${this.distanceUpdate}`;
    this.parameterObject.parameterData.forEach((element) => {
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
            this.parameterObject.data.values_to_delete = [];
            this.disableInputs = true;
            this.activeElement.isLoading = true;
            this.parameterObject.data.values_to_delete.push({
              value: this.activeElement.value,
              id: this.activeElement.id,
            });
            return this.moduleSettingsDetailService.deleteSettingDataParameter(
              this.parameterObject.parameter.id,
              this.parameterObject.data
            );
          }),
          switchMap(() => {
            this.parameterObject.data.values_to_delete = [];
            this.parameterObject.data.values_to_add = [];
            this.parameterObject.data.values_to_add.push(this.parameterObject.parameter.adder(this.itemToUpdate));
            return this.moduleSettingsDetailService.saveSettingsDataParameter(
              this.parameterObject.parameter.id,
              this.parameterObject.data
            );
          })
        )
        .subscribe(() => {
          this.activeElement.value = this.itemToUpdate;
          this.disableInputs = false;
          this.activeElement.isLoading = false;
          this.parameterObject.data.values_to_add = [];
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

  unsubscribe() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
