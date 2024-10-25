import { Component, EventEmitter, Input, Output, SimpleChanges, OnChanges } from '@angular/core';
import { TableConfig } from '../table-config';

@Component({
  selector: 'app-table-admin',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnChanges {
  isMenuOpened = false;
  optionMaxRows = [10, 15, 30, 50, 100];

  maxVisor = 10;
  lastIndex = this.maxVisor;
  pages = [];
  settingPagination = false;
  _selectedAll: boolean;

  @Input() table: TableConfig;
  @Input() keyRowSelected = 'isSelected';
  @Input() keyMaxRow = 'num_regs';
  @Input() isPaginate = true;
  @Input() isRowSelected = true;
  @Input() isNumberOfItemsSelected = true;
  @Input() template_outlet: any = {};
  @Input() template_header = [];
  @Input() editSuperadminOnly = false;
  @Input() template_footer: any;
  @Output() rowClick = new EventEmitter();
  @Input() isEdit = true;
  @Input() isDelete = true;
  @Output() editEmitter = new EventEmitter();
  @Output() deleteEmmiter = new EventEmitter();
  @Output() updateTable = new EventEmitter();
  @Output() reloadEmitter = new EventEmitter();
  @Output() sortEmmiter = new EventEmitter();
  @Input() hiddenBody = false;
  @Input()
  set allItemsSelected(selectedAll: boolean) {
    this._selectedAll = selectedAll || false;
  }

  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
    const { table } = changes;
    if (table?.currentValue !== table?.previousValue && !!table?.currentValue?.pagination) {
      this.resetPagination();
    }
  }

  resetPagination() {
    setTimeout(() => {
      this.setLastIndex();
      this.setPages();
    });
  }

  sort(data) {
    this.sortEmmiter.emit(data);
  }

  getClassTD(header, item) {
    let retorno = ' align-middle ';
    if (header.class) {
      retorno += header.class;
    }

    retorno += header.hasDetail ? ' cursor-pointer text-primary ' : ' ';
    return retorno;
  }

  getContext(row) {
    return { $implicit: row };
  }

  selectedAll() {
    this._selectedAll = !this._selectedAll;
    for (let i = 0; i < this.rows.length; i++) {
      this.table.results.list[i][this.keyRowSelected] = this._selectedAll;
    }
    this.emitTable();
  }

  get itemSelected() {
    return this.rows.filter((e) => e[this.keyRowSelected] === true);
  }

  get rows() {
    const retorno = [];
    if (this.table && this.table.results && this.table.results.list) {
      retorno.push(...this.table.results.list);
    }
    return retorno;
  }

  selectedRow(item) {
    item[this.keyRowSelected] = !item[this.keyRowSelected];
    this._selectedAll = this.rows.length === this.itemSelected.length;
    this.emitTable();
  }

  emitTable() {
    this.updateTable.emit(this.table);
  }

  get pagination() {
    if (this.isPaginate) {
      return this.table.pagination || { num_regs: 10 };
    }
    return { num_regs: 10 };
  }

  reload() {
    this.emitTable();
    this.reloadEmitter.emit(null);
    this._selectedAll = false;
  }

  changePagination(a) {
    this.pagination[this.keyMaxRow] = a;
    this.changePage(1);
  }

  changePage(e) {
    if (e > 0 && e <= this.totalPages) {
      this.pagination.page = e;
      this.setLastIndex();
      this.setPages();
      this.reload();
    }
  }

  changePageWithoutReload(e) {
    if (e > 0 && e <= this.totalPages) {
      this.pagination.page = e;
    }
  }

  changeSort() {
    this.pagination.sort = !this.pagination.sort;
    this.reload();
  }

  get totalPages() {
    if (this.table.results.total_resources) {
      let retorno = Number(this.table.results.total_resources / this.pagination[this.keyMaxRow]);
      retorno = Math.ceil(retorno);
      if (this.table.results.total_resources && this.settingPagination === false) {
        this.settingPagination = true;
        this.resetPagination();
      }
      return retorno || 0;
    }
    return 0;
  }

  onActionClick(header, item) {
    if (header && header.hasDetail) {
      this.rowClick.emit({
        header,
        data: item
      });
    }
  }

  setPages(): void {
    const pages = [];
    if (this.lastIndex <= this.maxVisor) {
      for (let i = 1; i <= this.lastIndex; i++) {
        pages.push(i);
      }
    } else {
      const current = this.pagination?.page || 1;
      let left = 1;
      let right = this.maxVisor;
      if (current > Math.ceil(this.maxVisor / 2)) {
        left = current - Math.ceil(this.maxVisor / 2);
        right =
          current + Math.ceil(this.maxVisor / 2) - 1 <= this.totalPages
            ? current + Math.ceil(this.maxVisor / 2) - 1
            : this.totalPages;
      }
      for (let i = left; i <= right; i++) {
        pages.push(i);
      }
    }
    this.pages = pages;
  }

  setLastIndex(): void {
    if (this.maxVisor - this.pagination?.page >= Math.ceil(this.maxVisor / 2)) {
      this.lastIndex = this.maxVisor <= this.totalPages ? this.maxVisor : this.totalPages;
    } else {
      if (this.pagination?.page + Math.ceil(this.maxVisor / 2) <= this.totalPages) {
        this.lastIndex = this.pagination.page + Math.ceil(this.maxVisor / 2);
      } else {
        this.lastIndex = this.totalPages;
      }
    }
  }

  setClass(classes: string) {
    if (classes) {
      return classes.includes('text-center') ? 'justify-content-center' : classes;
    }
  }
}
