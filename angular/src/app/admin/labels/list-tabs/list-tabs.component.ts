import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-list-tabs',
  template: `
    <main-header-v1 [title]="'Labels'" [arrayTabs]="arrayTabs" [(active)]="tabActive">
      <app-list-labels [idOrg]="idOrg" *ngIf="tabActive === arrayTabs[0]"></app-list-labels>
      <app-list-type-labels *ngIf="tabActive === arrayTabs[1]"></app-list-type-labels>
    </main-header-v1>
  `
})
export class ListTabsComponent {
  arrayTabs = ['Label list', 'Label types'];
  tabActive = this.arrayTabs[0];
  @Input() idOrg;

  constructor() {}
}
