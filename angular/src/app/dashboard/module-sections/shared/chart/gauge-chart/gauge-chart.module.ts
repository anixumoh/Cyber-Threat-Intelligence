import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GaugeChartComponent } from './gauge-chart.component';

@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [GaugeChartComponent],
  providers: [],
  exports: [GaugeChartComponent]
})
export class GaugeChartModule {}
