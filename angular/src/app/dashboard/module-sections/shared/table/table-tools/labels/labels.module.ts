import { NgModule } from '@angular/core';
import { LabelsComponent } from './labels.component';
import { FormsModule } from '@angular/forms';
import { ColorPickerModule } from 'ngx-color-picker';
import { LabelService } from 'app/dashboard/module-sections/shared/table/table-tools/labels/labels.service';
import { LabelItemModule } from 'app/dashboard/module-sections/shared/table/table-tools/label-item/label-item.module';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [FormsModule, CommonModule, ColorPickerModule, LabelItemModule],
  declarations: [LabelsComponent],
  providers: [LabelService],
  exports: [LabelsComponent],
})
export class LabelsModule {}
