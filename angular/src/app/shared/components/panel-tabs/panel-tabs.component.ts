import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ITabsItem } from '../tabs/tabs.component';

@Component({
  selector: 'app-panel-tabs',
  template: `
    <div class="card">
      <div class="card-header">
        <ul class="nav nav-tabs card-header-tabs">
          <li class="nav-item" *ngFor="let item of items">
            <a class="nav-link" [ngClass]="{ active: active === item.id }" (click)="this.selectTab(item.id)">
              <i *ngIf="item.icon" class="{{ item.icon }}"></i>
              {{ item.title }}
              <span *ngIf="item.count !== undefined && !item.loading">({{ item.count }})</span>
              <i *ngIf="item.loading" class="icon-spinner rotate"></i>
            </a>
          </li>
        </ul>
      </div>
      <div class="card-body">
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class PanelTabsComponent {
  @Input() active: '';
  @Input() items: ITabsItem[] = [];
  @Output() change = new EventEmitter();

  selectTab(id) {
    this.change.emit(id);
  }
}
