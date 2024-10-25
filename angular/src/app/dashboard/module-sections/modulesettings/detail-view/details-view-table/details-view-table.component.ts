import { Component, OnInit, Input } from '@angular/core';
import { Grants } from 'app/services/grants/grants';

@Component({
  selector: 'app-details-view-table',
  templateUrl: './details-view-table.component.html',
  styleUrls: ['./details-view-table.component.scss'],
})
export class DetailsViewTableComponent implements OnInit {
  _items;
  _tableHeader;
  _interactive;
  isModalInfoOpen = false;

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
  set interactive(its) {
    this._interactive = its;
  }

  get interactive() {
    return this._interactive;
  }

  constructor(protected grants: Grants) {}

  ngOnInit() {}

  openInfoModal() {
    this.isModalInfoOpen = !this.isModalInfoOpen;
  }
}
