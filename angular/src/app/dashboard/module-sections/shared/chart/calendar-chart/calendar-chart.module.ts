import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarChartComponent } from './calendar-chart.component';

@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [CalendarChartComponent],
  providers: [],
  exports: [CalendarChartComponent]
})
export class CalendarChartModule {}
