import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment-timezone';

@Pipe({
  name: 'timezone',
})
export class TimezonePipe implements PipeTransform {
  transform(value, onlyDate?): any {
    let date = '';
    if (typeof value === 'number') {
      if (onlyDate) {
        return (date = moment(value).format('D/M/YYYY'));
      } else {
        date = moment(value).format('D/M/YYYY HH:mm');
        return date + 'h';
      }
    } else if (typeof value === 'string') {
      if (onlyDate) {
        return (date = moment(Number(value)).format('D/M/YYYY'));
      } else {
        date = moment(Number(value)).format('D/M/YYYY HH:mm');
        return date + 'h';
      }
    } else if (!value) {
      return '---';
    }
  }
}
