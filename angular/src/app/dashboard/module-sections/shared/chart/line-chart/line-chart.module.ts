import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LineChartComponent } from './line-chart.component';

@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [LineChartComponent],
  providers: [],
  exports: [LineChartComponent]
})
export class LineChartModule {}
