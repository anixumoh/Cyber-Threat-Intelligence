import { Component, Input, OnInit } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';

@Component({
  selector: 'app-boolean-column',
  template: `
    <div class="td-link" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
      <ng-template #popTemplate>
        <div [innerHTML]="value"></div>
      </ng-template>
      <span [ngbTooltip]="popTemplate" placement="top" [innerHTML]="shortValue"></span>
    </div>
  `
})
export class RenderLargeTextComponent implements ViewCell, OnInit {
  @Input() value: string | number;
  @Input() rowData: any;

  shortValue: string;

  ngOnInit() {
    if (!this.value) {
      return;
    }
    this.shortValue = this.value.toString();
    if (this.shortValue.includes('<br')) {
      this.shortValue = this.shortValue.split('<br')[0];
    }
  }
}
