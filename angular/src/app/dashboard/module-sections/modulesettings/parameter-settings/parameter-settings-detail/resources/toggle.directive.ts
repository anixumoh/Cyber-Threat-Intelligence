import {Directive, Input, OnDestroy, TemplateRef, ViewContainerRef} from '@angular/core';
import {ToggleContainsDirective} from "./toggle-contains.directive";
import {Subscription} from "rxjs";

@Directive({
  selector: '[appToggle]'
})
export class ToggleDirective implements OnDestroy{
  isShow;
  isShowSubscription: Subscription;
  @Input() set appToggle(its: ToggleContainsDirective) {
    if (its) {
      this.isShow = !its.isShow;
      this.setEmbeddedView();
      this.unsubscribe();
      this.isShowSubscription = its.isShowEmitter.subscribe((isShow) => {
        this.isShow = !isShow;
        this.setEmbeddedView();
      });
    }
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) { }

  ngOnDestroy() {
    this.unsubscribe();
  }

  setEmbeddedView() {
    if (this.isShow) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }

  unsubscribe() {
    if (this.isShowSubscription) {
      this.isShowSubscription.unsubscribe();
    }
  }

}
