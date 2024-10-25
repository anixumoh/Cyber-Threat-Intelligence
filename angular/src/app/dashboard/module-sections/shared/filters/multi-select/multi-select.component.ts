import {
  Component,
  OnInit,
  OnChanges,
  Input,
  EventEmitter,
  Output,
  ElementRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  HostListener,
  SimpleChanges,
} from '@angular/core';
import * as _ from 'lodash';
import { StatusDictionary } from 'app/shared/enums/status-dictionary';
import { UntypedFormGroup, UntypedFormArray, UntypedFormControl } from '@angular/forms';

@Component({
  selector: 'app-multi-select',
  templateUrl: './multi-select.component.html',
  styleUrls: ['./multi-select.component.scss'],
  host: {
    '(document:click)': 'onClickOutside($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiSelectComponent implements OnInit, OnChanges {
  isMenuOpened = false;
  _multiSelectTitle = 'Status';
  _isForm = false;
  _isShown = false;
  _selectedItems;
  _iconClass;
  multiSelectTitleChildren: string;
  _disabled = false;
  completeArray = [];
  page = 0;
  _num = 50;
  _selectedFilter = false;
  _dictionary;

  get children() {
    if (this.parentForm.get(this.multiSelectTitleChildren)) {
      return (this.parentForm.get(this.multiSelectTitleChildren) as UntypedFormArray).controls;
    } else {
      return [];
    }
  }

  @Input()
  set selectedItems(its) {
    this._selectedItems = its;
    this.completeArray = its;
  }
  get selectedItems() {
    return this._selectedItems;
  }

  @Input()
  set multiSelectTitle(its) {
    this._multiSelectTitle = its;
  }

  get multiSelectTitle() {
    return this._multiSelectTitle;
  }

  @Input()
  set isForm(its) {
    this._isForm = its;
  }

  get isForm() {
    return this._isForm;
  }

  @Input()
  set iconClass(its) {
    this._iconClass = its;
  }

  get iconClass() {
    return this._iconClass;
  }

  @Input()
  set dictionary(its) {
    if (its === 'StatusDictionary') {
      this._dictionary = StatusDictionary;
    }
  }

  get dictionary() {
    return this._dictionary;
  }

  @Input()
  set isShown(its) {
    this._isShown = its;
  }

  get isShown() {
    return this._isShown;
  }

  @Input('parentForm')
  public parentForm: UntypedFormGroup;

  @Input()
  set disabled(status) {
    this._disabled = status;
  }

  get disabled() {
    return this._disabled;
  }

  @Input()
  set limitRender(num) {
    if (this._selectedItems && num) {
      this._selectedItems = this._selectedItems.slice(0, num);
      this._num = num;
    }
  }

  @Input()
  set selectedFilter(b) {
    this._selectedFilter = b || false;
  }

  get selectedFilter() {
    return this._selectedFilter;
  }

  @Input() scrollPercent;

  @Output() clickItem = new EventEmitter();
  @Output() closeOthers = new EventEmitter();

  public childForm: UntypedFormGroup;

  constructor(private el: ElementRef, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    if (this.isForm) {
      this.multiSelectTitleChildren = this.multiSelectTitle.toLocaleLowerCase();
      this.parentForm.addControl(this.multiSelectTitleChildren, new UntypedFormArray([]));
      this.selectedItems.forEach((item, index) => {
        (this.parentForm.controls[this.multiSelectTitleChildren] as UntypedFormArray).push(
          new UntypedFormGroup({
            label: new UntypedFormControl(item.label),
            value: new UntypedFormControl(item.value),
            selected: new UntypedFormControl(item.selected),
          })
        );
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    this.selectedItems =
      changes.selectedItems && changes.selectedItems.currentValue
        ? changes.selectedItems.currentValue
        : this.selectedItems;
  }

  toggleMenu(e) {
    this.isMenuOpened = !this.isMenuOpened;
    this.closeOthers.emit();
  }

  onClickOutside(event) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.isMenuOpened = false;
    }
  }

  clickOnItem(e, index) {
    if (!this._disabled) {
      this.selectedItems[index].selected = !this.selectedItems[index].selected;
      if (this.isForm) {
        this.parentForm.value[this.multiSelectTitleChildren][index].selected = !this.parentForm.value[
          this.multiSelectTitleChildren
        ][index].selected;
      }
      this.clickItem.emit(this.selectedItems);
    }
  }

  @HostListener('scroll', ['$event'])
  onScroll(event) {
    if (this._selectedItems.length != this.completeArray.length) {
      let max = event.target.scrollHeight - event.target.offsetHeight;
      let actual = event.target.scrollTop;
      let percent = (1 - actual / max) * 100;
      if (percent < this.scrollPercent) {
        this.page += 1;
        this._selectedItems = this._selectedItems.concat(
          this.completeArray.slice(this._num * this.page, this._num * (this.page + 1))
        );
      }
    }
  }
}
