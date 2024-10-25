import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabelsListComponent } from './labels-list.compontent'
import { TableMultiselectModule } from 'app/dashboard/module-sections/shared/labels/table-multiselect/table-multiselect.module';

@NgModule({
  declarations: [ LabelsListComponent ],
  imports: [
    CommonModule,
    TableMultiselectModule
  ],
  exports: [ LabelsListComponent ],
  providers: [ ],
})
export class LabelsListModule { }
