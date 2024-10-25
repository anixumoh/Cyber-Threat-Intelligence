import { Component } from '@angular/core';
import * as _ from 'lodash';
import { SettingDetailAbstract } from 'app/dashboard/module-sections/modulesettings/detail/settings-detail-abstract';

@Component({
  selector: 'typosquatting-keyword',
  templateUrl: '../settings-detail-generic.html',
  styleUrls: ['./typosquatting-keyword.component.scss'],
})
export class TyposquattingKeywordComponent extends SettingDetailAbstract {}
