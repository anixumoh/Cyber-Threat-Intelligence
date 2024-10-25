import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-action-circle',
  templateUrl: './action-circle.component.html',
  styleUrls: ['./action-circle.component.scss']
})
export class ActionCircleComponent {
  @Input() placement = 'auto';
  @Input() tooltip = '';
  @Input() colorIcon = '';
  @Input() isDisabled = false;
  @Input() sizeCustom = '';
  @Input() icon = '';
  @Input() iconSize = '';
  @Input() isLoading = '';
  @Output() clickEvent = new EventEmitter();

  constructor() {}

  clicked() {
    if (!this.isLoading && !this.isDisabled) {
      this.clickEvent.emit(null);
    }
  }

  get colorCuston() {
    let retorno = this.colorIcon;
    if (typeof this.colorIcon === 'object' && Object.keys(this.colorIcon) && Object.keys(this.colorIcon).length) {
      retorno = '';
      for (const key of Object.keys(this.colorIcon)) {
        if (this.colorIcon[key] === true) {
          retorno += ` ${key}`;
        }
      }
    }
    return retorno;
  }

  get superSizeCuston() {
    let retorno = this.sizeCustom;
    if (typeof this.sizeCustom === 'object' && Object.keys(this.sizeCustom) && Object.keys(this.sizeCustom).length) {
      retorno = '';
      for (const key of Object.keys(this.sizeCustom)) {
        if (this.sizeCustom[key] === true) {
          retorno += ` ${key}`;
        }
      }
    }
    return retorno;
  }
}
