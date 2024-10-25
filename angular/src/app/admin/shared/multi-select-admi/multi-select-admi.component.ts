import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { Subject, fromEvent } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'multi-select2',
  templateUrl: './multi-select-admi.component.html',
  styleUrls: ['./multi-select-admi.component.scss']
})
export class MultiSelectAdmiComponent implements OnChanges {
  @Input() isDisabled = false;
  @Input() isShow = false;
  @Input() listItems = [];
  @Input() forButton = true;
  @Input() control: any;
  @Output() controlChange = new EventEmitter();
  @Input() isMenuOpened = false;
  @Output() editItem = new EventEmitter();
  @Output() closed = new EventEmitter();
  @Input() title: any;
  @Input() valueKey: any;
  @Input() viewKey: any;
  @Input() styles: any;
  icon = [];
  documentEvent$: any;
  elementRef;
  private readonly destroy$ = new Subject<void>();

  get title_view() {
    return this.title || 'Selected...';
  }

  constructor(myElement: ElementRef, protected fb: UntypedFormBuilder, private cd: ChangeDetectorRef) {
    this.elementRef = myElement;
    this.handleClick();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.cd.detectChanges();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleMenu() {
    this.isMenuOpened = !this.isMenuOpened;
  }

  selectOption(a) {
    const index = this.indexOption(a);
    index === -1 ? this.addControl(this.control, this.valueObj(a)) : this.control.removeAt(index);
    this.isShow = true;
    this.loadItem();
  }

  loadItem() {
    this.editItem.emit(this.control.getRawValue());
    this.controlChange.emit(this.control);
  }

  indexOption(option) {
    const obj = this.valueObj(option);
    if (!this.control) {
      this.control = this.fb.array([]);
    }
    const valAux = this.control.getRawValue() || [];
    const retorno = valAux.findIndex((e) => {
      let compare = e;
      if (typeof e === 'object') {
        compare = this.valueObj(e);
      }
      if (typeof e === 'string') {
        const check = parseInt(e, 10);
        compare = check.toString() !== 'NaN' ? check : e;
      }
      return JSON.stringify(compare) === JSON.stringify(obj);
    });
    return retorno;
  }

  handleClick() {
    this.documentEvent$ = fromEvent(document, 'click')
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: any) => {
        if (!this.elementRef.nativeElement.contains(event.target)) {
          this.isMenuOpened = false;
          this.closed.emit(null);
        }
      });
  }

  addControl(form: any, value, key = null) {
    if (key) {
      if (!form.controls[key]) {
        form.addControl(key, this.fb.array([]));
      }
      form = form.controls[key];
    }

    if (typeof value !== 'object') {
      form.push(new UntypedFormControl(value));
    }

    if (typeof value === 'object') {
      const group = this.fb.group({});
      for (const ka of Object.keys(value)) {
        this.addControl2(group, value[ka], ka);
      }
      form.push(group);
    }
    this.loadItem();
  }

  addControl2(form: any, value, key = null) {
    if (Array.isArray(value)) {
      if (key && !form.controls[key]) {
        form.addControl(key, this.fb.array([]));
      }
      form = form.controls[key];
      for (const item of value) {
        if (typeof item !== 'object') {
          form.push(new UntypedFormControl(item));
        }
      }
    } else {
      form.addControl(key, new UntypedFormControl(value));
    }
    this.loadItem();
  }

  getViewLabel(item) {
    if (this.viewKey && Array.isArray(this.viewKey)) {
      const obj = <any>{};
      for (const a of this.viewKey) {
        obj[a] = item[a];
      }
      return obj.join(' ');
    } else if (this.viewKey && !Array.isArray(this.viewKey)) {
      return item[this.viewKey];
    }
    return item;
  }

  valueObj(a) {
    let retorno = a;
    if (this.valueKey && Array.isArray(this.valueKey)) {
      retorno = <any>{};
      for (const item of this.valueKey) {
        retorno[item] = a[item];
      }
    }

    if (this.valueKey && typeof this.valueKey !== 'object') {
      retorno = a[this.valueKey];
    }

    return retorno;
  }
}
