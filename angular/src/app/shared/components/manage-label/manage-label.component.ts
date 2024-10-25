import { Component, EventEmitter, Input, Output } from '@angular/core';
import { defaultColorsRGB } from '../../../utils/functions';
import { LabelsService } from '../../../dashboard/module-sections/shared/labels/labels.service';

@Component({
  selector: 'app-manage-label',
  templateUrl: './manage-label.component.html',
  styleUrls: ['./manage-label.component.scss'],
})
export class ManageLabelComponent {
  labelsList: any;
  isModalOpen = false;
  colors = defaultColorsRGB;
  isDropdownOpen = false;
  @Input() label: any = {};
  @Output() onSave = new EventEmitter();
  @Output() onCancel = new EventEmitter();
  @Output() onDestroy = new EventEmitter();

  constructor(private labelsService: LabelsService) { }

  onToggle(event) {
    this.labelsService.toggle(event);
  }

  cancel() {
    this.onCancel.emit();
  }

  openDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  textColor(background) {
    let retorno = '#000000';
    if (background && !(background === 'rgba(255,255,255,1)' || background === 'rgba(238,238,238,1)')) {
      retorno = '#FFFFFF';
    }
    return retorno;
  }

  selectColor(color) {
    this.label.bgColorHex = color;
    this.label.textColorHex = this.textColor(color);
    this.openDropdown();
  }

  rgbaToHexa(color) {
    let retorno = '';
    if (color && color.indexOf('(') !== -1 && color.indexOf(',') !== -1 && color.indexOf(')') !== -1) {
      let c = color
        .split('(')[1]
        .split(')')[0]
        .split(',');
      let a = parseInt(c[0]) < 10 ? '0' + c[0] : parseInt(c[0]).toString(16);
      let b = parseInt(c[1]) < 10 ? '0' + c[1] : parseInt(c[1]).toString(16);
      let d = parseInt(c[2]) < 10 ? '0' + c[2] : parseInt(c[2]).toString(16);
      retorno = '#' + a + b + d;
    }
    return retorno;
  }

  destroy() {
    this.onDestroy.emit(this.label.id);
  }

  save() {
    if (this.label && this.label.bgColorHex && this.label.label && this.label.labelTypeId) {
      const label: any = {};
      label.label = this.label.label.trim();
      label.prioritized = false;
      label.labelProtected = false;
      label.bgColorHex = this.label.bgColorHex.match(/^rgb/i)
        ? this.rgbaToHexa(this.label.bgColorHex)
        : this.label.bgColorHex;
      label.textColorHex = this.label.textColorHex;
      label.labelTypeId = this.label.labelTypeId !== 'null' ? this.label.labelTypeId : null;
      this.onSave.emit(label);
    }
  }
}
