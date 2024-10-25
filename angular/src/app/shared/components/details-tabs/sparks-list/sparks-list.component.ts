import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { take, finalize, takeUntil } from 'rxjs/operators';
import { ServerList } from '../../../cs/server-list';
import { convertToCSV, exportClientFile } from '../../../../utils/functions';
import * as moment from 'moment';

@Component({
  selector: 'sparks-list',
  templateUrl: './sparks-list.component.html',
  styleUrls: ['./sparks-list.component.scss'],
})
export class SparksListComponent extends ServerList implements OnInit, OnDestroy {
  @Input() source;

  sparks;
  sparkUrl = 'https://community.blueliv.com/#!';

  constructor() {
    super();
  }

  ngOnInit() {
    this.reloadData();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  exportToCSV() {
    const items = this.getExportableData(this.getCheckedItems());
    exportClientFile(convertToCSV(items), 'sparks');
  }

  exportToJson() {
    const items = this.getExportableData(this.getCheckedItems());
    exportClientFile(JSON.stringify(items), 'sparks', 'json');
  }

  protected reloadData() {
    const params = { page: this.page, limit: this.limit };
    this.loading = true;
    const source$ = this.source(params);
    source$
      .pipe(
        takeUntil(this.destroy$),
        take(1),
        finalize(() => (this.loading = false))
      )
      .subscribe(({ data, meta }) => {
        this.bulk = false;
        this.items = data.map((item) => {
          const URL = `${this.sparkUrl}/s/${item.attributes.community_id}`;
          return { ...item.attributes, URL, id: item.id };
        });
        if (meta) {
          this.count = meta.pagination.count;
        }
      });
  }

  private getExportableData(items) {
    return items.map((item) => {
      return {
        NAME: item.name,
        TAGS: (item.tags || []).join(','),
        TLP: item.tlp,
        DATE: moment(item.date, 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY'),
        LINK: item.URL || '',
      };
    });
  }
}
