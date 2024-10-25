import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TcxTypes } from 'app/shared/utils/common.utils';

export interface IQuickFilter {
  title: string;
  filters: { name: string; dork: string; markAsDefault?: boolean }[];
  filters2?: { name: string; dork: string }[];
}

@Component({
  selector: 'app-tcx-quick-filters',
  templateUrl: './tcx-quick-filters.component.html',
  styleUrls: ['./tcx-quick-filters.component.scss']
})
export class TcxQuickFiltersComponent {
  isOpen = false;
  openEditModal = false;
  @Input() items: IQuickFilter[] = [];
  @Input() tcxType: TcxTypes | '' = '';
  @Output() changeMethod = new EventEmitter();
  @Output() editSavedFilters = new EventEmitter();

  selectFilter(filter, event) {
    event.preventDefault();
    this.changeMethod.emit(filter);
    this.isOpen = false;
  }

  onEditSavedFilters(event) {
    event.preventDefault();
    this.onEditFilters(true);
    this.isOpen = false;
  }

  onEditFilters(event: boolean) {
    this.openEditModal = event;
  }
}
