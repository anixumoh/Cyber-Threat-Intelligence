import { AfterViewInit, Component, EventEmitter, Output } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MY_FORMATS } from 'app/shared/utils/common.utils';

@Component({
  selector: 'app-date-range',
  templateUrl: './date-range.component.html',
  providers: [{ provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }]
})
export class DateRangeComponent implements AfterViewInit {
  dateRange = new UntypedFormGroup({
    start: new UntypedFormControl(),
    end: new UntypedFormControl()
  });

  @Output() rangeEmit = new EventEmitter();

  constructor() {}

  ngAfterViewInit() {
    const style = document.getElementsByClassName('mat-date-range-input-start-wrapper');
    if (style[0]) {
      (style[0] as any).style.flex = '0 0 43%';
    }
  }

  onRangeEmit(event) {
    this.rangeEmit.emit(this.dateRange.value);
  }
}
