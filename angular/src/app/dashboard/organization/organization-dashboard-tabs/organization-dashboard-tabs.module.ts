import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DragulaModule } from 'ng2-dragula';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { GaugeChartModule } from '../../module-sections/shared/chart/gauge-chart/gauge-chart.module';
import { LineChartModule } from '../../module-sections/shared/chart/line-chart/line-chart.module';
import { StateMachineChartModule } from '../../module-sections/shared/chart/state-machine-chart/state-machine-chart.module';
import { ModalModule } from '../../module-sections/shared/modal/modal.module';
import { OrganizationDashboardTabsService } from './organization-dashboard-tabs.service';
import { ChartCardComponent } from './chart-card/chart-card.component';
import { AssetsMonitorGaugeComponent } from './assets-monitor-gauge/assets-monitor-gauge.component';
import { SharedAdminModule } from '../../../admin/shared/shared.module';
import { DashboardModuleChartComponent } from './dashboard-module-chart/dashboard-module-chart.component';
import { SharedModule } from '../../../shared/shared.module';
import { OrganizationDashboardTabsComponent } from './organization-dashboard-tabs.component';
import { MaterialDatepickerModule } from 'app/dashboard/module-sections/shared/filters/mat-datepicker/mat-datepicker.module';

@NgModule({
  declarations: [
    OrganizationDashboardTabsComponent,
    ChartCardComponent,
    AssetsMonitorGaugeComponent,
    DashboardModuleChartComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    GaugeChartModule,
    DragulaModule.forRoot(),
    LineChartModule,
    StateMachineChartModule,
    NgbModule,
    ModalModule,
    SharedAdminModule,
    SharedModule,
    MaterialDatepickerModule
  ],
  providers: [OrganizationDashboardTabsService],
  exports: []
})
export class OrganizationDashboardTabsModule {}
