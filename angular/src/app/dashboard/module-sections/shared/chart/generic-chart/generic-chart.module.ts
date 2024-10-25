import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenericChartComponent } from 'app/dashboard/module-sections/shared/chart/generic-chart/generic-chart.component';

@NgModule({
  imports: [CommonModule],
  declarations: [GenericChartComponent],
  providers: [],
  exports: [GenericChartComponent]
})
export class GenericChartModule {}
