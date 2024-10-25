import {
  AfterViewChecked,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ellipseText, ellipseUrl } from 'app/utils/functions';
import { BehaviorSubject } from 'rxjs';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-large-text',
  template: `
    <div [ngClass]="{ ellipsisClass: this._shouldApplyClass }" #divRef>
      <ng-content></ng-content>
      <span
        [ngbTooltip]="(isShowTooltip | async) ? value : ''"
        [placement]="placement"
        [innerHTML]="_textToShrink"
      ></span>
    </div>
  `,
  styles: [
    `
      .ellipsisClass {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    `,
  ],
})
export class LargeTextComponent implements OnInit, AfterViewChecked, OnChanges {
  get isEllipsisStyleAuto() {
    return this.ellipsisStyle === 'auto';
  }
  @Input() placement = 'left';
  @Input() ellipsisStyle: 'auto' | 'text' | 'url' = 'auto';
  @Input() charactersShown: number;
  @Input() value: string;
  @ViewChild('divRef') textWrapper: ElementRef;
  _textToShrink: string;
  _shouldShowTooltip = new BehaviorSubject(false);
  _shouldApplyClass = false;
  isShowTooltip = this._shouldShowTooltip.asObservable().pipe(delay(0));

  isEllipsisActive(e) {
    return e.offsetWidth < e.scrollWidth;
  }

  setShouldShowTooltip(value: boolean) {
    this._shouldShowTooltip.next(value);
  }

  renderTextValue() {
    if (this.isEllipsisStyleAuto) {
      this._shouldApplyClass = true;
      this._textToShrink = this.value;
    } else {
      const ellipse = (this.ellipsisStyle === 'url' ? ellipseUrl : ellipseText)(this.value, this.charactersShown);
      this.setShouldShowTooltip(ellipse.includes('...'));
      this._textToShrink = ellipse;
    }
  }

  ngOnInit() {
    this.renderTextValue();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.value) {
      this.renderTextValue();
    }
  }

  ngAfterViewChecked() {
    if (this._shouldApplyClass) {
      this.setShouldShowTooltip(this.isEllipsisActive(this.textWrapper.nativeElement));
    }
  }
}
