import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { DetailsTableComponent } from './details-table.component';
import { ResourceIssuesModule } from 'app/dashboard/module-sections/shared/table/table-tools/resource-issues/resource-issues.module';
import { DetailsModalModule } from '../details-modal/details-modal.module';
import { SharedModule } from '../../../../../shared/shared.module';
import { ModalModule } from 'app/dashboard/module-sections/shared/modal/modal.module';
import { IsDataIsLoadingThreatsModule } from 'app/dashboard/module-sections/shared/is-data-is-loading-threats/is-data-is-loading-threats.module';

@NgModule({
  imports: [
    FormsModule,
    NgbModule,
    CommonModule,
    ResourceIssuesModule,
    DetailsModalModule,
    SharedModule,
    ModalModule,
    IsDataIsLoadingThreatsModule
  ],
  declarations: [DetailsTableComponent],
  providers: [],
  bootstrap: [DetailsTableComponent],
  exports: [DetailsTableComponent]
})
export class DetailsTableModule {}
