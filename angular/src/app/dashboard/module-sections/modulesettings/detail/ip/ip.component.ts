import { Component } from '@angular/core';
import * as _ from 'lodash';
import { SettingDetailAbstract } from 'app/dashboard/module-sections/modulesettings/detail/settings-detail-abstract';

@Component({
  selector: 'ip',
  templateUrl: '../settings-detail-generic.html',
  styleUrls: ['./ip.component.scss'],
})
export class IpComponent extends SettingDetailAbstract {}
