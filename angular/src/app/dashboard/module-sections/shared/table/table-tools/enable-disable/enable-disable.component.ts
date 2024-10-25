import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-enable-disable',
  templateUrl: './enable-disable.component.html',
  styleUrls: ['./enable-disable.component.scss'],
})
export class EnableDisableComponent {
  @Input() status;
  @Input() interactive = true;
  @Output() setStatus = new EventEmitter();

  constructor() {}

  updateStatus() {
    if (this.interactive) {
      this.status = !this.status;
      this.setStatus.emit(this.status);
    }
  }
}
