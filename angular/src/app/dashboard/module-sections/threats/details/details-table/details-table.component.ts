import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { getHumanReadableDate, ellipseUrl, ellipseText } from 'app/utils/functions';
import { resourceTypes } from '../../../../../shared/enums/resource-types';
import { ResourcesService } from 'app/services/resources.service';
import { Grants } from 'app/services/grants/grants';
import { ServerList } from 'app/shared/cs/server-list';
import { UserAccountService } from 'app/dashboard/user/account.service';

@Component({
  selector: 'app-details-table',
  templateUrl: './details-table.component.html',
  styleUrls: ['./details-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetailsTableComponent extends ServerList implements OnInit, OnDestroy {
  @Input()
  set resource(r) {
    this._resource = r;
    if (this._resource) {
      this.resourceData();
      this.tableHeaders();
    }
  }
  @Input()
  set moduleName(name) {
    this._moduleName = name;
  }
  @Input()
  set moduleId(id) {
    this._moduleId = id;
  }
  @Input() loading;
  @Output() loadDataEvent = new EventEmitter();

  get resource() {
    return this._resource;
  }

  get moduleName() {
    return this._moduleName;
  }

  get moduleId() {
    return this._moduleId;
  }

  heads = [];
  _moduleName: string;
  _resource: any;
  _moduleId: any;
  columnToShow = [];
  items = [];
  showUrl = false;
  showIp = false;
  showType = false;
  showDomainUrl = false;
  showEmail = false;
  showBotModal = false;
  stolenType = true;
  showClassification = false;
  cardNumber;
  showExpiration;
  showCVV;
  showOwner;
  showSource;
  showValidation;
  selectedItem;
  bulk = false;
  selectedTodelete;
  isBulkDeleteConfirmationOpened = false;
  isDeleteConfirmationOpened = false;
  isBulkDeleteLoading = false;
  isDeleteLoading = false;
  allClassification = [];
  customerClassification = [];
  employeeClassification = [];
  externalClassification = [];
  unclassifiedClassification = [];
  selectedClassification = 'ALL';
  isCustomerAndGlobal: boolean;
  classificationType = ['ALL', 'EMPLOYEE', 'CUSTOMER', 'EXTERNAL', 'UNCLASSIFIED'];
  initMaxRows: number;
  noData: boolean;
  showTable = false;

  constructor(
    private resourcesService: ResourcesService,
    private grants: Grants,
    private toastrService: ToastrService,
    private userAccountService: UserAccountService
  ) {
    super();
    this.isCustomerAndGlobal = this.grants.isCustomer() && this.grants.isGlobalCustomer();
  }

  ngOnInit() {
    this.userAccountService
      .getState()
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        this.initMaxRows = state && state.defaultRows ? state.defaultRows : this.limits[0].value;
        if (this._moduleName) {
          this.resourceData(true, this.initMaxRows);
          this.tableHeaders();
        }
      });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  openBotModal(item) {
    this.selectedItem = item;
    this.showBotModal = true;
  }

  closeBotModal() {
    this.showBotModal = false;
  }

  resourceData(firstPage = false, initMaxRows?: any) {
    if (initMaxRows) {
      this.limit = initMaxRows;
    }
    this.page = firstPage ? 0 : this.page;
    if (this._moduleName === 'credential') {
      this.showTable = true;
      this.showUrl = false;
      this.showIp = false;
      this.showType = false;
      this.showDomainUrl = false;
      this.showEmail = false;

      this.allClassification = this.resource.credentials;
      this.employeeClassification = this.resource.credentials.filter((item) => item.classification === 'EMPLOYEE');
      this.customerClassification = this.resource.credentials.filter((item) => item.classification === 'CUSTOMER');
      this.externalClassification = this.resource.credentials.filter((item) => item.classification === 'EXTERNAL');
      this.unclassifiedClassification = this.resource.credentials.filter(
        (item) => item.classification === 'UNCLASSIFIED'
      );

      this.items = this.getItemsPaginated();

      this.noData = this.items.length === 0;
      if (this._resource.resource_type !== resourceTypes.BOTIP) {
        this.columnToShow = ['username', 'password', 'reported'];
      } else {
        this.columnToShow = ['reported'];
      }
      this.items.forEach((it) => {
        const username = it.username || it.userName ? it.username || it.userName : '-';
        const password = it.hash || it.userPassword || it.password ? it.hash || it.userPassword || it.password : '-';
        const originalUrl = it.Url || it.portalUrl || '-';
        const url = it.url || it.portalUrl ? it.url || it.portalUrl : '-';
        const ip = it.botIp || it.botip ? it.botIp || it.botip : '-';
        const type = it.type || it.Type ? it.type || it.Type : '-';
        const date =
          it.reportedAt || it.reportedat
            ? getHumanReadableDate(it.reportedAt) || getHumanReadableDate(it.reportedat)
            : '-';
        const domainUrl = it.domainUrl ? it.domainUrl : '-';
        const classification = it.classification ? it.classification : '-';
        const email = it.email ? it.email : '-';
        if (url !== '-' && !this.showUrl) {
          this.showUrl = true;
          this.columnToShow.push('url');
        }
        if (ip !== '-' && !this.showIp) {
          this.showIp = true;
          this.columnToShow.push('ip');
        }
        if (type !== '-' && !this.showType) {
          this.showType = true;
          this.columnToShow.push('type');
        }

        if (email !== '-' && !this.showEmail) {
          this.showEmail = true;
          this.columnToShow.splice(1, 0, 'email');
        }
        if (domainUrl !== '-' && !this.showDomainUrl) {
          this.showDomainUrl = true;
          this.columnToShow.splice(2, 0, 'domainUrl');
          this.columnToShow.splice(this.columnToShow.length - 1, 1);
        }

        if (classification !== '-') {
          this.showClassification = true;
          this.columnToShow.push('classification');
        }

        it.values = [
          { value: username, show: 'username', elementClass: '' },
          { value: ellipseText(email), show: 'email', class: '', elementClass: '' },
          { value: password, show: 'password', class: '', elementClass: '' },
          {
            value: domainUrl,
            show: 'domainUrl',
            originalUrl: domainUrl,
            class: '',
            elementClass: ''
          },
          {
            value: url,
            show: 'url',
            originalUrl: originalUrl,
            class: '',
            elementClass: ''
          },
          { value: ip, show: 'ip', class: 'td-center', elementClass: '' },
          { value: type, show: 'type', class: 'td-center', elementClass: '' },
          { value: classification, show: 'classification', class: 'td-center', elementClass: '' },
          {
            value: date,
            show: 'reported',
            class: 'td-center',
            elementClass: ''
          }
        ];
      });
    } else if (this._moduleName === 'credit_card') {
      if (this.grants.isCustomer()) {
        this.showTable = false;
        return;
      }
      this.showTable = true;
      this.showDomainUrl = true;
      this.items = this.getItemsPaginated();
      this.count = this._resource.credit_cards.length;
      this.columnToShow = [
        'number',
        'expiration',
        'cvv',
        'owner',
        'source',
        'validated',
        'reported',
        'confidenceLevel'
      ];
      this.items.forEach((it) => {
        const number = it.ccnumber || it.ccNumber ? it.ccnumber || it.ccNumber : '-';
        const expiration = it.ccexpiration || it.ccExpiration ? it.ccexpiration || it.ccExpiration : '-';
        const cvv = it.cccvv || it.ccCvv ? it.cccvv || it.ccCvv : '-';
        const owner = it.ccowner || it.ccOwner ? it.ccowner || it.ccOwner : '-';
        const source = it.source || it.Source ? it.source || it.Source : '-';
        const validated = it.validated ? 'Yes' : 'No';
        const date =
          it.reportedAt || it.reportedat
            ? getHumanReadableDate(it.reportedAt) || getHumanReadableDate(it.reportedat)
            : '-';
        const confidenceLevel = it.confidenceLevel ? it.confidenceLevel : '-';
        it.values = [
          {
            value: number,
            show: 'number',
            elementClass: 'mb-0 text-90 font-weight-normal'
          },
          {
            value: expiration,
            show: 'expiration',
            class: 'td-center',
            elementClass: 'mb-0 text-90 font-weight-normal'
          },
          {
            value: cvv,
            show: 'cvv',
            class: 'td-center',
            elementClass: 'mb-0 text-90 font-weight-normal'
          },
          {
            value: owner,
            show: 'owner',
            class: 'td-center',
            elementClass: 'mb-0 text-90 font-weight-normal'
          },
          {
            value: source,
            show: 'source',
            class: 'td-center',
            elementClass: 'mb-0 text-90 font-weight-normal'
          },
          {
            value: validated,
            show: 'validated',
            class: 'td-center',
            elementClass: 'mb-0 text-90 font-weight-normal'
          },
          {
            value: date,
            show: 'reported',
            class: 'td-center',
            elementClass: 'mb-0 text-90 font-weight-normal'
          },
          {
            value: confidenceLevel,
            show: 'confidenceLevel',
            class: 'td-center',
            elementClass: 'mb-0 text-90 font-weight-normal'
          }
        ];
      });
    } else if (this._moduleName === 'hacktivism' && this._resource.retweet_info.length) {
      this.showTable = true;
      this.showDomainUrl = true;
      this.items = this._resource.retweet_info;
      this.count = this._resource.retweet_info.length;
      this.columnToShow = ['screen_name', 'created_at', 'url'];
      this.items.forEach((it) => {
        const twitterProfile = it.screen_name ? `@${it.screen_name}` : '-';
        const date = it.created_at ? getHumanReadableDate(it.created_at) : '-';
        const url = it.retweet_status_id ? `http://twitter.com/${it.screen_name}/status/${it.retweet_status_id}` : '-';
        it.values = [
          {
            value: twitterProfile,
            show: 'screen_name',
            elementClass: 'mb-0 text-90 font-weight-normal'
          },
          {
            value: date,
            show: 'created_at',
            class: 'td-center',
            elementClass: 'mb-0 text-90 font-weight-normal'
          },
          {
            value: ellipseUrl(url, 40),
            show: 'url',
            class: 'td-center',
            elementClass: 'mb-0 text-90 font-weight-normal'
          }
        ];
      });
    } else if (this._moduleName === 'social_media') {
      this.showDomainUrl = true;
    }
  }

  tableHeaders() {
    if (this._resource) {
      if (this._moduleName === 'credential') {
        this.heads = [
          {
            value: 'Username',
            show: this._resource.resource_type !== resourceTypes.BOTIP
          },
          {
            value: 'Email',
            show: this.showEmail,
            class: ''
          },
          {
            value: 'Password/Hash',
            show: this._resource.resource_type !== resourceTypes.BOTIP,
            class: ''
          },
          {
            value: 'Domain/Url',
            show: this.showDomainUrl,
            class: ''
          },
          {
            value: 'Affected URL',
            show: this.showUrl,
            class: ''
          },
          {
            value: 'Bot IP',
            show: this.showIp,
            class: 'text-center'
          },
          {
            value: 'Type',
            show: this.showType,
            class: 'text-center'
          },
          {
            value: 'Classification',
            show: this.showClassification,
            class: 'text-center'
          },
          {
            value: 'Reported at',
            show: !this.showDomainUrl,
            class: 'text-center'
          }
        ];
      } else if (this._moduleName === 'credit_card') {
        this.heads = [
          {
            value: 'Card number',
            show: true,
            class: ''
          },
          {
            value: 'Expiration',
            show: true,
            class: 'text-center'
          },
          {
            value: 'CVV',
            show: true,
            class: 'text-center'
          },
          {
            value: 'Owner',
            show: true,
            class: 'text-center'
          },
          {
            value: 'Crime Service Type',
            show: true,
            class: 'text-center'
          },
          {
            value: 'Luhn validation',
            show: true,
            class: 'text-center'
          },
          {
            value: 'Reported at',
            show: true,
            class: 'text-center'
          },
          {
            value: 'Confidence',
            show: true,
            class: 'text-center'
          }
        ];
      } else if (this._moduleName === 'hacktivism') {
        this.heads = [
          {
            value: 'Twitter Profile',
            show: true
          },
          {
            value: 'Date Time',
            show: true,
            class: 'text-center'
          },
          {
            value: 'Url',
            show: true,
            class: 'text-center'
          }
        ];
      } else if (this._moduleName === 'social_media') {
        this.heads = [
          {
            value: 'Titlesddssd',
            show: true
          },
          {
            value: 'Url',
            show: true,
            class: 'text-center'
          }
        ];
      }
    }
  }

  setChecked() {
    setTimeout(() => {
      this.bulk = this.getCheckedItems().length === this.items.length;
    });
  }

  checkAll() {
    this.items = this.items.map((item) => ({ ...item, selected: !item.selected }));
  }

  openDeleteModal(type, item?) {
    if (type === 'single') {
      this.isDeleteConfirmationOpened = true;
      this.selectedTodelete = item;
    } else {
      this.isBulkDeleteConfirmationOpened = true;
    }
  }

  deleteOne() {
    this.isDeleteLoading = true;
    const data = [this.selectedTodelete.id];
    this.resourcesService
      .deleteResourceInDetail(this.moduleId, this.moduleName, this.resource.id, data)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        () => {
          this.isDeleteLoading = false;
          this.isDeleteConfirmationOpened = false;
          this.loadDataEvent.emit();
        },
        () => {
          this.isDeleteLoading = false;
          this.toastrService.error('There was an error deleting the item. Please try again later', 'Error');
        }
      );
  }

  deleteBulk() {
    this.isBulkDeleteLoading = true;
    const selected = this.getCheckedItems();
    const data = [];
    selected.forEach((item) => {
      data.push(item.id);
    });
    this.resourcesService
      .deleteResourceInDetail(this.moduleId, this.moduleName, this.resource.id, data)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        () => {
          this.isBulkDeleteLoading = false;
          this.isBulkDeleteConfirmationOpened = false;
          this.loadDataEvent.emit();
        },
        () => {
          this.isBulkDeleteLoading = false;
          this.toastrService.error('There was an error deleting the item. Please try again later', 'Error');
        }
      );
    this.loadDataEvent.emit();
  }

  onChangeClassification(e) {
    this.selectedClassification = e.target.value;
    this.resourceData(true);
  }

  private getItemsPaginated() {
    const start = this.page * this.limit;
    const end = start + this.limit;

    if (this._moduleName === 'credential') {
      switch (this.selectedClassification) {
        case 'ALL':
          this.count = this.allClassification.length;
          return this.allClassification.slice(start, end);

        case 'EMPLOYEE':
          this.count = this.employeeClassification.length;
          return this.employeeClassification.slice(start, end);

        case 'CUSTOMER':
          this.count = this.customerClassification.length;
          return this.customerClassification.slice(start, end);

        case 'EXTERNAL':
          this.count = this.externalClassification.length;
          return this.externalClassification.slice(start, end);

        case 'UNCLASSIFIED':
          this.count = this.unclassifiedClassification.length;
          return this.unclassifiedClassification.slice(start, end);
      }
    } else if (this._moduleName === 'credit_card') {
      return this._resource.credit_cards.slice(start, end);
    }
  }

  protected reloadData() {
    this.resourceData();
  }

  protected getCheckedItems() {
    return this.items.filter((item) => item.selected);
  }
}
