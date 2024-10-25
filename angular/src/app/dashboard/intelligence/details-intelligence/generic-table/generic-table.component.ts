import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NewTabService } from 'app/services/new-tab.service';

@Component({
  selector: 'app-generic-table',
  templateUrl: './generic-table.component.html',
  styleUrls: ['./generic-table.component.scss'],
})
export class GenericTableComponent implements OnInit {
  _items;
  _tableHeader;
  _loading;
  _errorMessage: string = 'There are no results';

  @Output() navigateTo = new EventEmitter<any>();

  @Input() isClickable: boolean = true;

  @Input()
  set errorMessage(its) {
    if (its) {
      this._errorMessage = its;
    }
  }

  get errorMessage() {
    return this._errorMessage;
  }

  @Input() robotSnippet: boolean = false;
  @Input() alertSnippet: boolean = false;

  @Input()
  set items(its) {
    this._items = its;
  }

  get items() {
    return this._items;
  }

  @Input()
  set tableHeader(its) {
    this._tableHeader = its;
  }

  get tableHeader() {
    return this._tableHeader;
  }

  @Input()
  set loading(its) {
    this._loading = its;
  }

  get loading() {
    return this._loading;
  }

  constructor(private newTabService: NewTabService) {}

  ngOnInit() {}

  navigateToDetail(event, it) {
    this.newTabService.openNewTab(event, it.customLink[0]);
  }

  navigateExternal(url) {
    if (url) {
      window.open(url, '_blank');
    }
  }
}
