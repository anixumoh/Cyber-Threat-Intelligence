import {
  Directive,
  Input,
  HostListener,
  ElementRef,
  ComponentFactoryResolver,
  Injector,
  ApplicationRef,
  EmbeddedViewRef
} from '@angular/core';

import { ModalComponent } from 'app/dashboard/module-sections/shared/modal/modal.component';

@Directive({
  selector: '[externalLink], a[href]'
})
export class ExternalLinksDirective {
  @Input() url: string;

  dialogText = 'You are trying to open an external link. Are you sure you want to continue?';

  constructor(
    private elementRef: ElementRef,
    private injector: Injector,
    private componentFactoryResolver: ComponentFactoryResolver,
    private applicationRef: ApplicationRef
  ) {}

  @HostListener('click', ['$event']) onClick(e) {
    const url = this.elementRef.nativeElement.innerText
      ? this.elementRef.nativeElement.innerText
      : this.elementRef.nativeElement.href;
    if (this.isLinkExternal(url)) {
      e.preventDefault();
      this.openConfirmation(url);
    } else {
      const fullUrl = this.elementRef.nativeElement.getAttribute('href') || this.url;
      window.open(fullUrl, '_blank');
    }
  }

  isLinkExternal(link) {
    return !link.includes(location.hostname);
  }

  openConfirmation(link) {
    const ref = this.componentFactoryResolver.resolveComponentFactory(ModalComponent).create(this.injector);

    ref.instance.modalBody = this.dialogText;
    ref.instance.linkBody = link;
    ref.instance.zIndex = 1033;
    ref.instance.modalTitle = 'External link warning';
    ref.instance.acceptBtn = 'Continue';
    ref.instance.cancelBtn = 'Go back';
    ref.instance.customClass = 'modal-margin-top';
    ref.instance.cancel.subscribe(() => {
      this.applicationRef.detachView(ref.hostView);
      ref.destroy();
    });
    ref.instance.accept.subscribe(() => {
      this.applicationRef.detachView(ref.hostView);
      ref.destroy();
      const itemUrl = this.elementRef.nativeElement.getAttribute('href') || this.url;
      window.open(itemUrl, '_blank');
    });

    // attach component to the appRef so that so that it will be dirty checked.
    this.applicationRef.attachView(ref.hostView);

    // get DOM element from component
    const domElem = (ref.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;

    document.body.appendChild(domElem);
  }
}
