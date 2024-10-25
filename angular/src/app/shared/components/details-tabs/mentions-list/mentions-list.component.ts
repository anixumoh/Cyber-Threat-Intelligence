import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { take, finalize, takeUntil } from 'rxjs/operators';
import { parseDomain, fromUrl, ParseResultType } from 'parse-domain';
import { ServerList } from '../../../cs/server-list';
import { getMentionsCategoryLabel, mentionsCategoriesKeys } from './mentions-categories-keys';
import { convertToCSV, exportClientFile } from '../../../../utils/functions';
import * as moment from 'moment';

@Component({
  selector: 'mentions-list',
  templateUrl: './mentions-list.component.html',
  styleUrls: ['./mentions-list.component.scss'],
})
export class MentionsListComponent extends ServerList implements OnInit, OnDestroy {
  @Input() source;
  @Input() set initialFilterBy(data) {
    if (data) {
      this.mentionCategoriesModel = data;
      this.reload();
    }
  }
  mentionCategoriesModel = [];
  mentionsCategoriesKeys = mentionsCategoriesKeys;
  mentionsCategories = [];
  showLinkWarningModal = false;

  constructor() {
    super();
    this.limit = 10;
  }

  ngOnInit() {
    this.mentionsCategories = this.mentionsCategoriesKeys.map((item) => {
      return {
        name: getMentionsCategoryLabel(item),
        value: item,
      };
    });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  onCategoryFilter(event) {
    this.mentionCategoriesModel = event && event.length > 0 ? [event.pop()] : [];
    this.reload();
  }

  exportToCSV() {
    const items = this.getExportableData(this.getCheckedItems());
    exportClientFile(convertToCSV(items), 'mentions');
  }

  exportToJson() {
    const items = this.getExportableData(this.getCheckedItems());
    exportClientFile(JSON.stringify(items), 'mentions', 'json');
  }

  reloadData() {
    let params = { page: this.page, limit: this.limit };
    if (this.mentionCategoriesModel) {
      params = {
        ...params,
        ...{
          filterValue: this.mentionCategoriesModel.length ? this.mentionCategoriesModel : null,
          filterField: 'feed_source_category',
        },
      };
    }
    this.loading = true;
    const source$ = this.source?.(params);
    source$
      .pipe(
        takeUntil(this.destroy$),
        take(1),
        finalize(() => (this.loading = false))
      )
      .subscribe(({ data, meta }) => {
        this.bulk = false;
        let items = data.map((item) => {
          return { ...item.attributes, id: item.id };
        });
        items = items.map((item: any) => {
          item.riskClass = this.extractRiskScoreClass(item.risk_score);
          item.feedSourceCategoryLabel = getMentionsCategoryLabel(item.feed_source_category);
          item.disableLink = item.feedSourceCategoryLabel === 'DARKWEB';
          item.labels = item.labels.filter((label) => !!label);
          item.URL = this.buildUrl(item);
          return item;
        });
        this.items = items;
        if (meta) {
          this.count = meta.pagination.count;
        }
      });
  }

  private buildUrl(item) {
    const url = item.URL;
    if (item.feed_source_category === 'INTERNET_SCANNERS' && item.feed_source_subcategory === 'SHODAN') {
      const parseResult = parseDomain(fromUrl(url));
      if (parseResult.type === ParseResultType.Ip) {
        return `https://www.shodan.io/host/${parseResult.hostname}`;
      }
      return url;
    }
    return url;
  }

  private extractRiskScoreClass(riskValue): string {
    if (riskValue >= 0 && riskValue <= 20) {
      return 'table2__row--border-gray';
    } else if (riskValue > 20 && riskValue <= 50) {
      return 'table2__row--border-yellow';
    } else if (riskValue > 50 && riskValue <= 80) {
      return 'table2__row--border-orange';
    } else if (riskValue > 80 && riskValue <= 100) {
      return 'table2__row--border-red';
    }
    return 'table2__row--border-gray';
  }

  private getExportableData(items) {
    return items.map((item) => {
      return {
        TITLE: item.title || '',
        TAGS: (item.labels || []).join(','),
        TYPE: item.feedSourceCategoryLabel || '',
        DATE: moment(item.published_at, 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY'),
        LINK: item.URL || '',
      };
    });
  }
}
