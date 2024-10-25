import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent {
  @Input() icon = '';
  @Input() title = '';
  @Input() isInverse = false;
  @Input() elements = [];
  @Input() isArrayElements = true;
  @Input() oneElement: any = '';
  @Input() valueFromLabel = false;
  @Input() valueFromName = false;
  @Input() isFromLabels = false;
  @Input() isFromRating = false;
  @Input() isKeyAndValue = false;
  @Input() isBadge = true;
  @Input() fileTypeArray: any = undefined;

  constructor() {}

  getValue(element) {
    const { value, type, label, name } = element;
    if (this.fileTypeArray) {
      return this.fileTypeArray[element].name;
    }
    if (this.valueFromLabel) {
      return label;
    }
    if (this.valueFromName) {
      return name;
    }
    return value || type;
  }
}
