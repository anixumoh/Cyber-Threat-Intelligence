import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-badge',
  template: `
    <div class="app-badge">
      <ng-content></ng-content>
      <sup *ngIf="!hide" class="app-badge__count">{{ count || default }}</sup>
    </div>
  `,
  styleUrls: ['./badge.component.scss'],
})
export class BadgeComponent {
  @Input() count;
  @Input() hide = false;
  @Input() default: string | number = 0;
}
