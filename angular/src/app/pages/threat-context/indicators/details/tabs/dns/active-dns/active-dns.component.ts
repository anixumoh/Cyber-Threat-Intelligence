import { Component, Input, OnInit } from '@angular/core';
import { convertToCSV, copyToClipboard, exportClientFile } from '../../../../../../../utils/functions';
import { ServerList } from '../../../../../../../shared/cs/server-list';
import { defang } from 'fanger';
import { isDomain, isIp, isURL } from '../../../../../../../shared/utils/hash.utils';

@Component({
  selector: 'app-active-dns',
  templateUrl: './active-dns.component.html',
  styleUrls: ['./active-dns.component.scss'],
})
export class ActiveDnsComponent extends ServerList {
  @Input() name = '';
  @Input() items = [];
  showDefangCopyToClipboardPopup = false;
  defangExportType: 'json' | 'csv' | null = null;

  tryCopyToClipboard() {
    const items = this.getCheckedItems();
    if (this.isDefangNeededForKey(items, 'value')) {
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
    const key = 'VALUE';
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
    exportClientFile(convertToCSV(items), `active-dns-${this.name}`);
  }

  exportToCSV() {
    const items = this.getExportableData(this.getCheckedItems());
    if (this.isDefangNeededForKey(items, 'VALUE')) {
      this.defangExportType = 'csv';
    } else {
      this.executeExportToCSV();
    }
  }

  exportToJson() {
    const items = this.getExportableData(this.getCheckedItems());
    if (this.isDefangNeededForKey(items, 'VALUE')) {
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
    exportClientFile(JSON.stringify(items), `active-dns-${this.name}`, 'json');
  }

  private defang(items) {
    for (const item of items) {
      const value = item.VALUE;
      if (isIp(value) || isDomain(value) || isURL(value)) {
        item.VALUE = defang(value);
      }
    }
    return items;
  }

  private getExportableData(items) {
    return items.map(item => {
      return {
        'RECORD CLASS': item.record_class,
        VALUE: item.value,
        TTL: item.ttl,
      };
    });
  }
}
