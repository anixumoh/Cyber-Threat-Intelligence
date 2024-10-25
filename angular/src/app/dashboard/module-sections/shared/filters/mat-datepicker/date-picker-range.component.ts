import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MY_FORMATS } from 'app/shared/utils/common.utils';
import moment from 'moment';

@Component({
  selector: 'app-date-picker-range',
  templateUrl: './date-picker-range.component.html',
  styleUrls: ['./date-picker-range.component.scss'],
  providers: [{ provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }]
})
export class DatePickerRangeComponent {
  @Input()
  set dateSince(since) {
    if (since) {
      if (this?.formDateRange?.controls['startDateCtrl']) {
        this.formDateRange.controls['startDateCtrl'].setValue(since);
      }
    }
  }
  @Input()
  set dateTo(to) {
    if (to) {
      if (this?.formDateRange?.controls['endDateCtrl']) {
        this.formDateRange.controls['endDateCtrl'].setValue(to);
      }
    }
  }
  @Input() disabled = false;
  @Output() resetDateSelected = new EventEmitter();
  @Output() submitDateFilter = new EventEmitter();

  formDateRange = new FormGroup({
    startDateCtrl: new FormControl<Date | null>(null, [Validators.required]),
    endDateCtrl: new FormControl<Date | null>(null, [Validators.required])
  });
  isFiltering = false;

  get startDate() {
    return this.formDateRange.value.startDateCtrl;
  }

  get endDate() {
    return this.formDateRange.value.endDateCtrl;
  }

  resetDatePickerControlValue() {
    Object.keys(this.formDateRange.controls).forEach((key) => {
      const control = this.formDateRange.get(key);
      control.reset();
      setTimeout(() => {
        control.markAsUntouched({ onlySelf: true });
      }, 0);
    });
    this.isFiltering = false;
  }

  onResetDateSelection(emit = true) {
    this.resetDatePickerControlValue();
    if (emit) {
      this.resetDateSelected.emit();
    }
  }

  onCloseRangePickerPopup() {
    if (this.endDate == null && this.startDate == null && !this.isFiltering) {
      this.resetDatePickerControlValue();
    }
  }

  onDateFilter() {
    this.isFiltering = true;
    if (this.formDateRange.invalid) {
      return;
    }

    this.submitDateFilter.emit({
      dateRange: {
        since: moment(this.startDate).startOf('day'),
        to: moment(this.endDate).endOf('day')
      }
    });
    this.isFiltering = false;
  }
}
