import { ModalModule } from './modal/modal.module';
import { ModalAddIncidentModule } from './table/table-tools/modal-add-incident/modal-add-incident.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TableModule } from './table/table.module';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MoreModule } from './table/table-tools/more/more.module';
import { LabelsModule } from './table/table-tools/labels/labels.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalViewIncidentModule } from './table/table-tools/modal-view-incident/modal-view-incident.module';
import { TooltipModule } from 'ngx-tooltip';
import { FiltersModule } from 'app/dashboard/module-sections/shared/filters/filters.module';
import { ResultLabelsModule } from 'app/dashboard/module-sections/shared/table/table-tools/labels/result-labels.module';
import { UploaderModule } from 'app/dashboard/module-sections/shared/uploader/uploader.module';
import { UploaderSettingsModule } from 'app/dashboard/module-sections/shared/uploader-settings/uploader-settings.module';
import { ModalTakedownModule } from './table/table-tools/modal-takedown/modal-takedown.module';
import { IsDataIsLoadingThreatsModule } from './is-data-is-loading-threats/is-data-is-loading-threats.module';
import { InfoButtonModule } from './info-button/info-button.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    LabelsModule,
    ResultLabelsModule,
    TooltipModule,
    ModalViewIncidentModule,
    ModalModule,
    ModalAddIncidentModule,
    ModalTakedownModule,
    TableModule,
    MoreModule,
    FiltersModule,
    UploaderModule,
    UploaderSettingsModule,
    IsDataIsLoadingThreatsModule,
    InfoButtonModule
  ],
  exports: [
    FiltersModule,
    UploaderModule,
    UploaderSettingsModule,
    IsDataIsLoadingThreatsModule,
    LabelsModule,
    ResultLabelsModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SharedModule {}
