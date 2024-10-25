import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import * as moment from 'moment';

interface Day {
  dayStr: string;
  date: Date;
  hasData: boolean;
  selected: boolean;
}

interface MonthInfo {
  month: string;
  days: Day[];
}

@Component({
  selector: 'app-calendar-chart',
  templateUrl: './calendar-chart.component.html',
  styleUrls: ['./calendar-chart.component.scss']
})
export class CalendarChartComponent implements OnInit {
  private dateFormat = 'D/M/YYYY';
  private selectedDay: string;

  onChanges = new ReplaySubject(1);
  private _dates: any = [];

  calendarInfo: MonthInfo[] = [];
  weekdays: string[] = moment.weekdaysShort();
  private daysWithValues: Set<string>;

  @Input() set dates(dates) {
    this._dates = dates;
    this.onChanges.next();
  }
  get dates() {
    return this._dates;
  }

  @Input() diff: any;
  @Input() set selectedDate(d) {
    if (d) {
      this.selectedDay = moment(d.split(' ')[0], this.dateFormat).format(this.dateFormat);
      this.onChanges.next();
    }
  }
  @Output() clickedDate = new EventEmitter();

  ngOnInit() {
    this.onChanges.subscribe(() => this.initCalendar());
  }

  initCalendar() {
    this.daysWithValues = new Set<string>(
      this.dates.map((d) => moment(d.values[1].value.split(' ')[0], this.dateFormat).format(this.dateFormat))
    );

    const now = new Date();
    const calendarInfo: MonthInfo[] = [];

    for (let i = 0; i < 12; i++) {
      const firstDayOfMonth = moment(now).subtract(i, 'months').startOf('month');
      const daysInMonth = firstDayOfMonth.daysInMonth();
      const days: Day[] = [...new Array(31)];

      for (let j = 0; j < daysInMonth; j++) {
        const day = moment(firstDayOfMonth).add(j, 'days');
        const dayStr = day.format(this.dateFormat);
        const hasData = this.daysWithValues.has(dayStr);
        const selected = this.selectedDay === dayStr;
        days[j] = {
          dayStr,
          date: day.toDate(),
          hasData,
          selected
        };
      }

      calendarInfo.push({
        month: firstDayOfMonth.format('MMMM'),
        days
      });
    }
    this.calendarInfo = calendarInfo;
  }

  selectDay(date) {
    const dayStr = moment(date).format(this.dateFormat);
    if (this.selectedDay === dayStr) return;
    const da = this.dates.find(
      (d) => moment(d.values[1].value.split(' ')[0], this.dateFormat).format(this.dateFormat) === dayStr
    );
    if (da) {
      this.clickedDate.emit(da);
    }
  }
}
