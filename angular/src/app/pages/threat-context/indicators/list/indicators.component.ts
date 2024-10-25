import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize, take, takeUntil } from 'rxjs/operators';
import { ServerList } from '../../../../shared/cs/server-list';
import { OrganizationService } from '../../../../dashboard/organization/organization.service';
import { IndicatorsService } from '../../../../core/models/indicators.service';
import { IndicatorTypes } from '../Indicator.types';
import { IndicatorsBackendRequestTypes } from '../indicators-backend-request.types';
import { ToastrService } from 'ngx-toastr';
import { ModuleModel, OrganizationModel } from 'app/dashboard/organization/models';
import { NewTabService } from 'app/services/new-tab.service';
import { IQuickFilter } from '../../../../shared/components/tcx-quick-filters/tcx-quick-filters.component';
import moment from 'moment';
import { defang } from 'fanger';
import { convertToCSV, copyToClipboard, exportClientFile } from '../../../../utils/functions';
import { UserAccountService } from 'app/dashboard/user/account.service';

const uiDownloadingByHashState = {
  listing: 'listing',
  downlading: 'downlading',
  indexing: 'indexing'
};

@Component({
  selector: 'app-indicators',
  templateUrl: './indicators.component.html',
  styleUrls: ['./indicators.component.scss']
})
export class IndicatorsComponent extends ServerList implements OnInit, OnDestroy {
  dorkFields = [];
  showModal = false;
  lastItem;
  activeModule: ModuleModel;
  activeOrganization: OrganizationModel;
  listError = '';
  malwareHashToDownload: string;
  downloadingByHashState = uiDownloadingByHashState.listing;
  uiDownloadingByHashState = uiDownloadingByHashState;
  currentYear = new Date().getFullYear();
  quickFilters: IQuickFilter[] = [
    {
      title: `New indicators in ${this.currentYear}`,
      filters: [
        { name: `New indicators in ${this.currentYear}`, dork: `first_seen:>=${this.currentYear}-01-01` },
        {
          name: `New malware in ${this.currentYear}`,
          dork: `first_seen:>=${this.currentYear}-01-01 AND type:"Malware"`
        },
        { name: `New IPs in ${this.currentYear}`, dork: `first_seen:>=${this.currentYear}-01-01 AND type:"IP"` },
        { name: `New domains in ${this.currentYear}`, dork: `first_seen:>=${this.currentYear}-01-01 AND type:"FQDN"` },
        {
          name: `New crimeservers in ${this.currentYear}`,
          dork: `first_seen:>=${this.currentYear}-01-01 AND type:"CrimeServer"`
        }
      ]
    }
  ];
  showDefangCopyToClipboardPopup = false;
  defangExportType: 'json' | 'csv' | null = null;

  constructor(
    private organizationService: OrganizationService,
    private route: ActivatedRoute,
    private indicatorsServide: IndicatorsService,
    private toastrService: ToastrService,
    private newTabService: NewTabService,
    private accountService: UserAccountService
  ) {
    super();
    this.limit = 50;
    this.sort = '-first_seen';
  }

