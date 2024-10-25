import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-dorks-threat-context-template',
  templateUrl: './dorks-threat-context-template.component.html',
  styleUrls: ['./dorks-threat-context-template.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DorksThreatContextTemplateComponent {
  _dorkFields;
  _dorkFieldsEntity = [];
  @Input() dorksThreathContextType;
  @Input() set dorkFields(its) {
    if (its) {
      this._dorkFields = its;
      this._dorkFieldsEntity = [];
      this.generateArrayKeys(this._dorkFields, this._dorkFieldsEntity);
      setTimeout(() => {
        this.addListeners();
      }, 300);
    }
  }
  @Output() changeDork = new EventEmitter();

  setDork(dork) {
    this.changeDork.emit(dork);
  }

  addListeners() {
    const elements: any = document.querySelectorAll('.set-dork-example');
    for (const element of elements) {
      (element as HTMLElement).addEventListener('click', () => {
        const dork = element.innerText;
        this.setDork(dork);
      });
    }
  }

  generateArrayKeys(defaultObject, arrayToPush) {
    for (const prop in defaultObject) {
      if (defaultObject.hasOwnProperty(prop)) {
        arrayToPush.push(prop);
      }
    }
  }
}
