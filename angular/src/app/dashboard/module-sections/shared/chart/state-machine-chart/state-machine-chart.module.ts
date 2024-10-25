import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {StateMachineChartComponent} from "./state-machine-chart.component";
import {GenericChartModule} from "../generic-chart/generic-chart.module";

@NgModule({
  imports: [
    CommonModule,
    GenericChartModule
  ],
  exports: [StateMachineChartComponent],
  declarations: [StateMachineChartComponent]
})
export class StateMachineChartModule { }
