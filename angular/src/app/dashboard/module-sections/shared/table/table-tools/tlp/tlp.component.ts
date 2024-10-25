import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ElementRef } from '@angular/core';

@Component({
  selector: 'app-tlp',
  templateUrl: './tlp.component.html',
  styleUrls: ['./tlp.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onClickOutside($event)'
  }
})
export class TlpComponent {
  tlpVisible = false;

  _availableStatus = {
    WHITE: true,
    GREEN: true,
    AMBER: true,
    RED: true
  };

  @Input() isFirst = false;
  @Input() isLast = false;
  @Input() isTdCenter = true;
  @Input() isRelativePosition = true;
  @Input() customClasses = '';
  @Input() isButton = false;
  @Input() status;
  @Input() interactive = true;
  @Input()
  set availableStatus(its) {
    this._availableStatus = its;
  }

  get availableStatus() {
    return this._availableStatus;
  }

  @Output() setStatus = new EventEmitter();

  constructor(private el: ElementRef) {}

  showTlp() {
    this.tlpVisible = !this.tlpVisible;
  }

  tlpClass(tlp) {
    if (tlp) {
      const status = tlp.toUpperCase();
      switch (status) {
        case 'WHITE':
          return 'icon-radio_button_unchecked is-white';
        case 'GREEN':
          return 'icon-lens is-green';
        case 'AMBER':
          return 'icon-lens is-amber';
        case 'RED':
          return 'icon-lens is-red';
      }
    }
  }

  updateStatus(e, status) {
    this.tlpVisible = false;
    this.setStatus.emit(status);
  }

  onClickOutside(event) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.tlpVisible = false;
    }
  }
}
