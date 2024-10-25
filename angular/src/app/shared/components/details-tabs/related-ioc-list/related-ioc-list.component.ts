import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { take, finalize, takeUntil } from 'rxjs/operators';

import { ServerList } from 'app/shared/cs/server-list';
import { OrganizationService } from '../../../../dashboard/organization/organization.service';
import { NewTabService } from 'app/services/new-tab.service';
import { convertToCSV, copyToClipboard, exportClientFile } from '../../../../utils/functions';
import { defang } from 'fanger';
import * as moment from 'moment';
import { ThreatContextNavigationService } from '../../threat-context-navigation/threat-context-navigation.service';

@Component({
  selector: 'related-ioc-list',
  templateUrl: './related-ioc-list.component.html',
  styleUrls: ['./related-ioc-list.component.scss']
})
export class RelatedIocListComponent extends ServerList implements OnInit, OnDestroy {
  @Input() indicatorType;
  @Input() indicatorId;
  @Input() source;
  @Input() showTitle = true;
  showDefangCopyToClipboardPopup = false;
  defangExportType: 'json' | 'csv' | null = null;
  orgId;
  moduleId;

  constructor(
    private router: Router,
    private organizationService: OrganizationService,
    private newTabService: NewTabService,
    private threatContextNavigationService: ThreatContextNavigationService
  ) {
    super();
  }

  ngOnInit() {
    this.organizationService
      .getCurrentContext()
      .pipe(takeUntil(this.destroy$), take(1))
      .subscribe((context) => {
        this.moduleId = context.currentModule.id;
        this.orgId = context.currentOrganization.id;
      });

    this.reloadData();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

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

  exportToCSV() {
    const items = this.getExportableData(this.getCheckedItems());
    if (this.isDefangNeededForKey(items, 'VALUE')) {
      this.defangExportType = 'csv';
    } else {
      this.executeExportToCSV();
    }
  }

  executeExportToCSV(defangConfirmed = false) {
    this.defangExportType = null;
    let items = this.getExportableData(this.getCheckedItems());
    if (defangConfirmed) {
      items = this.defang(items);
    }
    exportClientFile(convertToCSV(items), 'related-iocs');
  }

  exportToJson() {
    const items = this.getExportableData(this.getCheckedItems());
    if (this.isDefangNeededForKey(items, 'VALUE')) {
      this.defangExportType = 'json';
    } else {
      this.executeExportToJson();
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

  executeExportToJson(defangConfirmed = false) {
    this.defangExportType = null;
    let items = this.getExportableData(this.getCheckedItems());
    if (defangConfirmed) {
      items = this.defang(items);
    }
    exportClientFile(JSON.stringify(items), 'related-iocs', 'json');
  }

  details(event, { id, type, value }) {
    if (event.target.type === 'checkbox' || event.target.className.includes('icon-copy')) {
      return;
    }

    let path = '';
    switch (type) {
      case 'IP': {
        path = `indicators/ip/resource/${value}`;
        break;
      }
      case 'Malware': {
        path = `indicators/malware/resource/${value}`;
        break;
      }
      case 'CrimeServer': {
        path = `indicators/crime-server/resource/${id}`;
        break;
      }
      case 'FQDN': {
        path = `indicators/fqdn/resource/${value}`;
        break;
      }
    }

    if (path) {
      const link = `/dashboard/organizations/${this.orgId}/modules/${this.moduleId}/threat_context/${path}`;
      const navigation = this.threatContextNavigationService.getNavigation(value, path);
      this.newTabService.openNewTab(event, link, { navigation });
    }
  }

  seeMalwareReport({ value }, event) {
    event.stopImmediatePropagation();
    event.preventDefault();
    this.router.navigate([
      `/dashboard/organizations/${this.orgId}/modules/${this.moduleId}/threat_context/malwares/${value}/summary`
    ]);
  }

  reloadData() {
    this.loading = true;
    const source$ = this.source({ page: this.page, limit: this.limit });
    source$
      .pipe(
        takeUntil(this.destroy$),
        take(1),
        finalize(() => (this.loading = false))
      )
      .subscribe(({ data, meta }) => {
        if (data) {
          this.bulk = false;
          this.items = data.map((item) => ({ id: item.id, ...item.attributes }));
          if (meta) {
            this.count = meta.pagination.count;
          }
        }
      });
  }

  private defang(items) {
    for (const item of items) {
      switch (item.TYPE.toLowerCase()) {
        case 'ip':
        case 'fqdn':
        case 'crimeserver':
          item.VALUE = defang(item.VALUE);
      }
    }
    return items;
  }

  private getExportableData(items) {
    return items.map((item) => {
      return {
        RISK: item.risk,
        TYPE: item.type,
        SUBTYPE: item.ioc_types.join(', '),
        VALUE: item.value,
        'FIRST SEEN': moment(item.first_seen, 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY'),
        'LAST SEEN': moment(item.last_seen, 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY')
      };
    });
  }
}
