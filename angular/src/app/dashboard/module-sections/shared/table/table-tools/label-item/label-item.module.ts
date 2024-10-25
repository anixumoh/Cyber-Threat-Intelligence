import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabelItemComponent } from 'app/dashboard/module-sections/shared/table/table-tools/label-item/label-item.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [LabelItemComponent],
  bootstrap: [LabelItemComponent],
  exports: [LabelItemComponent],
})
export class LabelItemModule { }
