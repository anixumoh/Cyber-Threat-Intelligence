import { Component } from '@angular/core';
import { SettingDetailAbstract } from 'app/dashboard/module-sections/modulesettings/detail/settings-detail-abstract';

import * as _ from 'lodash';

@Component({
  selector: 'filename_list',
  templateUrl: '../settings-detail-generic.html',
  styleUrls: ['./filename.component.scss'],
})
export class FilenameComponent extends SettingDetailAbstract {}
