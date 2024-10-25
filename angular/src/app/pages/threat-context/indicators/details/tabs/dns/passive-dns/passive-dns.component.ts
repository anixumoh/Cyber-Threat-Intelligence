import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { finalize, take, takeUntil } from 'rxjs/operators';
import { ServerList } from '../../../../../../../shared/cs/server-list';
import { IndicatorsService } from '../../../../../../../core/models/indicators.service';
import { defang } from 'fanger';
import { convertToCSV, copyToClipboard, exportClientFile } from '../../../../../../../utils/functions';
import * as moment from 'moment';
import { isDomain, isIp, isURL } from '../../../../../../../shared/utils/hash.utils';

@Component({
  selector: 'app-passive-dns',
  templateUrl: './passive-dns.component.html',
  styleUrls: ['./passive-dns.component.scss'],
})
export class PassiveDnsComponent extends ServerList implements OnInit, OnDestroy {
  @Input() indicatorId;
  @Input() indicatorType;
  showDefangCopyToClipboardPopup = false;
  defangExportType: 'json' | 'csv' | null = null;

  constructor(private indicatorsService: IndicatorsService) {
    super();
  }

  ngOnInit() {
    this.reloadData();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  tryCopyToClipboard() {
    const items = this.getCheckedItems();
    if (this.isDefangNeededForKey(items, 'resolution')) {
      this.showDefangCopyToClipboardPopup = true;
    } else {
      this.copyToClipboardDefang(false);
    }
  }

  onCancelCopyToClipboardDefandPopup(abort) {
    this.showDefangCopyToClipboardPopup = false;
    if (!abort) {
      this.copyToClipboardDefang(false);
    }
  }

  copyToClipboardDefang(defangConfirmed = false) {
    this.showDefangCopyToClipboardPopup = false;
    const key = 'RESOLUTION';
    let items = this.getExportableData(this.getCheckedItems());
    if (defangConfirmed) {
      items = this.defang(items);
    }
    if (items && items.length > 0) {
      let clipboard = '';
      for (const item of items) {
        clipboard += item[key] + '\r\n';
      }
      copyToClipboard(clipboard);
    }
  }

  onConfirmDefangConfirmationPopup() {
    switch (this.defangExportType) {
      case 'csv':
        this.executeExportToCSV(true);
        break;
      case 'json':
        this.executeExportToJson(true);
        break;
    }
    this.defangExportType = null;
  }

  onCancelDefangConfirmationPopup(abort) {
    if (!abort) {
      switch (this.defangExportType) {
        case 'csv':
          this.executeExportToCSV(false);
          break;
        case 'json':
          this.executeExportToJson(false);
          break;
      }
    }
    this.defangExportType = null;
  }

  executeExportToCSV(defangConfirmed = false) {
    this.defangExportType = null;
    let items = this.getExportableData(this.getCheckedItems());
    if (defangConfirmed) {
      items = this.defang(items);
    }
    exportClientFile(convertToCSV(items), 'passive-dns');
  }

  exportToCSV() {
    const items = this.getExportableData(this.getCheckedItems());
    if (this.isDefangNeededForKey(items, 'RESOLUTION')) {
      this.defangExportType = 'csv';
    } else {
      this.executeExportToCSV();
    }
  }

  exportToJson() {
    const items = this.getExportableData(this.getCheckedItems());
    if (this.isDefangNeededForKey(items, 'RESOLUTION')) {
      this.defangExportType = 'json';
    } else {
      this.executeExportToJson();
    }
  }

  executeExportToJson(defangConfirmed = false) {
    this.defangExportType = null;
    let items = this.getExportableData(this.getCheckedItems());
    if (defangConfirmed) {
      items = this.defang(items);
    }
    exportClientFile(JSON.stringify(items), 'passive-dns', 'json');
  }

  reloadData() {
    const params = {};
    this.loading = true;
    this.indicatorsService
      .getGenericDetails({
        id: this.indicatorId,
        type: this.indicatorType,
        extension: 'enrichment/passive-dns',
        params,
      })
      .pipe(
        takeUntil(this.destroy$),
        take(1),
        finalize(() => (this.loading = false))
      )
      .subscribe(({ data }) => {
        this.bulk = false;
        this.items = data.attributes.resolutions || [];
      });
  }

  private defang(items) {
    for (const item of items) {
      const value = item.RESOLUTION;
      if (isIp(value) || isDomain(value) || isURL(value)) {
        item.RESOLUTION = defang(value);
      }
    }
    return items;
  }

  private getExportableData(items) {
    return items.map((item) => {
      return {
        RESOLUTION: item.resolution,
        'LAST SEEN': moment(item.last_seen, 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY'),
      };
    });
  }
}
