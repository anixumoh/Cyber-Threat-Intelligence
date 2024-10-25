import { Component } from '@angular/core';
import * as _ from 'lodash';
import { SettingDetailAbstract } from 'app/dashboard/module-sections/modulesettings/detail/settings-detail-abstract';

@Component({
  selector: 'keywords',
  templateUrl: '../settings-detail-generic.html',
  styleUrls: ['./keywords.component.scss'],
})
export class KeywordsComponent extends SettingDetailAbstract {}
