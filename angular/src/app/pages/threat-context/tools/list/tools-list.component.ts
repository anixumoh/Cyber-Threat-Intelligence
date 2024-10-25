import { finalize, take, takeUntil } from 'rxjs/operators';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { OrganizationService } from '../../../../dashboard/organization/organization.service';
import { ActivatedRoute } from '@angular/router';
import { ServerList } from '../../../../shared/cs/server-list';
import { ToolsService } from '../../../../core/models/tools.service';
import { NewTabService } from '../../../../services/new-tab.service';
import { convertToCSV, exportClientFile } from '../../../../utils/functions';
import moment from 'moment';
import { UserAccountService } from 'app/dashboard/user/account.service';

@Component({
  selector: 'app-tools-list',
  templateUrl: './tools-list.component.html',
  styleUrls: ['./tools-list.component.scss']
})
export class ToolsListComponent extends ServerList implements OnInit, OnDestroy {
  dorkFields = [];
  activeModule;
  activeOrganization;
  listError = '';

  constructor(
    private organizationService: OrganizationService,
    private route: ActivatedRoute,
    private toolsService: ToolsService,
    private newTabService: NewTabService,
    private accountService: UserAccountService
  ) {
    super();
    this.limit = 50;
    this.sort = 'name';
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

    this.toolsService
      .getOptions()
      .pipe(takeUntil(this.destroy$), take(1))
      .subscribe(({ data }) => {
        if (data) {
          this.dorkFields = this.improveDorks(data.dork_fields);
        }
        this.accountService.getSaveDorks('tools', this.quickFilters);
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
          case 'version':
            dorks[
              key
            ].description = `Version of the tool. Example: <span class="set-dork-example">version:"3.2"</span>`;
            break;
          case 'targeted_platforms':
            dorks[
              key
            ].description = `Platforms affected by the tool/malware. Options: Windows | Linux | Unix | Android (case sensitive).`;
            break;
          case 'name':
            dorks[key].description = `Name of the tool.`;
            break;
          case 'cve':
            dorks[
              key
            ].description = `Finds tools using a given CVE. Example: <span class="set-dork-example">cve:"CVE-2017-0199"</span>`;
            break;
          case 'first_seen':
            dorks[key].description = `The date when the tool was seen for the first time.`;
            break;
          case 'last_seen':
            dorks[key].description = ` The last time the tool was seen being used.`;
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
    delete dorks.discovery_date;
    return dorks;
  }

  details(event, { id }) {
    if (id) {
      if (event.target.type === 'checkbox') {
        return;
      }
      const route = `/dashboard/organizations/${this.activeOrganization.id}/modules/${this.activeModule.id}/threat_context/tools/${id}`;
      this.newTabService.openNewTab(event, route, { dork: this.searchText });
    }
  }

  reloadData() {
    this.loading = true;
    this.listError = '';
    let params = { limit: this.limit, page: this.page, sort: this.sort };
    if (this.searchText) {
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
    this.toolsService
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
    exportClientFile(convertToCSV(items), 'tools');
  }

  exportToJson() {
    const items = this.getExportableData(this.getCheckedItems());
    exportClientFile(JSON.stringify(items), 'tools', 'json');
  }

  onOpenModalDorks(value: boolean) {
    this.openModalDorks = value;
  }

  private getExportableData(items) {
    return items.map((item) => {
      return {
        NAME: item.name,
        PLATFORMS: item.targeted_platforms,
        TLP: item.tlp,
        'FIRST SEEN': moment(item.first_seen, 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY'),
        'LAST SEEN': moment(item.last_seen, 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY')
      };
    });
  }
}
