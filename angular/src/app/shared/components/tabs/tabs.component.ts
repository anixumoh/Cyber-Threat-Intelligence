import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface ITabsItem {
  id: string | number;
  title: string;
  icon?: string;
  count?: number | string;
  loading?: boolean;
  hidden?: boolean;
}

@Component({
  selector: 'app-tabs',
  template: `
    <div>
      <div class="app-tabs mb-2">
        <ul class="nav nav-pills border-bottom">
          <li
            class="d-flex align-items-center"
            *ngFor="let item of items | showTabsPipe"
            [ngClass]="{ 'is-active': active === item.id }"
            (click)="this.selectTab(item.id)"
          >
            <i *ngIf="item.icon" class="{{ item.icon }}"></i>
            {{ item.title }}
            <span *ngIf="item.count !== undefined && !item.loading">({{ item.count }})</span>
            <i *ngIf="item.loading" class="icon-spinner rotate"></i>
          </li>
        </ul>
      </div>

      <ng-content></ng-content>
    </div>
  `,
  styleUrls: ['./tabs.component.scss'],
})
export class TabsComponent {
  @Input() active: '';
  @Input() items: ITabsItem[] = [];
  @Output() onChange = new EventEmitter();

  selectTab(id) {
    this.onChange.emit(id);
  }
}
