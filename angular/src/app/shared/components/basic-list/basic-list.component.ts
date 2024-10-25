import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-basic-list',
  template: `
    <ul class="list-group app-basic-list">
      <li class="list-group-item app-basic-list__item" *ngFor="let item of items; let index = index">
        <span class="cursor-pointer" (click)="click(item, index)">
          {{ item[key] ? item[key] : item }}
        </span>
        <span class="app-basic-list__item-close" *ngIf="canEdit" (click)="edit(item, index)">
          <i class="icon-pencil-square"></i>
        </span>
        <span class="app-basic-list__item-close" *ngIf="canRemove" (click)="remove(item, index)">
          <i class="icon-times"></i>
        </span>
      </li>
    </ul>
  `,
  styleUrls: ['./basic-list.component.scss']
})
export class BasicListComponent {
  @Input() items: any[];
  @Input() key: string;
  @Input() canRemove: boolean;
  @Input() canEdit: boolean;
  @Output() onClick = new EventEmitter<{ $event: any }>();
  @Output() onEdit = new EventEmitter<{ item: any; index: number }>();
  @Output() onRemove = new EventEmitter<{ item: any; index: number }>();

  click(item, index) {
    const $event = { item, index };
    this.onClick.emit({ $event });
  }

  remove(item, index) {
    this.onRemove.emit({ item, index });
  }

  edit(item, index) {
    this.onEdit.emit({ item, index });
  }
}
