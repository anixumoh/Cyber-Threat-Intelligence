import { GenericParameter } from '../generic-parameter/generic-parameter';
import { ModuleSettingsDetailService } from '../../../../detail/module-settings-detail.service';
import { Injectable } from '@angular/core';

@Injectable()
export class TyposquattingDistanceParameter extends GenericParameter {
  constructor(protected moduleSettingsDetailService: ModuleSettingsDetailService) {
    super(moduleSettingsDetailService);
  }

  public sendData() {
    this.moduleSettingsDetailService.saveSettingsDataParameter(this.parameter.id, this.data).subscribe(
      () => {
        this.setParameterData(this.parameter);
      },
      (e) => {
        switch (e.status) {
          case 412:
            this.moduleSettingsDetailService.showError(e.error.field, '', 'error');
            break;

          default:
            const message = 'Invalid and not added';
            this.moduleSettingsDetailService.showError(message, '', 'error');
            break;
        }
        this.setParameterData(this.parameter);
      }
    );
    this.data.values_to_add = [];
  }
}
