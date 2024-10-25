import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./table.component.scss']
})
export class TableComponent {
  @Input() loading = false;
  @Input() items = [];
  @Input() class = '';
  @Input() noItems = 'There are no resources';
  @Input() sm = false;
  @Input() isFromAdmin = false;
  robot = true;
}
