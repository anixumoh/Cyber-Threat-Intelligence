import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-overlay',
  template: `
    <div class="overlay" [style.minHeight]="minHeight">
      <div class="overlay__layer" [style.display]="loading ? 'block' : 'none'">
        <div>
          <is-data-is-loading-threats [isLoading]="loading"></is-data-is-loading-threats>
        </div>
      </div>
      <ng-content></ng-content>
    </div>
  `,
  styleUrls: ['./overlay.component.scss']
})
export class OverlayComponent {
  @Input()
  get minHeight() {
    return this._minHeight;
  }
  set minHeight(value: string | number) {
    this._minHeight = typeof value === 'number' ? `${value}px` : value;
  }
  @Input() loading = false;
  private _minHeight = 'auto';
}
