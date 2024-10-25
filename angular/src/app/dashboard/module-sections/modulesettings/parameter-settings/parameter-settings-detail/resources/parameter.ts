import { Injectable } from '@angular/core';
import { ModuleSettingsDetailService } from '../../../detail/module-settings-detail.service';

@Injectable()
export class Parameter {
  parameterData = [];
  selectedItems = [];
  remaining = [];
  parameter: any = {};
  data: any = {};
  newData;
  selectedAll;
  anyChecked = false;
  inputAll;

  get parameterName() {
    return this.parameter.name;
  }

  get parameterTexts() {
    return this.parameter.texts;
  }
  constructor(protected moduleSettingsDetailService: ModuleSettingsDetailService) {}

  public setParameter(its = {}) {
    this.parameter = { ...its, valid: true };
  }

  public setParameterData(its, cb = null) {
    this.moduleSettingsDetailService.getParameterData(its.id).subscribe(({ values }: any) => {
      this.parameterData = [...values];
      if (cb) {
        cb();
      }
    });
  }

  sendData() {
    this.moduleSettingsDetailService.saveSettingsDataParameter(this.parameter.id, this.data).subscribe(
      () => {
        if (this.parameter.id === 'domain') {
          this.setParameterData({id: 'domain'})
        } else {
          this.parameterData = [...this.parameterData];
        }
        
      },
      (e) => {
        const errorType = e?.error?.message ? e.error.message : '';

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
              `To set up this module, review your License and contact your Account Manager `,
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
    );

    this.data.values_to_add = [];
  }

  public delete() {
    this.selectedItems = this.parameterData.filter((item) => item.selected);
    this.deleteData();
  }

  public deleteData(index?) {
    this.data.values_to_delete = [];
    this.selectedItems.forEach((el) => {
      this.data.values_to_delete.push({ value: el.value });
    });

    this.moduleSettingsDetailService.deleteSettingDataParameter(this.parameter.id, this.data).subscribe(
      () => {
        if (index > -1) {
          this.parameterData = [
            ...this.parameterData.slice(0, index),
            ...this.parameterData.slice(index + 1, this.parameterData.length)
          ];
        } else {
          this.parameterData = this.parameterData.filter((item) => !item.selected);
          this.searchInList('');
          this.checkIfAnySelected();
        }
        this.selectedItems = [];
      },
      (e) => {
        const errorMessage = e?.error?.field ? e.error.field : '';
        this.moduleSettingsDetailService.showError(errorMessage, '', 'error');
      }
    );
  }

  public deleteOne(index) {
    this.selectedItems.push(this.parameterData[index]);
    this.deleteData(index);
  }

  public checkIfAnySelected() {
    this.anyChecked = this.parameterData.some(({ selected }: any) => selected === true);
  }

  public updateSelectAll(value) {
    this.selectedAll = value;
    this.anyChecked = value;
  }

  public updateElement({ value, item }) {
    this.parameterData[item.index].selected = value;
  }

  public searchInList(event): void {
    const word = event.target ? event.target.value.toLowerCase() : event;
    if (word.length) {
      this.parameterData = this.parameterData.map((element) => {
        if (element?.title) {
          return { ...element, hide: element.title.toLowerCase().includes(word) ? false : true, selected: false };
        } else if (element?.value) {
          return { ...element, hide: element.value.toLowerCase().includes(word) ? false : true, selected: false };
        }
      });
    } else {
      this.parameterData = this.parameterData.map((element) => ({ ...element, hide: false, selected: false }));
    }
  }
}
