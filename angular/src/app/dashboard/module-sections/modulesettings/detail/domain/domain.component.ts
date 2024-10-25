import { Component } from '@angular/core';
import * as _ from 'lodash';
import { SettingDetailAbstract } from 'app/dashboard/module-sections/modulesettings/detail/settings-detail-abstract';

@Component({
  selector: 'domain',
  templateUrl: '../settings-detail-generic.html',
  styleUrls: ['./domain.component.scss'],
})
export class DomainComponent extends SettingDetailAbstract {}
