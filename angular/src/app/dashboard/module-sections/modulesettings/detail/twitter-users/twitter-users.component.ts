import { Component } from '@angular/core';
import * as _ from 'lodash';
import { SettingDetailAbstract } from 'app/dashboard/module-sections/modulesettings/detail/settings-detail-abstract';

@Component({
  selector: 'twitter-users',
  templateUrl: '../settings-detail-generic.html',
  styleUrls: ['./twitter-users.component.scss'],
})
export class TwitterUsersComponent extends SettingDetailAbstract {}
