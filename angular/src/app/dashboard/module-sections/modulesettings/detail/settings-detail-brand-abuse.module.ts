import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from "@angular/router";
import { SettingDetailBrandAbuseAbstract } from './settings-detail-brand-abuse-abstract';
import { PaginationModule } from "app/dashboard/module-sections/shared/filters/pagination/pagination.module";

@NgModule({
  imports: [
      FormsModule,
      CommonModule,
      RouterModule,
      PaginationModule
  ],
  declarations: [SettingDetailBrandAbuseAbstract],
  exports: [SettingDetailBrandAbuseAbstract]
})

export class SettingDetailBrandAbuseAbstractModule {}
