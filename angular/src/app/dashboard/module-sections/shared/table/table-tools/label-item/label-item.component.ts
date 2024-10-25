import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { setColors } from 'app/utils/functions';

@Component({
  selector: 'app-label-item',
  templateUrl: './label-item.component.html',
  styleUrls: ['./label-item.component.scss']
})
export class LabelItemComponent {
  _label: any;
  @Input() labelProperty: string;

  @Input()
  set label(labelValue) {
    this._label = labelValue;
    if ((labelValue.background_color && !labelValue.bgColorHex) || (labelValue.bgColor && labelValue.textColor)) {
      const background = labelValue.background_color ? labelValue.background_color : labelValue.bgColor;
      const isWhite = background === 0xffffff ? 0xeeeeee : background;
      const colorObject = setColors(isWhite, 'rgb');
      this._label.background = this.sanitizer.bypassSecurityTrustStyle(colorObject.background);
      this._label.color = this.sanitizer.bypassSecurityTrustStyle(colorObject.color);
      this._label.weight = this.sanitizer.bypassSecurityTrustStyle(colorObject.weight);
      this._label.border = this.sanitizer.bypassSecurityTrustStyle('3px solid ' + colorObject.background);
    }
    if (!labelValue.background_color && labelValue.bgColorHex) {
      this._label.background = labelValue.bgColorHex;
      this._label.color = labelValue.textColorHex;
      this._label.weight = '500';
      this._label.border = '3px solid ' + this._label.background;
    }
    if (this.labelProperty) {
      this._label.name = labelValue[this.labelProperty];
    }
  }

  get label() {
    return this._label;
  }

  constructor(private sanitizer: DomSanitizer) {}
}
