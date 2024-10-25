import { Injectable } from '@angular/core';
import { ModuleSettingsDetailService } from '../../../../detail/module-settings-detail.service';
import { Parameter } from '../parameter';

@Injectable()
export class GenericParameter extends Parameter {
  get parameterValid() {
    return this.parameter.valid;
  }

  constructor(protected moduleSettingsDetailService: ModuleSettingsDetailService) {
    super(moduleSettingsDetailService);
  }

  addData() {
    this.remaining = [];
    const rejectReason = [];
    this.data.values_to_add = this.data.values_to_add ? this.data.values_to_add : [];
    if (this.newData) {
      this.newData.split('\n').forEach((item_inserted) => {
        item_inserted = item_inserted.trim();
        let item_inserted_temp = item_inserted;
        this.checkElement(item_inserted, item_inserted_temp, rejectReason);
      });
      this.newData = this.remaining.join('\n');
      if (this.data.values_to_add.length) {
        this.sendData();
      }
      if (this.remaining.length && rejectReason.length) {
        const invalidInsertions = rejectReason.reduce((resultAcc, current) => {
          const valueMatchType = resultAcc.find((el) => el.group === current.group);
          if (valueMatchType) {
            valueMatchType.value = valueMatchType.value.concat(`, `, current.value);
            return resultAcc;
          } else {
            return [...resultAcc, current];
          }
        }, []);
        invalidInsertions.forEach((reject) => {
          this.moduleSettingsDetailService.showError(reject.msg, reject.value, reject.type);
        });
      }
    }
  }

  protected checkElement(item_inserted, item_inserted_temp, rejectReason?) {
    const rejected = {
      msg: null,
      type: null,
      group: null,
    };

    if (
      (this.parameter.id === 'typosquatting' ||
        this.parameter.id === 'typo_keyword_regex' ||
        this.parameter.id === 'typo_keyword_distance') &&
      item_inserted.length < 4
    ) {
      this.remaining.push(item_inserted);
      rejected.msg = 'The following terms were not added. Please, make sure they are minimum 4 characters long.';
      rejected.type = 'info';
      rejected.group = 'length';
    } else {
      if (item_inserted.length < 3) {
        this.remaining.push(item_inserted);
        rejected.msg = 'The following terms were not added. Please, make sure they are minimum 3 characters long.';
        rejected.type = 'info';
        rejected.group = 'length';
      } else {
        this.parameter.valid = this.parameter.validator(item_inserted);
        if (this.parameter.valid) {
          let elementExist = false;
          this.parameterData.forEach((element) => {
            if (element && element.value) {
              if (element.value === item_inserted_temp) {
                elementExist = true;
              }
            } else if (element && element.title) {
              if (element.title === item_inserted_temp) {
                elementExist = true;
              }
            }
          });
          if (!elementExist) {
            if (this.parameter.id === 'typo_keyword_distance') {
              item_inserted_temp = item_inserted_temp + `~${Math.floor(item_inserted_temp.length / 2)}`;
            }
            this.parameterData.unshift(this.parameter.adder(item_inserted_temp));
            this.data.values_to_add.push(this.parameter.adder(item_inserted_temp));
          } else {
            this.remaining.push(item_inserted);
            rejected.msg = 'Duplicated. Term not added.';
            rejected.type = 'info';
            rejected.group = 'duplicated';
          }
        } else {
          this.remaining.push(item_inserted);
          rejected.msg = this.parameter.texts.description;
          rejected.type = 'error';
          rejected.group = 'invalid';
        }
      }
    }

    if (rejected.msg && item_inserted_temp && rejectReason) {
      rejectReason.push({ ...rejected, value: item_inserted_temp });
    }
  }

  public resetSelectAll() {
    if (this.inputAll) {
      this.inputAll.nativeElement.checked = false;
    }
  }
}
