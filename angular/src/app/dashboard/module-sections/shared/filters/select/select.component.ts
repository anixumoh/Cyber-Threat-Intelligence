import { Component, OnInit, Input, EventEmitter, Output, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import * as _ from 'lodash';
@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  host: {
    '(document:click)': 'onClickOutside($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectComponent implements OnInit {
  isMenuOpened = false;
  _selectTitle: string = 'Status';
  _selectedItems: any[];

  @Input()
  set selectedItems(its) {
    this._selectedItems = its;
    if (this._selectedItems) {
      this._selectedItems.forEach((element) => {
        if (element.selected) {
          this.selectTitle = element.label;
        }
      });
    }
  }

  get selectedItems() {
    return this._selectedItems;
  }

  @Input()
  set selectTitle(its) {
    this._selectTitle = its;
  }

  get selectTitle() {
    return this._selectTitle;
  }

  @Input() selectedFilter;
  @Input() isScroll: boolean = false;
  @Input() disableScroll: boolean = false;

  @Output() clickItem = new EventEmitter();
  @Output() closeOthers = new EventEmitter();

  constructor(private el: ElementRef) {}

  ngOnInit() {
    if (this.selectedItems) {
      this.selectedItems.forEach((element) => {
        if (element.selected) {
          this.selectTitle = element.label;
        }
      });
    }
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
    if (this.selectedItems && !this.disableScroll) {
      this.selectedItems.forEach((element) => {
        element.selected = false;
      });
      this.selectedItems[index].selected = !this.selectedItems[index].selected;
      this.isMenuOpened = !this.isMenuOpened;
      this.clickItem.emit(this.selectedItems);
    }
  }
}
