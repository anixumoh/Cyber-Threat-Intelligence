import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'showTabsPipe',
})
export class ShowTabsPipe implements PipeTransform {
  transform(items: any[], args?: any): any {
    if (items) {
      return items.filter(item => {
        return !!!item.hidden;
      });
    }
    return items;
  }
}