  ngOnInit() {
    this.loading = true;
    this.organizationService
      .getCurrentContext()
      .pipe(takeUntil(this.destroy$), take(1))
      .subscribe((context) => {
        this.activeModule = context.currentModule;
        this.activeOrganization = context.currentOrganization;
      });

    const { dork } = this.route.snapshot.queryParams;
    if (dork) {
      this.searchText = dork;
    }

    this.indicatorsServide
      .getOptions()
      .pipe(takeUntil(this.destroy$), take(1))
      .subscribe(({ data }) => {
        if (data) {
          this.dorkFields = this.improveDorks(data.dork_fields);
        }
        this.accountService.getSaveDorks('indicators', this.quickFilters);
        this.loadSavedSearches();
        this.reloadData();
      });
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
    const key = 'INDICATOR';
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
    if (this.isDefangNeededForKey(items, 'INDICATOR')) {
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
    exportClientFile(convertToCSV(items), 'indicators');
  }

  exportToJson() {
    const items = this.getExportableData(this.getCheckedItems());
    if (this.isDefangNeededForKey(items, 'INDICATOR')) {
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
    exportClientFile(JSON.stringify(items), 'indicators', 'json');
  }

  improveDorks(dorks) {
    for (const key in dorks) {
      if (dorks.hasOwnProperty(key)) {
        switch (key) {
          case 'type':
            dorks[key].description = `The indicator type. Options: IP | FQDN | CrimeServer | Malware (case sensitive).`;
            break;
          case 'value':
            dorks[
              key
            ].description = ` The actual value of the indicator, the IP, the domain, etc. Example: <span class="set-dork-example">value:"google.com"</span>.`;
            break;
          case 'first_seen':
            dorks[
              key
            ].description = `The first time the indicator was seen by Blueliv. Example: <span class="set-dork-example">first_seen:${this.currentYear}-05-15</span>`;
            break;
          case 'last_seen':
            dorks[
              key
            ].description = `The last time the indicator was seen by Blueliv. Example: <span class="set-dork-example">last_seen:<${this.currentYear}-03-22</span>`;
            break;
        }
      }
    }
    delete dorks.created_at;
    delete dorks.updated_at;
    delete dorks.id;
    return dorks;
  }

  search() {
    this.downloadingByHashState = uiDownloadingByHashState.listing;
    this.reload();
  }

  onMalwareDownloadComplete(status: boolean) {
    if (status) {
      this.toastrService.success('Hash has been successfully processed', 'Success ');
      this.downloadingByHashState = uiDownloadingByHashState.indexing;
      setTimeout(() => {
        this.reloadData();
      }, 3000);
    } else {
      this.toastrService.error('Error proccesing the hash', 'Failed');
      this.downloadingByHashState = uiDownloadingByHashState.listing;
    }
  }

  details(event, { id, type, value }) {
    if (event.target.type === 'checkbox' || event.target.className.includes('icon-copy')) {
      return;
    }
    const indicatorType = type.toLowerCase();
    const indicatorId = indicatorType === IndicatorTypes.CrimeServer.toLowerCase() ? id : value;

    const url = `/dashboard/organizations/${this.activeOrganization.id}/modules/${
      this.activeModule.id
    }/threat_context/indicators/${
      indicatorType === IndicatorTypes.CrimeServer.toLowerCase()
        ? IndicatorsBackendRequestTypes.CrimeServer
        : indicatorType
    }/resource/${indicatorId}`;

    if (indicatorType) {
      this.newTabService.openNewTab(event, url, { dork: this.searchText });
    } else {
      this.toastrService.error('There was an error opening the link.', 'Error');
    }
  }

  getTags(tags) {
    if (tags && tags.length > 0) {
      return tags.join(', ');
    }
    return '-';
  }

  reloadData() {
    this.listError = '';
    this.loading = true;
    let params = { limit: this.limit, page: this.page, sort: this.sort };
    if (this.searchText) {
      // Use same RegExp that is used in thiapp to know if it's dork search
      // thiapp file -> src/app/shared/backend/crud.service.ts line:138

      if (this.checkSearchCriteriaHasDorks()) {
        params = { ...params, ...{ dork: this.searchText } };
      } else {
        const text = this.searchText.replace(/[\s|;,\n\r]+/g, ',');
        if (text.includes(',')) {
          const newDork = this.limitDorkToBeSentByHttpGet(this.processSearchText(text));
          params = { ...params, ...{ dork: newDork.value } };
          this.searchText = newDork.value;
          if (newDork.lastItem) {
            this.lastItem = newDork.lastItem;
            this.showModal = true;
          }
        } else {
          params = {
            ...params,
            ...{
              filterValue: this.searchText,
              filterField: 'value'
            }
          };
        }
      }
    }
    this.indicatorsServide
      .list(params)
      .pipe(
        takeUntil(this.destroy$),
        take(1),
        finalize(() => (this.loading = false))
      )
      .subscribe(
        ({ data, meta }: any) => {
          if (data) {
            this.bulk = false;
            this.items = data.map(({ id, attributes }) => ({ id, ...attributes }));
            this.count = meta.pagination.count <= 10000 ? meta.pagination.count : 10000;
            this.totalResources = meta.pagination.count;

            // drop virusTotal Download https://blueliv.atlassian.net/browse/TC-1216
            //
            // if (this.downloadingByHashState === uiDownloadingByHashState.listing) {
            //   if (this.count === 0 && hashToDownload) {
            //     this.downloadingByHashState = uiDownloadingByHashState.downlading;
            //     this.malwareHashToDownload = hashToDownload;
            //   }
            // } else if (this.downloadingByHashState === uiDownloadingByHashState.indexing) {
            //   if (this.count === 0) {
            //     setTimeout(() => {
            //       this.list();
            //     }, 3000);
            //   } else {
            //     this.downloadingByHashState = uiDownloadingByHashState.listing;
            //   }
            // }
          }
        },
        (error) => {
          if (error.status === 500) {
            this.listError = 'There was a problem with the search request.';
          } else if (error.status === 400) {
            this.listError = this.searchText
              ? 'Incorrect dork syntax. Please, check the Syntax help to guide you with this problem.'
              : 'There was a problem with the search request.';
          }
        }
      );
  }

  onOpenModalDorks(value: boolean) {
    this.openModalDorks = value;
  }

  private processSearchText(text: string): string {
    if (text.includes(',')) {
      const items = [
        ...new Set(
          text
            .split(',')
            .slice(0, 100)
            .filter((item) => !!item)
            .map((item) => item.trim().toLowerCase())
        )
      ];
      const dorkLikeItems = items.map((item) => this.dorkingText(item));
      return dorkLikeItems.join(' OR ');
    } else {
      return text;
    }
  }

  private dorkingText(text) {
    return `value:"${text}"`;

    // if (isMD5(text)) {
    //   return `md5:"${text}"`
    // } else if (isSHA1(text)) {
    //   return `sha1:"${text}"`
    // } else if (isSHA256(text)) {
    //   return `sha256:"${text}"`
    // } else if (isSHA512(text)) {
    //   return `sha512:"${text}"`
    // } else if (isDomain(text)) {
    //   return `domain:"${text}"`
    // } else if (isIp(text)) {
    //   return `ip:"${text}"`
    // } else if (isURL(text)) {
    //   return `url:"${text}"`
    // } else {
    //   return `value:"${text}"`
    // }
  }

  private defang(items) {
    for (const item of items) {
      switch (item.TYPE.toLowerCase()) {
        case 'ip':
        case 'fqdn':
        case 'crimeserver':
          item.INDICATOR = defang(item.INDICATOR);
      }
    }
    return items;
  }

  private getExportableData(items) {
    return items.map((item) => {
      return {
        INDICATOR: item.value,
        TYPE: item.type,
        TAGS: this.getTags(item.tags),
        'FIRST SEEN': moment(item.first_seen, 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY'),
        'LAST SEEN': moment(item.last_seen, 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY')
      };
    });
  }
}
