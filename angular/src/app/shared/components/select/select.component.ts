import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';

export interface ISelectItem {
  name: string;
  value: any;
  icon?: string;
  class?: string;
}

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
})
export class SelectComponent implements OnChanges {
  @Input() items: ISelectItem[];
  @Input() highlight = false;
  @Input() model: any;
  @Input() placement = 'bottom-left';
  @Input() icon: string;
  @Input() label: string;
  @Input() id: string;
  @Input() class: string;
  @Input() showText;
  @Input() loading = false;
  selected;

  @Output() onChange = new EventEmitter<ISelectItem>();

  ngOnChanges(changes: any): void {
    this.selected = this.items.find(item => item.value === this.model);
  }

  onChangeValue(item: ISelectItem) {
    let value = item;
    if (Array.isArray(this.model)) {
      value = toggle([...this.model], item.value);
    }
    this.onChange.emit(value);
  }

  isActive(value) {
    if (Array.isArray(this.model)) {
      const found = this.model.find(item => item === value);
      return !!found;
    } else {
      return this.model === value;
    }
  }
}

function toggle(collection, item) {
  const id = collection.indexOf(item);
  if (id !== -1) {
    collection.splice(id, 1);
  } else {
    collection.push(item);
  }
  return collection;
}
