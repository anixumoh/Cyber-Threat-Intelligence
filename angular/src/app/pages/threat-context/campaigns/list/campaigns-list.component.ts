import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize, take, takeUntil } from 'rxjs/operators';
import { OrganizationService } from '../../../../dashboard/organization/organization.service';
import { ServerList } from '../../../../shared/cs/server-list';
import { CampaignsService } from '../../../../core/models/campaigns.service';
import { convertToCSV, ellipseUrlNew, exportClientFile } from '../../../../utils/functions';
import * as he from 'he';
import { NewTabService } from '../../../../services/new-tab.service';
import moment from 'moment';
import { UserAccountService } from 'app/dashboard/user/account.service';

const stripedHtml = (htmlString) => htmlString.replace(/<[^>]+>/g, '');
const decodeHtml = (htmlString) => {
  return he.decode(htmlString);
};

@Component({
  selector: 'app-campaigns-list',
  templateUrl: './campaigns-list.component.html',
  styleUrls: ['./campaigns-list.component.scss']
})
export class CampaignsListComponent extends ServerList implements OnInit, OnDestroy {
  dorkFields = [];
  activeModule;
  activeOrganization;
  listError = '';

  constructor(
    private organizationService: OrganizationService,
    private route: ActivatedRoute,
    private campaignsService: CampaignsService,
    private newTabService: NewTabService,
    private accountService: UserAccountService
  ) {
    super();
    this.sort = '-last_seen';
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

    this.campaignsService
      .getOptions()
      .pipe(takeUntil(this.destroy$), take(1))
      .subscribe(({ data }) => {
        if (data) {
          this.dorkFields = this.improveDorks(data.dork_fields);
        }
        this.accountService.getSaveDorks('campaigns', this.quickFilters);
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
          case 'first_seen':
            dorks[key].description = `The date when the campaign started or was seen for the first time.`;
            break;
          case 'last_seen':
            dorks[key].description = `The last time the campaign was seen active.`;
            break;
          case 'name':
            dorks[key].description = `Name of the campaign.`;
            break;
          case 'cve':
            dorks[
              key
            ].description = `Finds campaigns using a given CVE. Example: <span class="set-dork-example">cve:"CVE-2017-0199"</span>`;
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
      const route = `/dashboard/organizations/${this.activeOrganization.id}/modules/${this.activeModule.id}/threat_context/campaigns/${id}`;
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
    this.campaignsService
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
            this.items = data.map(({ id, attributes }) => {
              const description = stripedHtml(decodeHtml(attributes.description || ''));
              return { id, shortDescription: ellipseUrlNew(description, 35), ...attributes, description };
            });
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
    exportClientFile(convertToCSV(items), 'campaigns');
  }

  exportToJson() {
    const items = this.getExportableData(this.getCheckedItems());
    exportClientFile(JSON.stringify(items), 'campaigns', 'json');
  }

  onOpenModalDorks(value: boolean) {
    this.openModalDorks = value;
  }

  private getExportableData(items) {
    return items.map((item) => {
      return {
        NAME: item.name,
        DESCRIPTION: item.description,
        TLP: item.tlp,
        'FIRST SEEN': moment(item.first_seen, 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY'),
        'LAST SEEN': moment(item.last_seen, 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY')
      };
    });
  }
}
