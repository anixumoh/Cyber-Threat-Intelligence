import { Component, EventEmitter, Input, Output } from '@angular/core';

export enum confirmationTypes {
  DEFAULT = 1,
  DELETE = 2,
}

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss'],
})
export class ConfirmationModalComponent {
  @Input() show = false;
  @Input() type = confirmationTypes.DEFAULT;
  @Input() title;
  @Input() okText = 'Accept';
  @Input() cancelText = 'Cancel';
  @Output() close = new EventEmitter();
  @Output() confirm = new EventEmitter();

  confirmationTypes = confirmationTypes;

  closeModal() {
    this.close.emit();
  }

  confirmAction() {
    this.confirm.emit();
  }
}
