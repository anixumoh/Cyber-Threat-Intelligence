import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { SharedModule } from 'app/shared/shared.module';
import { ModalModule } from '../../../shared/modal/modal.module';
import { PaginationModule } from 'app/dashboard/module-sections/shared/filters/pagination/pagination.module';
import { FiltersSettingsComponent } from 'app/dashboard/module-sections/modulesettings/detail/filters-settings/filters-settings.component';
import { EnableDisableModule } from 'app/dashboard/module-sections/shared/table/table-tools/enable-disable/enable-disable.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [
    FormsModule,
    RouterModule,
    CommonModule,
    PaginationModule,
    EnableDisableModule,
    SharedModule,
    ModalModule,
    DragDropModule,
    NgbModule
  ],
  declarations: [FiltersSettingsComponent],
  providers: [],
  exports: [FiltersSettingsComponent]
})
export class FiltersSettingsModule {}
