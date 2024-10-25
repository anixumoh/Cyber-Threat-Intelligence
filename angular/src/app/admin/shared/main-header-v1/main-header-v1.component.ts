import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'main-header-v1',
  templateUrl: './main-header-v1.component.html',
  styleUrls: ['./main-header-v1.component.scss']
})
export class MainHeaderV1Component {
  @Input() title: any;
  @Input() arrayTabs = [];
  @Input() active;
  @Output() activeChange = new EventEmitter();

  constructor() {}

  changeTabs(item) {
    this.active = item;
    this.activeChange.emit(this.active);
  }
}
