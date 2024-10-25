import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize, take, takeUntil } from 'rxjs/operators';
import { OrganizationService } from '../../../../dashboard/organization/organization.service';
import { ServerList } from '../../../../shared/cs/server-list';
import { SignaturesService } from '../../../../core/models/signatures.service';
import { ModuleModel, OrganizationModel } from 'app/dashboard/organization/models';
import { NewTabService } from 'app/services/new-tab.service';
import { IQuickFilter } from '../../../../shared/components/tcx-quick-filters/tcx-quick-filters.component';
import { convertToCSV, exportClientFile } from '../../../../utils/functions';
import moment from 'moment';
import { UserAccountService } from 'app/dashboard/user/account.service';

@Component({
  selector: 'app-signatures-list',
  templateUrl: './signatures-list.component.html',
  styleUrls: ['./signatures-list.component.scss']
})
export class SignaturesListComponent extends ServerList implements OnInit, OnDestroy {
  dorkFields = [];
  activeModule: ModuleModel;
  activeOrganization: OrganizationModel;
  listError = '';
  quickFilters: IQuickFilter[] = [
    {
      title: 'Relevant filters',
      filters: [
        { name: 'SNORT signatures', dork: 'type:"snort"' },
        { name: 'YARA signatures', dork: 'type:"yara"' },
        { name: 'Signatures related to CVEs', dork: 'num_cves:>0  ' }
      ]
    }
  ];

  constructor(
    private organizationService: OrganizationService,
    private route: ActivatedRoute,
    private signaturesService: SignaturesService,
    private newTabService: NewTabService,
    private accountService: UserAccountService
  ) {
    super();
    this.limit = 50;
    this.sort = '-created_at';
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

    this.signaturesService
      .getOptions()
      .pipe(takeUntil(this.destroy$), take(1))
      .subscribe(({ data }) => {
        if (data) {
          this.dorkFields = this.improveDorks(data.dork_fields);
        }
        this.accountService.getSaveDorks('signatures', this.quickFilters);
        this.loadSavedSearches();
        this.reloadData();
      });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  improveDorks(dorks) {
    for (const key in dorks) {
      if (dorks.hasOwnProperty(key)) {
        switch (key) {
          case 'signature':
            dorks[
              key
            ].description = `Finds signatures where the actual signature matches the given dork. Example: <span class="set-dork-example">signature:~"User-Agent"</span>`;
            break;
          case 'type':
            dorks[key].description = `Type of signature. Options: snort | yara | open_ioc | suricata`;
            break;
          case 'sid':
            dorks[
              key
            ].description = `External signature id, like Emerging Threats id. Example: <span class="set-dork-example">sid:2030495</span>`;
            break;
          case 'num_cves':
            dorks[key].description = `Number of CVEs related to the signature.`;
            break;
          case 'name':
            dorks[key].description = `Signature name. Example: <span class="set-dork-example">name:~"azorult"</span>`;
            break;
          case 'tlp':
            dorks[
              key
            ].description = `Traffic Light Protocol, more info <a href="https://www.first.org/tlp/" target="_blank">here</a>. Options: red | amber | green | white.`;
            break;
        }
      }
    }
    delete dorks.id;
    return dorks;
  }

  details(event, { id }) {
    if (id) {
      if (event.target.type === 'checkbox') {
        return;
      }
      const url = `/dashboard/organizations/${this.activeOrganization.id}/modules/${this.activeModule.id}/threat_context/signatures/${id}`;
      this.newTabService.openNewTab(event, url, { dork: this.searchText });
    }
  }

  reloadData() {
    this.loading = true;
    this.listError = '';
    let params = { limit: this.limit, page: this.page, sort: this.sort };
    if (this.searchText) {
      // Use same RegExp that is used in thiapp to know if it's dork search
      // thiapp file -> src/app/shared/backend/crud.service.ts line:138
      params = this.checkSearchCriteriaHasDorks()
        ? { ...params, ...{ dork: this.searchText } }
        : {
            ...params,
            ...{
              searchValue: this.searchText,
              searchField: 'name'
            }
          };
    }
    this.signaturesService
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

  exportToCSV() {
    const items = this.getExportableData(this.getCheckedItems());
    exportClientFile(convertToCSV(items), 'signatures');
  }

  exportToJson() {
    const items = this.getExportableData(this.getCheckedItems());
    exportClientFile(JSON.stringify(items), 'signatures', 'json');
  }

  onOpenModalDorks(value: boolean) {
    this.openModalDorks = value;
  }

  private getExportableData(items) {
    return items.map((item) => {
      return {
        NAME: item.name,
        TYPE: item.type,
        SID: item.sid || '-',
        DATE: moment(item.created_at, 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY'),
        SIGNATURE: item.signature
      };
    });
  }
}
