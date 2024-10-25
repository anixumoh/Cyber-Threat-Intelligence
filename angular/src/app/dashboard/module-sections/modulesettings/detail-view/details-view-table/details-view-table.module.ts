import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DetailsViewTableComponent } from 'app/dashboard/module-sections/modulesettings/detail-view/details-view-table/details-view-table.component';
import { EnableDisableModule } from 'app/dashboard/module-sections/shared/table/table-tools/enable-disable/enable-disable.module';
import { ModalModule } from 'app/dashboard/module-sections/shared/modal/modal.module';

@NgModule({
  declarations: [DetailsViewTableComponent],
  imports: [CommonModule, RouterModule, EnableDisableModule, ModalModule],
  exports: [DetailsViewTableComponent],
})
export class DetailsViewTableModule {}
