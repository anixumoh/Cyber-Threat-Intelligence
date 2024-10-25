import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-boolean',
  template: `
    <div class="text-center">
      <i [class]="classValue" [ngbTooltip]="value"></i>
    </div>
  `,
})
export class BooleanComponent implements OnInit {
  classValue: string;

  @Input() value: string | number;

  private falseClass = 'icon-close text-danger';
  private trueClass = 'icon-check text-success';

  ngOnInit() {
    if (this.value === null) {
      this.classValue = 'icon-question-circle-solid text-danger';
      return;
    }
    if (Array.isArray(this.value)) {
      this.classValue = this.value.length > 0 ? this.trueClass : this.falseClass;
      this.value = this.value.length > 0 ? 'True' : 'False';
      return;
    }
    if (typeof this.value !== 'undefined') {
      this.value = this.capitalizeFirstLetter(this.value.toString());
    }
    this.classValue = this.trueClass;
    if (this.value === 'False') {
      this.classValue = this.falseClass;
    }
  }

  protected capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}
