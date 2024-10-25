import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'app-generic-list',
  templateUrl: './generic-list.component.html',
  styleUrls: ['./generic-list.component.scss']
})
export class GenericListComponent {
  @Input() title = '';
  @Input() inverseId = 'id';
  @Input() type = '';
  @Input() typeClick = '';
  @Input() typeFilter = '';
  @Input() searchTerm = false;
  @Input() formControlByName = '';
  @Input() form: UntypedFormGroup;
  @Input() elements = [];
  @Input() haveSearch = true;
  @Input() haveInverse = true;
  @Input() haveTooltip = false;
  @Input() propertyForTooltip = '';
  @Input() isMultiClick = true;
  @Input() arrayName = '';
  @Input() actionPosition: number;
  @Output() searchInFilters = new EventEmitter();
  @Output() searchFilter = new EventEmitter();
  @Output() multiClick = new EventEmitter();
  constructor() {}

  onSearchInFilters($event: any, value: string) {
    this.searchInFilters.emit({ event: $event, list: value });
  }

  onSearchFilter(list: string, search: string) {
    this.searchFilter.emit({ list, filterName: search });
  }

  onMultiClick(element: string, index: number) {
    this.multiClick.emit({ condition: element, index });
  }

  onMultiClickActions(index: number, arrayName: string, actionPosition: number) {
    this.multiClick.emit({ index, arrayName, actionPosition });
  }
}
