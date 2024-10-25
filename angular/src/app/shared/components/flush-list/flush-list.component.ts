import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';

export interface IFlushListItem {
  title: string;
  icon: string;
  value: string;
  loading?: boolean;
  queryParams?: any;
  link?: string[];
  warningMessage?: string;
}

@Component({
  selector: 'app-flush-list',
  templateUrl: './flush-list.component.html',
  styleUrls: ['./flush-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FlushListComponent {
  @Input() data: IFlushListItem[] = [];
  @Input() mode: 'normal' | 'bold' = 'normal';
  @Input() placement = 'left';
  @Output() clickItem = new EventEmitter();

  clickEntry(entry) {
    this.clickItem.emit(entry);
  }
}
