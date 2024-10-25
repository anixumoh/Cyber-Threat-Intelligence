import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TooltipModule } from 'ngx-tooltip';

import { PaginationModule } from 'app/dashboard/module-sections/shared/filters/pagination/pagination.module';
import { MultiSelectModule } from 'app/dashboard/module-sections/shared/filters/multi-select/multi-select.module';
import { LabelstModuleTemp } from 'app/dashboard/module-sections/shared/labels/labels.module';
import { ModalModule } from '../modal/modal.module';
import { AsideModule } from '../../../../aside/aside.module';
import { MaterialDatepickerModule } from './mat-datepicker/mat-datepicker.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MultiSelectModule,
    PaginationModule,
    ModalModule,
    LabelstModuleTemp,
    AsideModule,
    NgbTooltipModule,
    TooltipModule,
    MaterialDatepickerModule
  ],
  exports: [PaginationModule]
})
export class FiltersModule {}
