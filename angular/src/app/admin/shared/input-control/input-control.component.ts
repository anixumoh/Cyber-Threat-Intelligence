import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter
} from '@angular/core';
import { UntypedFormControl } from '@angular/forms';

@Component({
  selector: 'input-control',
  templateUrl: './input-control.component.html',
  styleUrls: ['./input-control.component.scss']
})
export class InputControlComponent implements AfterViewInit, OnChanges {
  @Input() label: any;
  @Input() type = 'text';
  @Input() nameRadio: any;
  @Input() valueRadio: any;
  @Input() customClass: any;
  @Input() maxStars = 5;
  @Input() minNumber: any;
  @Input() maxNumber: any;
  @Input() viewSelect: any;
  @Input() valueSelect: any;
  @Input() isDisabled: any;
  @Input() maxlength: any;
  @Input() minLength: any;
  @Input() msjClass = 'text-danger';
  @Input() msjInfo: any;
  @Input() msjError: any;
  @Input() control: UntypedFormControl;
  @Input() typeOf: any;
  @Input() placeholder = '';

  _optionsSelect;
  @Input()
  set optionsSelect(its) {
    this._optionsSelect = its;
  }

  get optionsSelect() {
    return this._optionsSelect;
  }

  _showMessage;
  @Input()
  set showMessage(its) {
    this._showMessage = its;
  }

  get showMessage() {
    return this._showMessage;
  }

  _openDropdown = false;
  @Input()
  set openDropdown(its) {
    this._openDropdown = its;
  }

  get openDropdown() {
    return this._openDropdown;
  }

  _valueDropdown = '';
  @Input()
  set valueDropdown(its) {
    this._valueDropdown = its;
  }

  get valueDropdown() {
    return this._valueDropdown;
  }

  @Output() onEmitValue = new EventEmitter();
  @Output() onResetValue = new EventEmitter();
  @Output() onCloseDropdown = new EventEmitter();

  valueHover = 0;

  constructor(private cd: ChangeDetectorRef) {}

  ngAfterViewInit() {
    this.cd.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.cd.detectChanges();
  }

  get classCustom() {
    if (this.type === 'checkbox') {
      return this.customClass;
    }
    return 'form-control form-control-sm ' + this.customClass;
  }

  get numberStars() {
    const retorno = [];
    for (let i = 1; i <= this.maxStars; i++) {
      retorno.push(i);
    }
    return retorno;
  }

  changeCheckbox() {
    this.updateValue(!this.control.value);
    this.emitValue(this.control.value);
  }

  emitValue(e) {
    this.onEmitValue.emit(e);
  }

  changeSwitch(e) {
    this.updateValue(!this.control.value);
  }

  resetControl() {
    this.valueDropdown = '';
    this.onResetValue.emit();
  }

  selectedStars(i) {
    if (!this.isDisabled) {
      i = this.valueControl('number') === i ? 0 : i;
      this.updateValue(i);
    }
  }

  selectedValue(id, name) {
    this.valueDropdown = name;
    this.updateValue(id);
  }

  closeDropdown() {
    this.onCloseDropdown.emit();
  }

  updateValue(value) {
    if (this.typeOf && this.typeOf === 'boolean') {
      this.control.setValue(!!value);
    }
    if (this.typeOf && this.typeOf === 'number') {
      this.control.setValue(Number(value));
    }
    if (this.typeOf && this.typeOf === 'string') {
      this.control.setValue(JSON.stringify(value));
    } else {
      this.control.setValue(value);
    }
    this.openDropdown = false;
    this.closeDropdown();
  }

  valueControl(typeOf = null) {
    let retorno = this.control.value;
    if (typeOf && typeOf === 'boolean') {
      retorno = typeof retorno !== 'boolean' ? !!retorno : retorno;
    }
    if (typeOf && typeOf === 'number') {
      retorno = typeof retorno !== 'number' ? Number(retorno) : retorno;
    }
    if (typeOf && typeOf === 'string') {
      retorno = typeof retorno !== 'string' ? JSON.stringify(retorno) : retorno;
    }

    return retorno;
  }
}
