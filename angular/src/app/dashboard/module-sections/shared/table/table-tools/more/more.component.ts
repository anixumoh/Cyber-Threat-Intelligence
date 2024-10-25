import { Component, Input, EventEmitter, Output, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { Grants } from 'app/services/grants/grants';

@Component({
  selector: 'app-table-tools-more',
  templateUrl: './more.component.html',
  styleUrls: ['./more.component.scss'],
  host: {
    '(document:click)': 'onClickOutside($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoreComponent {
  selectedValue: string;
  isMenuOpened = false;

  @Input() items;
  @Input() selectedItem;
  @Input() onlyIssue;
  @Output() markAsRead = new EventEmitter();
  @Output() markAsUnread = new EventEmitter();
  @Output() markAsIssue = new EventEmitter();

  constructor(private el: ElementRef, public grants: Grants) {}

  toggleMenu() {
    this.isMenuOpened = !this.isMenuOpened;
  }

  onClickOutside(event) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.isMenuOpened = false;
    }
  }
}
