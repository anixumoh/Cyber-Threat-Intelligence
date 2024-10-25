import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize, take, takeUntil } from 'rxjs/operators';
import { OrganizationService } from '../../../../dashboard/organization/organization.service';
import { ServerList } from '../../../../shared/cs/server-list';
import { AttackPatternsService } from '../../../../core/models/attack-patterns.service';
import { NewTabService } from '../../../../services/new-tab.service';
import { convertToCSV, exportClientFile } from '../../../../utils/functions';
import { UserAccountService } from 'app/dashboard/user/account.service';
import { IQuickFilter } from 'app/shared/components/tcx-quick-filters/tcx-quick-filters.component';

@Component({
  selector: 'app-attack-patterns-list',
  templateUrl: './attack-patterns-list.component.html',
  styleUrls: ['./attack-patterns-list.component.scss']
})
export class AttackPatternsListComponent extends ServerList implements OnInit, OnDestroy {
  dorkFields = [];
  activeModule;
  activeOrganization;
  listError = '';
  mitreDork;
  isDisplayingList = true;
  isSearching = false;
  quickFilters: IQuickFilter[] = [];

  constructor(
    private organizationService: OrganizationService,
    private route: ActivatedRoute,
    private attackPatternsService: AttackPatternsService,
    private newTabService: NewTabService,
    private accountService: UserAccountService
  ) {
    super();
    this.limit = 50;
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

    this.attackPatternsService
      .getOptions()
      .pipe(takeUntil(this.destroy$), take(1))
      .subscribe(({ data }) => {
        if (data) {
          this.dorkFields = this.improveDorks(data.dork_fields);
        }
        this.accountService.getSaveDorks('attackPatterns', this.quickFilters);
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
          case 'severity':
            dorks[
              key
            ].description = `Severity of the attack pattern or technique. Options: very high | high | medium | low | very low.`;
            break;
          case 'name':
            dorks[
              key
            ].description = `The name of the attack pattern technique (CAPEC or ATT&CK MITRE). Example: <span class="set-dork-example">name:~"SQL"</span>`;
            break;
          case 'capec_id':
            dorks[
              key
            ].description = `The identificator of the CAPEC technique. In the case of ATT&CK techniques it is possible to use the following dork to select all ATT&CK techniques: <span class="set-dork-example">NOT capec_id:>0</span>`;
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

  searchAndList() {
    if (this.isDisplayingList) {
      this.isSearching = !!this.searchText;
      this.isDisplayingList = true;
      this.search();
    }
  }

  details(event, { id }) {
    if (id) {
      if (event.target.type === 'checkbox') {
        return;
      }
      const route = `/dashboard/organizations/${this.activeOrganization.id}/modules/${this.activeModule.id}/threat_context/attack-patterns/${id}`;
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
    this.attackPatternsService
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
    exportClientFile(convertToCSV(items), 'attack_patterns');
  }

  exportToJson() {
    const items = this.getExportableData(this.getCheckedItems());
    exportClientFile(JSON.stringify(items), 'attack_patterns', 'json');
  }

  toggleListStyle() {
    this.isDisplayingList = !this.isDisplayingList;
  }

  onOpenModalDorks(value: boolean) {
    this.openModalDorks = value;
  }

  private getExportableData(items) {
    return items.map((item) => {
      return {
        NAME: item.name,
        TYPE: item.capec_id ? 'CAPEC' : 'ATT&CK',
        PURPOSES: (item.purposes || []).join(', '),
        SEVERITY: item.severity || '-',
        TLP: item.tlp
      };
    });
  }
}
