import { GenericParameter } from '../generic-parameter/generic-parameter';
import { ModuleSettingsDetailService } from '../../../../detail/module-settings-detail.service';
import { Injectable } from '@angular/core';
import { differenceBy } from 'lodash';

@Injectable()
export class HacktivismRss extends GenericParameter {
  constructor(protected moduleSettingsDetailService: ModuleSettingsDetailService) {
    super(moduleSettingsDetailService);
  }

  public deleteData() {
    this.data.values_to_delete = [];
    this.selectedItems.forEach((el) => {
      this.data.values_to_delete.push({ title: el.title, url: el.url });
    });
    this.moduleSettingsDetailService.deleteSettingDataParameter(this.parameter.id, this.data).subscribe(() => {
      this.parameterData = differenceBy(this.parameterData, this.selectedItems, 'title');
      this.selectedItems = [];
    });
  }
}
