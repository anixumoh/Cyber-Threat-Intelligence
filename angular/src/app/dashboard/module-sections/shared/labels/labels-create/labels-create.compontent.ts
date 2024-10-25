import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';

import { LabelsService } from 'app/dashboard/module-sections/shared/labels/labels.service';
import { defaultColorsRGB } from 'app/utils/functions';
import { Grants } from 'app/services/grants/grants';

@Component({
  selector: 'app-labels-create',
  templateUrl: './labels-create.component.html',
  styleUrls: ['./labels-create.component.scss'],
})
export class LabelsCreateComponent implements OnInit, OnDestroy {
  subscriptionList: Subscription[] = [];
  labelsList: any;
  isModalOpen = false;
  colors = defaultColorsRGB;
  isDropdownOpen = false;
  label = <any>{};

  @Input()
  set saveData(d) {
    if (d) {
      this.onSave();
    }
  }

  @Output() saveLabel = new EventEmitter<any>();

  constructor(private labelsService: LabelsService, protected grants: Grants) {}

  ngOnInit() {}

  ngOnDestroy() {
    this.unsubscribeList();
  }

  unsubscribeList() {
    this.subscriptionList.forEach(s => {
      if (s) {
        s.unsubscribe();
      }
    });
  }

  onToggle(event) {
    this.labelsService.toggle(event);
  }

  close() {
    this.label = <any>{};
    this.isModalOpen = !this.isModalOpen;
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

  onSave() {
    if (this.label && this.label.bgColorHex && this.label.label && this.label.labelTypeId) {
      this.label.label = this.label.label.trim();
      this.label.prioritized = false;
      this.label.labelProtected = false;
      this.label.bgColorHex = this.rgbaToHexa(this.label.bgColorHex);
      this.saveLabel.emit(this.label);
      this.label = <any>{};
    }
  }
}
