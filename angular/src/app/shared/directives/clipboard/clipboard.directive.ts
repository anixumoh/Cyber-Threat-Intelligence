import { Directive, Input, HostListener, ElementRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Directive({
  selector: '[copyClipboard]',
})
export class CopyToClipboardDirective {
  @Input() copyClipboard: string;

  constructor(private toastrService: ToastrService, el: ElementRef) {}

  @HostListener('click') onMouseEnter() {
    const listener = (e: ClipboardEvent) => {
      const clipboard = e.clipboardData || window['clipboardData'];
      clipboard.setData('text', this.copyClipboard);
      e.preventDefault();
    };

    document.addEventListener('copy', listener, false);
    document.execCommand('copy');
    document.removeEventListener('copy', listener, false);

    this.toastrService.info('Copied!', '', {
      closeButton: false,
      progressBar: false,
      positionClass: 'toast-center-center',
      timeOut: 50,
    });
  }

  ngOnDestroy() {}
}
