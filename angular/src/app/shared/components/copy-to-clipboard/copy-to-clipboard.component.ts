import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-copy-to-clipboard',
  templateUrl: './copy-to-clipboard.component.html',
  styleUrls: ['./copy-to-clipboard.component.scss'],
})
export class CopyToClipboardComponent {
  @Input() value = '';
  @Input() child = false;
  @Input() tooltip = false;
  @Input() placement = 'top';

  @Output() copiedToClipboard = new EventEmitter();

  copyCooldown = false;

  constructor(private cdr: ChangeDetectorRef) {}

  copyToClipboard(value: string): void {
    const listener = (e: ClipboardEvent) => {
      e.clipboardData.setData('text/plain', value);
      e.preventDefault();
      this.copyCooldown = true;
      setTimeout(() => {
        this.copyCooldown = false;
        this.copiedToClipboard.emit();
        this.cdr.detectChanges();
      }, 2000);
    };

    document.addEventListener('copy', listener);
    document.execCommand('copy');
    document.removeEventListener('copy', listener);
  }
}
