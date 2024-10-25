import { Component } from '@angular/core';
import * as _ from 'lodash';
import { SettingDetailAbstract } from 'app/dashboard/module-sections/modulesettings/detail/settings-detail-abstract';

@Component({
  selector: 'email',
  templateUrl: '../settings-detail-generic.html',
  styleUrls: ['./email.component.scss'],
})
export class EmailComponent extends SettingDetailAbstract {}
