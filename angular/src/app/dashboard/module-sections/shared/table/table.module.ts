import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { ResourceIssuesModule } from 'app/dashboard/module-sections/shared/table/table-tools/resource-issues/resource-issues.module';
import { ModalModule } from 'app/dashboard/module-sections/shared/modal/modal.module';
import { LabelsModule } from 'app/dashboard/module-sections/shared/table/table-tools/labels/labels.module';
import { MoreModule } from 'app/dashboard/module-sections/shared/table/table-tools/more/more.module';
import { ModalAddIncidentModule } from 'app/dashboard/module-sections/shared/table/table-tools/modal-add-incident/modal-add-incident.module';
import { ModalViewIncidentModule } from 'app/dashboard/module-sections/shared/table/table-tools/modal-view-incident/modal-view-incident.module';
import { LabelstModuleTemp } from 'app/dashboard/module-sections/shared/labels/labels.module';
import { ListOrderModule } from 'app/dashboard/module-sections/shared/list-order/list-order.module';
import { InformModule } from 'app/dashboard/module-sections/shared/table/table-tools/inform/inform.module';
import { ModalTakedownModule } from './table-tools/modal-takedown/modal-takedown.module';
import { ResultLabelsModule } from './table-tools/labels/result-labels.module';
import { FiltersModule } from '../filters/filters.module';

@NgModule({
  imports: [
    FormsModule,
    NgbModule,
    CommonModule,
    ResourceIssuesModule,
    ModalModule,
    LabelsModule,
    ResultLabelsModule,
    LabelstModuleTemp,
    MoreModule,
    ModalAddIncidentModule,
    ModalViewIncidentModule,
    ModalTakedownModule,
    ListOrderModule,
    FiltersModule,
    InformModule
  ],
  declarations: [],
  exports: []
})
export class TableModule {}
