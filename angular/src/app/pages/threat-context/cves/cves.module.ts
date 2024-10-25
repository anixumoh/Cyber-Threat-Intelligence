import { Injector, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { createCustomElement } from '@angular/elements';

import { CvesListComponent } from './list/cves-list.component';
import { CvesDetailsComponent } from './details/cves-details.component';
import { SharedModule } from '../../../shared/shared.module';
import { ModalModule } from '../../../dashboard/module-sections/shared/modal/modal.module';
import { ScoreColorModule } from '../../../dashboard/intelligence/details-intelligence/share/score-color/score-color.module';
import { CVEDescriptionComponent } from './details/description/cve-description.component';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { GaugeChartModule } from '../../../dashboard/module-sections/shared/chart/gauge-chart/gauge-chart.module';
import { InfoButtonModule } from 'app/dashboard/module-sections/shared/info-button/info-button.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { LabelItemModule } from 'app/dashboard/module-sections/shared/table/table-tools/label-item/label-item.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ModalModule,
    FormsModule,
    ScoreColorModule,
    Ng2SmartTableModule,
    GaugeChartModule,
    InfoButtonModule,
    LabelItemModule,
    NgbModule
  ],
  declarations: [CvesListComponent, CvesDetailsComponent, CVEDescriptionComponent],
  exports: [CvesDetailsComponent]
})
export class CvesModule {
  constructor(private injector: Injector) {
    const el = createCustomElement(CvesDetailsComponent, { injector });
    customElements.define('angular-app-cves-details', el);
  }
}
