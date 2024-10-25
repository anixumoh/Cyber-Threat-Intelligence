import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModuleDetailsHeaderComponent } from 'app/dashboard/module-sections/modulesettings/detail-view/details-view-header/module-details-header.component';
import { EnableDisableModule } from 'app/dashboard/module-sections/shared/table/table-tools/enable-disable/enable-disable.module';

@NgModule({
  declarations: [ModuleDetailsHeaderComponent],
  imports: [CommonModule, EnableDisableModule],
  exports: [ModuleDetailsHeaderComponent],
})
export class ModuleDetailsHeaderModule {}
