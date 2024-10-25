import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabelsCreateComponent } from './labels-create.compontent'
import { TableMultiselectModule } from 'app/dashboard/module-sections/shared/labels/table-multiselect/table-multiselect.module';
import { ModalModule } from "app/dashboard/module-sections/shared/modal/modal.module";
import { FormsModule } from "@angular/forms";

@NgModule({
  declarations: [ LabelsCreateComponent ],
  imports: [
    CommonModule,
    TableMultiselectModule,
    ModalModule,
    FormsModule
  ],
  exports: [ LabelsCreateComponent ],
  providers: [ ],
})
export class LabelsCreateModule { }
