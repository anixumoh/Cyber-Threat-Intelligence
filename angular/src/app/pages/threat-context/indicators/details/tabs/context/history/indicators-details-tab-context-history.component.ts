import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { finalize, take, takeUntil } from 'rxjs/operators';
import { ServerList } from '../../../../../../../shared/cs/server-list';
import { IndicatorsService } from '../../../../../../../core/models/indicators.service';
import { IndicatorTypes } from '../../../../Indicator.types';
import { IndicatorsBackendRequestTypes } from '../../../../indicators-backend-request.types';
import { OrganizationService } from '../../../../../../../dashboard/organization/organization.service';
import { defang } from 'fanger';
import { NewTabService } from 'app/services/new-tab.service';
import { convertToCSV, copyToClipboard, exportClientFile } from '../../../../../../../utils/functions';
import * as moment from 'moment';
import { isDomain, isIp, isURL } from '../../../../../../../shared/utils/hash.utils';
import { ThreatContextNavigationService } from 'app/shared/components/threat-context-navigation/threat-context-navigation.service';

@Component({
  selector: 'app-indicators-details-tab-context-history',
  templateUrl: './indicators-details-tab-context-history.component.html',
  styleUrls: ['./indicators-details-tab-context-history.component.scss']
})
export class IndicatorsDetailsTabContextHistoryComponent extends ServerList implements OnInit, OnDestroy {
  @Input() indicatorType;
  @Input() indicatorId;
  activeModule;
  activeOrganization;
  showDefangCopyToClipboardPopup = false;
  defangExportType: 'json' | 'csv' | null = null;

  constructor(
    private indicatorsService: IndicatorsService,
    private organizationService: OrganizationService,
    private threatContextNavigationService: ThreatContextNavigationService,
    private newTabService: NewTabService
  ) {
    super();
  }

  ngOnInit() {
    this.organizationService
      .getCurrentContext()
      .pipe(takeUntil(this.destroy$), take(1))
      .subscribe((context) => {
        this.activeModule = context.currentModule;
        this.activeOrganization = context.currentOrganization;
      });

    this.reloadData();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  tryCopyToClipboard() {
    const items = this.getCheckedItems();
    if (this.isDefangNeededForKey(items, 'description')) {
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
    exportClientFile(convertToCSV(items), 'history');
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
    exportClientFile(JSON.stringify(items), 'history', 'json');
  }

  details(event, { id, subtype, value, description }) {
    if (event.target.type === 'checkbox' || event.target.className.includes('icon-copy')) {
      return;
    }

    if (this.isAnIndicator(subtype)) {
      const indicatorType = subtype.toLowerCase();
      const indicatorId = indicatorType === IndicatorTypes.CrimeServer.toLowerCase() ? id : value;
      if (indicatorType) {
        const path = `indicators/${
          indicatorType === IndicatorTypes.CrimeServer.toLowerCase()
            ? IndicatorsBackendRequestTypes.CrimeServer
            : indicatorType
        }/resource/${indicatorId}`;
        const url = `/dashboard/organizations/${this.activeOrganization.id}/modules/${this.activeModule.id}/threat_context/${path}`;
        const navigation = this.threatContextNavigationService.getNavigation(description, path);
        this.newTabService.openNewTab(event, url, { navigation });
      }
    }
  }

  reloadData() {
    const params = { limit: this.limit, page: this.page };
    this.loading = true;
    this.indicatorsService
      .getGenericDetails({
        id: this.indicatorId,
        type: this.indicatorType,
        extension: 'history',
        params
      })
      .pipe(
        takeUntil(this.destroy$),
        take(1),
        finalize(() => (this.loading = false))
      )
      .subscribe(({ data, meta }) => {
        if (data) {
          this.bulk = false;
          this.items = data.map((item) => ({
            ...item.attributes,
            id: item.id,
            isAnIndicator: this.isAnIndicator(item.attributes.subtype)
          }));
          if (meta) {
            this.count = meta.pagination.count;
          }
        }
      });
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

  private isAnIndicator(type: string): boolean {
    if (type) {
      const typeInLowerCase = type.toLocaleLowerCase();
      switch (typeInLowerCase) {
        case IndicatorTypes.CrimeServer.toLocaleLowerCase():
        case IndicatorTypes.FQDN.toLocaleLowerCase():
        case IndicatorTypes.IP.toLocaleLowerCase():
        case IndicatorTypes.Malware.toLocaleLowerCase():
          return true;
      }
    }
    return false;
  }

  private getExportableData(items) {
    return items.map((item) => {
      return {
        RISK: item.risk,
        TYPE: item.subtype,
        SUBTYPE: item.ioc_types.join(', '),
        VALUE: item.description,
        'FIRST SEEN': moment(item.first_seen, 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY'),
        'LAST SEEN': moment(item.last_seen, 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY')
      };
    });
  }
}
