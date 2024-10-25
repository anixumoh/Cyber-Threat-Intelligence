import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { ModalViewIncidentComponent } from './modal-view-incident.component';
import { ResourceIssuesModule } from 'app/dashboard/module-sections/shared/table/table-tools/resource-issues/resource-issues.module';
import { ModalModule } from 'app/dashboard/module-sections/shared/modal/modal.module';
import { SharedModule } from '../../../../../../shared/shared.module';

@NgModule({
  imports: [FormsModule, NgbModule, CommonModule, ResourceIssuesModule, ModalModule, SharedModule],
  declarations: [ModalViewIncidentComponent],
  providers: [],
  bootstrap: [ModalViewIncidentComponent],
  exports: [ModalViewIncidentComponent],
})
export class ModalViewIncidentModule {}
