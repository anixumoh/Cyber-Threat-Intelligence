import { Component } from '@angular/core';
import * as _ from 'lodash';
import { SettingDetailAbstract } from 'app/dashboard/module-sections/modulesettings/detail/settings-detail-abstract';

@Component({
  selector: 'terms',
  templateUrl: '../settings-detail-generic.html',
  styleUrls: ['./terms.component.scss'],
})
export class TermsComponent extends SettingDetailAbstract {}
