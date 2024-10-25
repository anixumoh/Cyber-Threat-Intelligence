import { Component } from '@angular/core';

import { SettingDetailAbstract } from 'app/dashboard/module-sections/modulesettings/detail/settings-detail-abstract';

@Component({
  selector: 'typosquatting',
  templateUrl: '../settings-detail-generic.html',
  styleUrls: ['./typosquatting.component.scss'],
})
export class TyposquattingComponent extends SettingDetailAbstract {}
