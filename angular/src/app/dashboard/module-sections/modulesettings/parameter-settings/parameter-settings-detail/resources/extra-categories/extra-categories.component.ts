import { Component } from '@angular/core';
import { GenericParameter } from '../generic-parameter/generic-parameter';
import { GenericParameterComponent } from '../generic-parameter/generic-parameter.component';
import { ExtraCategoriesService } from './extra-categories.service';
import { Grants } from '../../../../../../../services/grants/grants';

@Component({
  selector: 'app-extra-categories',
  templateUrl: './extra-categories.component.html',
  styleUrls: ['../generic-parameter/generic-parameter.component.scss'],
  providers: [{ provide: GenericParameter, useClass: ExtraCategoriesService }],
})
export class ExtraCategoriesComponent extends GenericParameterComponent {
  values = {
    ECONOMIC_PRESS: 'Economic press',
    SECURITY_COMPANIES: 'Security companies',
    SELF_REGULATORY_ORGANIZATION: 'Self regulatory organization',
    OFFICIAL_ORGANIZATION: 'Official organization',
    THINK_TANK: 'Think tank',
    BANKING_THINK_TANK: 'Banking think tank',
  };

  constructor(public parameterObject: GenericParameter, public grants: Grants) {
    super(parameterObject, grants);
  }

  renderValue(item) {
    return item && item.name && this.values[item.name] ? this.values[item.name] : '-';
  }

  update(list) {
    if (list) {
      this.parameterObject.data.values_to_add = list;
      this.parameterObject.sendData();
    }
  }
}
