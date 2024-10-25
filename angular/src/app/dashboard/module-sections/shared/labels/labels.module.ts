import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabelsComponent } from './labels.compontent'
import { LabelsListModule } from 'app/dashboard/module-sections/shared/labels/labels-list/labels-list.module';
import { LabelsService } from 'app/dashboard/module-sections/shared/labels/labels.service';
import { LocalFilterModule } from 'app/dashboard/module-sections/shared/labels/local-filter/local-filter.module'
import { ServerFilterModule } from 'app/dashboard/module-sections/shared/labels/server-filter/server-filter.module';
import { ModalModule } from "app/dashboard/module-sections/shared/modal/modal.module";
import { LabelsCreateModule } from "app/dashboard/module-sections/shared/labels/labels-create/labels-create.module";
import { LabelsUpdateModule } from "app/dashboard/module-sections/shared/labels/labels-update/labels-update.module";

@NgModule({
  declarations: [ LabelsComponent ],
  imports: [
    CommonModule,
    LabelsListModule,
    LocalFilterModule,
    ServerFilterModule,
    LabelsCreateModule,
    LabelsUpdateModule,
    ModalModule
  ],
  exports: [ LabelsComponent ],
  providers: [ LabelsService ]
})
export class LabelstModuleTemp { }
