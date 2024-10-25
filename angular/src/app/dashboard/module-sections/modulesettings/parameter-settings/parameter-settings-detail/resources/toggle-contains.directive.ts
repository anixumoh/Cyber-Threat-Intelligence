import {
  Directive,
  TemplateRef,
  ViewContainerRef,
  Input,
  Renderer2,
  OnDestroy,
  Output,
  EventEmitter,
} from '@angular/core';

@Directive({
  exportAs: 'appToggleContains',
  selector: '[appToggleContains]',
})
export class ToggleContainsDirective implements OnDestroy {
  _reference;

  @Input() set appToggleContains(reference) {
    this.setRefListener(reference);
    this.setDocumentListener();
  }

  refListener;
  isShow = false;
  documentListener;

  @Output() isShowEmitter = new EventEmitter();

  constructor(
    public renderer: Renderer2,
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {}

  ngOnDestroy() {
    this.unsubscribeDocumentListener();
    this.unsubscribeRefListener();
  }

  unsubscribeDocumentListener() {
    if (this.documentListener) {
      this.documentListener();
    }
  }

  unsubscribeRefListener() {
    if (this.refListener) {
      this.refListener();
    }
  }

  setRefListener(reference) {
    if (reference) {
      this._reference = reference;
      this.unsubscribeRefListener();
      this.refListener = this.renderer.listen(reference, 'click', (event) => {
        this.setShow(!this.isShow);
        this.setEmbeddedView();
      });
    }
  }

  setEmbeddedView() {
    if (this.isShow) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }

  setDocumentListener() {
    this.unsubscribeDocumentListener();
    this.documentListener = this.renderer.listen('document', 'click', (event) => {
      const targetElement = event.target as HTMLElement;
      const isCheckbox = typeof event.target.type !== 'undefined' || event.target.type === 'checkbox';
      const isListItem = targetElement.classList.contains('form-check');
      const isTrashIcon = targetElement.classList.contains('icon-delete');
      const isConfirmButton = targetElement.classList.contains('btn-primary');
      const isCancelButton = targetElement.classList.contains('btn-light');
      const avoidClickOutside = targetElement.classList.contains('noClickOutside');

      if (this.isShow) {
        if (this.templateRef.elementRef.nativeElement.nextSibling) {
          if (
            targetElement &&
            !this._reference.contains(targetElement) &&
            this.templateRef.elementRef.nativeElement.nextElementSibling &&
            !this.templateRef.elementRef.nativeElement.nextElementSibling.contains(targetElement) &&
            !isCheckbox &&
            !isTrashIcon &&
            !isListItem &&
            avoidClickOutside
          ) {
            this.setShow(false);
            this.viewContainer.clear();
          } else if (targetElement.localName === 'button' && (isConfirmButton || isCancelButton)) {
            this.setShow(false);
            this.viewContainer.clear();
          }
        }
      }
    });
  }

  setShow(isShow) {
    this.isShow = isShow;
    this.isShowEmitter.emit(this.isShow);
  }
}
