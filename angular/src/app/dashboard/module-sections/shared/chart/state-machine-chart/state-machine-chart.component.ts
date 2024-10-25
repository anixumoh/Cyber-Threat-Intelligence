import { Component, Input } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-state-machine-chart',
  templateUrl: './state-machine-chart.component.html',
  styleUrls: ['./state-machine-chart.component.scss'],
})
export class StateMachineChartComponent {
  subscriptionsList: Subscription[] = [];
  errorHeightMarginTop = 0;

  @Input() isDataPresent = false;
  @Input() isError = false;
  @Input() isLoading = false;
  @Input() isRobotSnippet = false;
  @Input() isCentral = false;

  @Input() chartData;
  @Input() errorMessage = 'No Graphic Data Was Found';
  @Input() errorClass = '';
  @Input() fontSize = 15;
  @Input() robotHeight = 15;
  @Input()
  set divHeight(its) {
    if (its) {
      if (this.isRobotSnippet && !this.isCentral) {
        this.errorHeightMarginTop = its / 2.5 - this.robotHeight;
      } else if (this.isRobotSnippet && this.isCentral) {
        this.errorHeightMarginTop = its / 2 - this.robotHeight;
      } else {
        this.errorHeightMarginTop = its / 2.5 - this.fontSize;
      }
    }
  }
}
