import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ModuleSettingsDetailService } from 'app/dashboard/module-sections/modulesettings/detail/module-settings-detail.service';
import { ModuleDetailsHeaderModule } from 'app/dashboard/module-sections/modulesettings/detail-view/details-view-header/module-details-header.module';
import { DetailsViewTableModule } from 'app/dashboard/module-sections/modulesettings/detail-view/details-view-table/details-view-table.module';
import { TermsCustomViewComponent } from 'app/dashboard/module-sections/modulesettings/detail/terms-custom/terms-custom-view/terms-custom-view.component';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [FormsModule, CommonModule, ModuleDetailsHeaderModule, DetailsViewTableModule, NgbTooltipModule],
  declarations: [TermsCustomViewComponent],
  providers: [],
  exports: [TermsCustomViewComponent],
})
export class TermsCustomViewModule {}
