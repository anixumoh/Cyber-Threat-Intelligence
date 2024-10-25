import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  template: `
    <div
      class="modal fade modal--outer"
      tabindex="-1"
      role="dialog"
      [ngClass]="{ show: show }"
      (click)="outerClickHandler($event)"
    >
      <div class="modal-dialog modal-dialog-centered {{ class }}" role="document">
        <app-overlay [loading]="loading" class="w-100">
          <ng-content></ng-content>
        </app-overlay>
      </div>
    </div>
  `,
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent {
  @Input() show = false;
  @Input() title: string;
  @Input() class = '';
  @Input() outClickClose = true;
  @Input() footer = true;
  @Input() loading = false;
  @Input() saveText = 'Save';
  @Input() closeText = 'Cancel';
  @Output() close = new EventEmitter();
  @Output() save = new EventEmitter();

  onSave() {
    this.save.emit();
  }

  onClose() {
    this.close.emit();
  }

  outerClickHandler(event) {
    if (event.target.classList.contains('modal--outer')) {
      if (!this.loading && this.outClickClose) {
        this.onClose();
      }
    }
  }
}
