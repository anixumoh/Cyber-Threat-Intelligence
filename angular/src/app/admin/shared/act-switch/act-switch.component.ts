import { Component, EventEmitter, Input, Output, ViewChild, ElementRef } from '@angular/core';
import { CommonAdmin } from '../common-admin';

@Component({
  selector: 'act-switch',
  templateUrl: './act-switch.component.html',
  styleUrls: ['./act-switch.component.scss']
})
export class ActSwitchComponent extends CommonAdmin {
  @ViewChild('switchElement') switchElement: ElementRef;

  id = this.id_crazy;
  @Input() model = false;
  @Input() disableConfirmation = false;
  @Input() disableConfirmationText = '';
  @Input() tooltip = '';

  @Output() modelChange = new EventEmitter();
  @Output() eventUpdate = new EventEmitter();

  isModel: any;
  disabledConfirmationModal = false;
  _isDisabled = false;

  @Input()
  set isDisabled(its) {
    this._isDisabled = its;
  }

  get isDisabled() {
    return this._isDisabled;
  }

  constructor() {
    super();
  }

  closeModal() {
    this.disabledConfirmationModal = false;
    this.switchElement['checked'] = true;
  }

  clicked(event) {
    if (this.disableConfirmation && this.model) {
      event.source.checked = true;
      this.disabledConfirmationModal = true;
      return;
    } else {
      this.update_model();
    }
  }

  confirmDisable() {
    this.switchElement['checked'] = false;
    this.disabledConfirmationModal = false;
    this.update_model();
  }

  update_model() {
    if (typeof this.model === 'string') {
      this.model = JSON.parse(this.model);
    }
    this.model = !this.model;
    this.modelChange.emit(this.model);
    this.eventUpdate.emit(null);
  }
}
