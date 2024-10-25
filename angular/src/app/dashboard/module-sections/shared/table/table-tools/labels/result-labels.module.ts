import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ColorPickerModule } from 'ngx-color-picker';
import { ResultLabelsComponent } from './result-labels.component';
import { LabelService } from 'app/dashboard/module-sections/shared/table/table-tools/labels/labels.service';
import { LabelItemModule } from 'app/dashboard/module-sections/shared/table/table-tools/label-item/label-item.module';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [FormsModule, CommonModule, ColorPickerModule, LabelItemModule],
  declarations: [ResultLabelsComponent],
  providers: [LabelService],
  exports: [ResultLabelsComponent],
})
export class ResultLabelsModule {}
