import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], searchText: string, key?: string ): any[] {
    if (!items) return [];
    if (!searchText) return items;
    searchText = searchText.toLowerCase();
    return items.filter(it => {
      if (key) {
        return it[key].toLowerCase().includes(searchText);
      } else {
        return it.toLowerCase().includes(searchText);
      }
    });
  }
}
