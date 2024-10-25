import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  template: `
    <div class="app-container">
      <div *ngIf="robot">
        <img src="/assets/default_images/searching.svg" class="robot" alt="" />
        <div class="text-primary">loading...</div>
      </div>
      <div *ngIf="!robot" class="spinner" [ngClass]="{ 'spinner--sm': sm }"></div>
    </div>
  `,
  styleUrls: ['./spinner.component.scss']
})
export class SpinnerComponent {
  @Input() robot = false;
  @Input() sm = false;
}
