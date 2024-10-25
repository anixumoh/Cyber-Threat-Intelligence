import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableMultiselectComponent } from './table-multiselect.compontent';
import { LabelsUpdateModule } from 'app/dashboard/module-sections/shared/labels/labels-update/labels-update.module';
import { LabelItemModule } from 'app/dashboard/module-sections/shared/table/table-tools/label-item/label-item.module';
import { SharedAdminModule } from 'app/admin/shared/shared.module';

@NgModule({
  declarations: [TableMultiselectComponent],
  imports: [CommonModule, LabelsUpdateModule, LabelItemModule, SharedAdminModule],
  exports: [TableMultiselectComponent],
  providers: [],
})
export class TableMultiselectModule {}
