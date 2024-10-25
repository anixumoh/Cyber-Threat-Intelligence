import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-drawer',
  template: `
    <div class="drawer-container" [ngClass]="{ 'drawer-container--open': open }">
      <div class="drawer-mask" (click)="onClose()"></div>
      <div class="drawer-content" [style.width]="width || '400px'">
        <div *ngIf="title" class="drawer-header">
          <span>{{ title }}</span>
          <i (click)="onClose()" class="icon-times"></i>
        </div>
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styleUrls: ['./drawer.component.scss'],
})
export class DrawerComponent {
  @Input() open: boolean;
  @Input() width: string;
  @Input() title: string;
  @Output() close = new EventEmitter();

  onClose() {
    this.close.emit();
  }
}
