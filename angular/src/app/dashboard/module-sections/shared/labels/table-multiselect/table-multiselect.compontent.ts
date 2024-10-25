import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Grants } from 'app/services/grants/grants';

@Component({
  selector: 'app-table-multiselect',
  templateUrl: './table-multiselect.component.html',
  styleUrls: ['./table-multiselect.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableMultiselectComponent {
  isMenuOpened = false;
  _tableList: any[] = [];

  @Input()
  set tableList(its) {
    if (its && its.length) {
      this._tableList = its;
    }
  }

  get tableList() {
    return this._tableList;
  }

  @Input() tableMultiselectTitle: string = 'Default Title';
  @Input() filterLabels;
  @Output() toggle = new EventEmitter<any>();
  @Output() update = new EventEmitter<any>();

  constructor(public grants: Grants) {}

  toggleItem(index: number, prop: string, event) {
    if (event.target.className && event.target.className !== 'checkbox-default') {
      const element = this._tableList[index];
      this.toggle.emit({
        element: { ...element, [prop]: !element[prop], strict: false, excluded: false }
      });
    }
  }

  identify(index, item) {
    return item ? item.id : undefined;
  }

  updateItem(event, item) {
    event.stopPropagation();
    this.update.emit(item);
  }

  updateLabel(index, type) {
    const element = this._tableList[index];
    switch (type) {
      case 'and':
        element.strict = true;
        element.excluded = false;
        break;
      case 'or':
        element.strict = false;
        element.excluded = false;
        break;
      case 'not':
        element.strict = false;
        element.excluded = true;
    }

    this.toggle.emit({
      element: { ...element }
    });
  }
}
