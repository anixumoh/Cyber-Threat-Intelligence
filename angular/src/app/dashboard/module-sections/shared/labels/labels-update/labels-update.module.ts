import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabelsUpdateComponent } from './labels-update.compontent'
import { ModalModule } from "app/dashboard/module-sections/shared/modal/modal.module";
import { FormsModule } from "@angular/forms";

@NgModule({
  declarations: [ LabelsUpdateComponent ],
  imports: [
    CommonModule,
    ModalModule,
    FormsModule
  ],
  exports: [ LabelsUpdateComponent ],
  providers: [ ],
})
export class LabelsUpdateModule { }
