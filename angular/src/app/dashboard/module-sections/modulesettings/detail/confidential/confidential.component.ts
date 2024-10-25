import { Component } from '@angular/core';
import * as _ from 'lodash';
import { SettingDetailAbstract } from 'app/dashboard/module-sections/modulesettings/detail/settings-detail-abstract';

@Component({
  selector: 'confidential',
  templateUrl: '../settings-detail-generic.html',
  styleUrls: ['./confidential.component.scss'],
})
export class ConfidentialComponent extends SettingDetailAbstract {}