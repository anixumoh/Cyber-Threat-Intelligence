import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SettingDetailAbstract } from './settings-detail-abstract';
import { PaginationModule } from 'app/dashboard/module-sections/shared/filters/pagination/pagination.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [FormsModule, CommonModule, RouterModule, PaginationModule, NgbModule],
  declarations: [SettingDetailAbstract],
  exports: [SettingDetailAbstract]
})
export class SettingDetailAbstractModule {}
