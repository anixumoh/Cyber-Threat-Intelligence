import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { defaultColorsRGB } from 'app/utils/functions';

@Component({
  selector: 'app-labels-update',
  templateUrl: './labels-update.component.html',
  styleUrls: ['./labels-update.component.scss'],
})
export class LabelsUpdateComponent implements OnInit, OnDestroy {
  subscriptionList: Subscription[] = [];
  labelsList: any;
  isModalOpen = false;
  colors = defaultColorsRGB;
  isDropdownOpen = false;
  _label = <any>{};

  @Input()
  set label(obj) {
    this._label = obj || <any>{};
    this.loadType();
  }

  loadType() {
    this._label.labelTypeId = '0';
    if (this.label.organizationId) {
      this._label.labelTypeId = '1';
    }
    if (this.label.moduleId) {
      this._label.labelTypeId = '2';
    }
  }

  get label() {
    return this._label;
  }

  @Input()
  set updateData(b) {
    if (b) {
      this.onSave();
    }
  }

  @Output() updateLabel = new EventEmitter<any>();

  constructor() {}

  ngOnInit() {}

  ngOnDestroy() {
    this.unsubscribeList();
  }

  unsubscribeList() {
    this.subscriptionList.forEach((s) => {
      if (s) {
        s.unsubscribe();
      }
    });
  }

  textColor(background) {
    let retorno = '#000';
    if (background && !(background === 'rgba(255,255,255,1)' || background === 'rgba(238,238,238,1)')) {
      retorno = '#FFFFFF';
    }
    return retorno;
  }

  rgbaToHexa(color) {
    let retorno = '';
    if (color && color.indexOf('(') !== -1 && color.indexOf(',') !== -1 && color.indexOf(')') !== -1) {
      let c = color.split('(')[1].split(')')[0].split(',');
      let a = parseInt(c[0]) < 10 ? '0' + c[0] : parseInt(c[0]).toString(16);
      let b = parseInt(c[1]) < 10 ? '0' + c[1] : parseInt(c[1]).toString(16);
      let d = parseInt(c[2]) < 10 ? '0' + c[2] : parseInt(c[2]).toString(16);
      retorno = '#' + a + b + d;
    }
    return retorno;
  }

  openDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectColor(color) {
    this.label.bgColorHex = color;
    this.label.textColorHex = this.textColor(color);
    this.isDropdownOpen = false;
  }

  changeType(e) {
    this._label.labelTypeId = e;
    if (this.label.labelTypeId !== '2') {
      delete this._label.moduleId;
    }
    if (this.label.labelTypeId === '0') {
      delete this._label.organizationId;
    }
  }

  onSave() {
    this.label.prioritized = false;
    this.label.labelProtected = false;
    if (this.label.bgColorHex.indexOf('rgb') !== -1) {
      this.label.bgColorHex = this.rgbaToHexa(this.label.bgColorHex);
    }
    if (this.label && this.label.bgColorHex && this.label.label && this.label.labelTypeId) {
      this.updateLabel.emit(this.label);
    }
  }
}
