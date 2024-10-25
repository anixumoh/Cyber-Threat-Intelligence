import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { DetailsComponent } from './details.component';
import { ResourceIssuesModule } from 'app/dashboard/module-sections/shared/table/table-tools/resource-issues/resource-issues.module';
import { DetailsHeaderModule } from './details-header/details-header.module';
import { DetailsTableModule } from './details-table/details-table.module';
import { CommentsModule } from 'app/dashboard/module-sections/shared/table/table-tools/comments/comment.module';
import { ModalAddIncidentModule } from 'app/dashboard/module-sections/shared/table/table-tools/modal-add-incident/modal-add-incident.module';
import { DetailsService } from 'app/dashboard/module-sections/threats/details/details.service';
import { DetailExtraInfoModule } from 'app/dashboard/module-sections/threats/details/details-extra-info/details-extra-info.module';
import { MoreModule } from 'app/dashboard/module-sections/shared/table/table-tools/more/more.module';
import { ResultLabelsModule } from 'app/dashboard/module-sections/shared/table/table-tools/labels/result-labels.module';
import { ModalModule } from 'app/dashboard/module-sections/shared/modal/modal.module';
import { LabelstModuleTemp } from 'app/dashboard/module-sections/shared/labels/labels.module';
import { InformModule } from 'app/dashboard/module-sections/shared/table/table-tools/inform/inform.module';
import { ModalViewIncidentModule } from 'app/dashboard/module-sections/shared/table/table-tools/modal-view-incident/modal-view-incident.module';
import { ModalTakedownModule } from '../../shared/table/table-tools/modal-takedown/modal-takedown.module';

@NgModule({
  imports: [
    FormsModule,
    NgbModule,
    CommonModule,
    ResourceIssuesModule,
    DetailsHeaderModule,
    DetailsTableModule,
    CommentsModule,
    ResultLabelsModule,
    MoreModule,
    ModalAddIncidentModule,
    ModalViewIncidentModule,
    ModalTakedownModule,
    DetailExtraInfoModule,
    ModalModule,
    LabelstModuleTemp,
    InformModule
  ],
  declarations: [DetailsComponent],
  providers: [DetailsService],
  bootstrap: [DetailsComponent],
  exports: [DetailsComponent]
})
export class DetailsModule {}
