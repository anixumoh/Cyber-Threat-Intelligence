import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ModuleDetailsHeaderModule } from 'app/dashboard/module-sections/modulesettings/detail-view/details-view-header/module-details-header.module';
import { DetailsViewTableModule } from 'app/dashboard/module-sections/modulesettings/detail-view/details-view-table/details-view-table.module';
import { TermsBrandAbuseViewImageComponent } from 'app/dashboard/module-sections/modulesettings/detail/terms-brand-abuse/terms-brand-abuse-view-image/terms-brand-abuse-view-image.component';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [FormsModule, CommonModule, ModuleDetailsHeaderModule, DetailsViewTableModule, NgbTooltipModule],
  declarations: [TermsBrandAbuseViewImageComponent],
  providers: [],
  exports: [TermsBrandAbuseViewImageComponent],
})
export class TermsBrandAbuseViewImageModule {}
